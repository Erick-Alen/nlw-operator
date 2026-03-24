// src/app/page.tsx
import { Suspense } from "react";
import { HomeEditorSection } from "./home-actions";
import { HomeStatsSkeleton } from "./home-stats";
import { HomeStatsLoader } from "./home-stats-loader";
import { ShameLeaderboardLoader } from "./shame-leaderboard-loader";
import { ShameLeaderboardSkeleton } from "./shame-leaderboard-preview";

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

      {/* Shame leaderboard preview */}
      <Suspense fallback={<ShameLeaderboardSkeleton />}>
        <ShameLeaderboardLoader />
      </Suspense>

      {/* Bottom padding */}
      <div className="h-[60px]" />
    </main>
  );
}
