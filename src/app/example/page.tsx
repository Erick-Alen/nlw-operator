import { Suspense } from "react";
import {
  AnalysisCard,
  CardDescription,
  CardHeader,
  CardRoot,
  CardTitle,
} from "../components/ui/analysis-card";
import { Badge, BadgeIndicator, BadgeRoot } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockMeta,
  CodeBlockRoot,
} from "../components/ui/code-block";
import { DiffLine } from "../components/ui/diff-line";
import {
  LeaderboardRow,
  LeaderboardRowCode,
  LeaderboardRowLanguage,
  LeaderboardRowRank,
  LeaderboardRowRoot,
  LeaderboardRowScore,
} from "../components/ui/leaderboard-row";
import {
  NavbarLink,
  NavbarLogo,
  NavbarRoot,
  NavbarSpacer,
} from "../components/ui/navbar";
import {
  ScoreRing,
  ScoreRingLabel,
  ScoreRingRoot,
  ScoreRingValue,
} from "../components/ui/score-ring";
import { ToggleDemo } from "./toggle-demo";

const sampleCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}`;

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <span className="font-bold font-primary text-accent-green text-sm">
          {"//"}
        </span>
        <h2 className="font-bold font-primary text-sm text-text-primary">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-primary text-text-muted text-xs">{children}</span>
  );
}

async function CodeBlockComposedDemo() {
  const { codeToHtml } = await import("shiki");
  const html = await codeToHtml('const greeting = "hello world";', {
    lang: "javascript",
    theme: "vesper",
  });

  return (
    <CodeBlockRoot>
      <CodeBlockHeader>
        <CodeBlockMeta>custom header · 1 line</CodeBlockMeta>
      </CodeBlockHeader>
      <CodeBlockBody html={html} />
    </CodeBlockRoot>
  );
}

export default function ExamplePage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-page">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-8 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-bold font-primary text-3xl text-text-primary">
            {"$ component_library"}
          </h1>
          <p className="font-secondary text-sm text-text-secondary">
            all shareable ui components — simple api and composition pattern.
          </p>
        </div>

        {/* --- Buttons --- */}
        <Section title="buttons">
          <div className="flex items-center gap-4">
            <Button variant="primary">$ roast_my_code</Button>
            <Button variant="secondary">$ share_roast</Button>
            <Button variant="link">{"$ view_all >>"}</Button>
          </div>
        </Section>

        {/* --- Badges --- */}
        <Section title="badges">
          <SectionLabel>simple api</SectionLabel>
          <div className="flex items-center gap-6">
            <Badge severity="critical">critical</Badge>
            <Badge severity="warning">warning</Badge>
            <Badge severity="good">good</Badge>
          </div>

          <SectionLabel>composed</SectionLabel>
          <div className="flex items-center gap-6">
            <BadgeRoot severity="critical">
              <BadgeIndicator severity="critical" />
              needs_serious_help
            </BadgeRoot>
            <BadgeRoot severity="good">
              <BadgeIndicator severity="good" />
              score: 9.2
            </BadgeRoot>
          </div>
        </Section>

        {/* --- Toggle --- */}
        <Section title="toggle">
          <ToggleDemo />
        </Section>

        {/* --- Score Ring --- */}
        <Section title="score_ring">
          <SectionLabel>simple api</SectionLabel>
          <div className="flex items-center gap-8">
            <ScoreRing score={3.5} />
            <ScoreRing maxScore={10} score={7} />
          </div>

          <SectionLabel>composed</SectionLabel>
          <div className="flex items-center gap-8">
            <ScoreRingRoot maxScore={10} score={4.2}>
              <div className="flex flex-col items-center gap-1">
                <ScoreRingValue>4.2</ScoreRingValue>
                <ScoreRingLabel>/10</ScoreRingLabel>
                <span className="font-primary text-[10px] text-accent-red">
                  needs work
                </span>
              </div>
            </ScoreRingRoot>
          </div>
        </Section>

        {/* --- Analysis Cards --- */}
        <Section title="analysis_cards">
          <SectionLabel>simple api</SectionLabel>
          <div className="flex flex-wrap gap-4">
            <AnalysisCard
              description="the var keyword is function-scoped rather than block-scoped, which can lead to unexpected behavior and bugs."
              label="critical"
              severity="critical"
              title="using var instead of const/let"
            />
            <AnalysisCard
              description="use proper error handling with try/catch blocks."
              label="warning"
              severity="warning"
              title="inconsistent line patterns"
            />
          </div>

          <SectionLabel>composed</SectionLabel>
          <CardRoot size="full">
            <CardHeader>
              <Badge severity="good">clean code</Badge>
            </CardHeader>
            <CardTitle>custom card with any content</CardTitle>
            <CardDescription>
              using composition, you can place any content inside the card
              structure — badges, buttons, code blocks, or anything else.
            </CardDescription>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary">$ dismiss</Button>
              <Button variant="link">$ details</Button>
            </div>
          </CardRoot>
        </Section>

        {/* --- Code Block --- */}
        <Section title="code_block">
          <SectionLabel>simple api</SectionLabel>
          <Suspense
            fallback={
              <div className="h-48 animate-pulse border border-border-primary bg-bg-input" />
            }
          >
            <CodeBlock code={sampleCode} language="javascript" />
          </Suspense>

          <SectionLabel>composed</SectionLabel>
          <Suspense
            fallback={
              <div className="h-24 animate-pulse border border-border-primary bg-bg-input" />
            }
          >
            <CodeBlockComposedDemo />
          </Suspense>
        </Section>

        {/* --- Diff Lines --- */}
        <Section title="diff_lines">
          <Suspense
            fallback={<div className="h-24 animate-pulse bg-bg-input" />}
          >
            <div className="flex flex-col">
              <DiffLine content="var total = 0;" type="removed" />
              <DiffLine content="let total = 0;" type="added" />
              <DiffLine content="return total;" type="context" />
            </div>
          </Suspense>
        </Section>

        {/* --- Leaderboard Rows --- */}
        <Section title="leaderboard_rows">
          <SectionLabel>simple api</SectionLabel>
          <div className="flex flex-col">
            <LeaderboardRow
              code='eval(prompt("enter code"))'
              language="javascript"
              rank={1}
              score={1.2}
            />
            <LeaderboardRow
              code="if (a == true) { return true; }"
              language="javascript"
              rank={2}
              score={1.8}
            />
          </div>

          <SectionLabel>composed</SectionLabel>
          <div className="flex flex-col">
            <LeaderboardRowRoot>
              <LeaderboardRowRank>#1</LeaderboardRowRank>
              <LeaderboardRowScore>1.2</LeaderboardRowScore>
              <LeaderboardRowCode>
                eval(prompt(&quot;enter code&quot;))
              </LeaderboardRowCode>
              <LeaderboardRowLanguage>
                <Badge severity="critical">js</Badge>
              </LeaderboardRowLanguage>
            </LeaderboardRowRoot>
          </div>
        </Section>

        {/* --- Navbar (composed) --- */}
        <Section title="navbar_composed">
          <NavbarRoot>
            <NavbarLogo>
              <span className="font-bold font-primary text-accent-amber text-xl">
                {"~"}
              </span>
              <span className="font-medium font-primary text-lg text-text-primary">
                custom_brand
              </span>
            </NavbarLogo>
            <NavbarSpacer />
            <NavbarLink href="#">docs</NavbarLink>
          </NavbarRoot>
        </Section>
      </main>
    </div>
  );
}
