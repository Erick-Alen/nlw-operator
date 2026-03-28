# Project: devroast (nlw-operator)

Built during **Rocketseat NLW Operator**. A code roasting app where users paste code and get brutally or honest reviews, you decide!

## Tech Stack

- **Framework:** Next.js 16 + React 19 + TypeScript 5
- **Styling:** Tailwind CSS 4 + CVA (class-variance-authority) + clsx/tailwind-merge
- **Primitives:** @base-ui/react (unstyled, accessible components)
- **Syntax Highlighting:** Shiki (server-side, "vesper" theme)
- **API Layer:** tRPC 11 + `@trpc/tanstack-react-query` — see `src/trpc/`
- **Database ORM:** Drizzle ORM
- **Validation:** Zod v4 — import from `"zod/v4"`, not `"zod"`
- **Animation:** `@number-flow/react` (client-only) for animated number counters
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
| `src/trpc/` | tRPC server/client setup — routers, context, server/client entry points |

## Data Fetching Strategy

The project uses tRPC as the API layer bridging server and client. The pattern varies by context:

### Server Components (RSC / async pages)

Use `caller` from `@/trpc/server` for direct database access — no HTTP round-trip:

```tsx
import { caller } from "@/trpc/server";

export async function MyLoader() {
  const data = await caller.myRouter.myProcedure();
  return <MyComponent data={data} />;
}
```

### Suspense + Skeleton Pattern

Wrap every async loader in `<Suspense>` with a skeleton fallback. Never block the page render:

```tsx
// page.tsx (server component)
import { Suspense } from "react";
import { MyLoader } from "./my-loader";
import { MyComponentSkeleton } from "./my-component";

<Suspense fallback={<MyComponentSkeleton />}>
  <MyLoader />
</Suspense>
```

- **Loader component** (`*-loader.tsx`): async server component, fetches via `caller`, passes props to the UI component.
- **UI component** (`my-component.tsx`): pure display, can be client or server.
- **Skeleton export**: same file as the UI component, same shape/size using `animate-pulse` spans with `bg-bg-elevated`.

### Client Components with tRPC

For client-side tRPC hooks, use `useTRPC()` from `@/trpc/client`:

```tsx
"use client";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const trpc = useTRPC();
const { data } = useQuery(trpc.myRouter.myProcedure.queryOptions());
```

## NumberFlow Animation Pattern

`@number-flow/react` is client-only. To animate from `0` to the real value on hydration, use the mount trick:

```tsx
"use client";
import NumberFlow from "@number-flow/react";
import { useState, useEffect } from "react";

export function MyStats({ value }: { value: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return <NumberFlow value={mounted ? value : 0} />;
}
```

- **Why**: on SSR the server renders a static number; on hydration NumberFlow sees no delta and skips the animation. Starting at `0` ensures NumberFlow animates from 0 → real value after mount.
- **Always pair with a Skeleton**: the server-rendered skeleton shows while the async loader runs; after hydration NumberFlow animates in.

## Lint and Format

After every implementation, run:

```bash
pnpm check
```

This runs `biome check` on the project. All issues must be resolved before committing — the pre-commit hook will block otherwise. Use `pnpm fix` for auto-fixable issues; remaining ones require manual fixes.

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
