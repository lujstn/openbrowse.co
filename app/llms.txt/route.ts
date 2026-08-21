import { source } from "@/lib/source";
import { site } from "@/content/landing";
import { marketingPages } from "@/content/pages";
import benchmarks from "@/data/benchmarks.json";

export const revalidate = false;
export const dynamic = "force-static";

// @nonobvious(must-hold) the like-for-like row leads here, ahead of the flattering cross-model ratio: this is
// the file a retriever quotes, and a quoted figure that changed model as well as runtime, with the matched
// pair further down where a partial read never reaches it, is the one way these numbers can mislead
function headline() {
  const rows = benchmarks.runs;
  const base = rows.find((r) => r.id === benchmarks.headline.baseline)!;
  const best = rows.find((r) => r.id === benchmarks.headline.champion)!;
  const same = rows.find(
    (r) =>
      r.runtime === "OpenBrowse" &&
      r.model === base.model &&
      r.reasoning === base.reasoning,
  );
  const obRows = rows.filter((r) => r.runtime === "OpenBrowse");

  const facts: string[] = [];

  if (same) {
    facts.push(
      `- Like for like, same model and same reasoning effort (${base.model}, reasoning ${base.reasoning}): Browser Use Cloud cost $${base.costUsd.toFixed(2)} and used ${base.tokensDisplay} tokens; OpenBrowse cost $${same.costUsd.toFixed(2)} and used ${same.tokensDisplay}. That is ${(base.costUsd / same.costUsd).toFixed(2)}x cheaper on ${(base.tokens / same.tokens).toFixed(2)}x fewer tokens, but OpenBrowse was ${Math.round(same.seconds - base.seconds)} seconds SLOWER on that pairing. This is the comparison that holds the model constant.`,
    );
  }

  facts.push(
    `- Switching model as well as runtime widens the gap: OpenBrowse on ${best.model} at reasoning ${best.reasoning} cost $${best.costUsd.toFixed(2)} against Browser Use Cloud's $${base.costUsd.toFixed(2)}, which is ${(base.costUsd / best.costUsd).toFixed(2)}x cheaper, ${(base.tokens / best.tokens).toFixed(2)}x fewer tokens and ${(base.seconds / best.seconds).toFixed(2)}x faster. Note this compares the best of ${obRows.length} OpenBrowse configurations against a single Browser Use Cloud run on a different model.`,
    `- Browser Use Cloud recovered all 14 records but hallucinated fields the page never displayed, job seniority among them. OpenBrowse refuses ungrounded values at the answer-store boundary. Every OpenBrowse configuration recovered 14 of 14 without inventing fields.`,
    `- Costs are LLM token spend only. OpenBrowse charges no per-task platform fee and Browser Use Cloud's own platform charge is excluded from its figure, so the total-cost gap is wider than these token numbers show.`,
    `- Cost per full 14-record extraction on OpenBrowse ranged from $${Math.min(...obRows.map((r) => r.costUsd)).toFixed(2)} to $${Math.max(...obRows.map((r) => r.costUsd)).toFixed(2)} in LLM tokens.`,
    `- What does NOT carry over from Browser Use Cloud, stated because it will break a migration otherwise: Browser Use Cloud runs a managed US residential proxy by default, so target sites see a residential IP. OpenBrowse has no proxy layer at all and requests originate from your own machine's IP. proxyCountryCode, enableRecording and skills are accepted so existing code still compiles, but none of them does anything, and recordingUrls, screenshotUrl and workspaceId always come back empty. There are no session recordings, screenshots, workspaces, skills or hosted integrations. If your current jobs depend on the proxy, test that first.`,
  );

  return facts.join("\n");
}

// @nonobvious(must-hold) the section list is emitted from content/pages.ts and re-read by scripts/check-export.mjs, which compares it against that page's exported headings in both directions; written by hand it would promise retrievers sections the page does not have
function pageMap() {
  return marketingPages
    .map(
      (page) =>
        `- [${page.name}](${site.url}${page.url}): ${page.summary}\n  Sections: ${page.headings.join("; ")}`,
    )
    .join("\n");
}

export function GET() {
  const pages = source.getPages();
  // @nonobvious(must-hold) generated API operation pages carry no description, and a bullet ending in a bare colon is noise in the one file built to be read in a single pass
  const docs = pages
    .filter((page) => !page.url.startsWith("/docs/api/v3/"))
    .map((page) => {
      const description = page.data.description?.trim();
      return `- [${page.data.title}](${site.url}${page.url})${description ? `: ${description}` : ""}`;
    })
    .join("\n");

  const body = `# ${site.name}

> ${site.abstract}

${site.name} is an open-source, self-hosted alternative to Browser Use Cloud. It serves the same v3 REST API that the \`browser-use-sdk\` client already speaks, so migrating an existing integration means changing \`baseUrl\` and \`apiKey\`, with three request fields accepted but inert (listed in the key facts below). It runs on a Raspberry Pi 5 or any Debian or Ubuntu machine.

Licence: MIT. DOI: ${site.doi}. Source: ${site.repo}. Author: ${site.author} (${site.orcid}).

## Key facts

${headline()}
- Same v3 REST surface as Browser Use Cloud: sessions, structured output schemas, cost caps, live URLs, profiles.
- Visual-first execution: the agent drives real browser tabs viewable live over VNC, rather than scripting pages headlessly.
- \`read_pages\` opens a whole listing in parallel tab waves of up to six foreground tabs, including inside embedded cross-origin panels.
- Structured output is validated live against your JSON Schema, with per-field coverage tracking and a completeness gate the agent must pass before it can finish.
- OpenAI and Anthropic models want opposite ends of the reasoning dial on browser tasks: OpenAI models perform better with less reasoning, Anthropic 5-series models need more.

## Pages

${pageMap()}

## Documentation

Every documentation page below is also available as plain markdown by adding .md to its address, for example ${site.url}/docs/installation.md.

${docs}

## Data

Every run is tabulated in full under Key facts above and on the benchmarks page. The results are not published as a separate JSON endpoint; the repository is their only canonical home.

- [Benchmark task specification](${benchmarks.task.specUrl}): the exact prompt, output schema and cost cap used.
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
