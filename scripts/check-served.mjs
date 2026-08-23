import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

// @nonobvious(forced-by) the site is served dynamically now, not exported to out/, so the citation
// contract can only be asserted against what the running server actually returns. This boots `next start`
// and fetches real responses, which also exercises the middleware, the Accept negotiation and the 404s
// that a static-file check could never see. A production build must exist first (npm run build).
const PORT = Number(process.env.CHECK_PORT ?? 3210);
const BASE = `http://localhost:${PORT}`;

const problems = [];
const notes = [];

function check(condition, failure) {
  if (!condition) problems.push(failure);
}

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// @nonobvious(must-hold) headings are read from inside <main> so the site chrome (nav, footer) cannot
// masquerade as page structure; the entity decoding matches how content/landing.ts spells the headings
function headingsIn(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  const body = main ? main[1] : html;
  return [...body.matchAll(/<(h1|h2)\b[^>]*>([\s\S]*?)<\/\1>/g)].map(([, , inner]) =>
    inner
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&#x27;|&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function jsonLdBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    ([, body]) => body,
  );
}

async function get(path, init) {
  const response = await fetch(`${BASE}${path}`, { redirect: "manual", ...init });
  const text = await response.text();
  return { status: response.status, headers: response.headers, text };
}

async function waitForReady(child) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`next start exited early with code ${child.exitCode}`);
    try {
      const response = await fetch(`${BASE}/`, { redirect: "manual" });
      if (response.status > 0) return;
    } catch {
      await sleep(500);
      continue;
    }
    await sleep(500);
  }
  throw new Error(`the server did not answer on ${BASE} within 90s`);
}

const REQUIRED_PAGES = [
  "/",
  "/benchmarks",
  "/vs/browser-use-cloud",
  "/vs/browserbase",
  "/docs",
  "/docs/installation",
  "/docs/api",
  "/docs/api/v3/sessions/post",
];

// @nonobvious(must-hold) these counts pin the benchmark and comparison claims to real <table> markup on
// the exact pages that carry them; a screenshot or a div grid would satisfy a reader and be invisible to
// a retriever
const TABLE_PAGES = [
  { page: "/", tables: 1, headers: 8, what: "the benchmark table" },
  { page: "/benchmarks", tables: 1, headers: 8, what: "the full runs table" },
  { page: "/vs/browser-use-cloud", tables: 2, headers: 14, what: "the benchmark and dimension tables" },
  { page: "/vs/browserbase", tables: 3, headers: 24, what: "the dimension, published-rates and measurement tables" },
];

// @nonobvious(must-hold) llms.txt publishes a section list per marketing page; these are the pages it maps,
// and each is fetched and its <main> headings compared against that list in both directions and in order
const MARKETING_PAGES = new Set([
  "/",
  "/benchmarks",
  "/vs/browser-use-cloud",
  "/vs/browser-use-cloud/pricing",
  "/vs/browserbase",
]);

const REQUIRED_FIELDS = {
  TechArticle: ["headline", "author", "publisher", "isPartOf", "mainEntityOfPage"],
  SoftwareApplication: ["name", "description", "applicationCategory", "offers"],
  SoftwareSourceCode: ["name", "codeRepository", "license"],
  BreadcrumbList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  Dataset: ["name", "description", "creator"],
  WebSite: ["name", "url"],
};

async function run() {
  const pageHtml = new Map();
  for (const page of REQUIRED_PAGES) {
    const { status, text } = await get(page);
    if (status !== 200) {
      problems.push(`${page} returned ${status}, not 200`);
      continue;
    }
    pageHtml.set(page, text);
    const words = textOf(text).split(" ").length;
    check(words > 180, `${page} rendered only ${words} words of text, so it reads as a client-rendered shell`);
    check(/<h1[\s>]/.test(text), `${page} has no <h1>, so retrievers have no title anchor`);
    check(/rel="canonical"/.test(text), `${page} is missing a canonical link`);
    notes.push(`${page}: ${words} words`);
  }

  for (const { page, tables: minTables, headers: minHeaders, what } of TABLE_PAGES) {
    const html = pageHtml.get(page);
    if (!html) continue;
    const tables = (html.match(/<table[\s>]/g) ?? []).length;
    check(tables >= minTables, `${page} must carry ${what} as real <table> elements, found ${tables}`);
    const headers = (html.match(/<th[\s>]/g) ?? []).length;
    check(headers >= minHeaders, `${page} has only ${headers} <th> cells, so its tables are unreadable to retrievers`);
  }

  const home = pageHtml.get("/");
  if (home) {
    const parsed = jsonLdBlocks(home).map((raw) => {
      try {
        return JSON.parse(raw);
      } catch {
        problems.push("a JSON-LD block on the landing page is not valid JSON");
        return null;
      }
    });
    check(parsed.length >= 3, `expected at least 3 JSON-LD blocks on the landing page, found ${parsed.length}`);
    const types = parsed.filter(Boolean).map((node) => node["@type"]);
    for (const required of ["SoftwareApplication", "FAQPage"]) {
      check(types.includes(required), `landing page JSON-LD is missing ${required}`);
    }
    const softwareApp = parsed.find((node) => node?.["@type"] === "SoftwareApplication");
    check(
      softwareApp && !softwareApp.aggregateRating && !softwareApp.review,
      "SoftwareApplication JSON-LD must not claim a rating or review; inventing them breaks Google's structured data policy",
    );
  }

  const { status: llmsStatus, text: llms } = await get("/llms.txt");
  check(llmsStatus === 200, `/llms.txt returned ${llmsStatus}, not 200`);
  if (llmsStatus === 200) {
    check(llms.startsWith("# "), "llms.txt must open with an H1 per the llmstxt.org spec");
    check(/^> /m.test(llms), "llms.txt must carry a blockquote summary per the llmstxt.org spec");
    check(llms.length > 800, `llms.txt is only ${llms.length} bytes, which is too thin to be useful`);
  }

  const { status: llmsFullStatus, text: llmsFull } = await get("/llms-full.txt");
  check(llmsFullStatus === 200, `/llms-full.txt returned ${llmsFullStatus}, not 200`);
  if (llmsFullStatus === 200) {
    check(llmsFull.length > 5000, `llms-full.txt is only ${llmsFull.length} bytes; it should inline the full documentation`);
  }

  const { status: robotsStatus, text: robots } = await get("/robots.txt");
  check(robotsStatus === 200, `/robots.txt returned ${robotsStatus}, not 200`);
  if (robotsStatus === 200) {
    for (const agent of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
      check(robots.includes(agent), `robots.txt does not explicitly allow ${agent}`);
    }
    check(!/Disallow: \/$/m.test(robots), "robots.txt disallows the whole site");
  }

  const { status: sitemapStatus, text: sitemap } = await get("/sitemap.xml");
  check(sitemapStatus === 200, `/sitemap.xml returned ${sitemapStatus}, not 200`);
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
  if (sitemapStatus === 200) {
    check(sitemapUrls.length >= 10, `sitemap.xml lists only ${sitemapUrls.length} URLs`);
  }

  // @nonobvious(must-hold) the results JSON is deliberately not served: the repository is its only canonical
  // home, so a link to it in llms.txt would point a retriever at a dead authoritative dataset
  const removed = await get("/benchmarks.json");
  check(removed.status === 404, `/benchmarks.json is served again (status ${removed.status}); it must live only in the repository`);
  for (const [name, body] of [["llms.txt", llms], ["llms-full.txt", llmsFull]]) {
    if (body) check(!/\/benchmarks\.json/.test(body), `${name} still links to /benchmarks.json, which is not served`);
  }

  // @nonobvious(forced-by) OG images used to export without an extension and needed an explicit header rule;
  // Next now serves them from a route, so the served Content-Type is asserted directly rather than the config
  for (const [page, html] of pageHtml) {
    const meta = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!meta) {
      if (!page.startsWith("/docs")) problems.push(`${page} declares no og:image`);
      continue;
    }
    const imagePath = new URL(meta[1]).pathname;
    const image = await get(imagePath);
    check(image.status === 200, `${page} points at ${imagePath} but it returned ${image.status}`);
    check(
      (image.headers.get("content-type") ?? "").includes("image/png"),
      `${imagePath} is not served as image/png, so social previews fail`,
    );
  }

  // @nonobvious(must-hold) llms.txt tells a retriever which sections each page has; this compares that list
  // against the page's own rendered headings both ways and in order, so neither can change without the other
  const entries = [
    ...llms.matchAll(/^- \[[^\]]+\]\(https:\/\/openbrowse\.co(\/[^)]*)\):[\s\S]*?\n  Sections: (.+)$/gm),
  ];
  check(entries.length === MARKETING_PAGES.size, `llms.txt maps ${entries.length} pages, expected ${MARKETING_PAGES.size}`);
  for (const [, rawPath, sectionList] of entries) {
    const urlPath = rawPath === "/" ? "/" : rawPath.replace(/\/$/, "");
    if (!MARKETING_PAGES.has(urlPath)) {
      problems.push(`llms.txt maps ${urlPath}, which is not a known marketing page`);
      continue;
    }
    const { status, text } = urlPath === "/" && home ? { status: 200, text: home } : await get(urlPath);
    if (status !== 200) {
      problems.push(`llms.txt maps ${urlPath}, which returned ${status}`);
      continue;
    }
    const declared = sectionList.split(";").map((h) => h.trim()).filter(Boolean);
    const actual = headingsIn(text);
    const missing = declared.filter((h) => !actual.includes(h));
    const unlisted = actual.filter((h) => !declared.includes(h));
    check(missing.length === 0, `llms.txt claims ${urlPath} has ${missing.map((h) => `"${h}"`).join(", ")}, but the page has no such heading`);
    check(unlisted.length === 0, `${urlPath} renders ${unlisted.map((h) => `"${h}"`).join(", ")} but llms.txt does not list it`);
    check(
      missing.length > 0 || unlisted.length > 0 || declared.join("|") === actual.join("|"),
      `llms.txt lists ${urlPath}'s sections in a different order from the page`,
    );
  }

  // @nonobvious(must-hold) a URL published in llms.txt is treated as authoritative, so a dead one is worse
  // than an omission
  for (const [name, body] of [["llms.txt", llms], ["llms-full.txt", llmsFull]]) {
    if (!body) continue;
    const urls = new Set([...body.matchAll(/https:\/\/openbrowse\.co(\/[^\s)\]<>"'`]*)/g)].map(([, p]) => p.replace(/[.,;:`]$/, "")));
    for (const urlPath of urls) {
      const { status } = await get(urlPath);
      check(status !== 404, `${name} links to ${urlPath}, which returns 404`);
    }
  }

  // @nonobvious(mirrors) every JSON-LD block on every indexable page is validated against its @type contract;
  // the sitemap is the enumeration of those pages now that there is no out/ directory to glob
  let blocks = 0;
  for (const loc of sitemapUrls) {
    const path = new URL(loc).pathname;
    const html = pageHtml.get(path) ?? (await get(path)).text;
    for (const raw of jsonLdBlocks(html)) {
      blocks += 1;
      let node;
      try {
        node = JSON.parse(raw);
      } catch (error) {
        problems.push(`${path} carries JSON-LD that does not parse: ${error.message}`);
        continue;
      }
      check(node["@context"] === "https://schema.org", `${path}: a JSON-LD block declares no schema.org @context`);
      const type = node["@type"];
      if (typeof type !== "string") {
        problems.push(`${path}: a JSON-LD block declares no @type`);
        continue;
      }
      for (const field of REQUIRED_FIELDS[type] ?? []) {
        check(node[field] !== undefined && node[field] !== "", `${path}: ${type} JSON-LD is missing ${field}`);
      }
      if (type === "TechArticle") {
        check(node.isPartOf?.["@type"] !== "TechArticle", `${path}: TechArticle declares itself part of another TechArticle`);
      }
    }
  }
  check(blocks > 0, "no JSON-LD was found on any page in the sitemap");
  notes.push(`${blocks} JSON-LD blocks validated across ${sitemapUrls.length} sitemap URLs`);

  const agents = await get("/agents.md");
  check(agents.status === 200, `/agents.md returned ${agents.status}, not 200 (the dedicated agent-instruction route must not be shadowed)`);
  check((agents.headers.get("content-type") ?? "").includes("text/markdown"), "/agents.md is not served as text/markdown");
  check(agents.text.startsWith("# "), "/agents.md does not open with a Markdown H1");

  for (const mdPath of ["/index.md", "/docs/installation.md"]) {
    const md = await get(mdPath);
    check(md.status === 200, `${mdPath} returned ${md.status}, not 200`);
    check((md.headers.get("content-type") ?? "").includes("text/markdown"), `${mdPath} is not served as text/markdown`);
    check(/rel="canonical"/.test(md.headers.get("link") ?? ""), `${mdPath} is missing a canonical Link header`);
  }

  const negotiated = await get("/", { headers: { Accept: "text/markdown" } });
  check((negotiated.headers.get("content-type") ?? "").includes("text/markdown"), "GET / with Accept: text/markdown did not return markdown");
  check((negotiated.headers.get("vary") ?? "").toLowerCase().includes("accept"), "the negotiated markdown response does not Vary on Accept");

  const missing = await get("/this-path-does-not-exist-xyz");
  check(missing.status === 404, `a nonexistent path returned ${missing.status}, not 404`);

  const missingMarkdown = await get("/this-path-does-not-exist-xyz.md");
  check(missingMarkdown.status === 404, `a nonexistent .md path returned ${missingMarkdown.status}, not 404`);
  check(missingMarkdown.text.startsWith("# "), "the 404 for a nonexistent .md path has no Markdown recovery body");

  const card = await get("/mcp/server-card");
  check(card.status === 200, `/mcp/server-card returned ${card.status} from localhost, not 200`);
  const cardEtag = card.headers.get("etag");
  if (cardEtag) {
    const notModified = await get("/mcp/server-card", { headers: { "If-None-Match": cardEtag } });
    check(notModified.status === 304, `/mcp/server-card ignored a matching If-None-Match (got ${notModified.status}), so conditional caching is dead`);
  } else {
    problems.push("/mcp/server-card served no ETag, so conditional caching cannot work");
  }
  const denied = await get("/mcp/server-card", { headers: { Origin: "https://evil.example" } });
  check(denied.status === 403, `/mcp/server-card allowed a cross-origin request (got ${denied.status}), so the security gate is not running`);

  const mcp = await get("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "check-served", version: "1.0" },
      },
    }),
  });
  check(mcp.status === 200, `POST /mcp initialize returned ${mcp.status}, not 200`);
  check(mcp.text.includes('"jsonrpc"'), "POST /mcp initialize did not return a JSON-RPC response");
  check(!/Session not found/.test(mcp.text), "POST /mcp initialize reported 'Session not found'");
}

const child = spawn("./node_modules/.bin/next", ["start", "-p", String(PORT)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env },
});
let serverLog = "";
child.stdout.on("data", (chunk) => (serverLog += chunk));
child.stderr.on("data", (chunk) => (serverLog += chunk));

try {
  await waitForReady(child);
  await run();
} catch (error) {
  problems.push(`the check could not run: ${error.message}`);
  if (serverLog.trim()) problems.push(`server output:\n${serverLog.trim().split("\n").slice(-20).join("\n")}`);
} finally {
  child.kill("SIGTERM");
}

if (problems.length) {
  console.error("the served site does not satisfy the citation contract:\n");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log("the served site satisfies the citation contract:");
for (const n of notes) console.log(`  ${n}`);
