import { cacheLife, cacheTag } from "next/cache";
import { staticCaller } from "@/trpc/server";
import { HomeStats } from "./home-stats";

export async function HomeStatsLoader() {
  "use cache";
  cacheLife("minutes");
  cacheTag("leaderboard");

  const stats = await staticCaller.leaderboard.getStats();
  return <HomeStats avgScore={stats.avgScore} totalCount={stats.totalCount} />;
}
