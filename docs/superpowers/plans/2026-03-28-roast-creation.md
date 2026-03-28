# Roast Creation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to submit code snippets and receive an AI-generated roast (or professional review), then view the full analysis on the results page.

**Architecture:** A Next.js Server Action inserts a `pending` submission into the DB and uses `after()` to schedule the Gemini AI call in the background. The client immediately redirects to `/roast/[id]`, which shows a "roasting your code..." skeleton until the AI finishes. Once done, the page shows the full cached result. The Vercel AI SDK (`generateObject`) with `@ai-sdk/google` handles structured JSON output from Gemini.

**Tech Stack:** Next.js 15 Server Actions, `after()` from `next/server`, Vercel AI SDK (`ai` + `@ai-sdk/google`), Drizzle ORM, tRPC, Zod v4

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/db/schema/enums.ts` | Modify | Add `submissionStatusEnum` ('pending' \| 'done' \| 'failed') |
| `src/db/schema/submissions.ts` | Modify | Add `status` column; make `score`, `verdict`, `roastQuote` nullable |
| `src/app/config/env.ts` | Modify | Add `GOOGLE_GENERATIVE_AI_API_KEY` |
| `src/app/lib/roast-ai.ts` | Create | `roastAi()` — calls Gemini with `generateObject`, returns typed roast output |
| `src/app/actions/submit.ts` | Create | `submitCode()` server action — inserts pending submission, schedules AI via `after()` |
| `src/trpc/routers/submission.ts` | Modify | Add `getStatusById` procedure for non-cached status polling |
| `src/app/home-actions.tsx` | Modify | Wire submit button to `submitCode` action with loading state |
| `src/app/roast/[roastId]/page.tsx` | Modify | Add status check; render pending view or cached result |
| `src/app/roast/[roastId]/roast-pending-view.tsx` | Create | Client component — shows skeleton + polls via `router.refresh()` |

---

### Task 1: Add `status` enum and column to the DB schema

**Files:**
- Modify: `src/db/schema/enums.ts`
- Modify: `src/db/schema/submissions.ts`

- [ ] **Step 1: Add `submissionStatusEnum` to enums.ts**

```ts
// src/db/schema/enums.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const roastModeEnum = pgEnum("roast_mode", ["honest", "roast"]);

export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical",
  "warning",
  "good",
]);

export const verdictEnum = pgEnum("verdict", [
  "mass_disaster",
  "needs_serious_help",
  "barely_acceptable",
  "decent_enough",
  "actually_good",
  "mass_respect",
]);

export const diffLineTypeEnum = pgEnum("diff_line_type", [
  "added",
  "removed",
  "context",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "done",
  "failed",
]);
```

- [ ] **Step 2: Add `status` column and make AI fields nullable in submissions.ts**

`score`, `verdict`, and `roastQuote` are not available until the AI finishes — make them nullable. Add `status` defaulting to `'done'` so existing seeded rows remain valid.

```ts
// src/db/schema/submissions.ts
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { roastModeEnum, submissionStatusEnum, verdictEnum } from "./enums";

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    code: text("code").notNull(),
    language: text("language").notNull(),
    lineCount: integer("line_count").notNull(),

    roastMode: roastModeEnum("roast_mode").notNull().default("roast"),
    status: submissionStatusEnum("status").notNull().default("done"),

    score: numeric("score", { precision: 3, scale: 1 }),
    verdict: verdictEnum("verdict"),
    roastQuote: text("roast_quote"),

    shareToken: text("share_token"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_submissions_score").on(table.score),
    index("idx_submissions_created_at").on(table.createdAt),
    uniqueIndex("idx_submissions_share_token").on(table.shareToken),
    index("idx_submissions_language").on(table.language),
    index("idx_submissions_status").on(table.status),
  ]
);
```

- [ ] **Step 3: Generate and apply migration**

```bash
cd /path/to/nlw-operator
pnpm db:generate
pnpm db:migrate
```

Expected: A new file appears in `drizzle/` named something like `0001_*.sql` containing `CREATE TYPE "submission_status"`, `ALTER TABLE "submissions" ADD COLUMN "status"`, and `ALTER COLUMN` statements for nullable fields.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
pnpm check
```

Expected: No type errors. (The roast results page will have new nullable types — the compiler will flag them; fix in Task 7.)

- [ ] **Step 5: Commit**

```bash
git add src/db/schema/enums.ts src/db/schema/submissions.ts drizzle/
git commit -m "feat(db): add submission_status enum and pending state to submissions"
```

---

### Task 2: Add Google AI API key to env

**Files:**
- Modify: `src/app/config/env.ts`
- Modify: `.env` (local only — not committed)
- Modify: `.env.example`

- [ ] **Step 1: Update env.ts**

```ts
// src/app/config/env.ts
import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 2: Add key to .env (not committed)**

```bash
# Add to .env:
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Get the key from https://aistudio.google.com/app/apikey

- [ ] **Step 3: Update .env.example**

Add this line to `.env.example`:
```
GOOGLE_GENERATIVE_AI_API_KEY=
```

- [ ] **Step 4: Install AI SDK packages**

```bash
pnpm add ai @ai-sdk/google
```

Expected: `ai` and `@ai-sdk/google` appear in `package.json` dependencies.

- [ ] **Step 5: Verify dev server starts**

```bash
pnpm dev
```

Expected: Server starts without `GOOGLE_GENERATIVE_AI_API_KEY` env error.

- [ ] **Step 6: Commit**

```bash
git add src/app/config/env.ts .env.example package.json pnpm-lock.yaml
git commit -m "feat(env): add Google AI API key config and install ai sdk"
```

---

### Task 3: Create the `roastAi()` function

**Files:**
- Create: `src/app/lib/roast-ai.ts`

This function calls Gemini with `generateObject`, enforcing a Zod schema that maps 1:1 to the DB structure. It has no side effects — it just returns data.

- [ ] **Step 1: Create the file**

```ts
// src/app/lib/roast-ai.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod"; // use "zod" not "zod/v4" — Vercel AI SDK expects standard Zod schema
import { env } from "@/app/config/env";

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const roastOutputSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(10)
    .describe("Code quality score from 0 (worst) to 10 (best), one decimal"),
  verdict: z
    .enum([
      "mass_disaster",
      "needs_serious_help",
      "barely_acceptable",
      "decent_enough",
      "actually_good",
      "mass_respect",
    ])
    .describe("Overall verdict label"),
  roastQuote: z
    .string()
    .describe("One punchy sentence summarizing the review. Max 120 chars."),
  issues: z
    .array(
      z.object({
        severity: z.enum(["critical", "warning", "good"]),
        title: z.string().describe("Short issue title, max 50 chars"),
        description: z
          .string()
          .describe("Actionable explanation, 1-2 sentences"),
      })
    )
    .min(2)
    .max(4)
    .describe("2 to 4 code issues or highlights"),
  suggestedFix: z
    .object({
      headerLabel: z
        .string()
        .describe(
          'Fix label, e.g. "your_code.ts → improved_code.ts"'
        ),
      lines: z
        .array(
          z.object({
            type: z.enum(["added", "removed", "context"]),
            content: z
              .string()
              .describe("Raw line content without diff prefix"),
          })
        )
        .describe("Unified diff lines for the suggested fix"),
    })
    .optional()
    .describe("Optional suggested fix diff — only when a fix is clear"),
});

export type RoastOutput = z.infer<typeof roastOutputSchema>;

function buildPrompt(
  code: string,
  language: string,
  roastMode: boolean
): string {
  const persona = roastMode
    ? `You are a brutally sarcastic senior engineer who tears apart bad code. Be ruthless, funny, and cutting — but every piece of feedback must be technically accurate and actionable. Think: a genius who has seen too much bad code and has completely lost patience.`
    : `You are a senior software engineer conducting a professional code review. Be direct, specific, and constructive. Identify real problems and suggest concrete improvements. No sugarcoating, but no sarcasm either.`;

  return `${persona}

Analyze the following ${language} code snippet and respond with a structured review.

Scoring guide:
- 0–2: mass_disaster (broken, dangerous, unreadable)
- 2–4: needs_serious_help (major issues throughout)
- 4–5: barely_acceptable (works but painful to read)
- 5–7: decent_enough (functional, some rough edges)
- 7–9: actually_good (solid, minor improvements possible)
- 9–10: mass_respect (exemplary code)

Include a suggestedFix only if there's a clear, small improvement to show (< 15 diff lines). Skip it for large or complex refactors.

Code:
\`\`\`${language}
${code}
\`\`\``;
}

export async function roastAi(
  code: string,
  language: string,
  roastMode: boolean
): Promise<RoastOutput> {
  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: roastOutputSchema,
    prompt: buildPrompt(code, language, roastMode),
  });

  return object;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm check
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/lib/roast-ai.ts
git commit -m "feat(ai): add roastAi function with Gemini structured output"
```

---

### Task 4: Create the `submitCode` server action

**Files:**
- Create: `src/app/actions/submit.ts`

This is the entry point when the user clicks "$ roast_my_code". It:
1. Inserts a `pending` submission into the DB
2. Uses `after()` to process the AI call after the response is returned
3. Returns `{ id }` so the client can redirect immediately

- [ ] **Step 1: Create the file**

```ts
// src/app/actions/submit.ts
"use server";

import { after } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@/db";
import { diffLines, issues, submissions, suggestedFixes } from "@/db/schema";
import { roastAi } from "@/app/lib/roast-ai";

const submitInputSchema = z.object({
  code: z.string().min(1).max(200000),
  language: z.string().min(1),
  roastMode: z.boolean(),
});

export async function submitCode(rawInput: unknown) {
  const input = submitInputSchema.parse(rawInput);
  const lineCount = input.code.split("\n").length;

  // Insert pending submission — returns immediately
  const [submission] = await db
    .insert(submissions)
    .values({
      code: input.code,
      language: input.language,
      lineCount,
      roastMode: input.roastMode ? "roast" : "honest",
      status: "pending",
    })
    .returning({ id: submissions.id });

  // Process AI in background, after the response is sent to the client
  after(async () => {
    try {
      const roast = await roastAi(input.code, input.language, input.roastMode);

      // Insert issues
      await db.insert(issues).values(
        roast.issues.map((issue, i) => ({
          submissionId: submission.id,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          sortOrder: i,
        }))
      );

      // Insert suggested fix if present
      if (roast.suggestedFix) {
        const [fix] = await db
          .insert(suggestedFixes)
          .values({
            submissionId: submission.id,
            headerLabel: roast.suggestedFix.headerLabel,
          })
          .returning({ id: suggestedFixes.id });

        await db.insert(diffLines).values(
          roast.suggestedFix.lines.map((line, i) => ({
            suggestedFixId: fix.id,
            type: line.type,
            content: line.content,
            sortOrder: i,
          }))
        );
      }

      // Update submission with AI results
      await db
        .update(submissions)
        .set({
          score: String(roast.score.toFixed(1)),
          verdict: roast.verdict,
          roastQuote: roast.roastQuote,
          status: "done",
        })
        .where(eq(submissions.id, submission.id));

      // Bust caches
      revalidateTag("leaderboard");
      revalidateTag(`roast-${submission.id}`);
    } catch {
      await db
        .update(submissions)
        .set({ status: "failed" })
        .where(eq(submissions.id, submission.id));
    }
  });

  return { id: submission.id };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm check
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/submit.ts
git commit -m "feat(actions): add submitCode server action with after() background processing"
```

---

### Task 5: Add `getStatusById` to the submission tRPC router

**Files:**
- Modify: `src/trpc/routers/submission.ts`

The roast results page needs a non-cached status check to decide whether to show the pending view or the full result. This is a simple, lightweight query.

- [ ] **Step 1: Update submission.ts**

```ts
// src/trpc/routers/submission.ts
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const submissionRouter = createTRPCRouter({
  getById: baseProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.submissions.findFirst({
        where: (submissions, { eq }) => eq(submissions.id, input.id),
        with: {
          issues: {
            orderBy: (issues, { asc }) => asc(issues.sortOrder),
          },
          suggestedFix: {
            with: {
              lines: {
                orderBy: (lines, { asc }) => asc(lines.sortOrder),
              },
            },
          },
        },
      });

      if (!result) {
        throw new Error("Submission not found");
      }

      return result;
    }),

  getStatusById: baseProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({ id: submissions.id, status: submissions.status })
        .from(submissions)
        .where(eq(submissions.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm check
```

- [ ] **Step 3: Commit**

```bash
git add src/trpc/routers/submission.ts
git commit -m "feat(trpc): add getStatusById procedure for pending state polling"
```

---

### Task 6: Create the `RoastPendingView` client component

**Files:**
- Create: `src/app/roast/[roastId]/roast-pending-view.tsx`

This client component shows the "roasting your code..." message with skeleton blocks, and polls `router.refresh()` every 3 seconds until the page re-renders with the full result.

- [ ] **Step 1: Create the file**

```tsx
// src/app/roast/[roastId]/roast-pending-view.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RoastPendingView() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="flex flex-col gap-10 px-20 py-10">
      {/* Pending message */}
      <p className="font-primary text-text-tertiary text-sm">
        <span className="text-accent-green">{"// "}</span>
        roasting your code
        <span className="animate-pulse">{"..."}</span>
      </p>

      {/* Score Hero skeleton */}
      <section className="flex items-center gap-12">
        <div className="h-[180px] w-[180px] animate-pulse rounded-full bg-bg-elevated" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-6 w-48 animate-pulse rounded bg-bg-elevated" />
          <div className="h-12 animate-pulse rounded bg-bg-elevated" />
          <div className="h-4 w-32 animate-pulse rounded bg-bg-elevated" />
        </div>
      </section>

      <div className="h-px w-full bg-border-primary" />

      {/* Code section skeleton */}
      <section className="flex flex-col gap-4">
        <div className="h-5 w-36 animate-pulse rounded bg-bg-elevated" />
        <div className="h-[200px] animate-pulse rounded bg-bg-elevated border border-border-primary" />
      </section>

      <div className="h-px w-full bg-border-primary" />

      {/* Analysis section skeleton */}
      <section className="flex flex-col gap-6">
        <div className="h-5 w-40 animate-pulse rounded bg-bg-elevated" />
        <div className="flex gap-5">
          <div className="flex-1 h-[120px] animate-pulse rounded bg-bg-elevated border border-border-primary" />
          <div className="flex-1 h-[120px] animate-pulse rounded bg-bg-elevated border border-border-primary" />
        </div>
        <div className="flex gap-5">
          <div className="flex-1 h-[120px] animate-pulse rounded bg-bg-elevated border border-border-primary" />
          <div className="flex-1 h-[120px] animate-pulse rounded bg-bg-elevated border border-border-primary" />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm check
```

- [ ] **Step 3: Commit**

```bash
git add src/app/roast/[roastId]/roast-pending-view.tsx
git commit -m "feat(ui): add RoastPendingView client component with polling"
```

---

### Task 7: Update the roast results page to handle pending and failed states

**Files:**
- Modify: `src/app/roast/[roastId]/page.tsx`

The page now has three states:
- `pending` → `<RoastPendingView />`
- `failed` → simple error message
- `done` → existing `<CachedRoastContent />` (unchanged)

The status check happens **outside** any cache boundary so it's always fresh.

- [ ] **Step 1: Update the page**

```tsx
// src/app/roast/[roastId]/page.tsx  (top of file — add these imports)
import { RoastPendingView } from "./roast-pending-view";
// staticCaller is already imported — use it for the status check too
```

Replace the `RoastResultsPage` default export with:

```tsx
export default async function RoastResultsPage({
  params,
}: {
  params: Promise<{ roastId: string }>;
}) {
  const { roastId } = await params;

  // Status check — NOT cached, runs on every request
  const statusResult = await staticCaller.submission.getStatusById({ id: roastId });

  if (!statusResult) notFound();

  if (statusResult.status === "pending") {
    return <RoastPendingView />;
  }

  if (statusResult.status === "failed") {
    return (
      <main className="flex flex-col items-center justify-center gap-4 px-20 py-20">
        <span className="font-bold font-primary text-accent-red text-3xl">{">"}</span>
        <h1 className="font-bold font-primary text-text-primary text-xl">
          roast_failed
        </h1>
        <p className="font-secondary text-text-secondary text-sm">
          {"// the AI couldn't process your code. try again."}
        </p>
      </main>
    );
  }

  return <CachedRoastContent roastId={roastId} />;
}
```

> `CachedRoastContent` remains unchanged — it still uses `staticCaller`, `cacheLife("static")`, and `cacheTag`.

- [ ] **Step 2: Fix nullable field access in `CachedRoastContent`**

Since `score`, `verdict`, and `roastQuote` are now nullable in the schema, TypeScript will complain inside `CachedRoastContent`. Add null guards for the `done` state (these fields are always populated when `status === 'done'`):

```tsx
// Inside CachedRoastContent, after the notFound() check:
if (!roast.score || !roast.verdict || !roast.roastQuote) {
  notFound();
}

const score = Number(roast.score);
const severity = verdictSeverityMap[roast.verdict] ?? "warning";
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
pnpm check
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/roast/[roastId]/page.tsx
git commit -m "feat(roast): handle pending and failed states on results page"
```

---

### Task 8: Wire the submit button in `HomeEditorSection`

**Files:**
- Modify: `src/app/home-actions.tsx`

Connect the "$ roast_my_code" button to the `submitCode` server action. Use `useTransition` for loading state so the button shows `$ analyzing...` while waiting for the server action to return the submission ID.

- [ ] **Step 1: Update home-actions.tsx**

```tsx
// src/app/home-actions.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BundledLanguage } from "shiki/bundle/web";
import { submitCode } from "@/app/actions/submit";
import { Button } from "./components/ui/button";
import { CodeEditor } from "./components/ui/code-editor";
import { Toggle } from "./components/ui/toggle";

const MAX_LINES = 1500;

const overLimitPhrases = [
  "// whoa, you pasted an entire codebase. we roast functions, not monoliths.",
  "// this isn't a code review, it's an archaeological dig.",
  "// even GPT would rage-quit reading this.",
  "// we said paste your code, not your entire git history.",
  "// that's not a snippet, that's a novel. trim it down.",
  "// 1,500 lines? at this point just mass-select delete.",
  "// our AI has feelings too. don't make it read all that.",
  "// ERROR 413: payload too thicc.",
  "// you're not submitting a PR, chill.",
  "// at this point we'd roast you, not the code.",
];

function pickOverLimitPhrase(lineCount: number) {
  return overLimitPhrases[lineCount % overLimitPhrases.length];
}

const defaultCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`;

export function HomeEditorSection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState<BundledLanguage>("javascript");
  const [roastMode, setRoastMode] = useState(true);
  const isEmpty = code.trim().length === 0;
  const lineCount = code.split("\n").length;
  const isOverLimit = lineCount > MAX_LINES;

  const bottomMessage = useMemo(() => {
    if (isPending) return "// analyzing your code...";
    if (isOverLimit) return pickOverLimitPhrase(lineCount);
    return "// maximum sarcasm enabled";
  }, [isPending, isOverLimit, lineCount]);

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitCode({ code, language, roastMode });
      router.push(`/roast/${result.id}`);
    });
  }

  return (
    <>
      <CodeEditor
        language={language}
        maxLines={MAX_LINES}
        onChange={setCode}
        onLanguageChange={setLanguage}
        value={code}
      />

      <div className="flex w-full max-w-[780px] items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle
            checked={roastMode}
            label="roast mode"
            onCheckedChange={setRoastMode}
          />
          <span
            className={`font-secondary text-xs italic ${isOverLimit ? "text-accent-red" : "text-text-tertiary"}`}
          >
            {bottomMessage}
          </span>
        </div>
        <Button
          disabled={isEmpty || isOverLimit || isPending}
          onClick={handleSubmit}
          variant="primary"
        >
          {isPending ? "$ analyzing..." : "$ roast_my_code"}
        </Button>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Run lint**

```bash
pnpm check
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/home-actions.tsx
git commit -m "feat(home): wire submit button to submitCode action with loading state"
```

---

### Task 9: End-to-end smoke test

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Open http://localhost:3000 and submit code**

1. Paste or edit code in the editor
2. Select a language
3. Click "$ roast_my_code"
4. Expected: Button shows "$ analyzing...", then browser navigates to `/roast/[uuid]`
5. Expected: Page shows "// roasting your code..." with skeleton blocks
6. Expected: After ~5–15 seconds, page automatically refreshes and shows full roast result

- [ ] **Step 3: Test roast OFF mode**

1. Toggle roast mode OFF
2. Submit code
3. Expected: Result shows professional/constructive feedback tone (no sarcasm in roastQuote or issue descriptions)

- [ ] **Step 4: Verify leaderboard updates**

1. Go to `/leaderboard` after submitting
2. Expected: New submission appears (cache invalidated via `revalidateTag('leaderboard')`)

- [ ] **Step 5: Test error path (optional)**

1. Temporarily break the API key in `.env` (change one character)
2. Submit code
3. Expected: Results page eventually shows `roast_failed` error state
4. Restore the API key

- [ ] **Step 6: Run lint**

```bash
pnpm check
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(roast): complete roast creation end-to-end"
```

---

## Verification Summary

1. `pnpm check` — clean TypeScript + Biome
2. `pnpm db:migrate` — migration applied successfully
3. Submit → redirect → pending skeleton → auto-refresh → full result
4. Roast mode ON/OFF produces noticeably different tones
5. Leaderboard invalidated after submission completes
6. Failed AI calls show error state (no crash)
