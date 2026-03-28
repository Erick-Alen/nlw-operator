import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import type { BundledLanguage } from "shiki";
import { cachedHighlight } from "@/app/lib/cached-highlight";
import { staticCaller } from "@/trpc/server";
import {
  CodeBlockHeader,
  CodeBlockMeta,
  CodeBlockRoot,
} from "../components/ui/code-block";
import { ExpandableCode } from "../components/ui/expandable-code";

// --- Entry card ---

interface EntryCardProps {
  code: string;
  language: BundledLanguage;
  lineCount: number;
  rank: number;
  score: string;
}

async function EntryCard({ entry }: { entry: EntryCardProps }) {
  const html = await cachedHighlight(entry.code, entry.language);

  return (
    <CodeBlockRoot>
      <CodeBlockHeader className="h-12 justify-between px-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <CodeBlockMeta>#</CodeBlockMeta>
            <span className="font-bold font-primary text-accent-amber text-sm">
              {entry.rank}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <CodeBlockMeta>score:</CodeBlockMeta>
            <span className="font-bold font-primary text-accent-red text-sm">
              {entry.score}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CodeBlockMeta className="text-text-secondary">
            {entry.language}
          </CodeBlockMeta>
          <CodeBlockMeta>
            {entry.lineCount} {entry.lineCount === 1 ? "line" : "lines"}
          </CodeBlockMeta>
        </div>
      </CodeBlockHeader>

      <ExpandableCode html={html} lineCount={entry.lineCount} />
    </CodeBlockRoot>
  );
}

// --- Entry card skeleton ---

function EntryCardSkeleton() {
  return (
    <div className="flex flex-col border border-border-primary">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-border-primary border-b px-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 animate-pulse rounded bg-bg-elevated" />
            <div className="h-4 w-5 animate-pulse rounded bg-bg-elevated" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-10 animate-pulse rounded bg-bg-elevated" />
            <div className="h-4 w-8 animate-pulse rounded bg-bg-elevated" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-16 animate-pulse rounded bg-bg-elevated" />
          <div className="h-3 w-12 animate-pulse rounded bg-bg-elevated" />
        </div>
      </div>
      {/* Code block */}
      <div className="h-[120px] animate-pulse bg-bg-elevated" />
    </div>
  );
}

// --- Loader ---

async function LeaderboardEntriesLoader() {
  "use cache";
  cacheLife("minutes");
  cacheTag("leaderboard");

  const entries = await staticCaller.leaderboard.getTop({ limit: 10 });

  const avgScore =
    entries.length > 0
      ? (
          entries.reduce((sum, e) => sum + Number(e.score), 0) / entries.length
        ).toFixed(1)
      : "0";

  return (
    <>
      {/* Stats */}
      <div className="flex items-center gap-2">
        <span className="font-secondary text-text-tertiary text-xs">
          {entries.length} submissions
        </span>
        <span className="font-secondary text-text-tertiary text-xs">·</span>
        <span className="font-secondary text-text-tertiary text-xs">
          avg score: {avgScore}/10
        </span>
      </div>

      {/* Entry cards */}
      <section className="mt-10 flex flex-col gap-5">
        {entries.map((entry, i) => (
          <EntryCard
            entry={{
              rank: i + 1,
              score: entry.score ?? "0",
              language: entry.language as BundledLanguage,
              code: entry.code,
              lineCount: entry.lineCount || entry.code.split("\n").length,
            }}
            key={entry.id}
          />
        ))}
      </section>
    </>
  );
}

// --- Skeleton for the loader section ---

function LeaderboardEntriesSkeleton() {
  return (
    <>
      {/* Stats line skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 animate-pulse rounded bg-bg-elevated" />
        <div className="h-3 w-2 animate-pulse rounded bg-bg-elevated" />
        <div className="h-3 w-28 animate-pulse rounded bg-bg-elevated" />
      </div>

      {/* Card skeletons */}
      <section className="mt-10 flex flex-col gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <EntryCardSkeleton key={i} />
        ))}
      </section>
    </>
  );
}

// --- Page ---

export default function LeaderboardPage() {
  return (
    <main className="flex flex-col px-20 py-10">
      {/* Hero — static, renders immediately */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="font-bold font-primary text-3xl text-accent-green">
            {">"}
          </span>
          <h1 className="font-bold font-primary text-3xl text-text-primary">
            shame_leaderboard
          </h1>
        </div>
        <p className="font-secondary text-sm text-text-secondary">
          {"// the most roasted code on the internet"}
        </p>

        {/* Stats + entries — suspense boundary */}
        <Suspense fallback={<LeaderboardEntriesSkeleton />}>
          <LeaderboardEntriesLoader />
        </Suspense>
      </section>
    </main>
  );
}
