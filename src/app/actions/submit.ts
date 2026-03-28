// src/app/actions/submit.ts
"use server";

import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { z } from "zod/v4";
import { roastAi } from "@/app/lib/roast-ai";
import { db } from "@/db";
import { diffLines, issues, submissions, suggestedFixes } from "@/db/schema";

const submitInputSchema = z.object({
  code: z.string().min(1).max(200_000),
  language: z.string().min(1),
  roastMode: z.boolean(),
});

export type SubmitInput = z.infer<typeof submitInputSchema>;

export async function submitCode(rawInput: SubmitInput) {
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
      revalidateTag("leaderboard", "max");
      revalidateTag(`roast-${submission.id}`, "max");
    } catch {
      await db
        .update(submissions)
        .set({ status: "failed" })
        .where(eq(submissions.id, submission.id));
    }
  });

  return { id: submission.id };
}
