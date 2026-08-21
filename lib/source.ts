import { loader } from "fumadocs-core/source";
import { defineDocs } from "fumadocs-mdx/macro";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { z } from "zod";
import { docsContentRoute, docsImageRoute, docsRoute } from "./shared";
import { openapi } from "./openapi";

// @nonobvious(means) seoTitle and seoDescription exist because one frontmatter field has to serve several
// readers at once. title is the H1, the sidebar entry, the markdown mirror's heading and the tab title;
// description is the standfirst under the H1, the llms.txt bullet and the search snippet. Every reader but
// the last wants the fuller phrasing, and only the last is truncated at a fixed width, so writing one string
// for both costs the on-page reader detail to fit a snippet. Pages that set neither use title and description
// for all of it, which is the right answer almost everywhere.
const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema.extend({
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    }),
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
