"use client";

import { useState } from "react";
import { Button } from "./components/ui/button";
import { CodeEditor } from "./components/ui/code-editor";
import { Toggle } from "./components/ui/toggle";

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
  const [code, setCode] = useState(defaultCode);
  const [roastMode, setRoastMode] = useState(true);
  const isEmpty = code.trim().length === 0;

  return (
    <>
      <CodeEditor onChange={setCode} value={code} />

      <div className="flex w-full max-w-[780px] items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle
            checked={roastMode}
            label="roast mode"
            onCheckedChange={setRoastMode}
          />
          <span className="font-secondary text-text-tertiary text-xs italic">
            {"// maximum sarcasm enabled"}
          </span>
        </div>
        <Button disabled={isEmpty} variant="primary">
          $ roast_my_code
        </Button>
      </div>
    </>
  );
}
