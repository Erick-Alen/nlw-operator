"use client";

import { type ComponentProps, useRef } from "react";
import { cn } from "./cn";

interface CodeEditorProps extends Omit<ComponentProps<"div">, "onChange"> {
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

export function CodeEditor({
  className,
  onChange,
  placeholder = "// paste your code here...",
  value,
  ...props
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = value ? value.split("\n") : [""];
  const lineCount = lines.length;

  return (
    <div
      className={cn(
        "flex w-full max-w-[780px] flex-col overflow-hidden border border-border-primary bg-bg-input",
        className
      )}
      {...props}
    >
      {/* Window header */}
      <div className="flex h-10 items-center gap-2 border-border-primary border-b px-4">
        <span className="size-3 rounded-full bg-accent-red" />
        <span className="size-3 rounded-full bg-accent-amber" />
        <span className="size-3 rounded-full bg-accent-green" />
      </div>

      {/* Editor body */}
      <div className="flex min-h-[320px]">
        {/* Line numbers */}
        <div
          aria-hidden
          className="flex w-12 shrink-0 flex-col items-end border-border-primary border-r bg-bg-surface px-3 pt-4 pb-4"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              className="font-primary text-text-tertiary text-xs leading-[20px]"
              key={`ln-${String(i + 1)}`}
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          className="flex-1 resize-none bg-transparent p-4 font-primary text-text-primary text-xs leading-[20px] outline-none placeholder:text-text-tertiary"
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          ref={textareaRef}
          spellCheck={false}
          value={value}
        />
      </div>
    </div>
  );
}
