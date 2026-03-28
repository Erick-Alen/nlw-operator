"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { BundledLanguage } from "shiki/bundle/web";
import { submitCode } from "@/app/actions/submit";
import { Button } from "./components/ui/button";
import { CodeEditor } from "./components/ui/code-editor";
import { Toggle } from "./components/ui/toggle";

const MAX_LINES = 1500;

const overLimitPhrases = [
  "// whoa, you pasted an entire codebase. we roast functions, not monoliths.",
  "// this isn't a code review, it's an archaeological dig.",
  "// even GPT would rage-quit reading this.",
  "// we said paste your code, not your entire git history.",
  "// that's not a snippet, that's a novel. trim it down.",
  "// 1,500 lines? at this point just mass-select delete.",
  "// our AI has feelings too. don't make it read all that.",
  "// ERROR 413: payload too thicc.",
  "// you're not submitting a PR, chill.",
  "// at this point we'd roast you, not the code.",
];

function pickOverLimitPhrase(lineCount: number) {
  return overLimitPhrases[lineCount % overLimitPhrases.length];
}

const defaultCode = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  if (total > 100) {
    console.log("discount applied");
    total = total * 0.9;
  }

  // TODO: handle tax calculation
  // TODO: handle currency conversion

  return total;
}`;

export function HomeEditorSection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState<BundledLanguage>("javascript");
  const [roastMode, setRoastMode] = useState(true);
  const isEmpty = code.trim().length === 0;
  const lineCount = code.split("\n").length;
  const isOverLimit = lineCount > MAX_LINES;

  const bottomMessage = useMemo(() => {
    if (isPending) {
      return "// analyzing your code...";
    }
    if (isOverLimit) {
      return pickOverLimitPhrase(lineCount);
    }
    return "// maximum sarcasm enabled";
  }, [isPending, isOverLimit, lineCount]);

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitCode({ code, language, roastMode });
      router.push(`/roast/${result.id}`);
    });
  }

  return (
    <>
      <CodeEditor
        language={language}
        maxLines={MAX_LINES}
        onChange={setCode}
        onLanguageChange={setLanguage}
        value={code}
      />

      <div className="flex w-full max-w-[780px] items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle
            checked={roastMode}
            label="roast mode"
            onCheckedChange={setRoastMode}
          />
          <span
            className={`font-secondary text-xs italic ${isOverLimit ? "text-accent-red" : "text-text-tertiary"}`}
          >
            {bottomMessage}
          </span>
        </div>
        <Button
          disabled={isEmpty || isOverLimit || isPending}
          onClick={handleSubmit}
          variant="primary"
        >
          {isPending ? "$ analyzing..." : "$ roast_my_code"}
        </Button>
      </div>
    </>
  );
}
