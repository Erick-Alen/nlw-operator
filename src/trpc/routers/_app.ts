import { createTRPCRouter } from "../init";
import { leaderboardRouter } from "./leaderboard";
import { submissionRouter } from "./submission";

export const appRouter = createTRPCRouter({
  submission: submissionRouter,
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
