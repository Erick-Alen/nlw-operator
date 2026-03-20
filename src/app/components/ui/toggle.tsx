"use client";

import { Switch } from "@base-ui/react/switch";
import type { ComponentProps } from "react";
import { cn } from "./cn";

interface ToggleProps extends ComponentProps<typeof Switch.Root> {
  label?: string;
}

export function Toggle({ checked, className, label, ...props }: ToggleProps) {
  return (
    <div className="inline-flex items-center gap-3">
      <Switch.Root
        checked={checked}
        className={cn(
          "flex h-[22px] w-10 items-center rounded-full p-[3px] transition-colors",
          "data-[checked]:justify-end data-[checked]:bg-accent-green data-[unchecked]:bg-border-primary",
          className
        )}
        {...props}
      >
        <Switch.Thumb
          className={cn(
            "size-4 rounded-full transition-colors",
            "data-[checked]:bg-bg-page data-[unchecked]:bg-text-secondary"
          )}
        />
      </Switch.Root>
      {label ? (
        <span className="font-primary text-text-secondary text-xs">
          {label}
        </span>
      ) : null}
    </div>
  );
}
