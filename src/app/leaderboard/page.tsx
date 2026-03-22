import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import {
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockMeta,
  CodeBlockRoot,
} from "../components/ui/code-block";

interface LeaderboardEntry {
  code: string;
  language: BundledLanguage;
  rank: number;
  score: number;
}

const entries: LeaderboardEntry[] = [
  {
    rank: 1,
    score: 1.2,
    language: "javascript",
    code: `eval(prompt("enter code"))
document.write(response)
// trust the user lol`,
  },
  {
    rank: 2,
    score: 1.8,
    language: "typescript",
    code: `if (x == true) { return true; }
else if (x == false) { return false; }
else { return !false; }`,
  },
  {
    rank: 3,
    score: 2.1,
    language: "sql",
    code: `SELECT * FROM users WHERE 1=1
-- TODO: add authentication`,
  },
  {
    rank: 4,
    score: 2.3,
    language: "java",
    code: `catch (e) {
  // ignore
}`,
  },
  {
    rank: 5,
    score: 2.5,
    language: "javascript",
    code: `const sleep = (ms) =>
  new Date(Date.now() + ms)
  while(new Date() < end) {}`,
  },
];

async function EntryCard({ entry }: { entry: LeaderboardEntry }) {
  const lines = entry.code.split("\n");
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
            {lines.length} {lines.length === 1 ? "line" : "lines"}
          </CodeBlockMeta>
        </div>
      </CodeBlockHeader>

      <CodeBlockBody className="max-h-[120px] overflow-hidden" html={html} />
    </CodeBlockRoot>
  );
}

export default async function LeaderboardPage() {
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
            2,847 submissions
          </span>
          <span className="font-secondary text-text-tertiary text-xs">·</span>
          <span className="font-secondary text-text-tertiary text-xs">
            avg score: 4.2/10
          </span>
        </div>
      </section>

      {/* Entries */}
      <section className="mt-10 flex flex-col gap-5">
        {entries.map((entry) => (
          <EntryCard entry={entry} key={entry.rank} />
        ))}
      </section>
    </main>
  );
}
