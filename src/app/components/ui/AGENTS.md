# UI Components — devroast Design System

Shareable components built from the `devroast.pen` design file. All components use **named exports**, **Tailwind v4**, **class-variance-authority (CVA)**, **clsx**, and **tailwind-merge** via the `cn()` utility.

## Architecture

```
src/app/components/ui/
├── cn.ts              # Utility: clsx + tailwind-merge
├── button.tsx         # Button with variants (base-ui)
├── badge.tsx          # Status badge — BadgeRoot, BadgeIndicator, Badge
├── toggle.tsx         # Switch toggle (base-ui, client component)
├── navbar.tsx         # Navigation — NavbarRoot, NavbarLogo, NavbarSpacer, NavbarLink, Navbar
├── analysis-card.tsx  # Card — CardRoot, CardHeader, CardTitle, CardDescription, AnalysisCard
├── score-ring.tsx     # Score — ScoreRingRoot, ScoreRingValue, ScoreRingLabel, ScoreRing
├── code-block.tsx     # Code — CodeBlockRoot, CodeBlockHeader, CodeBlockMeta, CodeBlockBody, CodeBlock (server-only)
├── diff-line.tsx      # Diff line — DiffLine (server-only)
└── leaderboard-row.tsx # Row — LeaderboardRowRoot, LeaderboardRowRank, LeaderboardRowScore, LeaderboardRowCode, LeaderboardRowLanguage, LeaderboardRow
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `class-variance-authority` | Variant-based styling for components |
| `clsx` | Conditional class joining |
| `tailwind-merge` | Resolves Tailwind class conflicts |
| `@base-ui/react` | Headless primitives for Button (`@base-ui/react/button`) and Switch (`@base-ui/react/switch`) |
| `shiki` | Server-side syntax highlighting with Vesper theme |
| `server-only` | Enforces server-only imports for CodeBlock and DiffLine |

## Conventions

- **Named exports only** — no default exports, no barrel files (biome `noBarrelFile` rule).
- **Import directly** — `import { Button } from "@/app/components/ui/button"`.
- **`cn()` for class merging** — always use `cn()` from `./cn` to combine classes. Never use raw `clsx` or `twMerge` directly in components.
- **CVA for variants** — use `cva()` to define variant styles. Export the variants type via `VariantProps<typeof xVariants>`.
- **Spread `className`** — every component accepts `className` and merges it via `cn()` so consumers can override styles.
- **Spread rest props** — every component spreads `...props` onto the root element.
- **base-ui for behavior** — use `@base-ui/react` headless primitives for components with interactive behavior (Button, Toggle/Switch). Style them with Tailwind via `data-[checked]`, `data-[unchecked]`, `data-[disabled]` attributes.
- **Server-only components** — `CodeBlock` and `DiffLine` import `"server-only"` and are `async` functions. They **cannot** be imported from client components. Wrap them in `<Suspense>` when used.
- **Shiki for syntax highlighting** — uses `codeToHtml()` with the `vesper` theme. Output is rendered via `dangerouslySetInnerHTML` (safe — shiki produces pre-rendered HTML). Biome-ignore comment is required on the `dangerouslySetInnerHTML` prop.
- **`"use client"` only when needed** — only Toggle uses it (wraps base-ui Switch).
- **Biome compliance** — `useConsistentArrayType` (use `T[]` not `Array<T>`), `useSortedClasses` (Tailwind classes auto-sorted), `!important` syntax is `bg-transparent!` (Tailwind v4 postfix), not `!bg-transparent`.

## Composition Pattern

Every complex component exposes **composable sub-parts** alongside a **pre-composed convenience** export. This allows two usage styles:

### Simple API (props-driven)

Use the pre-composed component when the default structure fits your needs:

```tsx
<Badge severity="critical">critical</Badge>
<AnalysisCard severity="critical" label="critical" title="..." description="..." />
<Navbar links={[{ href: "/leaderboard", label: "leaderboard" }]} />
<ScoreRing score={3.5} />
<CodeBlock code={code} language="javascript" />
<LeaderboardRow rank={1} score={1.2} code="..." language="javascript" />
```

### Composition API (children-driven)

Use the sub-parts when you need custom structure, extra elements, or different content:

```tsx
// Badge — custom content alongside the indicator
<BadgeRoot severity="critical">
  <BadgeIndicator severity="critical" />
  needs_serious_help
</BadgeRoot>

// Card — custom layout with buttons
<CardRoot size="full">
  <CardHeader>
    <Badge severity="good">clean code</Badge>
  </CardHeader>
  <CardTitle>custom card</CardTitle>
  <CardDescription>with any content inside</CardDescription>
  <Button variant="secondary">$ action</Button>
</CardRoot>

// Navbar — custom branding and links
<NavbarRoot>
  <NavbarLogo>
    <span>~</span>
    <span>custom_brand</span>
  </NavbarLogo>
  <NavbarSpacer />
  <NavbarLink href="/docs">docs</NavbarLink>
  <NavbarLink href="/api">api</NavbarLink>
</NavbarRoot>

// ScoreRing — custom inner content
<ScoreRingRoot score={4.2} maxScore={10}>
  <div className="flex flex-col items-center gap-1">
    <ScoreRingValue>4.2</ScoreRingValue>
    <ScoreRingLabel>/10</ScoreRingLabel>
    <span className="text-accent-red text-[10px]">needs work</span>
  </div>
</ScoreRingRoot>

// CodeBlock — custom header (server component)
<CodeBlockRoot>
  <CodeBlockHeader>
    <CodeBlockMeta>custom header · 1 line</CodeBlockMeta>
  </CodeBlockHeader>
  <CodeBlockBody html={highlightedHtml} />
</CodeBlockRoot>

// LeaderboardRow — custom cells
<LeaderboardRowRoot>
  <LeaderboardRowRank>#1</LeaderboardRowRank>
  <LeaderboardRowScore>1.2</LeaderboardRowScore>
  <LeaderboardRowCode>eval(prompt("enter code"))</LeaderboardRowCode>
  <LeaderboardRowLanguage>
    <Badge severity="critical">js</Badge>
  </LeaderboardRowLanguage>
</LeaderboardRowRoot>
```

### Sub-parts Reference

| File | Sub-parts | Pre-composed |
|------|-----------|-------------|
| `badge.tsx` | `BadgeRoot`, `BadgeIndicator` | `Badge` |
| `analysis-card.tsx` | `CardRoot`, `CardHeader`, `CardTitle`, `CardDescription` | `AnalysisCard` |
| `navbar.tsx` | `NavbarRoot`, `NavbarLogo`, `NavbarSpacer`, `NavbarLink` | `Navbar` |
| `score-ring.tsx` | `ScoreRingRoot`, `ScoreRingValue`, `ScoreRingLabel` | `ScoreRing` |
| `code-block.tsx` | `CodeBlockRoot`, `CodeBlockHeader`, `CodeBlockMeta`, `CodeBlockBody` | `CodeBlock` |
| `leaderboard-row.tsx` | `LeaderboardRowRoot`, `LeaderboardRowRank`, `LeaderboardRowScore`, `LeaderboardRowCode`, `LeaderboardRowLanguage` | `LeaderboardRow` |

### When to use which

- **Simple API**: default layouts, standard content, quick prototyping.
- **Composition API**: custom content in slots, extra elements (buttons, badges inside cards), non-standard layouts, wrapping sub-parts with additional logic.

## Design Tokens

Defined in `src/app/globals.css` as CSS variables mapped to Tailwind v4 `@theme inline`:

| Token | Tailwind Class | Value |
|-------|---------------|-------|
| `--bg-page` | `bg-bg-page` | `#0a0a0a` |
| `--bg-surface` | `bg-bg-surface` | `#0f0f0f` |
| `--bg-elevated` | `bg-bg-elevated` | `#1a1a1a` |
| `--bg-input` | `bg-bg-input` | `#111111` |
| `--text-primary` | `text-text-primary` | `#fafafa` |
| `--text-secondary` | `text-text-secondary` | `#6b7280` |
| `--text-tertiary` | `text-text-tertiary` | `#4b5563` |
| `--accent-green` | `text-accent-green` / `bg-accent-green` | `#10b981` |
| `--accent-red` | `text-accent-red` / `bg-accent-red` | `#ef4444` |
| `--accent-amber` | `text-accent-amber` / `bg-accent-amber` | `#f59e0b` |
| `--accent-cyan` | `text-accent-cyan` / `bg-accent-cyan` | `#06b6d4` |
| `--border-primary` | `border-border-primary` | `#2a2a2a` |

Fonts: `font-primary` (JetBrains Mono), `font-secondary` (IBM Plex Mono).

## Component Reference

### `cn(...inputs: ClassValue[])`

Utility combining `clsx` and `twMerge`. Use for all dynamic class composition.

```tsx
import { cn } from "@/app/components/ui/cn";

cn("text-sm", isActive && "text-accent-green", className);
```

### `Button`

Wraps `@base-ui/react/button` for built-in focus management and disabled state handling. Three variants matching the design.

```tsx
import { Button } from "@/app/components/ui/button";

<Button variant="primary">$ roast_my_code</Button>
<Button variant="secondary">$ share_roast</Button>
<Button variant="link" disabled>$ view_all &gt;&gt;</Button>
```

**Props:** `variant` (`"primary"` | `"secondary"` | `"link"`), plus all base-ui Button props (`disabled`, `onClick`, etc.). Focus ring styled via `focus-visible:outline-accent-green`. Disabled state uses `data-[disabled]` attribute.

### `Badge` / `BadgeRoot` / `BadgeIndicator`

Status indicator with colored dot and label.

```tsx
import { Badge, BadgeRoot, BadgeIndicator } from "@/app/components/ui/badge";

// Simple
<Badge severity="critical">critical</Badge>

// Composed
<BadgeRoot severity="good">
  <BadgeIndicator severity="good" />
  score: 9.2
</BadgeRoot>
```

**Props:** `severity` (`"critical"` | `"warning"` | `"good"`), `children`, plus all `<span>` props.

### `Toggle`

Client component wrapping `@base-ui/react/switch`. Accessible by default (`role="switch"`, `aria-checked` managed by base-ui).

```tsx
import { Toggle } from "@/app/components/ui/toggle";

<Toggle checked={isOn} label="roast mode" onCheckedChange={setIsOn} />
```

**Props:** `checked` (boolean), `label` (string), `onCheckedChange` (`(checked: boolean) => void`), plus all base-ui Switch.Root props. Uses `data-[checked]` / `data-[unchecked]` attributes for styling.

### `Navbar` / `NavbarRoot` / `NavbarLogo` / `NavbarSpacer` / `NavbarLink`

Top navigation bar.

```tsx
import { Navbar, NavbarRoot, NavbarLogo, NavbarSpacer, NavbarLink } from "@/app/components/ui/navbar";

// Simple
<Navbar links={[{ href: "/leaderboard", label: "leaderboard" }]} />

// Composed
<NavbarRoot>
  <NavbarLogo />
  <NavbarSpacer />
  <NavbarLink href="/docs">docs</NavbarLink>
</NavbarRoot>
```

`NavbarLogo` renders the default devroast logo when no children are provided.

### `AnalysisCard` / `CardRoot` / `CardHeader` / `CardTitle` / `CardDescription`

Card displaying analysis findings.

```tsx
import { AnalysisCard, CardRoot, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/analysis-card";

// Simple
<AnalysisCard severity="critical" label="critical" title="..." description="..." />

// Composed
<CardRoot size="full">
  <CardHeader><Badge severity="good">clean</Badge></CardHeader>
  <CardTitle>custom title</CardTitle>
  <CardDescription>custom description</CardDescription>
</CardRoot>
```

**CardRoot props:** `size` (`"default"` 480px | `"full"` 100%), plus `<div>` props.

### `ScoreRing` / `ScoreRingRoot` / `ScoreRingValue` / `ScoreRingLabel`

SVG circular gauge with gradient arc.

```tsx
import { ScoreRing, ScoreRingRoot, ScoreRingValue, ScoreRingLabel } from "@/app/components/ui/score-ring";

// Simple
<ScoreRing score={3.5} />

// Composed — custom inner content
<ScoreRingRoot score={4.2} maxScore={10}>
  <ScoreRingValue>4.2</ScoreRingValue>
  <ScoreRingLabel>/10</ScoreRingLabel>
</ScoreRingRoot>
```

**ScoreRingRoot props:** `score` (number, required), `maxScore` (number, default `10`), `children` (inner content), plus `<div>` props.

### `CodeBlock` / `CodeBlockRoot` / `CodeBlockHeader` / `CodeBlockMeta` / `CodeBlockBody` (server-only, async)

Syntax-highlighted code display using shiki with Vesper theme. **Must be wrapped in `<Suspense>`.**

```tsx
import { CodeBlock, CodeBlockRoot, CodeBlockHeader, CodeBlockMeta, CodeBlockBody } from "@/app/components/ui/code-block";

// Simple
<Suspense fallback={<div className="animate-pulse h-48 bg-bg-input" />}>
  <CodeBlock code={code} language="javascript" />
</Suspense>

// Composed — custom header
<CodeBlockRoot>
  <CodeBlockHeader>
    <CodeBlockMeta>custom header · 1 line</CodeBlockMeta>
  </CodeBlockHeader>
  <CodeBlockBody html={highlightedHtml} />
</CodeBlockRoot>
```

**CodeBlockBody** requires pre-highlighted HTML from `codeToHtml()`.

### `DiffLine` (server-only, async)

Syntax-highlighted single diff line. **Must be wrapped in `<Suspense>`.**

```tsx
import { DiffLine } from "@/app/components/ui/diff-line";

<Suspense fallback={<div className="animate-pulse h-24 bg-bg-input" />}>
  <div className="flex flex-col">
    <DiffLine content="var total = 0;" type="removed" language="javascript" />
    <DiffLine content="let total = 0;" type="added" language="javascript" />
  </div>
</Suspense>
```

### `LeaderboardRow` / `LeaderboardRowRoot` / `LeaderboardRowRank` / `LeaderboardRowScore` / `LeaderboardRowCode` / `LeaderboardRowLanguage`

Leaderboard table row.

```tsx
import { LeaderboardRow, LeaderboardRowRoot, LeaderboardRowRank, LeaderboardRowScore, LeaderboardRowCode, LeaderboardRowLanguage } from "@/app/components/ui/leaderboard-row";

// Simple
<LeaderboardRow rank={1} score={1.2} code="..." language="javascript" />

// Composed — custom cells
<LeaderboardRowRoot>
  <LeaderboardRowRank>#1</LeaderboardRowRank>
  <LeaderboardRowScore>1.2</LeaderboardRowScore>
  <LeaderboardRowCode>eval(...)</LeaderboardRowCode>
  <LeaderboardRowLanguage>
    <Badge severity="critical">js</Badge>
  </LeaderboardRowLanguage>
</LeaderboardRowRoot>
```

## Adding New Components

1. Create `src/app/components/ui/component-name.tsx` (kebab-case filename).
2. Use `cn()` from `./cn` for class merging.
3. Use `cva()` if the component has variants.
4. Use `@base-ui/react` primitives for interactive behavior (buttons, switches, dialogs, etc.).
5. **Apply composition pattern**: export sub-parts (`ComponentRoot`, `ComponentHeader`, etc.) as named exports, then export a pre-composed convenience component that assembles them with a props-driven API.
6. For server-only components: add `import "server-only"`, use `async function`, and document `<Suspense>` requirement.
7. For shiki highlighting: use `codeToHtml()` with `theme: "vesper"`, add `biome-ignore` comment on `dangerouslySetInnerHTML`.
8. Accept `className` and spread `...props` on every sub-part.
9. Use named export only.
10. Run `npx biome check --write src/app/components/ui/` before committing.
