import type { ComponentProps } from "react";
import { cn } from "./cn";

// --- Composable parts ---

interface ScoreRingRootProps extends ComponentProps<"div"> {
  maxScore?: number;
  score: number;
}

export function ScoreRingRoot({
  className,
  children,
  maxScore = 10,
  score,
  ...props
}: ScoreRingRootProps) {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 85;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn(
        "relative flex size-[180px] items-center justify-center",
        className
      )}
      {...props}
    >
      <svg
        className="absolute inset-0"
        height="180"
        viewBox="0 0 180 180"
        width="180"
      >
        <title>Score ring</title>
        <circle
          className="stroke-border-primary"
          cx="90"
          cy="90"
          fill="none"
          r="85"
          strokeWidth="4"
        />
        <circle
          cx="90"
          cy="90"
          fill="none"
          r="85"
          stroke="url(#scoreGradient)"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          strokeWidth="4"
          transform="rotate(-90 90 90)"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-green)" />
            <stop offset="100%" stopColor="var(--accent-amber)" />
          </linearGradient>
        </defs>
      </svg>

      {children}
    </div>
  );
}

export function ScoreRingValue({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "font-bold font-primary text-4xl text-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function ScoreRingLabel({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn("font-primary text-text-tertiary text-xs", className)}
      {...props}
    >
      {children}
    </span>
  );
}

// --- Pre-composed convenience ---

interface ScoreRingProps extends ComponentProps<"div"> {
  label?: string;
  maxScore?: number;
  score: number;
}

export function ScoreRing({
  className,
  label = "/10",
  maxScore = 10,
  score,
  ...props
}: ScoreRingProps) {
  return (
    <ScoreRingRoot
      className={className}
      maxScore={maxScore}
      score={score}
      {...props}
    >
      <div className="flex flex-col items-center gap-0.5">
        <ScoreRingValue>{score}</ScoreRingValue>
        <ScoreRingLabel>{label}</ScoreRingLabel>
      </div>
    </ScoreRingRoot>
  );
}
