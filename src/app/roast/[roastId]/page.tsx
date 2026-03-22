import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
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

// --- Mock data (will be replaced with backend fetch using roastId) ---

interface RoastData {
  analysis: {
    severity: "critical" | "warning" | "good";
    label: string;
    title: string;
    description: string;
  }[];
  code: string;
  diff: { type: "added" | "removed" | "context"; content: string }[];
  language: BundledLanguage;
  roastMessage: string;
  score: number;
  verdict: string;
  verdictSeverity: "critical" | "warning" | "good";
}

const mockRoast: RoastData = {
  score: 3.5,
  verdict: "verdict: needs_serious_help",
  verdictSeverity: "critical",
  roastMessage:
    '"this code looks like it was written during a power outage... in 2005."',
  language: "javascript",
  code: `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`,
  analysis: [
    {
      severity: "critical",
      label: "critical",
      title: "using var instead of const/let",
      description:
        "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
    },
    {
      severity: "warning",
      label: "warning",
      title: "imperative loop pattern",
      description:
        "for loops are verbose and error-prone. use .reduce() or .map() for cleaner, functional transformations.",
    },
    {
      severity: "good",
      label: "good",
      title: "clear naming conventions",
      description:
        "calculateTotal and items are descriptive, self-documenting names that communicate intent without comments.",
    },
    {
      severity: "good",
      label: "good",
      title: "single responsibility",
      description:
        "the function does one thing well — calculates a total. no side effects, no mixed concerns, no hidden complexity.",
    },
  ],
  diff: [
    { type: "context", content: "function calculateTotal(items) {" },
    { type: "removed", content: "  var total = 0;" },
    {
      type: "removed",
      content: "  for (var i = 0; i < items.length; i++) {",
    },
    { type: "removed", content: "    total = total + items[i].price;" },
    { type: "removed", content: "  }" },
    { type: "removed", content: "  return total;" },
    {
      type: "added",
      content: "  return items.reduce((sum, item) => sum + item.price, 0);",
    },
    { type: "context", content: "}" },
  ],
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

// --- Page ---

export default async function RoastResultsPage({
  params,
}: {
  params: Promise<{ roastId: string }>;
}) {
  const { roastId } = await params;

  // TODO: fetch roast data from backend using roastId
  console.log("roastId:", roastId);
  const roast = mockRoast;

  const lines = roast.code.split("\n");
  const html = await codeToHtml(roast.code, {
    lang: roast.language,
    theme: "vesper",
  });

  return (
    <main className="flex flex-col gap-10 px-20 py-10">
      {/* Score Hero */}
      <section className="flex items-center gap-12">
        <ScoreRing score={roast.score} />

        <div className="flex flex-1 flex-col gap-4">
          <Badge severity={roast.verdictSeverity}>{roast.verdict}</Badge>
          <p className="font-secondary text-text-primary text-xl leading-relaxed">
            {roast.roastMessage}
          </p>
          <div className="flex items-center gap-4">
            <span className="font-primary text-text-tertiary text-xs">
              lang: {roast.language}
            </span>
            <span className="font-primary text-text-tertiary text-xs">·</span>
            <span className="font-primary text-text-tertiary text-xs">
              {lines.length} lines
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
            {roast.analysis.slice(0, 2).map((item) => (
              <AnalysisCard
                description={item.description}
                key={item.title}
                label={item.label}
                severity={item.severity}
                size="full"
                title={item.title}
              />
            ))}
          </div>
          <div className="flex gap-5">
            {roast.analysis.slice(2, 4).map((item) => (
              <AnalysisCard
                description={item.description}
                key={item.title}
                label={item.label}
                severity={item.severity}
                size="full"
                title={item.title}
              />
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* Suggested Fix */}
      <section className="flex flex-col gap-6">
        <SectionTitle>suggested_fix</SectionTitle>
        <CodeBlockRoot>
          <CodeBlockHeader className="px-4">
            <span className="font-primary text-text-secondary text-xs">
              {"your_code.ts → improved_code.ts"}
            </span>
          </CodeBlockHeader>
          <div className="flex flex-col py-1">
            {roast.diff.map((line) => (
              <DiffLine
                content={line.content}
                key={`${line.type}-${line.content}`}
                language={roast.language}
                type={line.type}
              />
            ))}
          </div>
        </CodeBlockRoot>
      </section>
    </main>
  );
}
