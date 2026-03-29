"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";

export function ShareButton({ roastId }: { roastId: string }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/roast/${roastId}`;

    if (navigator.share) {
      navigator.share({ url }).catch(() => {
        // share dismissed or unsupported — silently ignore
      });
      return;
    }

    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button onClick={handleShare} variant="secondary">
      {copied ? "$ link_copied!" : "$ share_roast"}
    </Button>
  );
}
