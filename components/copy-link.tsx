"use client";

import { useEffect, useRef, useState } from "react";

export function CopyLink({
  href,
  label,
  compact = false,
}: {
  href: string;
  label: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    const absolute = new URL(href, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(absolute);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy the link to ${label}`}
        // @nonobvious(must-hold) quietness here is a colour step, never opacity: this is an interactive control, so its resting state has to clear 4.5:1, and text-dim is the dimmest token that does on this background. Hiding it until hover would also make it unreachable on a touch device.
        className="shrink-0 font-mono text-[11px] tabular-nums text-dim transition-colors group-hover/row:text-body hover:!text-accent focus-visible:text-body data-[copied=true]:text-ok"
        data-copied={copied}
      >
        {copied ? "copied" : "copy"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy the link to ${label}`}
      className="inline-flex items-center gap-2 rounded-xs border border-line-strong bg-panel px-2.5 py-1.5 font-mono text-[12px] text-body transition-colors hover:border-accent hover:text-accent active:translate-y-px"
    >
      <span
        aria-hidden="true"
        className={`inline-block size-1.5 rounded-full transition-colors duration-200 ${
          copied ? "bg-ok" : "bg-dim"
        }`}
      />
      <span className="tabular-nums">{copied ? "Copied" : "Copy link"}</span>
    </button>
  );
}
