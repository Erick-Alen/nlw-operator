// src/app/roast/[roastId]/roast-pending-view.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RoastPendingView() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <main className="flex flex-col gap-10 px-20 py-10">
      {/* Pending message */}
      <p className="font-primary text-sm text-text-tertiary">
        <span className="text-accent-green">{"// "}</span>
        roasting your code
        <span className="animate-pulse">{"..."}</span>
      </p>

      {/* Score Hero skeleton */}
      <section className="flex items-center gap-12">
        <div className="h-[180px] w-[180px] animate-pulse rounded-full bg-bg-elevated" />
        <div className="flex flex-1 flex-col gap-4">
          <div className="h-6 w-48 animate-pulse rounded bg-bg-elevated" />
          <div className="h-12 animate-pulse rounded bg-bg-elevated" />
          <div className="h-4 w-32 animate-pulse rounded bg-bg-elevated" />
        </div>
      </section>

      <div className="h-px w-full bg-border-primary" />

      {/* Code section skeleton */}
      <section className="flex flex-col gap-4">
        <div className="h-5 w-36 animate-pulse rounded bg-bg-elevated" />
        <div className="h-[200px] animate-pulse rounded border border-border-primary bg-bg-elevated" />
      </section>

      <div className="h-px w-full bg-border-primary" />

      {/* Analysis section skeleton */}
      <section className="flex flex-col gap-6">
        <div className="h-5 w-40 animate-pulse rounded bg-bg-elevated" />
        <div className="flex gap-5">
          <div className="h-[120px] flex-1 animate-pulse rounded border border-border-primary bg-bg-elevated" />
          <div className="h-[120px] flex-1 animate-pulse rounded border border-border-primary bg-bg-elevated" />
        </div>
        <div className="flex gap-5">
          <div className="h-[120px] flex-1 animate-pulse rounded border border-border-primary bg-bg-elevated" />
          <div className="h-[120px] flex-1 animate-pulse rounded border border-border-primary bg-bg-elevated" />
        </div>
      </section>
    </main>
  );
}
