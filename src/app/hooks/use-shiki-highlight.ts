import { useEffect, useMemo, useState } from "react";
import type { BundledLanguage } from "shiki/bundle/web";
import { getClientHighlighter, getHighlighterSync } from "../lib/shiki-client";

export function useShikiHighlight(code: string, language: BundledLanguage) {
  const [isLoaded, setIsLoaded] = useState(() => getHighlighterSync() !== null);

  useEffect(() => {
    if (!isLoaded) {
      getClientHighlighter().then(() => setIsLoaded(true));
    }
  }, [isLoaded]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: isLoaded triggers recompute once highlighter finishes loading
  const html = useMemo(() => {
    const highlighter = getHighlighterSync();
    if (!(highlighter && code)) {
      return "";
    }
    return highlighter.codeToHtml(code, { lang: language, theme: "vesper" });
  }, [code, language, isLoaded]);

  return { html, isReady: isLoaded && code.length > 0 };
}
