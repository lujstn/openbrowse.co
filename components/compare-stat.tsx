export function CompareStat({
  label,
  ours,
  theirs,
  ourValue,
  theirValue,
  saving,
}: {
  label: string;
  ours: number;
  theirs: number;
  ourValue: string;
  theirValue: string;
  saving: string;
}) {
  // @nonobvious(must-hold) both bars scale against the larger value, so length reads as real magnitude; a ratio encoding would render the better result as a nearly empty bar
  const scale = Math.max(ours, theirs);
  // @nonobvious(must-hold) the comparison bar is the only reference the shorter bar has, so it must stay visible: --color-label is the dimmest token clearing the 3:1 floor for a graphic that carries meaning
  const ourWidth = Math.max(3, (ours / scale) * 100);
  const theirWidth = Math.max(3, (theirs / scale) * 100);

  return (
    <div className="rounded-md border border-line bg-raised p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-label">
          {label}
        </span>
        <span className="rounded-xs bg-ok/[0.13] px-1.5 py-0.5 text-[11px] font-medium text-ok">
          {saving}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12px] text-ink">OpenBrowse</span>
            <span className="font-mono text-[15px] tabular-nums text-ink">
              {ourValue}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-panel">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${ourWidth}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[12px] text-dim">Browser Use Cloud</span>
            <span className="font-mono text-[15px] tabular-nums text-dim">
              {theirValue}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-panel">
            <div
              className="h-full rounded-full bg-label"
              style={{ width: `${theirWidth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
