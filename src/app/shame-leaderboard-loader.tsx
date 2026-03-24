import { caller } from "@/trpc/server";
import { ShameLeaderboardPreview } from "./shame-leaderboard-preview";

export async function ShameLeaderboardLoader() {
  const { entries, totalCount } = await caller.leaderboard.getShamePreview();
  return <ShameLeaderboardPreview entries={entries} totalCount={totalCount} />;
}
