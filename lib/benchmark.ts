import benchmarks from "@/data/benchmarks.json";

export type Run = (typeof benchmarks.runs)[number];

export const runs: Run[] = benchmarks.runs;
export const task = benchmarks.task;
export const conditions = benchmarks.conditions;

export function byId(id: string): Run {
  const run = runs.find((r) => r.id === id);
  if (!run) throw new Error(`unknown benchmark run: ${id}`);
  return run;
}

export const baseline = byId(benchmarks.headline.baseline);
export const champion = byId(benchmarks.headline.champion);
export const headlineRuns = benchmarks.headline.rowIds.map(byId);

export const byCost = [...runs].sort((a, b) => a.costUsd - b.costUsd);

function ratio(worse: number, better: number) {
  return worse / better;
}

export const delta = {
  cost: ratio(baseline.costUsd, champion.costUsd),
  tokens: ratio(baseline.tokens, champion.tokens),
  time: ratio(baseline.seconds, champion.seconds),
};

export function formatRatio(value: number) {
  return `${value.toFixed(value >= 10 ? 0 : 2).replace(/\.00$/, "")}x`;
}

export function percentLess(worse: number, better: number) {
  return `${Math.round((1 - better / worse) * 100)}% less`;
}

export function percentFaster(slower: number, faster: number) {
  return `${Math.round((1 - faster / slower) * 100)}% faster`;
}

export const openbrowseRuns = runs.filter((r) => r.runtime === "OpenBrowse");

export const costRange = {
  min: Math.min(...openbrowseRuns.map((r) => r.costUsd)),
  max: Math.max(...openbrowseRuns.map((r) => r.costUsd)),
};

export function isBest(run: Run, key: "costUsd" | "seconds" | "tokens" | "steps") {
  return run[key] === Math.min(...runs.map((r) => r[key] as number));
}

// @nonobvious(means) the headline ratio compares our best configuration against the single cloud run on a different model; this is the same-model, same-reasoning pair, which is the claim that survives a hostile reading and must therefore travel with the headline everywhere it goes
export const likeForLike = (() => {
  const match = runs.find(
    (r) =>
      r.runtime === "OpenBrowse" &&
      r.model === baseline.model &&
      r.reasoning === baseline.reasoning,
  );
  if (!match) return null;
  return {
    cloud: baseline,
    openbrowse: match,
    costRatio: baseline.costUsd / match.costUsd,
    tokenRatio: baseline.tokens / match.tokens,
    secondsSlower: match.seconds - baseline.seconds,
  };
})();

export const shape = {
  runs: runs.length,
  runtimes: new Set(runs.map((r) => r.runtime)).size,
  models: new Set(runs.map((r) => r.model)).size,
  reasoningLevels: new Set(runs.map((r) => r.reasoning)).size,
};

export const cheapest = openbrowseRuns.reduce((a, b) =>
  a.costUsd <= b.costUsd ? a : b,
);

function duration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return rest ? `${m}m ${String(rest).padStart(2, "0")}s` : `${m}m`;
}

function list(parts: string[]) {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

// @nonobvious(must-hold) which reasoning setting is the cheap one differs by model family, which is the entire point of the finding, so cheap and dear are picked from the data rather than named: hardcoding "none is cheaper" would state the OpenAI result for Anthropic the moment a run changed. The clauses are conditional because a family whose token count barely moves would otherwise be given a meaningless "0.98x the tokens", which reads as an argument against the finding it is meant to support.
function contrast(model: string) {
  const rows = openbrowseRuns.filter((r) => r.model === model);
  if (rows.length < 2) return null;
  const cheap = rows.reduce((a, b) => (a.costUsd <= b.costUsd ? a : b));
  const dear = rows.reduce((a, b) => (a.costUsd >= b.costUsd ? a : b));

  const tokenRatio = dear.tokens / cheap.tokens;
  const stepGap = dear.steps - cheap.steps;
  const timeGap = dear.seconds - cheap.seconds;

  const clauses: string[] = [];
  if (tokenRatio >= 1.15) clauses.push(`burns ${formatRatio(tokenRatio)} the tokens`);
  if (stepGap >= 2) clauses.push(`takes ${dear.steps} steps instead of ${cheap.steps}`);
  if (timeGap >= 30) clauses.push(`runs ${duration(timeGap)} longer`);

  const base = `${model} costs $${cheap.costUsd.toFixed(2)} at reasoning ${cheap.reasoning} and $${dear.costUsd.toFixed(2)} at ${dear.reasoning}.`;
  return clauses.length
    ? `${base} At ${dear.reasoning} it also ${list(clauses)}.`
    : base;
}

export const reasoningContrast = [
  { family: "OpenAI", verdict: "Turn it down", model: "gpt-5.6-terra" },
  { family: "Anthropic", verdict: "Turn it up", model: "claude-sonnet-5" },
]
  .map((f) => {
    const text = contrast(f.model);
    return text ? { ...f, text } : null;
  })
  .filter((f): f is { family: string; verdict: string; model: string; text: string } => f !== null);
