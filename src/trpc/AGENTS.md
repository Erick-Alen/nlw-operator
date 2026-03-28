# tRPC Layer — devroast

tRPC 11 with Next.js App Router. The `src/trpc/` directory owns all server/client tRPC setup.

## File Map

| File | Purpose |
|------|---------|
| `init.ts` | tRPC server initialization — context, router factory, procedure base |
| `server.tsx` | Server-only entry — `caller`, `trpc` proxy, `getQueryClient` |
| `client.tsx` | Client entry — `TRPCReactProvider`, `useTRPC` hook |
| `query-client.ts` | `makeQueryClient()` with dehydration config |
| `routers/_app.ts` | Root router — merges all sub-routers, exports `AppRouter` type |
| `routers/*.ts` | Domain routers (`leaderboard.ts`, `submission.ts`, …) |

## Context (`init.ts`)

```ts
// biome-ignore lint/suspicious/useAwait: tRPC context must be async for callers that await headers()
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return { db, headers: opts.headers };
};
```

- **Must be `async`** even when there is no `await` inside — tRPC callers call it with `await`.
- Add `biome-ignore lint/suspicious/useAwait` with the explanation above. Do not remove the `async`.

## `server.tsx` — Server-only Entry

```ts
import "server-only";

export const getQueryClient = cache(makeQueryClient);

// Direct server-side calls — no HTTP, no React Query
export const caller = appRouter.createCaller(
  async () => createTRPCContext({ headers: await headers() }),
);

// Proxy for prefetching (SSR hydration with TanStack Query)
export const trpc = createTRPCOptionsProxy({
  ctx: async () => createTRPCContext({ headers: await headers() }),
  router: appRouter,
  queryClient: getQueryClient,
});
```

### `caller` vs `trpc` proxy

| | `caller` | `trpc` proxy |
|---|---|---|
| What it does | Calls procedures directly on the server | Creates TanStack Query options for SSR prefetch |
| When to use | Async server components, page data loading | Prefetching + hydrating client components |
| React Query | No | Yes — pairs with `HydrationBoundary` |
| Import | `@/trpc/server` | `@/trpc/server` |

**Default**: use `caller` in async server components / Loader components. Use `trpc` proxy only when you need client-side cache hydration.

## `client.tsx` — Client Entry

```tsx
"use client";

export function useTRPC() { ... }         // hook — returns typed tRPC client
export function TRPCReactProvider(...) {} // wraps app with QueryClient + tRPC provider
```

`TRPCReactProvider` is added once in `src/app/layout.tsx`. Do not nest it.

The HTTP batch link points to `/api/trpc`. The route handler lives at `src/app/api/trpc/[trpc]/route.ts`.

## Router Conventions

- One file per domain: `routers/leaderboard.ts`, `routers/submission.ts`, etc.
- Export the router as a named const: `export const leaderboardRouter = createTRPCRouter({ ... })`.
- Merge all routers in `routers/_app.ts` and export the `AppRouter` type.
- Use `baseProcedure.query(async ({ ctx }) => { ... })` for read procedures.
- Use `baseProcedure.input(schema).mutation(async ({ ctx, input }) => { ... })` for writes.
- Throw `new TRPCError({ code: "NOT_FOUND" })` for missing resources (pages call `notFound()` on catch).

## Zod Validation

Always import from `"zod/v4"`, not `"zod"`:

```ts
import { z } from "zod/v4";
```

## Drizzle Aggregations

Use Drizzle `count()` and `avg()` for aggregation queries:

```ts
import { count, avg } from "drizzle-orm";

const [result] = await ctx.db
  .select({ totalCount: count(), avgScore: avg(submissions.score) })
  .from(submissions);

return {
  totalCount: result.totalCount,
  avgScore: Number(result.avgScore ?? 0),
};
```

Always cast `avg()` result to `Number` — Drizzle returns it as a string.

## Adding a New Router

1. Create `src/trpc/routers/my-domain.ts`.
2. Define procedures using `baseProcedure` from `../init`.
3. Export as `export const myDomainRouter = createTRPCRouter({ ... })`.
4. Import and merge in `routers/_app.ts`.
5. Run `pnpm check` before committing.
