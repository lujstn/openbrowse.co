import { marketingPages } from "@/content/pages";
import { site } from "@/content/landing";
import { trustPages, type TrustPage } from "@/content/trust";
import { getLLMText, source } from "@/lib/source";
import { canonicalPathFor } from "@/lib/markdown-path";

const trustPageForPath = Object.entries(trustPages).map(([slug, page]) => ({
  path: `/${slug}`,
  page,
}));

function markdownUrl(path: string) {
  return `${path === "/" ? "/index" : path}.md`;
}

function marketingMarkdown(path: string) {
  const page = marketingPages.find((candidate) => candidate.url === path);
  if (!page) return null;
  return `# ${page.name}\n\n> ${page.summary}\n\nCanonical URL: ${site.url}${path}\nMarkdown URL: ${site.url}${markdownUrl(path)}\n\n## Sections\n\n${page.headings.map((heading) => `- ${heading}`).join("\n")}\n\n## Use OpenBrowse when\n\nUse OpenBrowse for self-hosted AI browser tasks that need a Browser Use v3-compatible API, schema-validated grounded extraction, and a live view of the browser on Linux hardware you control.\n\n## Limitations\n\nOpenBrowse is not a managed proxy, a remote CDP endpoint, or a recording and workspace service. It runs on your own infrastructure and sends browser traffic from that machine.\n\n## Developer resources\n\n- [Documentation](${site.url}/docs)\n- [OpenAPI schema](${site.url}/openapi.json)\n- [Agent instructions](${site.url}/agents.md)\n- [Documentation MCP](${site.url}/mcp/server-card)\n`;
}

function trustMarkdown(path: string) {
  const item = trustPageForPath.find((candidate) => candidate.path === path);
  if (!item) return null;
  const page: TrustPage = item.page;
  const sections = page.sections
    .map((section) => {
      const paragraphs = section.paragraphs?.join("\n\n") ?? "";
      const cards = section.cards
        ?.map(
          (card) =>
            `### ${card.label}\n\n${card.body}${card.href && card.linkLabel ? `\n\n[${card.linkLabel}](${site.url}${card.href})` : ""}`,
        )
        .join("\n\n");
      return `## ${section.title}\n\n${[paragraphs, cards].filter(Boolean).join("\n\n")}`;
    })
    .join("\n\n");
  return `# ${page.title}\n\n> ${page.standfirst}\n\nCanonical URL: ${site.url}${path}\nMarkdown URL: ${site.url}${markdownUrl(path)}\n\n${sections}\n`;
}

export async function getMarkdownForPath(path: string) {
  const normalised = canonicalPathFor(path);
  if (normalised === "/") return marketingMarkdown(normalised);

  if (normalised === "/docs") {
    const page = source.getPage([]);
    return page ? getLLMText(page) : null;
  }

  if (normalised.startsWith("/docs/")) {
    const slug = normalised.slice("/docs/".length).split("/").filter(Boolean);
    const page = source.getPage(slug);
    return page ? getLLMText(page) : null;
  }

  const trust = trustMarkdown(normalised);
  if (trust) return trust;

  return marketingMarkdown(normalised);
}

export function markdownRecoveryBody(path: string) {
  return `# Page not found\n\nNo public Markdown document exists for \`${path}\`.\n\n- [Sitemap](${site.url}/sitemap.xml)\n- [Agent instructions](${site.url}/agents.md)\n- [Documentation](${site.url}/docs)\n`;
}
