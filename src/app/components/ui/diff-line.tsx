import "server-only";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";
import { cn } from "./cn";

const diffLineVariants = cva(
  "flex items-center gap-2 px-4 py-2 font-primary text-[13px]",
  {
    variants: {
      type: {
        added: "bg-[#0A1A0F]",
        removed: "bg-[#1A0A0A]",
        context: "",
      },
    },
    defaultVariants: {
      type: "context",
    },
  }
);

const prefixColorMap = {
  added: "text-accent-green",
  removed: "text-accent-red",
  context: "text-text-tertiary",
} as const;

const prefixMap = {
  added: "+",
  removed: "-",
  context: " ",
} as const;

interface DiffLineProps
  extends ComponentProps<"div">,
    VariantProps<typeof diffLineVariants> {
  content: string;
  language?: BundledLanguage;
}

export async function DiffLine({
  className,
  content,
  language = "javascript",
  type = "context",
  ...props
}: DiffLineProps) {
  const highlighted = await codeToHtml(content, {
    lang: language,
    theme: "vesper",
  });

  const resolvedType = type ?? "context";

  return (
    <div className={cn(diffLineVariants({ type }), className)} {...props}>
      <span className={cn("select-none", prefixColorMap[resolvedType])}>
        {prefixMap[resolvedType]}
      </span>
      <span
        className="[&_code]:inline [&_pre]:inline [&_pre]:bg-transparent! [&_pre]:font-primary [&_pre]:text-[13px]"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates safe pre-rendered HTML for syntax highlighting
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  );
}
