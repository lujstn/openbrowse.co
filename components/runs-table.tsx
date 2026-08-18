"use client";

import { useState } from "react";
import type { Run } from "@/lib/benchmark";
import { BenchmarkTable } from "@/components/benchmark-table";

type SortKey = "costUsd" | "seconds" | "tokens" | "steps";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "costUsd", label: "Cheapest" },
  { key: "seconds", label: "Fastest" },
  { key: "tokens", label: "Fewest tokens" },
  { key: "steps", label: "Fewest steps" },
];

export function RunsTable({
  rows,
  highlight,
}: {
  rows: Run[];
  highlight?: string;
}) {
  const [sort, setSort] = useState<SortKey>("costUsd");
  const [openbrowseOnly, setOpenbrowseOnly] = useState(false);

  const visible = rows
    .filter((r) => (openbrowseOnly ? r.runtime === "OpenBrowse" : true))
    .slice()
    .sort((a, b) => (a[sort] as number) - (b[sort] as number));

  return (
    <div className="overflow-hidden rounded-md border border-line bg-raised">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-medium uppercase tracking-[0.05em] text-label">
            Sort by
          </span>
          {SORTS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSort(option.key)}
              aria-pressed={sort === option.key}
              className={`rounded-xs px-2 py-1 text-[12px] transition-colors ${
                sort === option.key
                  ? "bg-accent/[0.15] text-accent"
                  : "text-dim hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="ml-auto flex cursor-pointer items-center gap-2 text-[12px] text-dim transition-colors hover:text-ink">
          <input
            type="checkbox"
            checked={openbrowseOnly}
            onChange={(event) => setOpenbrowseOnly(event.target.checked)}
            className="size-3.5 accent-[#60a5fa]"
          />
          OpenBrowse runs only
        </label>
      </div>

      <BenchmarkTable rows={visible} showSteps highlight={highlight} />

      <p className="border-t border-line px-4 py-2.5 text-[12px] text-label">
        Showing {visible.length} of {rows.length} runs.
      </p>
    </div>
  );
}
