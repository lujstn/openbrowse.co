import release from "@/data/release.json";
import {
  baseline,
  champion,
  cheapest,
  formatRatio,
  likeForLike,
  task,
} from "@/lib/benchmark";

// @nonobvious(must-hold) the gap between the cheapest run and the recommended one is pennies, and rendering it as "$0.02 more" invites the reader to dismiss it; spelling out the unit is what makes the sentence land as "the speed is nearly free"
const SMALL = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
function centsMore(cheaper: number, dearer: number) {
  const cents = Math.round((dearer - cheaper) * 100);
  const word = cents < SMALL.length ? SMALL[cents] : String(cents);
  return `${word} cent${cents === 1 ? "" : "s"} more`;
}

export const site = {
  name: "OpenBrowse",
  domain: "openbrowse.co",
  url: "https://openbrowse.co",
  repo: "https://github.com/lujstn/openbrowse",
  doi: release.doi,
  doiUrl: `https://doi.org/${release.doi}`,
  orcid: release.orcid,
  version: release.version,
  author: "Lucas Johnston Kurilov",
  licence: "MIT",
  tagline: "The open-source Browser Use Cloud alternative",
  abstract:
    "OpenBrowse is an open-source, self-hosted alternative to Browser Use Cloud: AI browser agents that run on your own hardware, driven through the v3 REST API, with schema-validated structured output, anti-hallucination grounding guards, and a live visual dashboard.",
} as const;

export const hero = {
  h1: "The open-source Browser Use Cloud alternative",
  sub: "Describe a job in your own words. It drives a real browser and hands back structured data, on hardware you own.",
  primary: { label: "Get started", href: "/docs" },
  secondary: { label: "View source", href: site.repo },
  videoCaption:
    "One real run of the benchmark task, at full speed. The agent works across parallel tabs on the left while the sandbox scripts it writes stream into the panel on the right.",
} as const;

// @nonobvious(mirrors) the quick start from the upstream README, kept identical to it because someone who
// reads one and then the other has to be told the same thing twice, not two things once. The tool name is
// the only part that differs between the three installers, which is why it is the only part that rotates.
export const install = {
  label: "Install",
  tools: ["uv tool", "pipx", "pip"],
  installArgs: "install openbrowse",
  start: "openbrowse start",
} as const;

// @nonobvious(must-hold) every section heading rendered on a marketing page is named here exactly once, and content/pages.ts assembles them into the page map that llms.txt publishes. A heading typed inline in a component would be invisible to that map, and scripts/check-export.mjs compares the published map against the exported HTML in both directions, so an unlisted heading fails the build rather than silently making llms.txt wrong.
export const headings = {
  faqs: "FAQs",
  capabilities: "What it does that a cloud runner does not",
  dimensions: "Dimension by dimension",
  reasoning: "Reasoning cuts both ways",
  picking: "Which model to reach for",
  method: "Run it yourself",
  vs: "OpenBrowse vs Browser Use Cloud",
} as const;

export const benchmark = {
  h2: "Cheaper, faster, hallucination-resistant.",
  standfirst:
    "You get the same result for a fraction of the spend, in less time, with nothing in it the page did not actually say. Here is one real extraction task where we measured all three.",
} as const;

export const evidence = {
  title: "Benchmarks",
  // @nonobvious(must-hold) every figure in this block is interpolated: these sentences render inches from the runs table and are inlined verbatim into llms-full.txt, so a typed number here contradicts the table beside it the first time a run changes
  intro: (shape: { runs: number; runtimes: number; models: number }) =>
    `One real extraction task, ${shape.runs} runs, ${shape.runtimes} runtimes, ${shape.models} models. A careers page listing ${task.recordsExpected} vacancies whose listings live inside an embedded job board on another domain, so a naive read of the page returns nothing at all. Every run had the same schema, the same spending cap, and had to come back with all ${task.recordsExpected}.`,
  honesty: `Every OpenBrowse run recovered all ${task.recordsExpected} records without inventing a field. Browser Use Cloud recovered all ${task.recordsExpected} too, and populated values the page never displayed, job seniority among them.`,
  costsNote:
    "Costs are LLM token spend. OpenBrowse charges nothing on top, and Browser Use Cloud's own platform fee is not in its figure, so the real difference in what you pay is wider than this.",
} as const;

export const benchmarkAnalysis = {
  h2: "What we learned running it",
  points: [
    {
      title: "The saving is token efficiency, not a cheaper model",
      body: likeForLike
        ? `Hold the model steady and the gap is still there. ${likeForLike.cloud.model} at reasoning ${likeForLike.cloud.reasoning} costs $${likeForLike.cloud.costUsd.toFixed(2)} on Browser Use Cloud and $${likeForLike.openbrowse.costUsd.toFixed(2)} here, because the run burns ${likeForLike.openbrowse.tokensDisplay} tokens instead of ${likeForLike.cloud.tokensDisplay}. What changes is how many tokens the runtime spends getting the agent to the answer.`
        : `OpenBrowse reached the same result on ${formatRatio(baseline.tokens / champion.tokens)} fewer tokens than Browser Use Cloud. What changes is how many tokens the runtime spends getting the agent to the answer, not which model you picked.`,
    },
    {
      title: "Reading a whole listing at once is where it goes",
      body: `Open ${task.recordsExpected} pages one at a time and you pay for ${task.recordsExpected} rounds of page context. read_pages resolves the same ${task.recordsExpected} in three waves of real tabs, so the agent reasons over the set instead of rebuilding context per page.`,
    },
    {
      title: "We do not recommend our own cheapest run",
      body: `${cheapest.model} at reasoning ${cheapest.reasoning} was the cheapest complete extraction at $${cheapest.costUsd.toFixed(2)}, and it took ${cheapest.timeDisplay} to get there. ${champion.model} at ${champion.reasoning} cost ${centsMore(cheapest.costUsd, champion.costUsd)} and finished in ${champion.timeDisplay}. That is why the cheapest row is not the recommended one.`,
    },
    {
      title: "Every reasoning level got the same answer",
      body: `Every OpenBrowse run recovered ${task.recordsExpected} of ${task.recordsExpected} records at every reasoning level. What moved was time, steps and cost, sometimes threefold. Treat reasoningEffort as a cost and latency control and set it deliberately per model family.`,
    },
  ],
} as const;

export const dropIn = {
  h2: "Just change two lines.",
  standfirst:
    "OpenBrowse serves the same v3 REST surface that browser-use-sdk already speaks. Point the client at your own box and everything downstream stays put.",
  diff: [
    { type: "context", text: 'import { BrowserUse } from "browser-use-sdk/v3";' },
    { type: "context", text: "" },
    { type: "context", text: "const client = new BrowserUse({" },
    { type: "remove", text: "  apiKey: process.env.BROWSER_USE_API_KEY," },
    { type: "add", text: "  apiKey: process.env.OPENBROWSE_API_KEY," },
    { type: "add", text: '  baseUrl: "https://your-host/v3",' },
    { type: "context", text: "});" },
  ],
} as const;

export const comparison = {
  h2: "What you gain and what you give up",
  standfirst:
    "You take on running a machine. In exchange the agent stops being a black box you rent by the task.",
  rows: [
    {
      dimension: "Hosting",
      cloud: "Managed, priced per task",
      openbrowse: "Your hardware. You pay for LLM tokens and nothing else",
      advantage: "openbrowse",
    },
    {
      dimension: "How it works",
      cloud: "Code-first. The agent scripts its way through pages",
      openbrowse: "Visual-first. The agent opens real tabs you can watch, like a person working",
      advantage: "neutral",
    },
    {
      dimension: "Bulk page reads",
      cloud: "One page at a time on the v3 agent we benchmarked",
      openbrowse: "read_pages opens a whole listing in parallel tab waves, in one step",
      advantage: "openbrowse",
    },
    {
      dimension: "Structured output",
      cloud: "Schema-validated",
      openbrowse:
        "Schema-validated, plus a live answer store with a completeness gate the agent has to pass before it can finish",
      advantage: "openbrowse",
    },
    {
      dimension: "Anti-hallucination",
      cloud: "Will fill fields the page never showed",
      openbrowse:
        "On-screen data first, enriched only from the page's own structured data. Values without evidence are refused at the store boundary",
      advantage: "openbrowse",
    },
    {
      dimension: "Profiles",
      cloud: "Cloud profiles",
      openbrowse: "Import your existing cloud profiles, cookies and localStorage, with one command",
      advantage: "neutral",
    },
    {
      dimension: "Live view",
      cloud: "A live URL you can embed from the moment the session starts, plus recordings afterwards",
      openbrowse:
        "Real-time VNC of the actual browser, a step feed carrying the model's reasoning, and an IDE panel streaming the agent's sandbox scripts as they are written. No recordings",
      advantage: "neutral",
    },
    {
      dimension: "Network egress",
      cloud: "A managed US residential proxy, on by default, with a selectable country",
      openbrowse:
        "Your machine's own IP address. There is no proxy layer. proxyCountryCode is accepted for SDK compatibility and does nothing",
      advantage: "cloud",
    },
    {
      dimension: "Platform extras",
      cloud: "Session recordings, screenshots, workspaces, and hosted integrations",
      openbrowse:
        "None of them. enableRecording and skills are accepted and ignored, and the matching response fields come back empty",
      advantage: "cloud",
    },
    {
      dimension: "API",
      cloud: "v3 REST",
      openbrowse: "The same v3 REST surface",
      advantage: "neutral",
    },
    {
      dimension: "Operations",
      cloud: "Someone else's problem",
      openbrowse: "Yours. A box that has to stay up, and roughly 2GB of RAM per concurrent session",
      advantage: "cloud",
    },
  ],
  columnNote:
    "Browser Use Cloud as of the v3 agent, August 2026. Their v4 agent has a different shape and is out of scope here.",
  moreHref: "/vs/browser-use-cloud",
} as const;

// @nonobvious(must-hold) these two paths are the llmstxt.org contract and are also asserted by scripts/check-export.mjs; renaming either one silently breaks retrievers that look for them by convention
export const machineReadable = {
  heading: "For LLMs",
  files: [
    { href: "/llms.txt", label: "llms.txt" },
    { href: "/llms-full.txt", label: "llms-full.txt" },
  ],
  note: "Every docs page also serves as markdown. Add .md to the address.",
} as const;

export const differentiators = {
  h2: headings.capabilities,
  items: [
    {
      id: "tab-waves",
      title: "Real tabs, not just code.",
      body: "OpenBrowse focuses on visual content, driving the browser like a human with parallel tabs, then diving into background data like JSON files to make its response better.",
    },
    {
      id: "answer-store",
      title: "Data completeness, guaranteed.",
      body: "Every write is checked against your schema as it discovers data, with coverage tracked field by field.",
    },
    {
      id: "grounding",
      title: "Separate \"missing\" from \"failed\".",
      body: "Values with no evidence on the page are refused at the boundary, so you genuinely know if something's not there to see.",
    },
    {
      id: "live-view",
      title: "See it work.",
      body: "Drop into any browser session to see real-time costs, a feed of the model's reasoning, and a livestream of each browser working away.",
    },
  ],
} as const;

// @nonobvious(must-hold) the figures below are interpolated from data/benchmarks.json rather than typed: these answers are emitted as FAQPage JSON-LD and quoted verbatim by retrievers, so a hand-written number here contradicts the same number on /benchmarks the first time a run changes
export const faq = [
  {
    q: "What is OpenBrowse?",
    a: "A free, self-hosted alternative to Browser Use Cloud. Describe a job, an AI agent drives a real browser on hardware you own, and you get structured data back.",
  },
  {
    q: "How does it compare to Browser Use Cloud?",
    a: "Same v3 API, your hardware, your network, no per-task/platform/proxy fees. OpenBrowse does not currently support BU's v4 API though, nor does it have BU Cloud's recordings or workspaces features.",
    link: { label: "Full comparison", href: "/vs/browser-use-cloud" },
  },
  {
    q: "What does it cost to run?",
    a: `Just LLM tokens: no platform fee, and maxCostUsd hard-caps any session. Our benchmark job cost $${champion.costUsd.toFixed(2)} here against $${baseline.costUsd.toFixed(2)} on the cloud.`,
    link: { label: "See the benchmark", href: "/benchmarks" },
  },
  {
    q: "How do I migrate from Browser Use Cloud?",
    a: "Change two lines: your apiKey and your baseUrl. Everything downstream carries over untouched.",
    link: { label: "Migration guide", href: "/docs/migrating" },
  },
  {
    q: "Can I bring my existing profiles?",
    a: "Yes. Import your cloud profile export and existing profileId references keep working.",
    link: { label: "Profiles", href: "/docs/profiles" },
  },
  {
    q: "Which model should I use?",
    a: "Whichever suits the job. Worth knowing: OpenAI models do better with less reasoning, Anthropic's with more.",
    link: { label: "Choosing a model", href: "/docs/models" },
  },
  {
    q: "Does it solve CAPTCHAs?",
    a: "Optionally, with your own CapSolver key. Most common types are solved; the rest are named rather than silently attempted.",
    link: { label: "Solving CAPTCHAs", href: "/docs/captchas" },
  },
  {
    q: "Does it work with the Browser Use v4 API?",
    a: "Not yet. OpenBrowse implements v3; v4 support is planned.",
  },
  {
    q: "Is OpenBrowse affiliated with Browser Use, and how is it licensed?",
    a: "No, it is independent, and built on Browser Use's own open-source SDK. MIT licensed, with a DOI so it can be cited.",
  },
];
