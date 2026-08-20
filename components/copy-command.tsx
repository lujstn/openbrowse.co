"use client";

import { useEffect, useRef, useState } from "react";

export function CopyCommand({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy the ${label} commands`}
      // @nonobvious(must-hold) the resting colour is a token step rather than an opacity knock-back, because this is an interactive control and text-dim is the quietest token that still clears 4.5:1 on this background
      className={`shrink-0 font-mono text-[11px] transition-colors ${
        copied ? "text-ok" : "text-dim hover:text-accent focus-visible:text-body"
      }`}
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
