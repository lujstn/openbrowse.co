import release from "@/data/release.json";
import {
  baseline,
  champion,
  cheapest,
  costRange,
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
  sub: "Describe a job in plain English. It drives a real browser and hands back structured data, on hardware you own.",
  primary: { label: "Get started", href: "/docs" },
  secondary: { label: "View source", href: site.repo },
  videoCaption:
    "One real run of the benchmark task, at full speed. The agent works across parallel tabs on the left while the sandbox scripts it writes stream into the panel on the right.",
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
  h2: "Two lines change.",
  standfirst:
    "OpenBrowse serves the same v3 REST surface that browser-use-sdk already speaks. Point the client at your own box and everything downstream stays put.",
  after: "Retry logic, polling, profile ids, output schemas and cost caps all carry over untouched. Three things do not: the managed proxy, session recording, and skills. Those fields are still accepted so your code compiles, and then do nothing.",
  moreLabel: "The full comparison with Browser Use Cloud",
  moreHref: "/vs/browser-use-cloud",
  exampleLead: "The job itself stays exactly as it was, too.",
  exampleBody:
    "Same fields, same schema, same everything. Only the machine underneath it changed.",
  example: [
    "const session = await client.sessions.create({",
    '  task: "Find every open role on this careers page and return them all.",',
    '  model: "gpt-5.6-terra",',
    "  outputSchema: roles,",
    "});",
  ],
  // @nonobvious(must-hold) the import is browser-use-sdk/v3 and the method is sessions.create: the bare browser-use-sdk entry point is the v4 client, whose surface OpenBrowse does not implement, and baseUrl must carry the /v3 suffix because the SDK's own default base URL ends in /api/v3 and its request paths are relative to it
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
      title: "Parallel tab waves",
      body: "Most runners walk a listing one page at a time and pay for a fresh round of page context on every hop. read_pages opens the whole thing at once, in waves of up to six real foreground tabs, reading inside embedded panels from other domains as it goes.",
    },
    {
      id: "answer-store",
      title: "A completeness gate",
      body: "Every write is checked against your JSON Schema as it happens, with coverage tracked field by field. The agent cannot call itself finished until the gate passes.",
    },
    {
      id: "grounding",
      title: "Grounding guards",
      body: "Values with no evidence on the page are refused at the boundary. A field the site genuinely does not publish comes back marked absent, never guessed.",
    },
    {
      id: "live-view",
      title: "A live view that is actually live",
      body: "The real browser streamed over VNC while it works, beside a feed of the model's reasoning and the cost of each step, and a code tab where the agent's sandbox scripts appear line by line as it writes them.",
    },
  ],
} as const;

// @nonobvious(must-hold) every figure below is interpolated from data/benchmarks.json rather than typed: these answers are emitted as FAQPage JSON-LD and quoted verbatim by retrievers, so a hand-written number here contradicts the same number on /benchmarks the first time a run changes
const matched = likeForLike
  ? `Hold ${likeForLike.cloud.model} at reasoning ${likeForLike.cloud.reasoning} on both sides and OpenBrowse still costs $${likeForLike.openbrowse.costUsd.toFixed(2)} against $${likeForLike.cloud.costUsd.toFixed(2)} on ${formatRatio(likeForLike.tokenRatio)} fewer tokens, though it takes ${likeForLike.secondsSlower} seconds longer.`
  : "";

export const faq = [
  {
    q: "What is OpenBrowse?",
    a: "OpenBrowse is a free, MIT-licensed, self-hosted alternative to Browser Use Cloud. You describe a job in plain English, an AI agent drives a real Chromium browser on hardware you own, and you get back structured data validated against your own schema. It serves the same v3 REST API that browser-use-sdk already speaks, so existing clients work against it unchanged, and you pay your LLM provider and nothing to OpenBrowse. Browser Use Cloud is the hosted service run by the authors of the open-source Browser Use library, which charges per task to do the same work on their machines.",
  },
  {
    q: "What does OpenBrowse cost to run?",
    a: `LLM tokens, plus whatever the machine costs you. There is no per-task platform fee and nothing meters your usage. On the benchmark task a full ${task.recordsExpected}-record extraction cost between $${costRange.min.toFixed(2)} and $${costRange.max.toFixed(2)} in tokens, the spread coming entirely from which model and reasoning effort you picked. Every session also accepts maxCostUsd, which is a hard stop-loss, not an estimate.`,
  },
  {
    q: "Is OpenBrowse cheaper than Browser Use Cloud?",
    a: `On the benchmark task, yes: $${champion.costUsd.toFixed(2)} against $${baseline.costUsd.toFixed(2)} for the same ${task.recordsExpected} records, on ${champion.tokensDisplay} tokens instead of ${baseline.tokensDisplay}, finishing in ${champion.timeDisplay} against ${baseline.timeDisplay}. That headline changes model as well as runtime, so the conservative reading is the matched pair. ${matched} Neither figure includes Browser Use Cloud's own platform fee, which sits on top of its tokens.`,
  },
  {
    q: "How long does it take to install, and what hardware does it need?",
    a: "About ten minutes on a machine you already have, most of it apt installing Chromium's dependencies and the virtual display it draws into. Three commands clone, sync and start it, then a setup screen in the browser generates your API key and writes .env for you. It runs on any Debian or Ubuntu box, not just the Raspberry Pi 5 it was benchmarked on, and wants roughly 2GB of RAM per concurrent session. To reach it from outside your network, tailscale funnel --bg 8420 publishes the API over TLS without opening a port on your router.",
  },
  {
    q: "How do I migrate from Browser Use Cloud?",
    a: "Two lines: point apiKey at your instance's key and set baseUrl to https://your-host/v3, importing the client from browser-use-sdk/v3. Everything downstream survives the move: retries, polling, profile ids, output schemas, cost caps. One thing to settle before you cut over: Browser Use Cloud routes sessions through a managed US residential proxy by default, and OpenBrowse has no proxy layer, so target sites will see your server's own IP. Nothing errors when that happens, the pages simply come back different, so test anything geo-gated or rate-limited by IP first.",
  },
  {
    q: "What does OpenBrowse do that Browser Use Cloud does not?",
    a: "read_pages opens a whole listing in parallel waves of up to six real tabs, reading inside embedded cross-origin panels as it goes, which is where most of the token gap comes from. Structured output is a live answer store, not a final validation pass: every write is checked against your JSON Schema as it happens, coverage is tracked field by field, and the agent cannot call itself finished until the gate passes. The live view is the actual browser streamed over VNC while it works, with the model's reasoning and the sandbox scripts it writes appearing beside it. The run also stays on your hardware, with no dependency on any service beyond the LLM provider itself.",
  },
  {
    q: "Does it hallucinate data the page never showed?",
    a: `Not by design. Values with no evidence on the page are refused at the answer store boundary, and enum writes are checked against the text of the pages actually read in that session, so a plausible default like seniority Senior is rejected rather than filled in. A field the site genuinely does not publish is settled as absent, which is why a record occasionally comes back thinner than you hoped. On the benchmark task Browser Use Cloud returned all ${task.recordsExpected} records and also populated fields the page never displayed, job seniority among them.`,
  },
  {
    q: "Which model should I use?",
    a: `For most work, gpt-5.6-terra or gpt-5.6-sol at reasoning effort none, or claude-sonnet-5 at high. The two families want opposite ends of the reasoning dial: OpenAI models do better reacting to the page in front of them with less planning, while Anthropic's 5-series need reasoning time to stay on the goal. Every OpenBrowse run in the benchmark recovered all ${task.recordsExpected} records whatever the effort, so treat reasoningEffort as a cost and latency control, never as a correctness one.`,
  },
  {
    q: "Can I bring my existing Browser Use Cloud profiles?",
    a: "Yes. OpenBrowse imports profiles in Playwright storage-state format, the cookie and localStorage jar a cloud profile export gives you. Import one with the CLI or the dashboard and the local profile id matches the cloud id, so your existing profileId references keep working.",
  },
  {
    q: "Does it solve CAPTCHAs?",
    a: "Optionally, through a CapSolver integration you configure with your own key. reCAPTCHA v2 and v3 including Enterprise, Cloudflare Turnstile, GeeTest v3 and v4, MTCaptcha, AWS WAF tokens and image-to-text are solved. hCaptcha and DataDome have no CapSolver task at all, so they are recognised and named rather than silently attempted, and cost nothing. Detection reads the page's own structure rather than asking the model what it is looking at, each solve's real cost is folded into the session total, and a per-run ceiling stops a stubborn challenge draining the budget. Without a key the tool is simply not registered."
  },
  {
    q: "Can one session hold a conversation?",
    a: "Yes. Set keepAlive and the browser, the agent and its history stay alive between turns, so a follow-up answers from what the session already knows instead of starting cold and re-reading the page. maxCostUsd then bounds each dispatch rather than the whole conversation: the pot tops back up by the allowance the session was created with, so a long exchange cannot slowly strangle itself. A session nobody comes back to closes itself rather than holding memory for ever.",
  },
  {
    q: "How do I tell a provider outage apart from a task that will never work?",
    a: "A failed session carries failureKind, so you do not have to parse prose to find out. Provider rate limits, provider 5xx responses, connection errors and provider timeouts are each named separately from session timeouts, invalid output, budget exhaustion and ordinary agent failure, with the provider's status code alongside where there was one. The first group is worth retrying unchanged; the last is not.",
  },
  {
    q: "What does Browser Use Cloud have that OpenBrowse does not?",
    a: "A managed US residential proxy on by default, session recordings and screenshots, and skills, workspaces and hosted integrations. The three matching request fields, proxyCountryCode, enableRecording and skills, are still accepted so your code compiles, and are then ignored; the matching response fields come back empty or null. The proxy is the one to test before you migrate, because nothing errors, the pages just come back different. The machine is also yours to keep up, at roughly 2GB of RAM per concurrent session.",
  },
  {
    q: "Does it work with the Browser Use v4 API?",
    a: "No. OpenBrowse implements v3, which is what browser-use-sdk still ships at browser-use-sdk/v3 and what the benchmark on this site was run against. The v4 runs API has a different request shape and is out of scope.",
  },
  {
    q: "Is OpenBrowse affiliated with Browser Use, and how is it licensed?",
    a: "No, it is an independent open-source project built on Browser Use's own open-source SDK, implementing the same v3 REST surface so existing clients work against it unchanged. It is MIT licensed, with a DOI through Zenodo and a CITATION.cff in the repository, so it can be cited directly in academic work.",
  },
];
