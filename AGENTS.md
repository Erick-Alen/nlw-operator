# Project: devroast (nlw-operator)

Built during **Rocketseat NLW Operator**. A code roasting app where users paste code and get brutally or honest reviews, you decide!

## Tech Stack

- **Framework:** Next.js 16 + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + CVA (class-variance-authority) + clsx/tailwind-merge
- **Primitives:** @base-ui/react (unstyled, accessible components)
- **Syntax Highlighting:** Shiki (server-side, "vesper" theme)
- **Tooling:** Biome (lint + format), Lefthook (git hooks), lint-staged, pnpm

## Architecture

- **Server components by default** — client components only where interactivity is needed (`"use client"`)
- **Composition pattern** — UI components export sub-parts (Root, Header, Body, etc.) for flexibility, plus a pre-composed convenience export for common usage
- **Design tokens** in `src/app/globals.css` — CSS variables mapped to Tailwind via `@theme inline`
- **Fonts:** JetBrains Mono (primary/UI) + IBM Plex Mono (secondary/descriptions), loaded via `next/font/google`

## Key Directories

| Path | Purpose |
|------|---------|
| `src/app/components/ui/` | Shareable UI components (button, badge, toggle, code-block, code-editor, navbar, etc.) |
| `src/app/components/ui/cn.ts` | Utility: `clsx` + `tailwind-merge` |
| `src/app/example/` | Component showcase page |
| `src/app/globals.css` | Design tokens (colors, fonts, borders, syntax) |

## Commit Messages

This project does **not** use any ticket prefix. Use standard conventional commits:

```
type(scope)?: description
```

Types: `feat`, `fix`, `hotfix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

## Commit Strategy

Split changes into **separate commits grouped by concern**:

1. **Dependencies + config** — `package.json`, lock files, `globals.css` token changes
2. **Core implementation** — component files, utilities
3. **Pages / consumers** — pages that use the components
4. **Documentation** — `AGENTS.md`, `README.md`, etc.
