import { getLLMText, source } from "@/lib/source";
import { site } from "@/content/landing";
import benchmarks from "@/data/benchmarks.json";
import { benchmarkAnalysis, comparison, faq } from "@/content/landing";

export const revalidate = false;
export const dynamic = "force-static";

function benchmarkTable() {
  const header = "| Runtime | Model | Reasoning | Steps | Time | Tokens | LLM cost | Records |";
  const divider = "| --- | --- | --- | ---: | ---: | ---: | ---: | --- |";
  const rows = benchmarks.runs
    .slice()
    .sort((a, b) => a.costUsd - b.costUsd)
    .map(
      (r) =>
        `| ${r.runtime} | ${r.model} | ${r.reasoning} | ${r.steps} | ${r.timeDisplay} | ${r.tokensDisplay} | $${r.costUsd.toFixed(2)} | ${r.records}/${r.recordsExpected}${r.faithful ? "" : " (with hallucinated fields)"} |`,
    );
  return [header, divider, ...rows].join("\n");
}

function comparisonTable() {
  const header = "| | Browser Use Cloud | OpenBrowse |";
  const divider = "| --- | --- | --- |";
  const rows = comparison.rows.map(
    (r) => `| ${r.dimension} | ${r.cloud} | ${r.openbrowse} |`,
  );
  return [header, divider, ...rows].join("\n");
}

// @nonobvious(must-hold) the methodology limits live here and not in content/landing.ts because no rendered page carries them any more: the marketing pages state the result, and this file is what a retriever quotes, so the caveat has to travel with the numbers even though a human visitor never reads it
const METHODOLOGY_LIMITS = {
  title: "What this benchmark does not tell you",
  body: "This is one task on one site, run once per configuration, on one Raspberry Pi. It is a real task rather than a synthetic one, and the specification is published so it can be repeated, but a single task is not a suite and one run per row carries no variance estimate. It shows that the token gap on this class of work is large and reproducible. It does not establish an average across the web, and a site with different structure could move these numbers in either direction.",
} as const;

export async function GET() {
  const pages = source.getPages();
  const docs = await Promise.all(pages.map(getLLMText));

  const body = `# ${site.name}: ${site.tagline}

> ${site.abstract}

Canonical URL: ${site.url}
Source repository: ${site.repo}
DOI: ${site.doiUrl}
Licence: MIT
Author: ${site.author} (${site.orcid})

---

# Benchmark

${benchmarks.task.summary}

Conditions: ${benchmarks.conditions.hardware}, concurrency ${benchmarks.conditions.concurrency}. ${benchmarks.conditions.note}

${benchmarkTable()}

Caveat on the Browser Use Cloud row: it recovered all 14 records, but some returned fields, job seniority among them, were hallucinated where the page never showed them.

## ${benchmarkAnalysis.h2}

${benchmarkAnalysis.points.map((p) => `### ${p.title}\n\n${p.body}`).join("\n\n")}

### ${METHODOLOGY_LIMITS.title}

${METHODOLOGY_LIMITS.body}

The exact task specification, including the prompt, output schema and cost cap, is published at ${benchmarks.task.specUrl}.

---

# OpenBrowse compared with Browser Use Cloud

${comparisonTable()}

---

# Frequently asked questions

${faq.map((item) => `## ${item.q}\n\n${item.a}`).join("\n\n")}

---

# Documentation

${docs.join("\n\n---\n\n")}
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
