"use client";

import { type ComponentProps, useCallback, useRef } from "react";
import type { BundledLanguage } from "shiki/bundle/web";
import { useShikiHighlight } from "../../hooks/use-shiki-highlight";
import { SUPPORTED_LANGUAGES } from "../../lib/shiki-client";
import { cn } from "./cn";

const sharedStyles =
  "font-primary text-xs leading-[20px] whitespace-pre tab-size-[2]";

interface CodeEditorProps extends Omit<ComponentProps<"div">, "onChange"> {
  language?: BundledLanguage;
  maxLines?: number;
  onChange: (value: string) => void;
  onLanguageChange?: (lang: BundledLanguage) => void;
  placeholder?: string;
  value: string;
}

export function CodeEditor({
  className,
  language = "javascript",
  maxLines,
  onChange,
  onLanguageChange,
  placeholder = "// paste your code here...",
  value,
  ...props
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lines = value ? value.split("\n") : [""];
  const lineCount = lines.length;
  const isOverLimit = maxLines != null && lineCount > maxLines;

  const { html, isReady } = useShikiHighlight(value, language);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      const pre = preRef.current;
      const lineNumbers = lineNumbersRef.current;
      if (textarea && pre) {
        pre.scrollTop = textarea.scrollTop;
        pre.scrollLeft = textarea.scrollLeft;
      }
      if (textarea && lineNumbers) {
        lineNumbers.scrollTop = textarea.scrollTop;
      }
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const { selectionStart, selectionEnd } = textarea;
        const newValue = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = selectionStart + 2;
          textarea.selectionEnd = selectionStart + 2;
        });
      }
    },
    [value, onChange]
  );

  return (
    <div
      className={cn(
        "flex w-full max-w-[780px] flex-col overflow-hidden border bg-bg-input",
        isOverLimit ? "border-accent-red" : "border-border-primary",
        className
      )}
      {...props}
    >
      {/* Window header */}
      <div className="flex h-10 items-center border-border-primary border-b px-4">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-accent-red" />
          <span className="size-3 rounded-full bg-accent-amber" />
          <span className="size-3 rounded-full bg-accent-green" />
        </div>
        <div className="ml-auto flex items-center gap-3">
          {maxLines != null && (
            <span
              className={`font-secondary text-xs ${isOverLimit ? "text-accent-red" : "text-text-tertiary"}`}
            >
              {lineCount}/{maxLines} lines
            </span>
          )}
          {onLanguageChange && (
            <select
              className="cursor-pointer bg-transparent font-secondary text-text-secondary text-xs outline-none"
              onChange={(e) =>
                onLanguageChange(e.target.value as BundledLanguage)
              }
              value={language}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex h-[320px]">
        {/* Line numbers */}
        <div
          aria-hidden
          className="w-12 shrink-0 overflow-hidden border-border-primary border-r bg-bg-surface"
          ref={lineNumbersRef}
        >
          <div className="flex flex-col items-end px-3 pt-4 pb-4">
            {Array.from({ length: lineCount }, (_, i) => (
              <span
                className="font-primary text-text-tertiary text-xs leading-[20px]"
                key={`ln-${String(i + 1)}`}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Editor area with overlay */}
        <div className="relative flex-1 overflow-hidden">
          {/* Highlight layer */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 overflow-hidden p-4 [&_pre]:m-0 [&_pre]:bg-transparent! [&_pre]:p-0",
              sharedStyles
            )}
            ref={preRef}
          >
            {!value && (
              <span className="text-text-tertiary">{placeholder}</span>
            )}
            {value && !isReady && (
              <pre className="m-0 p-0">
                <code className="text-text-primary">{value}</code>
              </pre>
            )}
            {value && isReady && (
              // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki generates safe pre-rendered HTML for syntax highlighting
              <div dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </div>

          {/* Transparent input layer */}
          <textarea
            className={cn(
              "relative z-10 h-full w-full resize-none bg-transparent p-4 text-transparent caret-text-primary outline-none [-webkit-text-fill-color:transparent]",
              sharedStyles
            )}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            ref={textareaRef}
            spellCheck={false}
            value={value}
          />
        </div>
      </div>
    </div>
  );
}
