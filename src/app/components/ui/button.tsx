import { Button as BaseButton } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "./cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium font-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-green focus-visible:-outline-offset-1 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-green px-6 py-2.5 font-medium text-[13px] text-bg-page",
        secondary:
          "border border-border-primary px-4 py-2 text-text-primary text-xs",
        link: "border border-border-primary px-3 py-1.5 text-text-secondary text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

type ButtonProps = ComponentProps<typeof BaseButton> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
