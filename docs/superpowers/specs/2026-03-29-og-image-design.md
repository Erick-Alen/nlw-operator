# OpenGraph Image for Roast Pages — Design Spec

## Goal

Automatically generate a dynamic OpenGraph image for every completed roast so that sharing a `/roast/[id]` URL on social platforms (Twitter/X, Slack, iMessage, etc.) renders a rich embed showing the score, verdict, and roast quote.

## Architecture

### Approach

Use Next.js's built-in `opengraph-image.tsx` file convention inside the `src/app/roast/[roastId]/` route segment. Next.js automatically wires the `<meta property="og:image">` tag when this file exists — no manual metadata configuration needed for the image URL.

Image rendering uses **`takumi-js`** (a Rust-backed `ImageResponse` library, API-compatible with `next/og`) for performance. It requires one config change in `next.config.ts`.

### File Map

| File | Action | Responsibility |
|---|---|---|
| `next.config.ts` | Modify | Add `serverExternalPackages: ["@takumi-rs/core"]` |
| `src/app/roast/[roastId]/opengraph-image.tsx` | Create | Dynamic OG image route handler |
| `src/app/roast/[roastId]/page.tsx` | Modify | Add `generateMetadata` for title/description/OG text |

## Image Spec

**Dimensions:** 1200 × 630 px
**Background:** `#0A0A0A`
**Border:** 1px inside, `#2A2A2A`

### Layout

Single centered vertical column, padding 64px, gap 28px between elements:

1. **Logo row** — `>` in green `#10B981` + `devroast` in white `#FAFAFA`, JetBrains Mono
2. **Score row** — giant score number (160px, weight 900) in severity color + `/10` in gray `#4B5563` (56px), aligned to baseline
3. **Verdict row** — colored circle dot (12×12) + verdict enum string, both in severity color, JetBrains Mono 20px
4. **Lang info** — `lang: {language} · {lineCount} lines`, gray `#4B5563`, JetBrains Mono 16px
5. **Roast quote** — `roastQuote` wrapped in curly quotes, IBM Plex Mono 22px, white `#FAFAFA`, centered, line-height 1.5

### Color Logic

Severity is derived from the verdict value, matching the existing `verdictSeverityMap` in the app:

| Verdict | Severity | Hex |
|---|---|---|
| `mass_disaster`, `needs_serious_help` | critical | `#EF4444` |
| `barely_acceptable`, `decent_enough` | warning | `#F59E0B` |
| `actually_good`, `mass_respect` | good | `#10B981` |

The severity color applies to: score number, verdict dot, verdict text.
Gray `#4B5563` is always used for `/10` and the lang info line.

### Fonts

Both fonts are loaded from Google Fonts as `ArrayBuffer` and passed to `ImageResponse`:

- **JetBrains Mono** — logo, score, verdict, lang info
- **IBM Plex Mono** — roast quote

Font fetching is wrapped in a module-level cached async helper so it runs once per cold start, not on every request.

## Caching

The image response sets `Cache-Control: public, max-age=31536000, immutable` (via `revalidate = false` export). Roast results are immutable once scored — the image never needs regeneration.

## Edge Cases

- **`pending` or `failed` submissions:** the handler returns `notFound()`. No broken image appears in embeds; platforms fall back to the default site image.
- **Missing submission:** same — `notFound()`.

## Metadata (`generateMetadata`)

Added to `src/app/roast/[roastId]/page.tsx`:

```ts
title: `${score}/10 · ${verdict} — devroast`
description: roastQuote
openGraph.title: same as title
openGraph.description: same as description
// og:image is injected automatically by Next.js from opengraph-image.tsx
```

For `pending` / `failed` submissions, metadata falls back to the site default.

## Dependencies

- `takumi-js` (install via `pnpm add takumi-js`)
- `@takumi-rs/core` (installed as a peer by `takumi-js`, must be in `serverExternalPackages`)
