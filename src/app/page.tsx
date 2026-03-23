import Link from "next/link";
import { Suspense } from "react";
import { Button } from "./components/ui/button";
import {
  LeaderboardRowCode,
  LeaderboardRowLanguage,
  LeaderboardRowRank,
  LeaderboardRowRoot,
  LeaderboardRowScore,
} from "./components/ui/leaderboard-row";
import { HomeEditorSection } from "./home-actions";
import { HomeStatsSkeleton } from "./home-stats";
import { HomeStatsLoader } from "./home-stats-loader";

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

      {/* Leaderboard preview */}
      <section className="mt-20 flex w-full max-w-[960px] flex-col gap-6">
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

        {/* Table header */}
        <div className="flex flex-col">
          <div className="flex items-center gap-6 bg-bg-surface px-5 py-3">
            <span className="w-10 font-primary text-text-tertiary text-xs">
              #
            </span>
            <span className="w-[60px] font-primary text-text-tertiary text-xs">
              score
            </span>
            <span className="flex-1 font-primary text-text-tertiary text-xs">
              code
            </span>
            <span className="w-[100px] text-right font-primary text-text-tertiary text-xs">
              lang
            </span>
          </div>

          {/* Row 1 */}
          <LeaderboardRowRoot>
            <LeaderboardRowRank>#1</LeaderboardRowRank>
            <LeaderboardRowScore>1.2</LeaderboardRowScore>
            <LeaderboardRowCode>
              {'eval(prompt("enter code")); document.write(result)'}
            </LeaderboardRowCode>
            <LeaderboardRowLanguage>javascript</LeaderboardRowLanguage>
          </LeaderboardRowRoot>

          {/* Row 2 */}
          <LeaderboardRowRoot>
            <LeaderboardRowRank>#2</LeaderboardRowRank>
            <LeaderboardRowScore>1.8</LeaderboardRowScore>
            <LeaderboardRowCode>
              {"if (x == true) { return true; } else { return false; }"}
            </LeaderboardRowCode>
            <LeaderboardRowLanguage>typescript</LeaderboardRowLanguage>
          </LeaderboardRowRoot>

          {/* Row 3 */}
          <LeaderboardRowRoot>
            <LeaderboardRowRank>#3</LeaderboardRowRank>
            <LeaderboardRowScore>2.1</LeaderboardRowScore>
            <LeaderboardRowCode>
              {"SELECT * FROM users; -- TODO: add WHERE clause later"}
            </LeaderboardRowCode>
            <LeaderboardRowLanguage>sql</LeaderboardRowLanguage>
          </LeaderboardRowRoot>
        </div>

        <p className="text-center font-secondary text-text-tertiary text-xs">
          {"showing top 3 · "}
          <Link
            className="transition-colors duration-200 hover:text-text-secondary"
            href="/leaderboard"
          >
            {"view full leaderboard >>"}
          </Link>
        </p>
      </section>

      {/* Bottom padding */}
      <div className="h-[60px]" />
    </main>
  );
}
