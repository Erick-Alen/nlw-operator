import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { BundledLanguage } from "shiki";
import { cachedHighlight } from "@/app/lib/cached-highlight";
import { staticCaller } from "@/trpc/server";
import { AnalysisCard } from "../../components/ui/analysis-card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockRoot,
} from "../../components/ui/code-block";
import { DiffLine } from "../../components/ui/diff-line";
import { ScoreRing } from "../../components/ui/score-ring";
import { RoastPendingView } from "./roast-pending-view";

// --- Verdict → Badge severity mapping ---

const verdictSeverityMap: Record<string, "critical" | "warning" | "good"> = {
  mass_disaster: "critical",
  needs_serious_help: "critical",
  barely_acceptable: "warning",
  decent_enough: "warning",
  actually_good: "good",
  mass_respect: "good",
};

// --- Section title helper ---

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold font-primary text-accent-green text-sm">
        {"//"}
      </span>
      <h2 className="font-bold font-primary text-sm text-text-primary">
        {children}
      </h2>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-border-primary" />;
}

// --- Cached content component ---

async function CachedRoastContent({ roastId }: { roastId: string }) {
  "use cache";
  cacheLife("static");
  cacheTag(`roast-${roastId}`);

  let roast: Awaited<ReturnType<typeof staticCaller.submission.getById>>;
  try {
    roast = await staticCaller.submission.getById({ id: roastId });
  } catch {
    notFound();
  }

  // Guard nullable AI fields — these are always populated when status is 'done'
  if (!(roast.score && roast.verdict && roast.roastQuote)) {
    notFound();
  }

  const score = Number(roast.score);
  const severity = verdictSeverityMap[roast.verdict] ?? "warning";
  const language = roast.language as BundledLanguage;

  const html = await cachedHighlight(roast.code, language);

  return (
    <main className="flex flex-col gap-10 px-20 py-10">
      {/* Score Hero */}
      <section className="flex items-center gap-12">
        <ScoreRing score={score} />

        <div className="flex flex-1 flex-col gap-4">
          <Badge severity={severity}>
            verdict: {roast.verdict.replace(/_/g, " ")}
          </Badge>
          <p className="font-secondary text-text-primary text-xl leading-relaxed">
            {`"${roast.roastQuote}"`}
          </p>
          <div className="flex items-center gap-4">
            <span className="font-primary text-text-tertiary text-xs">
              lang: {roast.language}
            </span>
            <span className="font-primary text-text-tertiary text-xs">·</span>
            <span className="font-primary text-text-tertiary text-xs">
              {roast.lineCount} lines
            </span>
          </div>
          <div>
            <Button variant="secondary">{"$ share_roast"}</Button>
          </div>
        </div>
      </section>

      <Divider />

      {/* Submitted Code */}
      <section className="flex flex-col gap-4">
        <SectionTitle>your_submission</SectionTitle>
        <CodeBlockRoot>
          <CodeBlockBody html={html} />
        </CodeBlockRoot>
      </section>

      <Divider />

      {/* Detailed Analysis */}
      <section className="flex flex-col gap-6">
        <SectionTitle>detailed_analysis</SectionTitle>
        <div className="flex flex-col gap-5">
          <div className="flex gap-5">
            {roast.issues.slice(0, 2).map((issue) => (
              <AnalysisCard
                description={issue.description}
                key={issue.id}
                label={issue.severity}
                severity={issue.severity}
                size="full"
                title={issue.title}
              />
            ))}
          </div>
          {roast.issues.length > 2 && (
            <div className="flex gap-5">
              {roast.issues.slice(2, 4).map((issue) => (
                <AnalysisCard
                  description={issue.description}
                  key={issue.id}
                  label={issue.severity}
                  severity={issue.severity}
                  size="full"
                  title={issue.title}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {roast.suggestedFix && (
        <>
          <Divider />

          {/* Suggested Fix */}
          <section className="flex flex-col gap-6">
            <SectionTitle>suggested_fix</SectionTitle>
            <CodeBlockRoot>
              <CodeBlockHeader className="px-4">
                <span className="font-primary text-text-secondary text-xs">
                  {roast.suggestedFix.headerLabel}
                </span>
              </CodeBlockHeader>
              <div className="flex flex-col py-1">
                {roast.suggestedFix.lines.map((line) => (
                  <DiffLine
                    content={line.content}
                    key={line.id}
                    language={language}
                    type={line.type}
                  />
                ))}
              </div>
            </CodeBlockRoot>
          </section>
        </>
      )}
    </main>
  );
}

// --- Page ---

export default async function RoastResultsPage({
  params,
}: {
  params: Promise<{ roastId: string }>;
}) {
  const { roastId } = await params;
  await connection(); // opt into dynamic rendering for uncached status check

  // Status check — NOT cached, runs on every request
  const statusResult = await staticCaller.submission.getStatusById({
    id: roastId,
  });

  if (!statusResult) {
    notFound();
  }

  if (statusResult.status === "pending") {
    return <RoastPendingView />;
  }

  if (statusResult.status === "failed") {
    return (
      <main className="flex flex-col items-center justify-center gap-4 px-20 py-20">
        <span className="font-bold font-primary text-3xl text-accent-red">
          {">"}
        </span>
        <h1 className="font-bold font-primary text-text-primary text-xl">
          roast_failed
        </h1>
        <p className="font-secondary text-sm text-text-secondary">
          {"// the AI couldn't process your code. try again."}
        </p>
      </main>
    );
  }

  return <CachedRoastContent roastId={roastId} />;
}
