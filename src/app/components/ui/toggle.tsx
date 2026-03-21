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
          "flex h-[22px] w-10 cursor-pointer items-center rounded-full p-[3px] transition-colors duration-200",
          "data-[checked]:bg-accent-green data-[unchecked]:bg-border-primary",
          className
        )}
        {...props}
      >
        <Switch.Thumb
          className={cn(
            "size-4 rounded-full transition-all duration-200",
            "data-[checked]:translate-x-[18px] data-[unchecked]:translate-x-0",
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
