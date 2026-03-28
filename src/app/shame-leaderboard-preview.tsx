import type { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import type { submissions } from "@/db/schema";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/cn";
import { ExpandableCode } from "./components/ui/expandable-code";
import {
  LeaderboardRowRank,
  LeaderboardRowScore,
} from "./components/ui/leaderboard-row";

type Submission = InferSelectModel<typeof submissions>;

interface ShameLeaderboardPreviewProps {
  entries: Submission[];
  totalCount: number;
}

// --- Internal async entry component ---

interface ShameLeaderboardEntryProps {
  entry: Submission;
  isLast: boolean;
  rank: number;
}

async function ShameLeaderboardEntry({
  entry,
  rank,
  isLast,
}: ShameLeaderboardEntryProps) {
  const lineCount = entry.lineCount || entry.code.split("\n").length;

  const html = await codeToHtml(entry.code, {
    lang: entry.language as BundledLanguage,
    theme: "vesper",
  });

  return (
    <div
      className={cn(
        "flex flex-col border-border-primary border-b",
        isLast && "border-b-0"
      )}
    >
      {/* Meta row */}
      <div className="flex items-center gap-4 px-5 py-3">
        <LeaderboardRowRank
          className={cn(
            "w-8 text-xs",
            rank === 1 ? "font-bold text-accent-amber" : "text-text-secondary"
          )}
        >
          {rank}
        </LeaderboardRowRank>

        <LeaderboardRowScore className="w-14 text-xs">
          {Number(entry.score ?? 0).toFixed(1)}
        </LeaderboardRowScore>

        <span className="flex-1 font-primary text-text-tertiary text-xs">
          {lineCount} {lineCount === 1 ? "line" : "lines"}
        </span>

        <span className="font-primary text-text-secondary text-xs">
          {entry.language}
        </span>
      </div>

      {/* Syntax-highlighted code, expandable */}
      <ExpandableCode html={html} lineCount={lineCount} />
    </div>
  );
}

// --- Public component ---

export function ShameLeaderboardPreview({
  entries,
  totalCount,
}: ShameLeaderboardPreviewProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="mt-20 flex w-full max-w-[960px] flex-col gap-6">
      {/* Section header */}
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

      {/* Entries */}
      <div className="flex flex-col border border-border-primary">
        {entries.map((entry, index) => (
          <ShameLeaderboardEntry
            entry={entry}
            isLast={index === entries.length - 1}
            key={entry.id}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Footer hint */}
      <p className="text-center font-secondary text-text-tertiary text-xs">
        {`showing top 3 of ${totalCount.toLocaleString()} · `}
        <Link
          className="transition-colors duration-200 hover:text-text-secondary"
          href="/leaderboard"
        >
          {"view full leaderboard >>"}
        </Link>
      </p>
    </section>
  );
}

export function ShameLeaderboardSkeleton() {
  return (
    <section className="mt-20 flex w-full max-w-[960px] flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold font-primary text-accent-green text-sm">
            {"//"}
          </span>
          <span className="font-bold font-primary text-sm text-text-primary">
            shame_leaderboard
          </span>
        </div>
        <div className="h-6 w-24 animate-pulse rounded bg-bg-elevated" />
      </div>

      <div className="h-3 w-64 animate-pulse rounded bg-bg-elevated" />

      {/* 3 skeleton entries */}
      <div className="flex flex-col border border-border-primary">
        {[1, 2, 3].map((i) => (
          <div
            className={cn(
              "flex flex-col border-border-primary border-b",
              i === 3 && "border-b-0"
            )}
            key={i}
          >
            {/* Meta row skeleton */}
            <div className="flex items-center gap-4 px-5 py-3">
              <div className="h-3 w-8 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3 w-14 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3 w-16 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3 w-20 animate-pulse rounded bg-bg-elevated" />
            </div>
            {/* Code block skeleton */}
            <div className="h-[120px] animate-pulse bg-bg-elevated" />
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex justify-center">
        <div className="h-3 w-56 animate-pulse rounded bg-bg-elevated" />
      </div>
    </section>
  );
}
