import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const REPO = process.env.OPENBROWSE_REPO ?? "../browser-use-raspberrypi";
const PROSE_DIR = "./content/docs";
const PROSE_EXTRA = ["./content/landing.ts"];

const repo = resolve(REPO);
const exists = await stat(repo).catch(() => null);
if (!exists) {
  console.log(
    `skipping the fact check: no OpenBrowse application source at ${repo}.\n` +
      "Clone https://github.com/lujstn/openbrowse alongside this repository, or set OPENBROWSE_REPO,\n" +
      "to assert the published constants against the code they describe.",
  );
  process.exit(0);
}

const problems = [];

// @nonobvious(must-hold) published prose wraps and reflows, and the same constant is spelled in house
// style rather than in source style: 64000 becomes "64,000", ten steps is written as a word, and
// claude-opus-4-8 is published as claude-opus-4.8 because the application itself treats either
// punctuation as the same model. Matching on normalised whitespace, case-folded, across a fact's whole
// spelling set is what stops those legitimate differences reading as drift.
const WORDS = [
  "no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen", "twenty",
];

const flatten = (text) => text.replace(/\s+/g, " ").toLowerCase();

function spellings(value) {
  const out = new Set([value]);
  const bare = value.replace(/_/g, "");
  if (/^\d+$/.test(bare)) {
    out.add(bare);
    out.add(bare.replace(/\B(?=(\d{3})+$)/g, ","));
    if (WORDS[Number(bare)] !== undefined) out.add(WORDS[Number(bare)]);
  }
  out.add(value.replace(/-(\d+)-(\d+)$/, "-$1.$2"));
  out.add(value.replace(/_/g, "-"));
  return [...out].map(flatten);
}

// @nonobvious(forced-by) the fact patterns are written with a leading (?m) to document that their
// anchors are per-line, which V8 rejects as an inline modifier, so it is lifted into a real flag here
function compile(pattern, flags) {
  return new RegExp(pattern.replace(/^\(\?m\)/, ""), `m${flags}`);
}

const proseFiles = [];
for (const name of await readdir(PROSE_DIR)) {
  if (name.endsWith(".mdx")) proseFiles.push(join(PROSE_DIR, name));
}
proseFiles.push(...PROSE_EXTRA);

const prose = new Map();
for (const path of proseFiles) {
  prose.set(path.replace(/^\.\//, ""), flatten(await readFile(path, "utf8")));
}

// @nonobvious(must-hold) an empty prose set would make every "is this still published?" assertion below
// pass by vacuum, reporting a clean run while verifying nothing at all
if (prose.size < 2) {
  console.error(`only ${prose.size} prose file(s) found under ${PROSE_DIR}; the fact check cannot verify anything`);
  process.exit(2);
}

const publishers = (needle) =>
  [...prose.entries()].filter(([, body]) => body.includes(flatten(needle))).map(([path]) => path);

const named = (paths) =>
  paths.length > 3
    ? `${paths.slice(0, 3).join(", ")} and ${paths.length - 3} more`
    : paths.join(", ") || "the docs";

const sources = new Map();
async function source(path) {
  if (!sources.has(path)) {
    sources.set(path, await readFile(join(repo, path), "utf8").catch(() => null));
  }
  return sources.get(path);
}

function extract(fact, body) {
  const mode = fact.mode ?? "capture";
  let haystack = body;
  if (fact.scope) {
    const scoped = compile(fact.scope, "").exec(body);
    if (!scoped) return { missing: `the ${fact.scope} block is gone` };
    haystack = scoped[0];
  }
  if (mode === "absent") {
    return compile(fact.pattern, "").test(haystack) ? { found: fact.value } : { found: null };
  }
  if (mode === "all") {
    const seen = [];
    for (const [, captured] of haystack.matchAll(compile(fact.pattern, "g"))) {
      if (!seen.includes(captured)) seen.push(captured);
    }
    return seen.length ? { found: seen.join(", ") } : { missing: "no match" };
  }
  const match = compile(fact.pattern, "").exec(haystack);
  if (!match) return { missing: "no match" };
  if (mode === "tokens") {
    const seen = [];
    for (const [, token] of match[1].matchAll(/"([^"]+)"/g)) {
      if (!seen.includes(token)) seen.push(token);
    }
    return { found: seen.join(", ") };
  }
  return { found: match[1] };
}

const { facts } = JSON.parse(await readFile("./data/facts.json", "utf8"));

// @nonobvious(must-hold) an emptied fact list is the one failure this script cannot report as drift,
// because there would be nothing left to compare; it has to be caught as the vacuum it is
if (!facts?.length) {
  console.error("data/facts.json asserts no constants, so this check verifies nothing");
  process.exit(2);
}

let verified = 0;

for (const fact of facts) {
  const body = await source(fact.source);
  if (body === null) {
    problems.push(`${fact.key}: ${fact.source} no longer exists in the application source`);
    continue;
  }

  const elements = fact.value.split(", ");
  const needles = fact.prose ? [fact.prose] : elements;

  // @nonobvious(must-hold) where a fact names the sentence that publishes it, that sentence must still
  // contain the value it is standing in for. Without this, the cheapest way to silence a real drift is
  // to point the needle at some other prose that happens to survive, leaving the guard green and wrong.
  if (fact.prose) {
    const flat = flatten(fact.prose);
    const unspoken = elements.filter((e) => !spellings(e).some((s) => flat.includes(s)));
    if (unspoken.length) {
      problems.push(
        `${fact.key}: the recorded sentence "${fact.prose}" does not contain ${unspoken.join(", ")}, so it no longer stands for the value this fact guards`,
      );
      continue;
    }
  }

  const asserted = needles.flatMap((needle) =>
    fact.prose
      ? publishers(needle)
      : spellings(needle).flatMap((s) => publishers(s)),
  );
  const where = [...new Set(asserted)];

  const { found, missing } = extract(fact, body);

  if (fact.mode === "absent") {
    if (found !== null) {
      problems.push(
        `${fact.key}: ${fact.source} now declares ${fact.value}, but ${named(where)} publish it as a field this instance does not implement`,
      );
      continue;
    }
  } else if (missing) {
    problems.push(
      `${fact.key}: ${fact.source} no longer matches /${fact.pattern}/ (${missing}), so the value published as ${fact.value} by ${named(where)} can no longer be verified`,
    );
    continue;
  } else if (found !== fact.value) {
    const gained = found.split(", ").filter((e) => !elements.includes(e));
    const lost = elements.filter((e) => !found.split(", ").includes(e));
    const detail =
      elements.length > 1 && (gained.length || lost.length)
        ? `${lost.length ? `no longer has ${lost.join(", ")}` : ""}${lost.length && gained.length ? " and " : ""}${gained.length ? `now has ${gained.join(", ")}` : ""}`
        : `says ${found}, but the docs publish ${fact.value}`;
    problems.push(`${fact.key}: ${fact.source} ${detail}; published by ${named(where)}`);
    continue;
  }

  // @nonobvious(must-hold) a list fact is checked element by element, not as a set: asking whether ANY
  // element still appears lets a newly added one sit here undocumented while its siblings keep it green
  if (!fact.prose && elements.length > 1) {
    const silent = elements.filter((e) => !spellings(e).some((sp) => publishers(sp).length));
    if (silent.length) {
      problems.push(
        `${fact.key}: ${silent.join(", ")} ${silent.length === 1 ? "is" : "are"} asserted here but published nowhere in the prose`,
      );
      continue;
    }
  }

  // @nonobvious(must-hold) a value that has silently dropped out of the prose is a fact this guard has
  // stopped guarding, and it fails here rather than sitting in data/facts.json looking like coverage
  if (!where.length) {
    problems.push(
      fact.prose
        ? `${fact.key}: no docs page still says "${fact.prose}", so ${fact.value} is asserted here but published nowhere`
        : `${fact.key}: ${fact.value} is no longer mentioned anywhere in the published prose`,
    );
    continue;
  }

  verified += 1;
}

if (problems.length) {
  console.error("the published prose has drifted from the OpenBrowse application source:\n");
  for (const p of problems) console.error(`  - ${p}`);
  console.error(`\nApplication source: ${repo}`);
  process.exit(1);
}

console.log(
  `published prose matches the application source: ${verified} constants verified against ${sources.size} source files and re-found in ${prose.size} prose files.`,
);
