import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const script = resolve(root, "scripts/check-upstream.mjs");

const readme = `
| Runtime | Model | Reasoning | Steps | Time | Tokens | LLM cost | Records |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| OpenBrowse | **gpt-5.6-sol** | **none** | 8 | 2m 03s | 136k | $0.33 | 14/14 |

- OpenAI: \`gpt-5.6-sol\`
`;

function fixture(records = 14, readmeText = readme) {
  const directory = mkdtempSync(resolve(tmpdir(), "openbrowse-upstream-sync-"));
  const readmePath = resolve(directory, "README.md");
  const benchmarksPath = resolve(directory, "benchmarks.json");
  const modelsPath = resolve(directory, "models.json");
  writeFileSync(readmePath, readmeText);
  writeFileSync(
    benchmarksPath,
    `${JSON.stringify(
      {
        runs: [
          {
            id: "sol-none",
            runtime: "OpenBrowse",
            model: "gpt-5.6-sol",
            reasoning: "none",
            steps: 7,
            seconds: 99,
            timeDisplay: "1m 39s",
            tokens: 120000,
            tokensDisplay: "120k",
            costUsd: 0.41,
            records,
            recordsExpected: 14,
            faithful: true,
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    modelsPath,
    `${JSON.stringify({ providers: [{ name: "OpenAI", models: ["gpt-5.6-sol"] }] })}\n`,
  );
  return { directory, readmePath, benchmarksPath, modelsPath };
}

function environment(paths: ReturnType<typeof fixture>) {
  return {
    ...process.env,
    OPENBROWSE_README: paths.readmePath,
    OPENBROWSE_BENCHMARKS: paths.benchmarksPath,
    OPENBROWSE_MODELS: paths.modelsPath,
  };
}

test("write mode synchronises measured values from a checked-out README", (t) => {
  const paths = fixture();
  t.after(() => rmSync(paths.directory, { recursive: true, force: true }));

  execFileSync(process.execPath, [script, "--write"], {
    cwd: root,
    env: environment(paths),
  });

  const run = JSON.parse(readFileSync(paths.benchmarksPath, "utf8")).runs[0];
  assert.deepEqual(
    {
      steps: run.steps,
      seconds: run.seconds,
      timeDisplay: run.timeDisplay,
      tokens: run.tokens,
      tokensDisplay: run.tokensDisplay,
      costUsd: run.costUsd,
      records: run.records,
      faithful: run.faithful,
    },
    {
      steps: 8,
      seconds: 123,
      timeDisplay: "2m 03s",
      tokens: 136000,
      tokensDisplay: "136k",
      costUsd: 0.33,
      records: 14,
      faithful: true,
    },
  );
});

test("write mode refuses to hide a changed result count", (t) => {
  const paths = fixture(13);
  t.after(() => rmSync(paths.directory, { recursive: true, force: true }));

  const result = spawnSync(process.execPath, [script, "--write"], {
    cwd: root,
    env: environment(paths),
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /records are 13\/14 locally but 14\/14 upstream/);
  const run = JSON.parse(readFileSync(paths.benchmarksPath, "utf8")).runs[0];
  assert.equal(run.records, 13);
});

test("write mode refuses malformed upstream measurements", (t) => {
  const paths = fixture(14, readme.replace("2m 03s", "not-a-duration"));
  t.after(() => rmSync(paths.directory, { recursive: true, force: true }));

  const result = spawnSync(process.execPath, [script, "--write"], {
    cwd: root,
    env: environment(paths),
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.match(result.stderr, /could not parse seconds from the upstream row/);
  const run = JSON.parse(readFileSync(paths.benchmarksPath, "utf8")).runs[0];
  assert.equal(run.seconds, 99);
  assert.equal(run.costUsd, 0.41);
});
