"use client";

import { useState } from "react";
import { Toggle } from "../components/ui/toggle";

export function ToggleDemo() {
  const [roastMode, setRoastMode] = useState(true);

  return (
    <div className="flex items-center gap-8">
      <Toggle
        checked={roastMode}
        label="roast mode"
        onCheckedChange={setRoastMode}
      />
      <Toggle checked={false} label="roast mode" />
    </div>
  );
}
