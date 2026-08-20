import { readFile } from "node:fs/promises";

const README =
  "https://raw.githubusercontent.com/lujstn/openbrowse/main/README.md";

const strip = (cell) =>
  cell
    .replace(/<sup>.*?<\/sup>/g, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();

function parseTables(markdown) {
  const tables = [];
  let current = null;
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line.slice(1, -1).split("|").map(strip);
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      if (!current) {
        current = { header: cells, rows: [] };
        tables.push(current);
      } else {
        current.rows.push(cells);
      }
    } else if (line === "") {
      current = null;
    }
  }
  return tables;
}

function tokensToNumber(display) {
  const value = display.replace(/[^0-9.MmKk]/g, "");
  if (/m$/i.test(value)) return Math.round(parseFloat(value) * 1_000_000);
  if (/k$/i.test(value)) return Math.round(parseFloat(value) * 1_000);
  return Number(value);
}

const problems = [];

const res = await fetch(README, { headers: { "user-agent": "openbrowse.co-drift-check" } });
if (!res.ok) {
  console.error(`could not fetch upstream README: HTTP ${res.status}`);
  process.exit(2);
}
const markdown = await res.text();

const local = JSON.parse(await readFile("./data/benchmarks.json", "utf8"));
const localModels = JSON.parse(await readFile("./data/models.json", "utf8"));

const tables = parseTables(markdown);
const runTable = tables.find(
  (t) =>
    t.header.includes("Runtime") &&
    t.header.includes("Steps") &&
    t.header.includes("LLM cost"),
);

if (!runTable) {
  problems.push(
    "could not find the full benchmark table upstream (expected a table with Runtime, Steps and LLM cost columns)",
  );
} else {
  const idx = Object.fromEntries(runTable.header.map((h, i) => [h, i]));
  const recordsCol = runTable.header.findIndex((h) => /records/i.test(h));
  if (recordsCol === -1) {
    problems.push("upstream benchmark table has no Records column; the records claim can no longer be verified");
  }

  const upstream = runTable.rows.map((cells) => ({
    runtime: cells[idx.Runtime],
    model: cells[idx.Model],
    reasoning: cells[idx.Reasoning],
    steps: Number(cells[idx.Steps]),
    timeDisplay: cells[idx.Time],
    tokens: tokensToNumber(cells[idx.Tokens]),
    costUsd: Number(cells[idx["LLM cost"]].replace("$", "")),
    records: recordsCol === -1 ? null : cells[recordsCol].trim(),
  }));

  if (upstream.length !== local.runs.length) {
    problems.push(
      `upstream has ${upstream.length} benchmark runs, data/benchmarks.json has ${local.runs.length}`,
    );
  }

  for (const up of upstream) {
    const match = local.runs.find(
      (r) =>
        r.runtime.replace("Browser Use Cloud", "BU Cloud") ===
          up.runtime.replace("Browser Use Cloud", "BU Cloud") &&
        r.model === up.model &&
        r.reasoning === up.reasoning,
    );
    if (!match) {
      problems.push(
        `upstream run not present locally: ${up.runtime} / ${up.model} / ${up.reasoning}`,
      );
      continue;
    }
    for (const field of ["steps", "tokens", "costUsd", "timeDisplay"]) {
      if (String(match[field]) !== String(up[field])) {
        problems.push(
          `${up.runtime} / ${up.model} / ${up.reasoning}: ${field} is ${match[field]} locally but ${up[field]} upstream`,
        );
      }
    }
    // @nonobvious(must-hold) the records column is the credibility of the whole benchmark, so a row silently corrected upstream from 14/14 to 13/14 must fail here rather than keep being published
    if (up.records && up.records !== `${match.records}/${match.recordsExpected}`) {
      problems.push(
        `${up.runtime} / ${up.model} / ${up.reasoning}: records are ${match.records}/${match.recordsExpected} locally but ${up.records} upstream`,
      );
    }
  }
}

// @nonobvious(forced-by) the leading `>` is optional because upstream folds these lists into a <details>
// block, which puts them inside a blockquote. Anchoring on the bullet alone would stop matching the moment
// that collapses again, and this check reports "the format changed" rather than a wrong answer, so a
// pattern that only works in one of the two shapes fails the build for a purely cosmetic README edit.
const upstreamModels = [
  ...markdown.matchAll(/^>?\s*-\s+(OpenAI|Anthropic|Google):\s*(.*)$/gm),
].map(([, provider, rest]) => ({
  provider,
  models: [...rest.matchAll(/`([^`]+)`/g)].map(([, m]) => m),
}));

// @nonobvious(must-hold) an empty match set means the upstream format changed, and the loop below would then verify nothing while reporting success
if (upstreamModels.length === 0) {
  problems.push(
    "could not parse any provider model lists from the upstream README; the format changed and the model check is no longer verifying anything",
  );
}

for (const localProvider of localModels.providers) {
  if (!upstreamModels.some((up) => up.provider === localProvider.name)) {
    problems.push(`we publish provider ${localProvider.name} but upstream no longer lists it`);
  }
}

for (const up of upstreamModels) {
  const match = localModels.providers.find((p) => p.name === up.provider);
  if (!match) {
    problems.push(`upstream provider missing locally: ${up.provider}`);
    continue;
  }
  const missing = up.models.filter((m) => !match.models.includes(m));
  const extra = match.models.filter((m) => !up.models.includes(m));
  if (missing.length) {
    problems.push(`${up.provider}: upstream lists models we do not: ${missing.join(", ")}`);
  }
  if (extra.length) {
    problems.push(`${up.provider}: we list models upstream does not: ${extra.join(", ")}`);
  }
}

if (problems.length) {
  console.error("data/ has drifted from the upstream README:\n");
  for (const p of problems) console.error(`  - ${p}`);
  console.error(`\nSource: ${README}`);
  process.exit(1);
}

console.log(
  `data/ matches the upstream README: ${local.runs.length} benchmark runs and ${localModels.providers.length} providers verified.`,
);
