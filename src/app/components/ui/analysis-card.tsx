import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Badge } from "./badge";
import { cn } from "./cn";

const cardVariants = cva(
  "flex flex-col gap-3 border border-border-primary p-5",
  {
    variants: {
      size: {
        default: "w-[480px]",
        full: "w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// --- Composable parts ---

type CardRootProps = ComponentProps<"div"> & VariantProps<typeof cardVariants>;

export function CardRoot({
  className,
  size,
  children,
  ...props
}: CardRootProps) {
  return (
    <div className={cn(cardVariants({ size }), className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn("font-primary text-[13px] text-text-primary", className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-secondary text-text-secondary text-xs leading-6",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// --- Pre-composed convenience ---

interface AnalysisCardProps
  extends ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  description: string;
  label: string;
  severity?: "critical" | "warning" | "good" | null;
  title: string;
}

export function AnalysisCard({
  className,
  description,
  label,
  severity,
  size,
  title,
  ...props
}: AnalysisCardProps) {
  return (
    <CardRoot className={className} size={size} {...props}>
      <CardHeader>
        <Badge severity={severity}>{label}</Badge>
      </CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardRoot>
  );
}
