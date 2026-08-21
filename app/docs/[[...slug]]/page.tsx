import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";
import { findPath } from "fumadocs-core/page-tree";
import { getMDXComponents } from "@/components/mdx";
import { getPageImageUrl, source } from "@/lib/source";
import { openapi } from "@/lib/openapi";
import { OpenAPIPage } from "@/components/openapi-page";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb, techArticle } from "@/lib/schema";
import { articleOpenGraph } from "@/lib/metadata";
import { docsRoute, OG_SIZE } from "@/lib/shared";

// @nonobvious(means) the ancestor folders come from the same page tree that renders the sidebar, so a folder
// renamed in meta.json cannot leave the breadcrumb describing a hierarchy the navigation no longer has, but
// the final crumb is taken from the page's own frontmatter rather than its tree node: the OpenAPI pages carry
// a method badge as their tree name, which is a React element and not a string a crawler can read
function breadcrumbTrail(url: string, title: string) {
  const trail =
    findPath(source.getPageTree().children, (node) => node.type === "page" && node.url === url) ?? [];
  const crumbs = [{ name: "Documentation", url: docsRoute }];
  for (const node of trail) {
    if (node.type !== "folder") continue;
    const target = node.index?.url;
    if (typeof node.name === "string" && target && target !== docsRoute && target !== url) {
      crumbs.push({ name: node.name, url: target });
    }
  }
  if (url !== docsRoute) crumbs.push({ name: title, url });
  return crumbs;
}

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const preloadedProps = page.data._openapi
    ? await openapi.preloadOpenAPIPage(page)
    : undefined;

  const openapiComponents: MDXComponents = {};
  if (preloadedProps) {
    const Rendered = (props: object) => (
      <OpenAPIPage
        {...({ ...props, ...preloadedProps } as ComponentProps<typeof OpenAPIPage>)}
      />
    );
    openapiComponents.OpenAPIPage = Rendered;
    openapiComponents.APIPage = Rendered;
  }

  const trail = breadcrumbTrail(page.url, page.data.title);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <JsonLd
        data={techArticle({
          title: page.data.title,
          description: page.data.description ?? "",
          url: page.url,
          image: getPageImageUrl(page).url,
        })}
      />
      {trail.length > 1 ? <JsonLd data={breadcrumb(trail)} /> : null}
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
            ...openapiComponents,
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.seoTitle ?? page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      ...articleOpenGraph,
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      // @nonobvious(forced-by) passed as an object rather than the bare URL string it used to be: Next can
      // only emit og:image:width, height and alt when the metadata declares them, and a string declares
      // nothing. The route already renders at exactly these dimensions.
      images: [
        {
          url: getPageImageUrl(page).url,
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          alt: page.data.title,
        },
      ],
    },
  };
}
