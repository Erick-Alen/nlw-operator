"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

interface HomeStatsProps {
  avgScore: number;
  totalCount: number;
}

export function HomeStats({ totalCount, avgScore }: HomeStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <p className="font-secondary text-sm text-text-tertiary">
      <NumberFlow value={mounted ? totalCount : 0} /> codes roasted · avg score:{" "}
      <NumberFlow
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        value={mounted ? avgScore : 0}
      />
      /10
    </p>
  );
}

export function HomeStatsSkeleton() {
  return (
    <p className="flex items-center gap-1 font-secondary text-sm text-text-tertiary">
      <span className="inline-block h-4 w-10 animate-pulse rounded bg-bg-elevated" />{" "}
      codes roasted · avg score:{" "}
      <span className="inline-block h-4 w-8 animate-pulse rounded bg-bg-elevated" />
      /10
    </p>
  );
}
