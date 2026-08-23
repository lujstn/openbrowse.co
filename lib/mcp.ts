import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { SUPPORTED_PROTOCOL_VERSIONS } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod/v4";
import openapi from "../data/openapi.json" with { type: "json" };
import release from "../data/release.json" with { type: "json" };
import { getLLMText, source } from "./source";

const site = { url: "https://openbrowse.co", version: release.version } as const;

export const MCP_ENDPOINT = `${site.url}/mcp`;
export const MCP_SERVER_CARD_URL = `${MCP_ENDPOINT}/server-card`;
export const MCP_SERVER_NAME = "co.openbrowse/documentation";
export const MCP_SERVER_TITLE = "OpenBrowse documentation MCP";
export const MCP_SERVER_DESCRIPTION =
  "Read-only OpenBrowse documentation and v3 API schema for AI assistants.";

type Operation = {
  operationId?: string;
  tags?: string[];
  summary?: string;
  description?: string;
  parameters?: unknown[];
  requestBody?: unknown;
  responses?: unknown;
};

type OperationRecord = Operation & { method: string; path: string };

function operations() {
  return Object.entries(openapi.paths).flatMap(([path, methods]) =>
    Object.entries(methods as Record<string, Operation>).flatMap(([method, operation]) =>
      operation.operationId ? [{ ...operation, method: method.toUpperCase(), path }] : [],
    ),
  );
}

function normaliseDocumentPath(path: string) {
  const pathname = path.trim().replace(/^https?:\/\/[^/]+/i, "").replace(/\.md$/, "");
  if (pathname === "/docs" || pathname === "/docs/") return [];
  if (!pathname.startsWith("/docs/") || pathname.includes("..")) return null;
  const slug = pathname.slice("/docs/".length).split("/").filter(Boolean);
  return slug.length === 0 || slug.some((segment) => !/^[a-z0-9_-]+$/i.test(segment))
    ? null
    : slug;
}

async function documentForPath(path: string) {
  const slug = normaliseDocumentPath(path);
  if (!slug) return null;
  const page = source.getPage(slug);
  if (!page) return null;
  return getLLMText(page);
}

function renderDocuments() {
  return Promise.all(
    source.getPages().map(async (page) => ({
      path: page.url,
      title: page.data.title,
      description: page.data.description ?? "",
      text: await getLLMText(page),
    })),
  );
}

let documentsCache: ReturnType<typeof renderDocuments> | null = null;

// @nonobvious(forced-by) static docs corpus: cache the render across requests
function searchableDocuments() {
  documentsCache ??= renderDocuments();
  return documentsCache;
}

function resourceError(message: string) {
  return { contents: [{ uri: "openbrowse://docs", text: message, mimeType: "text/markdown" }] };
}

function toolText(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function toolError(text: string) {
  return { content: [{ type: "text" as const, text }], isError: true };
}

const readOnlyAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  destructiveHint: false,
  openWorldHint: false,
} as const;

function markdownUrl(path: string) {
  return `${site.url}${path === "/docs" ? "/docs.md" : `${path}.md`}`;
}

function apiDocsUrl(operation: OperationRecord) {
  const segments = operation.path
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/^\{(.+)\}$/, "$1"));
  return `${site.url}/docs/api/${[...segments, operation.method.toLocaleLowerCase()].join("/")}`;
}

export function createMcpServer() {
  const server = new McpServer({
    name: MCP_SERVER_NAME,
    version: site.version,
    title: MCP_SERVER_TITLE,
    websiteUrl: site.url,
  });

  server.registerTool(
    "search_openbrowse_docs",
    {
      title: "Search OpenBrowse documentation",
      description: "Search public OpenBrowse documentation pages by text.",
      inputSchema: {
        query: z.string().min(2).max(200).describe("Text to search for."),
        limit: z.number().int().min(1).max(10).default(5).describe("Maximum matching documents."),
      },
      outputSchema: z.object({
        query: z.string(),
        results: z.array(z.object({ path: z.string(), title: z.string(), description: z.string(), excerpt: z.string(), markdownUrl: z.string().url() })),
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ query, limit }) => {
      const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
      const matches = (await searchableDocuments())
        .map((document) => {
          const haystack = `${document.title}\n${document.description}\n${document.text}`.toLocaleLowerCase();
          const matchedTerms = terms.filter((term) => haystack.includes(term)).length;
          const titleMatches = terms.filter((term) => document.title.toLocaleLowerCase().includes(term)).length;
          return { ...document, score: matchedTerms * 10 + titleMatches * 20 };
        })
        .filter((document) => document.score > 0)
        .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
        .slice(0, limit)
        .map(({ path, title, description, text }) => ({
          path,
          title,
          description,
          excerpt: text.replace(/\s+/g, " ").slice(0, 320),
          markdownUrl: markdownUrl(path),
        }));
      const result = { query, results: matches };
      return { ...toolText(JSON.stringify(result, null, 2)), structuredContent: result };
    },
  );

  server.registerTool(
    "get_openbrowse_document",
    {
      title: "Get an OpenBrowse document",
      description: "Read a public OpenBrowse documentation page as Markdown using its /docs path.",
      inputSchema: { path: z.string().min(1).max(500).describe("A public /docs path, optionally ending in .md.") },
      outputSchema: z.object({ title: z.string(), path: z.string(), markdown: z.string(), canonicalUrl: z.string().url() }),
      annotations: readOnlyAnnotations,
    },
    async ({ path }) => {
      const slug = normaliseDocumentPath(path);
      const page = slug === null ? null : source.getPage(slug);
      if (!page) return toolError(`No public OpenBrowse documentation exists at ${path}.`);
      const result = {
        title: page.data.title,
        path: page.url,
        markdown: await getLLMText(page),
        canonicalUrl: `${site.url}${page.url}`,
      };
      return { ...toolText(result.markdown), structuredContent: result };
    },
  );

  server.registerTool(
    "list_openbrowse_api_operations",
    {
      title: "List OpenBrowse API operations",
      description: "List public v3 API operations, optionally filtered by sessions or profiles.",
      inputSchema: { tag: z.enum(["sessions", "profiles"]).optional().describe("Optional API tag filter.") },
      outputSchema: z.object({
        operations: z.array(z.object({ operationId: z.string(), method: z.string(), path: z.string(), tags: z.array(z.string()), summary: z.string().optional(), description: z.string().optional(), docsUrl: z.string().url() })),
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ tag }) => {
      const result = operations()
        .filter((operation) => !tag || operation.tags?.includes(tag))
        .map((operation) => ({
          operationId: operation.operationId!,
          method: operation.method,
          path: operation.path,
          tags: operation.tags ?? [],
          summary: operation.summary,
          description: operation.description,
          docsUrl: apiDocsUrl(operation),
        }));
      const structuredContent = { operations: result };
      return { ...toolText(JSON.stringify(structuredContent, null, 2)), structuredContent };
    },
  );

  server.registerTool(
    "get_openbrowse_api_operation",
    {
      title: "Get an OpenBrowse API operation",
      description: "Read one public v3 API operation by operationId.",
      inputSchema: { operationId: z.string().min(1).max(200).describe("OpenAPI operationId.") },
      outputSchema: z.object({ operationId: z.string(), method: z.string(), path: z.string(), tags: z.array(z.string()), docsUrl: z.string().url(), operation: z.record(z.string(), z.unknown()) }),
      annotations: readOnlyAnnotations,
    },
    async ({ operationId }) => {
      const operation = operations().find((candidate) => candidate.operationId === operationId);
      if (!operation) return toolError(`No public OpenBrowse API operation exists with operationId ${operationId}.`);
      const { method, path, tags, operationId: id, ...operationData } = operation;
      const result = { operationId: id!, method, path, tags: tags ?? [], docsUrl: apiDocsUrl(operation), operation: operationData };
      return { ...toolText(JSON.stringify(result, null, 2)), structuredContent: result };
    },
  );

  server.registerResource(
    "openbrowse-llms",
    "openbrowse://llms",
    { title: "OpenBrowse documentation", description: "All public OpenBrowse documentation as Markdown.", mimeType: "text/markdown" },
    async () => ({
      contents: [
        {
          uri: "openbrowse://llms",
          mimeType: "text/markdown",
          text: (await searchableDocuments()).map((document) => document.text).join("\n\n---\n\n"),
        },
      ],
    }),
  );

  server.registerResource(
    "openbrowse-openapi",
    "openbrowse://openapi",
    { title: "OpenBrowse OpenAPI schema", description: "The public OpenBrowse v3 OpenAPI schema.", mimeType: "application/json" },
    async () => ({ contents: [{ uri: "openbrowse://openapi", mimeType: "application/json", text: JSON.stringify(openapi, null, 2) }] }),
  );

  server.registerResource(
    "openbrowse-document",
    new ResourceTemplate("openbrowse://docs/{slug}", { list: undefined }),
    { title: "OpenBrowse documentation page", description: "A public OpenBrowse documentation page as Markdown.", mimeType: "text/markdown" },
    async (uri, variables) => {
      const slug = variables.slug;
      const path = Array.isArray(slug) ? slug.join("/") : slug;
      const document = typeof path === "string" ? await documentForPath(`/docs/${path}`) : null;
      return document
        ? { contents: [{ uri: uri.toString(), mimeType: "text/markdown", text: document }] }
        : resourceError(`No public OpenBrowse documentation exists at ${uri.toString()}.`);
    },
  );

  return server;
}

// @nonobvious(forced-by) a fresh transport and server per request rather than a shared session map:
// serverless scales across instances with separate memory, so a session stored on one instance is
// invisible to the next request routed elsewhere, which would 404 as "Session not found". The tools are
// read-only with no cross-request state, and the /mcp route hard-405s the GET and DELETE that streaming
// resumption and explicit termination need, so stateless mode loses nothing.
export async function handleMcpRequest(request: Request) {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await createMcpServer().connect(transport);
  return transport.handleRequest(request);
}

export const serverCard = {
  $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
  name: MCP_SERVER_NAME,
  version: site.version,
  title: MCP_SERVER_TITLE,
  description: MCP_SERVER_DESCRIPTION,
  websiteUrl: site.url,
  remotes: [
    {
      type: "streamable-http",
      url: MCP_ENDPOINT,
      supportedProtocolVersions: SUPPORTED_PROTOCOL_VERSIONS,
    },
  ],
} as const;

export const aiCatalog = {
  specVersion: "1.0",
  entries: [
    {
      identifier: "urn:air:openbrowse.co:mcp:documentation",
      type: "application/mcp-server-card+json",
      url: MCP_SERVER_CARD_URL,
    },
  ],
} as const;
