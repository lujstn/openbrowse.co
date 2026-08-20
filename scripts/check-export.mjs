import { glob, readFile, stat } from "node:fs/promises";

const OUT = "./out";
const problems = [];
const notes = [];

async function read(path) {
  try {
    return await readFile(`${OUT}/${path}`, "utf8");
  } catch {
    return null;
  }
}

function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function check(condition, failure) {
  if (!condition) problems.push(failure);
}

// @nonobvious(must-hold) a catch-all rule matches every path, so counting it as coverage makes this
// assertion incapable of failing; only a rule with a real prefix proves the header is set for this file
function headersDeclare(rules, path, header, value) {
  return rules.some((rule) => {
    const prefix = rule.source.replace(/\(\.\*\).*$/, "");
    if (prefix === "/") return false;
    const matches = rule.source.includes("(.*)")
      ? path.startsWith(prefix)
      : rule.source === path;
    if (!matches) return false;
    const declared = rule.headers[header] ?? rule.headers[header.toLowerCase()];
    return typeof declared === "string" && declared.toLowerCase().includes(value.toLowerCase());
  });
}

const REQUIRED_PAGES = [
  "index.html",
  "benchmarks.html",
  "vs/browser-use-cloud.html",
  "docs.html",
  "docs/installation.html",
  "docs/api.html",
  "docs/api/v3/sessions/post.html",
];

for (const page of REQUIRED_PAGES) {
  const html = await read(page);
  if (!html) {
    problems.push(`${page} was not exported`);
    continue;
  }
  const words = textOf(html).split(" ").length;
  check(
    words > 180,
    `${page} rendered only ${words} words of text, which suggests it is a client-rendered shell rather than crawlable HTML`,
  );
  check(
    /<h1[\s>]/.test(html),
    `${page} has no <h1>, so retrievers have no title anchor for the page`,
  );
  check(
    /<link rel="canonical"/.test(html) || /rel="canonical"/.test(html),
    `${page} is missing a canonical link`,
  );
  notes.push(`${page}: ${words} words`);
}

// @nonobvious(must-hold) these counts pin the benchmark and comparison claims to real <table> markup on the exact pages that carry them; a screenshot or a div grid would satisfy a reader and be invisible to a retriever
const TABLE_PAGES = [
  { page: "index.html", tables: 1, headers: 8, what: "the benchmark table" },
  { page: "benchmarks.html", tables: 1, headers: 8, what: "the full runs table" },
  {
    page: "vs/browser-use-cloud.html",
    tables: 2,
    headers: 14,
    what: "the benchmark and dimension-by-dimension tables",
  },
];

for (const { page, tables: minTables, headers: minHeaders, what } of TABLE_PAGES) {
  const html = await read(page);
  if (!html) continue;
  const tables = (html.match(/<table[\s>]/g) ?? []).length;
  check(
    tables >= minTables,
    `${page} must carry ${what} as real <table> elements, found ${tables}`,
  );
  const headers = (html.match(/<th[\s>]/g) ?? []).length;
  check(
    headers >= minHeaders,
    `${page} has only ${headers} <th> cells, so its tables are missing header cells and retrievers cannot read them`,
  );
}

const home = await read("index.html");
if (home) {

  const ld = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  check(ld.length >= 3, `expected at least 3 JSON-LD blocks on the landing page, found ${ld.length}`);
  const types = [];
  for (const [, body] of ld) {
    try {
      types.push(JSON.parse(body)["@type"]);
    } catch {
      problems.push("a JSON-LD block on the landing page is not valid JSON");
    }
  }
  for (const required of ["SoftwareApplication", "FAQPage"]) {
    check(types.includes(required), `landing page JSON-LD is missing ${required}`);
  }

  const softwareApp = ld
    .map(([, b]) => {
      try {
        return JSON.parse(b);
      } catch {
        return null;
      }
    })
    .find((d) => d?.["@type"] === "SoftwareApplication");
  check(
    softwareApp && !softwareApp.aggregateRating && !softwareApp.review,
    "SoftwareApplication JSON-LD must not claim a rating or review; there are none to report and inventing them breaks Google's structured data policy",
  );
}

const llms = await read("llms.txt");
check(llms !== null, "llms.txt was not exported");
if (llms) {
  check(llms.startsWith("# "), "llms.txt must open with an H1 per the llmstxt.org spec");
  check(/^> /m.test(llms), "llms.txt must carry a blockquote summary per the llmstxt.org spec");
  check(llms.length > 800, `llms.txt is only ${llms.length} bytes, which is too thin to be useful`);
}

const llmsFull = await read("llms-full.txt");
check(llmsFull !== null, "llms-full.txt was not exported");
if (llmsFull) {
  check(
    llmsFull.length > 5000,
    `llms-full.txt is only ${llmsFull.length} bytes; it should inline the full documentation`,
  );
}

const robots = await read("robots.txt");
check(robots !== null, "robots.txt was not exported");
if (robots) {
  for (const agent of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
    check(robots.includes(agent), `robots.txt does not explicitly allow ${agent}`);
  }
  check(!/Disallow: \/$/m.test(robots), "robots.txt disallows the whole site");
}

const sitemap = await read("sitemap.xml");
check(sitemap !== null, "sitemap.xml was not exported");
if (sitemap) {
  const urls = (sitemap.match(/<loc>/g) ?? []).length;
  check(urls >= 10, `sitemap.xml lists only ${urls} URLs`);
}

// @nonobvious(must-hold) the results JSON is deliberately NOT served: the repository is its only canonical home, so this asserts the endpoint stays gone and that nothing published re-advertises it. A link to a 404 in llms.txt costs more than a missing file, because a retriever treats the dead URL as the authoritative dataset.
const removedEndpoint = await read("benchmarks.json");
check(
  removedEndpoint === null,
  "benchmarks.json is being exported again; the results JSON is meant to live only in the GitHub repository",
);
for (const file of ["llms.txt", "llms-full.txt", "index.html", "benchmarks.html", "vs/browser-use-cloud.html"]) {
  const body = await read(file);
  if (!body) continue;
  check(
    !/\/benchmarks\.json/.test(body),
    `${file} still links to /benchmarks.json, which is no longer served`,
  );
}

// @nonobvious(must-hold) OG images export without a file extension, so the host serves them as
// octet-stream unless a rule names their path; this asserts both that they exist and that the deployed
// header config covers them. It reads config/headers.json, which is the same file vercel.ts is built
// from, so the guard cannot pass against a list that is not the one shipped.
const { rules: headerRules } = JSON.parse(await readFile("./config/headers.json", "utf8"));
for (const page of REQUIRED_PAGES) {
  const html = await read(page);
  if (!html) continue;
  const meta = html.match(/<meta property="og:image" content="([^"]+)"/);
  if (!meta) {
    if (!page.startsWith("docs")) problems.push(`${page} declares no og:image`);
    continue;
  }
  const path = new URL(meta[1]).pathname;
  const info = await stat(`${OUT}${path}`).catch(() => null);
  check(info !== null, `${page} points at ${path} but no such file was exported`);
  if (info) {
    const bytes = await readFile(`${OUT}${path}`).catch(() => null);
    check(
      bytes !== null && bytes.subarray(1, 4).toString() === "PNG",
      `${path} is not a PNG`,
    );
  }
  if (!/\.[a-z0-9]+$/i.test(path)) {
    check(
      headersDeclare(headerRules, path, "Content-Type", "image/png"),
      `${path} has no file extension and no specific rule in config/headers.json sets Content-Type: image/png for it, so it will be served as application/octet-stream and social previews will fail`,
    );
  }
}

// @nonobvious(must-hold) llms.txt publishes a section list per page, generated from content/pages.ts. This
// re-reads that published list and compares it against the headings in the page's own exported HTML, in
// both directions and in order, so neither file can be changed without the other. Without this the page map
// is just prose that happens to be generated, and prose drifts: llms.txt spent this project's whole life
// telling retrievers that /benchmarks carried a methodology section that had been removed from it.
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

const EXPORTED_FOR = {
  "/": "index.html",
  "/benchmarks": "benchmarks.html",
  "/vs/browser-use-cloud": "vs/browser-use-cloud.html",
};

if (llms) {
  const entries = [
    ...llms.matchAll(/^- \[[^\]]+\]\(https:\/\/openbrowse\.co(\/[^)]*)\):[\s\S]*?\n  Sections: (.+)$/gm),
  ];
  check(
    entries.length === Object.keys(EXPORTED_FOR).length,
    `llms.txt publishes a section list for ${entries.length} pages, expected ${Object.keys(EXPORTED_FOR).length}; the page map and the exported pages have diverged`,
  );

  for (const [, rawPath, sections] of entries) {
    const urlPath = rawPath === "/" ? "/" : rawPath.replace(/\/$/, "");
    const file = EXPORTED_FOR[urlPath];
    if (!file) {
      problems.push(`llms.txt maps ${urlPath}, which is not an exported marketing page`);
      continue;
    }
    const html = await read(file);
    if (!html) continue;

    const declared = sections.split(";").map((h) => h.trim()).filter(Boolean);
    const actual = headingsIn(html);

    const missing = declared.filter((h) => !actual.includes(h));
    const unlisted = actual.filter((h) => !declared.includes(h));
    check(
      missing.length === 0,
      `llms.txt tells retrievers ${urlPath} has ${missing.map((h) => `"${h}"`).join(", ")}, but no such heading is in ${file}`,
    );
    check(
      unlisted.length === 0,
      `${file} renders ${unlisted.map((h) => `"${h}"`).join(", ")} but llms.txt does not list it, so a retriever building a page map will miss it`,
    );
    check(
      missing.length > 0 || unlisted.length > 0 || declared.join("|") === actual.join("|"),
      `llms.txt lists ${urlPath}'s sections in a different order from the page itself`,
    );
  }
}

// @nonobvious(must-hold) a URL published in llms.txt or llms-full.txt is treated by a retriever as the
// authoritative location for what the line claims, so a dead one is worse than an omission: it is a
// confident pointer at nothing.
for (const file of ["llms.txt", "llms-full.txt"]) {
  const body = await read(file);
  if (!body) continue;
  const urls = new Set(
    [...body.matchAll(/https:\/\/openbrowse\.co(\/[^\s)\]]*)/g)].map(([, p]) => p),
  );
  for (const urlPath of urls) {
    const clean = urlPath.replace(/[.,;:]$/, "");
    const candidates = clean === "/"
      ? ["index.html"]
      : /\.[a-z0-9]+$/i.test(clean)
        ? [clean.slice(1)]
        : [`${clean.slice(1)}.html`, `${clean.slice(1)}/index.html`];
    const found = await Promise.all(candidates.map((c) => read(c)));
    check(
      found.some((f) => f !== null),
      `${file} links to ${clean}, which was not exported`,
    );
  }
}

// @nonobvious(mirrors) every docs page is served twice, as HTML and as the .md an LLM fetches. The two are
// generated from one MDX file, so the failure this catches is not a wording drift but a missing or
// mistitled mirror, which sends a retriever asking for markdown to a 404.
const docsPages = REQUIRED_PAGES.filter((p) => p.startsWith("docs/") && p.endsWith(".html"));
for (const page of docsPages) {
  const slug = page.replace(/^docs\//, "").replace(/\.html$/, "");
  if (slug.startsWith("api/")) continue;
  const html = await read(page);
  const markdown = await read(`docs/${slug}.md`);
  check(markdown !== null, `docs/${slug}.md was not exported, so the .md address advertised in llms.txt 404s`);
  if (html && markdown) {
    const title = html.match(/<title>([^<·]+)/)?.[1]?.trim();
    const heading = markdown.match(/^# (.+)$/m)?.[1]?.trim();
    check(
      !title || !heading || title === heading,
      `docs/${slug}.md is titled "${heading}" but the page is titled "${title}"`,
    );
  }
}

// @nonobvious(must-hold) every app route exports a sibling .txt holding that page's full React payload, which
// the client router prefetches and which carries no robots signal of its own. The rule keeping them out of
// the index is compiled here with the same library the host uses, and run over the set the exporter actually
// produced rather than a handful of paths someone checked once, because the exporter names those files and a
// future upgrade can rename them. The two llms files are asserted in the opposite direction: they exist to be
// retrieved, so a rule that swept them up would be a silent, total loss of the machine-readable surface.
const { sourceToRegex } = await import("@vercel/routing-utils");
const noindexPatterns = headerRules
  .filter((rule) => String(rule.headers["X-Robots-Tag"] ?? "").includes("noindex"))
  .map((rule) => new RegExp(sourceToRegex(rule.source).src));
const RETRIEVABLE = ["/llms.txt", "/llms-full.txt"];

let payloads = 0;
for await (const file of glob(`${OUT}/**/*.txt`)) {
  const urlPath = `/${file.replace(/^out[/\\]/, "").split(/[/\\]/).join("/")}`;
  const covered = noindexPatterns.some((pattern) => pattern.test(urlPath));
  if (RETRIEVABLE.includes(urlPath)) {
    check(
      !covered,
      `${urlPath} is marked noindex by config/headers.json, but it exists to be retrieved`,
    );
    continue;
  }
  payloads += 1;
  check(
    covered,
    `${urlPath} is served as public plain text with no rule in config/headers.json marking it noindex, so it is an indexable copy of a page that already has one`,
  );
}
check(payloads > 0, "no payload .txt files were found in the export, so the noindex rule is asserting nothing");
notes.push(`${payloads} exported payload files are covered by a noindex rule`);

// @nonobvious(mirrors) every other machine-readable claim on this site is guarded against its source, and the
// JSON-LD was the exception. It is the one surface where an error is invisible in the browser, in the build
// and in review: a TechArticle spent this project's life declaring itself part of another TechArticle, which
// no rendered page could have shown anyone.
const REQUIRED_FIELDS = {
  TechArticle: ["headline", "author", "publisher", "isPartOf", "mainEntityOfPage"],
  SoftwareApplication: ["name", "description", "applicationCategory", "offers"],
  SoftwareSourceCode: ["name", "codeRepository", "license"],
  BreadcrumbList: ["itemListElement"],
  FAQPage: ["mainEntity"],
  Dataset: ["name", "description", "creator"],
  WebSite: ["name", "url"],
};

let blocks = 0;
for await (const file of glob(`${OUT}/**/*.html`)) {
  const html = await readFile(file, "utf8");
  for (const [, raw] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    blocks += 1;
    let node;
    try {
      node = JSON.parse(raw);
    } catch (error) {
      problems.push(`${file} carries JSON-LD that does not parse: ${error.message}`);
      continue;
    }
    check(
      node["@context"] === "https://schema.org",
      `${file}: a JSON-LD block declares no schema.org @context`,
    );
    const type = node["@type"];
    if (typeof type !== "string") {
      problems.push(`${file}: a JSON-LD block declares no @type`);
      continue;
    }
    for (const field of REQUIRED_FIELDS[type] ?? []) {
      check(
        node[field] !== undefined && node[field] !== "",
        `${file}: ${type} JSON-LD is missing ${field}`,
      );
    }
    if (type === "TechArticle") {
      check(
        node.isPartOf?.["@type"] !== "TechArticle",
        `${file}: TechArticle declares itself part of another TechArticle, which is not a containment schema.org recognises`,
      );
    }
  }
}
check(blocks > 0, "no JSON-LD was found anywhere in the export");
notes.push(`${blocks} JSON-LD blocks validated`);

if (problems.length) {
  console.error("the export does not satisfy the citation contract:\n");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log("export satisfies the citation contract:");
for (const n of notes) console.log(`  ${n}`);
