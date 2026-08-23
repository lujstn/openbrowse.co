import { site } from "@/content/landing";

export const dynamic = "force-static";

export function GET() {
  const body = `# OpenBrowse agent instructions

> OpenBrowse is an MIT-licensed, self-hosted AI browser-agent server. This website publishes documentation, schemas and a read-only documentation MCP server; it does not run browser tasks for you.

## When to use OpenBrowse

Use OpenBrowse when you need a self-hosted Browser Use v3-compatible browser agent, grounded schema-validated extraction, a live browser view, and control over the Linux machine that makes requests. It is suitable for Browser Use v3 migrations, repeatable research tasks and structured extraction where evidence on the visited page matters.

## When not to use OpenBrowse

Do not use OpenBrowse when you need a managed residential proxy, remote CDP or Playwright endpoint, recordings, workspaces, managed hosting, or webhooks. It does not replace a hosted browser fleet and requires you to operate Linux hardware and protect your own API keys.

## Calling a self-hosted instance

Install the first-party CLI from PyPI: \`pipx install openbrowse\`, then start an instance with \`openbrowse start\`. Call its \`/v3\` API at your own hostname with an \`Authorization: Bearer\` API key. Read the [OpenAPI schema](${site.url}/openapi.json), [API documentation](${site.url}/docs/api), and [authentication guide](${site.url}/docs/authentication) before generating client code.

## Documentation MCP

The public MCP endpoint is \`${site.url}/mcp\`. It searches this documentation and the OpenAPI schema only. It cannot execute browser tasks, access an OpenBrowse instance, receive credentials, or control a browser. Discover it through [the server card](${site.url}/mcp/server-card) or [AI catalogue](${site.url}/.well-known/ai-catalog.json).

## Discovery

- [Documentation](${site.url}/docs)
- [Developer resources](${site.url}/developers)
- [LLMs index](${site.url}/llms.txt)
- [Complete LLM corpus](${site.url}/llms-full.txt)
- [Source code](${site.repo})
- [PyPI package](${site.pypi})
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
