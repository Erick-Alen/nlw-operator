import { cacheLife } from "next/cache";
import type { BundledLanguage } from "shiki";
import { codeToHtml } from "shiki";

export async function cachedHighlight(
  code: string,
  language: BundledLanguage
): Promise<string> {
  "use cache";
  cacheLife("max");
  return await codeToHtml(code, { lang: language, theme: "vesper" });
}
