import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";

const badgeVariants = cva(
  "inline-flex items-center gap-2 font-primary text-xs",
  {
    variants: {
      severity: {
        critical: "text-accent-red",
        warning: "text-accent-amber",
        good: "text-accent-green",
      },
    },
    defaultVariants: {
      severity: "critical",
    },
  }
);

const indicatorVariants = cva("size-2 rounded-full", {
  variants: {
    severity: {
      critical: "bg-accent-red",
      warning: "bg-accent-amber",
      good: "bg-accent-green",
    },
  },
  defaultVariants: {
    severity: "critical",
  },
});

// --- Composable parts ---

type BadgeRootProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>;

export function BadgeRoot({
  className,
  severity,
  children,
  ...props
}: BadgeRootProps) {
  return (
    <span className={cn(badgeVariants({ severity }), className)} {...props}>
      {children}
    </span>
  );
}

type BadgeIndicatorProps = ComponentProps<"span"> &
  VariantProps<typeof indicatorVariants>;

export function BadgeIndicator({
  className,
  severity,
  ...props
}: BadgeIndicatorProps) {
  return (
    <span
      className={cn(indicatorVariants({ severity }), className)}
      {...props}
    />
  );
}

// --- Pre-composed convenience ---

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, severity, children, ...props }: BadgeProps) {
  return (
    <BadgeRoot className={className} severity={severity} {...props}>
      <BadgeIndicator severity={severity} />
      {children}
    </BadgeRoot>
  );
}
