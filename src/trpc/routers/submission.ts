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
