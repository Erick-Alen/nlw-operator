import { cacheLife, cacheTag } from "next/cache";
import { staticCaller } from "@/trpc/server";
import { ShameLeaderboardPreview } from "./shame-leaderboard-preview";

export async function ShameLeaderboardLoader() {
  "use cache";
  cacheLife("minutes");
  cacheTag("leaderboard");

  const { entries, totalCount } =
    await staticCaller.leaderboard.getShamePreview();
  return <ShameLeaderboardPreview entries={entries} totalCount={totalCount} />;
}
