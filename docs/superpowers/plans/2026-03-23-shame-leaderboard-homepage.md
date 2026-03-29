# Shame Leaderboard Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded 3-row leaderboard preview on the homepage with a live, SSR-fetched shame leaderboard showing the 3 worst-scored submissions, plus a real footer count ("showing top 3 of N").

**Architecture:** Add a `getShamePreview` tRPC procedure that fetches the top-3 lowest-scored entries and total submission count in a single parallel call (`Promise.all`). A new async server component (`ShameLeaderboardLoader`) calls it via the direct `caller` (no HTTP), renders the real UI, and is wrapped in a `<Suspense>` boundary with a skeleton — following the same pattern as `HomeStatsLoader` on the same page.

**Tech Stack:** Next.js App Router (RSC), tRPC v11 (`caller` for SSR), Drizzle ORM (`Promise.all` for parallel queries), Tailwind CSS, existing `LeaderboardRow*` composable parts.

> **Commit convention:** This project requires the format `AUD-NNN type(scope): description`. Before committing, extract the ticket number from your current branch name (e.g. branch `AUD-42-my-feature` → `AUD-42`). All commit examples below show only the message body — prepend the ticket prefix from your branch.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/trpc/routers/leaderboard.ts` | Add `getShamePreview` procedure returning `{ entries, totalCount }` |
| Create | `src/app/shame-leaderboard-preview.tsx` | Presentational component + `ShameLeaderboardSkeleton` |
| Create | `src/app/shame-leaderboard-loader.tsx` | Async RSC that calls tRPC and passes data to preview |
| Modify | `src/app/page.tsx` | Remove hardcoded section + 7 now-unused imports; add `<Suspense>` + `<ShameLeaderboardLoader />` |

---

## Task 1: Add `getShamePreview` tRPC procedure

**Files:**
- Modify: `src/trpc/routers/leaderboard.ts`

A dedicated procedure is preferred over calling `getTop` + `getStats` separately from the loader because it consolidates both queries into one server call, running them in parallel with `Promise.all`. This avoids two sequential round-trips through tRPC's caller machinery and keeps the loader trivially simple.

Score is stored as `numeric(3,1)` in Postgres — Drizzle returns it as a string; coercion to `Number` happens in the UI layer, not here.

- [ ] **Step 1: Add the procedure to the leaderboard router**

```typescript
// src/trpc/routers/leaderboard.ts
import { asc, avg, count } from "drizzle-orm";
import { z } from "zod/v4";
import { submissions } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "../init";

export const leaderboardRouter = createTRPCRouter({
  getTop: baseProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(submissions)
        .orderBy(asc(submissions.score))
        .limit(input.limit);
    }),

  getStats: baseProcedure.query(async ({ ctx }) => {
    const [result] = await ctx.db
      .select({
        totalCount: count(),
        avgScore: avg(submissions.score),
      })
      .from(submissions);

    return {
      totalCount: result.totalCount,
      avgScore: Number(result.avgScore ?? 0),
    };
  }),

  getShamePreview: baseProcedure.query(async ({ ctx }) => {
    const [entries, [stats]] = await Promise.all([
      ctx.db
        .select()
        .from(submissions)
        .orderBy(asc(submissions.score))
        .limit(3),
      ctx.db.select({ totalCount: count() }).from(submissions),
    ]);

    return {
      entries,
      totalCount: stats.totalCount,
    };
  }),
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/ricioli/source/projects/rocketseat/nlw-operator
npx tsc --noEmit
```
Expected: no errors related to `leaderboard.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/trpc/routers/leaderboard.ts
git commit -m "AUD-NNN feat(trpc): add getShamePreview procedure with parallel DB queries"
```
> Replace `AUD-NNN` with the ticket from your branch name.

---

## Task 2: Create `ShameLeaderboardPreview` component and skeleton

**Files:**
- Create: `src/app/shame-leaderboard-preview.tsx`

Pure presentational server component — receives data as props, renders the table. Also exports `ShameLeaderboardSkeleton` for the `<Suspense>` fallback.

Design notes from Pencil (`devroast.pen`, node `luohW`):
- Outer border around the whole table: `border border-border-primary` (this is a visual change from the current hardcoded version which has no outer border — intentional per design)
- Header: `bg-bg-surface` with bottom border
- Rank #1 uses `text-accent-amber font-bold`, ranks 2–3 use `text-text-secondary` — applied via `className` on the existing `LeaderboardRowRank` composable part
- Score: `text-accent-red font-bold` (already default in `LeaderboardRowScore`)
- Code column: first 3 lines of `entry.code` stacked vertically with `gap-[3px]`, plain text — no Shiki
- Lang column: `text-right text-text-secondary` (via `LeaderboardRowLanguage`)
- Footer hint: `showing top 3 of {totalCount} · view full leaderboard >>`

- [ ] **Step 1: Create the file**

```tsx
// src/app/shame-leaderboard-preview.tsx
import Link from "next/link";
import type { InferSelectModel } from "drizzle-orm";
import type { submissions } from "@/db/schema";
import {
  LeaderboardRowLanguage,
  LeaderboardRowRank,
  LeaderboardRowRoot,
  LeaderboardRowScore,
} from "./components/ui/leaderboard-row";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/cn";

type Submission = InferSelectModel<typeof submissions>;

interface ShameLeaderboardPreviewProps {
  entries: Submission[];
  totalCount: number;
}

export function ShameLeaderboardPreview({
  entries,
  totalCount,
}: ShameLeaderboardPreviewProps) {
  return (
    <section className="mt-20 flex w-full max-w-[960px] flex-col gap-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold font-primary text-accent-green text-sm">
            {"//"}
          </span>
          <h2 className="font-bold font-primary text-sm text-text-primary">
            shame_leaderboard
          </h2>
        </div>
        <Link href="/leaderboard">
          <Button variant="link">{"$ view_all >>"}</Button>
        </Link>
      </div>

      <p className="font-secondary text-text-tertiary text-xs">
        {"// the worst code on the internet, ranked by shame"}
      </p>

      {/* Table */}
      <div className="flex flex-col border border-border-primary">
        {/* Header */}
        <div className="flex items-center gap-6 border-border-primary border-b bg-bg-surface px-5 py-3">
          <span className="w-10 font-primary text-text-tertiary text-xs">#</span>
          <span className="w-[60px] font-primary text-text-tertiary text-xs">score</span>
          <span className="flex-1 font-primary text-text-tertiary text-xs">code</span>
          <span className="w-[100px] text-right font-primary text-text-tertiary text-xs">lang</span>
        </div>

        {/* Rows */}
        {entries.map((entry, index) => {
          const rank = index + 1;
          const codeLines = entry.code.split("\n").slice(0, 3);
          const isLast = index === entries.length - 1;

          return (
            <LeaderboardRowRoot
              key={entry.id}
              className={cn(isLast && "border-b-0")}
            >
              {/* Rank — amber for #1, secondary for others */}
              <LeaderboardRowRank
                className={cn(
                  rank === 1
                    ? "font-bold text-accent-amber"
                    : "text-text-secondary"
                )}
              >
                {rank}
              </LeaderboardRowRank>

              {/* Score */}
              <LeaderboardRowScore className="w-[60px]">
                {Number(entry.score).toFixed(1)}
              </LeaderboardRowScore>

              {/* Code preview — up to 3 lines stacked */}
              <div className="flex flex-1 flex-col gap-[3px] overflow-hidden">
                {codeLines.map((line, i) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: static preview lines, order never changes
                    key={i}
                    className="truncate font-primary text-[12px] text-text-primary"
                  >
                    {line}
                  </span>
                ))}
              </div>

              {/* Language */}
              <LeaderboardRowLanguage>{entry.language}</LeaderboardRowLanguage>
            </LeaderboardRowRoot>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="text-center font-secondary text-text-tertiary text-xs">
        {`showing top 3 of ${totalCount.toLocaleString()} · `}
        <Link
          className="transition-colors duration-200 hover:text-text-secondary"
          href="/leaderboard"
        >
          {"view full leaderboard >>"}
        </Link>
      </p>
    </section>
  );
}

export function ShameLeaderboardSkeleton() {
  return (
    <section className="mt-20 flex w-full max-w-[960px] flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold font-primary text-accent-green text-sm">{"//"}</span>
          <span className="font-bold font-primary text-sm text-text-primary">
            shame_leaderboard
          </span>
        </div>
        <div className="h-6 w-24 animate-pulse rounded bg-bg-elevated" />
      </div>

      <div className="h-3 w-64 animate-pulse rounded bg-bg-elevated" />

      {/* Table skeleton */}
      <div className="flex flex-col border border-border-primary">
        {/* Header row — static labels, not skeleton */}
        <div className="flex items-center gap-6 border-border-primary border-b bg-bg-surface px-5 py-3">
          <span className="w-10 font-primary text-text-tertiary text-xs">#</span>
          <span className="w-[60px] font-primary text-text-tertiary text-xs">score</span>
          <span className="flex-1 font-primary text-text-tertiary text-xs">code</span>
          <span className="w-[100px] text-right font-primary text-text-tertiary text-xs">lang</span>
        </div>

        {/* 3 skeleton rows */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-6 border-border-primary px-5 py-4",
              i < 3 && "border-b"
            )}
          >
            <div className="h-3 w-10 animate-pulse rounded bg-bg-elevated" />
            <div className="h-3 w-[60px] animate-pulse rounded bg-bg-elevated" />
            <div className="flex flex-1 flex-col gap-[3px]">
              <div className="h-3 w-3/4 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-bg-elevated" />
            </div>
            <div className="h-3 w-[80px] animate-pulse rounded bg-bg-elevated" />
          </div>
        ))}
      </div>

      {/* Footer hint skeleton */}
      <div className="flex justify-center">
        <div className="h-3 w-56 animate-pulse rounded bg-bg-elevated" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/shame-leaderboard-preview.tsx
git commit -m "AUD-NNN feat(ui): add ShameLeaderboardPreview component and skeleton"
```

---

## Task 3: Create `ShameLeaderboardLoader` server component

**Files:**
- Create: `src/app/shame-leaderboard-loader.tsx`

Follows the exact same pattern as `src/app/home-stats-loader.tsx`: async RSC, calls tRPC via `caller` (direct DB, no HTTP), passes data to the presentational component.

- [ ] **Step 1: Create the file**

```tsx
// src/app/shame-leaderboard-loader.tsx
import { caller } from "@/trpc/server";
import { ShameLeaderboardPreview } from "./shame-leaderboard-preview";

export async function ShameLeaderboardLoader() {
  const { entries, totalCount } = await caller.leaderboard.getShamePreview();
  return <ShameLeaderboardPreview entries={entries} totalCount={totalCount} />;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/shame-leaderboard-loader.tsx
git commit -m "AUD-NNN feat(rsc): add ShameLeaderboardLoader async server component"
```

---

## Task 4: Wire up the homepage

**Files:**
- Modify: `src/app/page.tsx`

The current `page.tsx` has a hardcoded `<section>` (lines 42–118) with 5 `LeaderboardRow*` imports, a `Link` import, and a `Button` import — all now handled inside `ShameLeaderboardPreview`. **Remove all of those imports** from `page.tsx` or Biome will fail the build on unused-imports. Add the two new imports (`ShameLeaderboardSkeleton`, `ShameLeaderboardLoader`) and replace the entire hardcoded section with the `<Suspense>` boundary.

The existing `HomeStatsLoader` Suspense boundary is kept untouched — these are independent sections with independent skeletons.

- [ ] **Step 1: Replace `page.tsx` entirely**

```tsx
// src/app/page.tsx
import { Suspense } from "react";
import { HomeEditorSection } from "./home-actions";
import { HomeStatsSkeleton } from "./home-stats";
import { HomeStatsLoader } from "./home-stats-loader";
import { ShameLeaderboardSkeleton } from "./shame-leaderboard-preview";
import { ShameLeaderboardLoader } from "./shame-leaderboard-loader";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-6 py-16">
      {/* Hero */}
      <section className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-bold font-primary text-4xl text-text-primary">
            <span className="text-accent-green">$ </span>
            paste your code. get roasted.
          </h1>
          <p className="font-secondary text-sm text-text-secondary">
            {
              "// drop your code below and we'll rate it — brutally honest or full roast mode"
            }
          </p>
        </div>

        {/* Code editor + actions bar */}
        <HomeEditorSection />

        {/* Footer stats */}
        <Suspense fallback={<HomeStatsSkeleton />}>
          <HomeStatsLoader />
        </Suspense>
      </section>

      {/* Shame leaderboard preview */}
      <Suspense fallback={<ShameLeaderboardSkeleton />}>
        <ShameLeaderboardLoader />
      </Suspense>

      {/* Bottom padding */}
      <div className="h-[60px]" />
    </main>
  );
}
```

> Imports removed vs. current `page.tsx`: `Link`, `Button`, `LeaderboardRowCode`, `LeaderboardRowLanguage`, `LeaderboardRowRank`, `LeaderboardRowRoot`, `LeaderboardRowScore`.

- [ ] **Step 2: Run the dev server and verify visually**

```bash
npm run dev
```

Open `http://localhost:3000`. Check:
- [ ] Skeleton renders during load (verify by temporarily adding `await new Promise(r => setTimeout(r, 2000))` inside `ShameLeaderboardLoader`, then revert)
- [ ] Rank #1 number is bold amber; ranks 2–3 are secondary color
- [ ] Score shows one decimal (e.g. `1.2`)
- [ ] Code column shows up to 3 stacked lines per entry
- [ ] Footer shows `showing top 3 of N` with real total count
- [ ] Both links (`$ view_all >>` and `view full leaderboard >>`) navigate to `/leaderboard`
- [ ] `HomeStats` Suspense boundary is unaffected

- [ ] **Step 3: Verify TypeScript and build compile cleanly**

```bash
npx tsc --noEmit && npm run build
```
Expected: clean build, no type errors, no unused-import lint errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "AUD-NNN feat(home): wire shame leaderboard with Suspense and SSR data"
```

---

## SSR Fetching Rule (important for future agents)

`ShameLeaderboardLoader` uses `caller` from `@/trpc/server` — a **direct** server-side call with zero HTTP overhead. This is the default pattern for all RSC data fetching in this project. Never switch to `useTRPC` / client-side fetching for this section; the data is static on page load and gains nothing from client hydration.
