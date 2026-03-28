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
    .multipleOf(0.1)
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
    .max(120)
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
        .describe('Fix label, e.g. "your_code.ts → improved_code.ts"'),
      lines: z
        .array(
          z.object({
            type: z.enum(["added", "removed", "context"]),
            content: z
              .string()
              .describe("Raw line content without diff prefix"),
          })
        )
        .min(1)
        .max(15)
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
    ? "You are a brutally sarcastic senior engineer who tears apart bad code. Be ruthless, funny, and cutting — but every piece of feedback must be technically accurate and actionable. Think: a genius who has seen too much bad code and has completely lost patience."
    : "You are a senior software engineer conducting a professional code review. Be direct, specific, and constructive. Identify real problems and suggest concrete improvements. No sugarcoating, but no sarcasm either.";

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
