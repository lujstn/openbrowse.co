import { loader } from "fumadocs-core/source";
import { defineDocs } from "fumadocs-mdx/macro";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { z } from "zod";
import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";
import { openapi } from "./openapi";

// @nonobvious(means) seoTitle exists because one frontmatter title has to serve four readers at once: the
// H1, the sidebar entry, the markdown mirror's heading and the tab title. The first three want the short name
// a reader recognises in a list; only the last wants the words someone would type into a search box. Pages
// that do not set it keep using title for all four, which is the right answer almost everywhere.
const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({ seoTitle: z.string().optional() }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [openapi.loaderPlugin()],
});

export function getPageImageUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "image.png"];
  return {
    segments,
    url:
      "/" +
      [page.locale, ...docsImageRoute.split("/"), ...segments]
        .filter(Boolean)
        .join("/"),
  };
}

export function getPageMarkdownUrl(page: (typeof source)["$inferPage"]) {
  const segments = [...page.slugs, "content.md"];
  return {
    segments,
    url:
      "/" +
      [page.locale, ...docsContentRoute.split("/"), ...segments]
        .filter(Boolean)
        .join("/"),
  };
}

export async function getLLMText(page: (typeof source)["$inferPage"]) {
  const processed = await page.data.getText("processed");
  return `# ${page.data.title} (${page.url})\n\n${processed}`;
}
