import { readdir, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";

const CONTENT = "./content/docs";
const SPEC = "./data/openapi.json";
const OUT = "./public/docs";
const SITE = "https://openbrowse.co";

await rm(OUT, { recursive: true, force: true });

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith(".mdx")) files.push(full);
  }
  return files;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (field) data[field[1]] = field[2].trim().replace(/^["']|["']$/g, "");
  }
  return { data, body: source.slice(match[0].length) };
}

// @nonobvious(must-hold) these are the MDX-only constructs in our own pages; anything left unconverted would reach an LLM as raw JSX and read as noise
function toMarkdown(body) {
  return body
    .replace(/<Callout type="warn">([\s\S]*?)<\/Callout>/g, (_, inner) =>
      inner
        .trim()
        .split("\n")
        .map((line) => `> **Warning:** ${line}`.replace(/^> \*\*Warning:\*\* $/, ">"))
        .join("\n"),
    )
    .replace(/<Callout(?: type="[a-z]+")?>([\s\S]*?)<\/Callout>/g, (_, inner) =>
      inner
        .trim()
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
    )
    .replace(/^\{\/\*[\s\S]*?\*\/\}\n?/gm, "")
    .replace(/^export default function[\s\S]*$/m, "")
    .replace(/\]\(\/(docs|benchmarks|vs)/g, `](${SITE}/$1`)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const written = [];

for (const file of await walk(CONTENT)) {
  const relative = path.relative(CONTENT, file);
  // @nonobvious(must-hold) only the generated operation pages are skipped, because the OpenAPI loop below writes those from the spec; api/index.mdx is hand-written and must still get a mirror, since llms.txt promises every docs page answers to a .md address
  if (relative.startsWith(`api${path.sep}v3${path.sep}`)) continue;

  const { data, body } = parseFrontmatter(await readFile(file, "utf8"));
  const slug = relative.replace(/\.mdx$/, "").replace(/\/index$/, "");
  const target =
    slug === "index" ? path.join(OUT, "..", "docs.md") : path.join(OUT, `${slug}.md`);

  const url = slug === "index" ? `${SITE}/docs` : `${SITE}/docs/${slug}`;
  const markdown = `# ${data.title ?? slug}\n\n${
    data.description ? `> ${data.description}\n\n` : ""
  }*Source: ${url}*\n\n${toMarkdown(body)}\n`;

  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, markdown);
  written.push(path.relative("./public", target));
}

const METHODS = ["get", "post", "put", "patch", "delete"];
const spec = JSON.parse(await readFile(SPEC, "utf8"));

// @nonobvious(forced-by) FastAPI wraps optional request bodies as anyOf[$ref, null] rather than a bare $ref, so a resolver that only follows $ref finds nothing and the field table silently comes out empty
function schemaFields(node, seen = new Set(), depth = 0) {
  if (!node || depth > 4) return [];
  if (typeof node.$ref === "string") {
    const name = node.$ref.split("/").pop();
    if (seen.has(name)) return [];
    seen.add(name);
    return schemaFields(spec.components?.schemas?.[name], seen, depth + 1);
  }
  for (const key of ["anyOf", "allOf", "oneOf"]) {
    if (Array.isArray(node[key])) {
      for (const branch of node[key]) {
        if (branch?.type === "null") continue;
        const fields = schemaFields(branch, seen, depth + 1);
        if (fields.length) return fields;
      }
    }
  }
  if (!node.properties) return [];
  return Object.entries(node.properties).map(([key, value]) => ({
    name: key,
    type:
      value.type ??
      value.anyOf?.find((v) => v.type && v.type !== "null")?.type ??
      "object",
    description: (value.description ?? "").replace(/\n/g, " ").trim(),
  }));
}

for (const [route, item] of Object.entries(spec.paths)) {
  for (const method of METHODS) {
    const operation = item[method];
    if (!operation) continue;

    const slug = `api${route.replace(/\{([^}]+)\}/g, "$1")}/${method}`;
    const target = path.join(OUT, `${slug}.md`);
    const url = `${SITE}/docs/${slug}`;

    const body = operation.requestBody?.content?.["application/json"]?.schema;
    const fields = schemaFields(body);
    const table = fields.length
      ? `\n## Request body\n\n| Field | Type | Description |\n| --- | --- | --- |\n${fields
          .map((f) => `| \`${f.name}\` | ${f.type} | ${f.description || ""} |`)
          .join("\n")}\n`
      : "";

    const params = (operation.parameters ?? []).map((p) => `\`${p.name}\``);
    const paramLine = params.length
      ? `\n## Parameters\n\n${params.join(", ")}\n`
      : "";

    const markdown = `# ${operation.summary ?? `${method.toUpperCase()} ${route}`}

> ${method.toUpperCase()} ${route}

*Source: ${url}*

${operation.description ?? ""}

## Request

\`\`\`bash
curl -X ${method.toUpperCase()} "https://your-host${route}" \\
  -H "Authorization: Bearer $OPENBROWSE_API_KEY"${
    method === "get" || method === "delete"
      ? ""
      : ` \\\n  -H "Content-Type: application/json" \\\n  -d '{}'`
  }
\`\`\`
${paramLine}${table}
## Responses

${Object.entries(operation.responses ?? {})
  .map(([code, value]) => `- \`${code}\`: ${value.description ?? ""}`)
  .join("\n")}
`;

    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, markdown);
    written.push(path.relative("./public", target));
  }
}

console.log(`wrote ${written.length} markdown mirrors under public/docs`);
