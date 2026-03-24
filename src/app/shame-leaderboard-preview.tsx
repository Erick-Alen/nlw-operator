// src/app/shame-leaderboard-preview.tsx

import type { InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import type { submissions } from "@/db/schema";
import { Button } from "./components/ui/button";
import { cn } from "./components/ui/cn";
import {
  LeaderboardRowLanguage,
  LeaderboardRowRank,
  LeaderboardRowRoot,
  LeaderboardRowScore,
} from "./components/ui/leaderboard-row";

type Submission = InferSelectModel<typeof submissions>;

interface ShameLeaderboardPreviewProps {
  entries: Submission[];
  totalCount: number;
}

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

      {/* Table */}
      <div className="flex flex-col border border-border-primary">
        {/* Header */}
        <div className="flex items-center gap-6 border-border-primary border-b bg-bg-surface px-5 py-3">
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

        {/* Rows */}
        {entries.map((entry, index) => {
          const rank = index + 1;
          const codeLines = entry.code.split("\n").slice(0, 3);
          const isLast = index === entries.length - 1;

          return (
            <LeaderboardRowRoot
              className={cn(isLast && "border-b-0")}
              key={entry.id}
            >
              {/* Rank — amber for #1, secondary for others */}
              <LeaderboardRowRank
                className={cn(
                  rank === 1
                    ? "font-bold text-accent-amber"
                    : "text-text-secondary"
                )}
              >
                {rank}
              </LeaderboardRowRank>

              {/* Score */}
              <LeaderboardRowScore>
                {Number(entry.score ?? 0).toFixed(1)}
              </LeaderboardRowScore>

              {/* Code preview — up to 3 lines stacked */}
              <div className="flex flex-1 flex-col gap-[3px] overflow-hidden">
                {codeLines.map((line, i) => (
                  <span
                    className="truncate font-primary text-[12px] text-text-primary"
                    // biome-ignore lint/suspicious/noArrayIndexKey: static preview lines, order never changes
                    key={i}
                  >
                    {line}
                  </span>
                ))}
              </div>

              {/* Language */}
              <LeaderboardRowLanguage>{entry.language}</LeaderboardRowLanguage>
            </LeaderboardRowRoot>
          );
        })}
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

      {/* Table skeleton */}
      <div className="flex flex-col border border-border-primary">
        {/* Header row — static labels, not skeleton */}
        <div className="flex items-center gap-6 border-border-primary border-b bg-bg-surface px-5 py-3">
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

        {/* 3 skeleton rows */}
        {[1, 2, 3].map((i) => (
          <div
            className={cn(
              "flex items-center gap-6 border-border-primary px-5 py-4",
              i < 3 && "border-b"
            )}
            key={i}
          >
            <div className="h-3 w-10 animate-pulse rounded bg-bg-elevated" />
            <div className="h-3 w-[60px] animate-pulse rounded bg-bg-elevated" />
            <div className="flex flex-1 flex-col gap-[3px]">
              <div className="h-3 w-3/4 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-bg-elevated" />
            </div>
            <div className="h-3 w-[80px] animate-pulse rounded bg-bg-elevated" />
          </div>
        ))}
      </div>

      {/* Footer hint skeleton */}
      <div className="flex justify-center">
        <div className="h-3 w-56 animate-pulse rounded bg-bg-elevated" />
      </div>
    </section>
  );
}
