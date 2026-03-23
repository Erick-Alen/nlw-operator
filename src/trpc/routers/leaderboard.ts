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
});
