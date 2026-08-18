import type { ReactNode } from "react";
import { Text } from "@astryxdesign/core/Text";
import { Badge } from "@astryxdesign/core/Badge";

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-label">
      {children}
    </span>
  );
}

export function Panel({
  label,
  actions,
  children,
  padded = true,
  tone = "raised",
}: {
  label?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  padded?: boolean;
  tone?: "raised" | "quiet";
}) {
  return (
    <div
      className={`overflow-hidden rounded-md border ${
        tone === "quiet" ? "border-line-faint bg-transparent" : "border-line bg-raised"
      }`}
    >
      {label || actions ? (
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
          <Label>{label}</Label>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={padded ? "p-4 sm:p-5" : ""}>{children}</div>
    </div>
  );
}

export function StatPanel({
  label,
  value,
  detail,
  fraction,
  tone = "accent",
}: {
  label: string;
  value: string;
  detail: string;
  fraction: number;
  tone?: "accent" | "ok" | "warn";
}) {
  const bar =
    tone === "ok" ? "bg-ok" : tone === "warn" ? "bg-warn" : "bg-accent";
  const text =
    tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-ink";

  return (
    <div className="rounded-md border border-line bg-raised px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <Label>{label}</Label>
        <span
          className={`font-mono text-[22px] leading-none tabular-nums ${text}`}
        >
          {value}
        </span>
      </div>
      <div
        className="mt-3.5 h-px w-full bg-line-strong"
        role="presentation"
        aria-hidden="true"
      >
        <div
          className={`h-px ${bar}`}
          style={{ width: `${Math.max(4, Math.min(100, fraction * 100))}%` }}
        />
      </div>
      <p className="mt-2.5 font-mono text-[11px] text-dim">{detail}</p>
    </div>
  );
}

export function Chip({
  children,
  color = "gray",
}: {
  children: ReactNode;
  color?: "blue" | "purple" | "teal" | "pink" | "green" | "orange" | "red" | "gray";
}) {
  const tones: Record<string, string> = {
    blue: "bg-accent/[0.13] text-accent",
    purple: "bg-[#a78bfa]/[0.13] text-[#a78bfa]",
    teal: "bg-idle/[0.13] text-idle",
    pink: "bg-[#f472b6]/[0.13] text-[#f472b6]",
    green: "bg-ok/[0.13] text-ok",
    orange: "bg-warn/[0.13] text-warn",
    red: "bg-bad/[0.13] text-bad",
    gray: "bg-panel text-dim",
  };
  return (
    <span
      className={`inline-flex items-center rounded-xs px-1.5 py-0.5 font-mono text-[11px] ${tones[color]}`}
    >
      {children}
    </span>
  );
}

export function ModelToken({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-xs border border-line-strong bg-panel px-1.5 py-0.5 font-mono text-[11px] text-body">
      {name}
    </span>
  );
}

export function Dot({
  tone,
  label,
}: {
  tone: "ok" | "warn" | "bad" | "accent" | "neutral";
  label: string;
}) {
  const tones: Record<string, string> = {
    ok: "bg-ok",
    warn: "bg-warn",
    bad: "bg-bad",
    accent: "bg-accent",
    neutral: "bg-dim",
  };
  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-block size-2 shrink-0 rounded-full ${tones[tone]}`}
    />
  );
}

export function Count({ children }: { children: ReactNode }) {
  return <Badge variant="neutral" label={children} />;
}

export function Lede({ children }: { children: ReactNode }) {
  return (
    <Text as="p" type="large" color="secondary" textWrap="pretty">
      {children}
    </Text>
  );
}
