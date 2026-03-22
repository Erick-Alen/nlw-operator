import type { BundledLanguage, Highlighter } from "shiki/bundle/web";

export const SUPPORTED_LANGUAGES: BundledLanguage[] = [
  "javascript",
  "typescript",
  "python",
  "java",
  "php",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "bash",
];

let highlighterPromise: Promise<Highlighter> | null = null;
let highlighterInstance: Highlighter | null = null;

export function getClientHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki/bundle/web")
      .then(({ createHighlighter }) =>
        createHighlighter({
          themes: ["vesper"],
          langs: SUPPORTED_LANGUAGES,
        })
      )
      .then((h) => {
        highlighterInstance = h;
        return h;
      });
  }

  return highlighterPromise;
}

export function getHighlighterSync() {
  return highlighterInstance;
}
