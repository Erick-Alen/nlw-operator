import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { caller } from "@/trpc/server";
import {
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockMeta,
  CodeBlockRoot,
} from "../components/ui/code-block";

interface EntryCardProps {
  code: string;
  language: BundledLanguage;
  lineCount: number;
  rank: number;
  score: string;
}

async function EntryCard({ entry }: { entry: EntryCardProps }) {
  const html = await codeToHtml(entry.code, {
    lang: entry.language,
    theme: "vesper",
  });

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

      <CodeBlockBody className="max-h-[120px] overflow-hidden" html={html} />
    </CodeBlockRoot>
  );
}

export default async function LeaderboardPage() {
  const entries = await caller.leaderboard.getTop({ limit: 10 });

  return (
    <main className="flex flex-col px-20 py-10">
      {/* Hero */}
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
        <div className="flex items-center gap-2">
          <span className="font-secondary text-text-tertiary text-xs">
            {entries.length} submissions
          </span>
          <span className="font-secondary text-text-tertiary text-xs">·</span>
          <span className="font-secondary text-text-tertiary text-xs">
            avg score:{" "}
            {entries.length > 0
              ? (
                  entries.reduce((sum, e) => sum + Number(e.score), 0) /
                  entries.length
                ).toFixed(1)
              : "0"}
            /10
          </span>
        </div>
      </section>

      {/* Entries */}
      <section className="mt-10 flex flex-col gap-5">
        {entries.map((entry, i) => (
          <EntryCard
            entry={{
              rank: i + 1,
              score: entry.score,
              language: entry.language as BundledLanguage,
              code: entry.code,
              lineCount: entry.lineCount,
            }}
            key={entry.id}
          />
        ))}
      </section>
    </main>
  );
}
