# App Layer — devroast

Pages, layouts, and feature components in `src/app/`. Follows Next.js 16 App Router conventions.

## Data Fetching — Loader Pattern

Async data fetching uses the **Loader + Suspense** pattern. Never block page renders; isolate async work in dedicated loader components.

### File Naming

| File | Role |
|------|------|
| `my-feature-loader.tsx` | Async server component — fetches via `caller`, renders UI component |
| `my-feature.tsx` | UI component (can be server or client) + skeleton export |

### Loader Component

```tsx
// my-feature-loader.tsx
import { caller } from "@/trpc/server";
import { MyFeature } from "./my-feature";

export async function MyFeatureLoader() {
  const data = await caller.myRouter.myProcedure();
  return <MyFeature data={data} />;
}
```

- Import `caller` from `@/trpc/server` — direct DB call, no HTTP.
- No React Query, no `useQuery` — just `await`.
- File stays server-only by default (no `"use client"`).

### Page Usage

```tsx
// page.tsx
import { Suspense } from "react";
import { MyFeatureLoader } from "./my-feature-loader";
import { MyFeatureSkeleton } from "./my-feature";

export default function Page() {
  return (
    <Suspense fallback={<MyFeatureSkeleton />}>
      <MyFeatureLoader />
    </Suspense>
  );
}
```

Always wrap loaders in `<Suspense>`. Never `await` data directly in a page component.

## Skeleton Convention

Skeleton exports live in the same file as the UI component. They mirror the component's visual shape using `animate-pulse` spans:

```tsx
export function MyFeatureSkeleton() {
  return (
    <p className="flex items-center gap-1 font-secondary text-sm text-text-tertiary">
      <span className="inline-block h-4 w-10 animate-pulse rounded bg-bg-elevated" />
      label text ·
      <span className="inline-block h-4 w-8 animate-pulse rounded bg-bg-elevated" />
    </p>
  );
}
```

- Use `bg-bg-elevated` for the pulsing placeholder color.
- Match the skeleton dimensions to the real content as closely as possible.

## NumberFlow Animation

Animated number counters require client-side mounting. Use this pattern whenever displaying a number that should animate from 0 to its real value:

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

- The component must be `"use client"`.
- Start with `value={0}` until `mounted` is `true` — this triggers NumberFlow's animation on hydration.
- For decimal formatting: `<NumberFlow format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} value={...} />`.

## Client vs Server Components

- **Default: server component** — no directive needed.
- Add `"use client"` only when the component uses hooks, browser APIs, or event handlers.
- Interactive wrappers (providers, animated displays) are client components; their async data comes from server-side props passed down from a Loader.

## Dynamic Routes

- Use `caller` in the page to fetch by ID, then call `notFound()` if the resource is missing:

```tsx
import { notFound } from "next/navigation";
import { caller } from "@/trpc/server";

export default async function Page({ params }: { params: { myId: string } }) {
  let data;
  try {
    data = await caller.myRouter.getById({ id: params.myId });
  } catch {
    notFound();
  }
  // render...
}
```
