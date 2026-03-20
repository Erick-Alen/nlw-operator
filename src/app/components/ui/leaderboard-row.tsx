import type { ComponentProps } from "react";
import { cn } from "./cn";

// --- Composable parts ---

export function LeaderboardRowRoot({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-6 border-border-primary border-b px-5 py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function LeaderboardRowRank({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn("w-10 font-primary text-sm text-text-tertiary", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function LeaderboardRowScore({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "w-[60px] font-bold font-primary text-accent-red text-sm",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function LeaderboardRowCode({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex-1 truncate font-primary text-[13px] text-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function LeaderboardRowLanguage({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "w-[100px] text-right font-primary text-text-tertiary text-xs",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// --- Pre-composed convenience ---

interface LeaderboardRowProps extends ComponentProps<"div"> {
  code: string;
  language: string;
  rank: number;
  score: number;
}

export function LeaderboardRow({
  className,
  code,
  language,
  rank,
  score,
  ...props
}: LeaderboardRowProps) {
  return (
    <LeaderboardRowRoot className={className} {...props}>
      <LeaderboardRowRank>{rank}</LeaderboardRowRank>
      <LeaderboardRowScore>{score}</LeaderboardRowScore>
      <LeaderboardRowCode>{code}</LeaderboardRowCode>
      <LeaderboardRowLanguage>{language}</LeaderboardRowLanguage>
    </LeaderboardRowRoot>
  );
}
