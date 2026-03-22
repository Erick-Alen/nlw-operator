import "server-only";

import type { ComponentProps } from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { cn } from "./cn";

// --- Composable parts ---

export function CodeBlockRoot({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col border border-border-primary bg-bg-input",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CodeBlockDots() {
  return (
    <div className="flex gap-2">
      <span className="size-3 rounded-full bg-accent-red" />
      <span className="size-3 rounded-full bg-accent-amber" />
      <span className="size-3 rounded-full bg-accent-green" />
    </div>
  );
}

export function CodeBlockHeader({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex h-10 items-center gap-3 border-border-primary border-b px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CodeBlockMeta({
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

interface CodeBlockBodyProps extends ComponentProps<"div"> {
  html: string;
}

export function CodeBlockBody({
  className,
  html,
  ...props
}: CodeBlockBodyProps) {
  return (
    <div
      className={cn(
        "[&_code]:counter-reset-[line] [&_code_.line]:counter-increment-[line] [&_code_.line::before]:mr-4 [&_code_.line::before]:inline-block [&_code_.line::before]:w-6 [&_code_.line::before]:select-none [&_code_.line::before]:text-right [&_code_.line::before]:text-text-tertiary [&_code_.line::before]:content-[counter(line)] [&_pre]:bg-transparent! [&_pre]:p-4 [&_pre]:font-primary [&_pre]:text-[13px] [&_pre]:leading-6",
        className
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates safe pre-rendered HTML for syntax highlighting
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
}

// --- Pre-composed convenience ---

interface CodeBlockProps extends ComponentProps<"div"> {
  code: string;
  language?: BundledLanguage;
  lineCount?: number;
}

export async function CodeBlock({
  className,
  code,
  language = "javascript",
  lineCount,
  ...props
}: CodeBlockProps) {
  const lines = code.split("\n");
  const displayLineCount = lineCount ?? lines.length;

  const highlighted = await codeToHtml(code, {
    lang: language,
    theme: "vesper",
  });

  return (
    <CodeBlockRoot className={className} {...props}>
      <CodeBlockHeader>
        <CodeBlockDots />
        <CodeBlockMeta>
          {`lang: ${language} · ${String(displayLineCount)} lines`}
        </CodeBlockMeta>
      </CodeBlockHeader>
      <CodeBlockBody html={highlighted} />
    </CodeBlockRoot>
  );
}
