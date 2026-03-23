import { caller } from "@/trpc/server";
import { HomeStats } from "./home-stats";

export async function HomeStatsLoader() {
  const stats = await caller.leaderboard.getStats();
  return <HomeStats avgScore={stats.avgScore} totalCount={stats.totalCount} />;
}
