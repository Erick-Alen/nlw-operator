"use client";

import { useState } from "react";
import { cn } from "./cn";

// Shared CSS classes matching CodeBlockBody shiki rendering styles.
// Duplicated here (not imported) because code-block.tsx uses "server-only".
export const shikiBodyClass =
  "[&_code]:[counter-reset:line] [&_code_.line]:[counter-increment:line] [&_code_.line::before]:mr-4 [&_code_.line::before]:inline-block [&_code_.line::before]:w-6 [&_code_.line::before]:select-none [&_code_.line::before]:text-right [&_code_.line::before]:text-text-tertiary [&_code_.line::before]:[content:counter(line)] [&_pre]:bg-transparent! [&_pre]:p-4 [&_pre]:font-primary [&_pre]:text-[13px] [&_pre]:leading-6";

interface ExpandableCodeProps {
  className?: string;
  /** Max height in px when collapsed. Default: 120. */
  collapsedHeight?: number;
  html: string;
  /** Number of lines in the code — used to decide whether to show the toggle. */
  lineCount?: number;
}

export function ExpandableCode({
  html,
  lineCount = 0,
  collapsedHeight = 120,
  className,
}: ExpandableCodeProps) {
  const [expanded, setExpanded] = useState(false);
  // ~5 lines fit in 120px (24px line-height + padding). No button needed for short code.
  const isExpandable = lineCount > 4;

  return (
    <div className={cn("bg-bg-input", className)}>
      <div
        className={cn(
          "relative overflow-hidden",
          expanded && "overflow-y-auto"
        )}
        style={{ maxHeight: expanded ? "600px" : `${collapsedHeight}px` }}
      >
        <div
          className={shikiBodyClass}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates safe pre-rendered HTML for syntax highlighting
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {!expanded && isExpandable && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-10 bg-gradient-to-t from-bg-input to-transparent" />
        )}
      </div>

      {isExpandable && (
        <button
          className="w-full border-border-primary border-t px-4 py-1.5 text-left font-primary text-text-tertiary text-xs transition-colors duration-150 hover:text-text-secondary"
          onClick={() => setExpanded(!expanded)}
          type="button"
        >
          {expanded ? "[ collapse ]" : "[ expand ]"}
        </button>
      )}
    </div>
  );
}
