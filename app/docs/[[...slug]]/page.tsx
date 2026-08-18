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
import { getMDXComponents } from "@/components/mdx";
import { getPageImageUrl, source } from "@/lib/source";
import { openapi } from "@/lib/openapi";
import { OpenAPIPage } from "@/components/openapi-page";
import { JsonLd } from "@/components/json-ld";
import { techArticle } from "@/lib/schema";

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

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <JsonLd
        data={techArticle({
          title: page.data.title,
          description: page.data.description ?? "",
          url: page.url,
        })}
      />
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
    title: page.data.title,
    description: page.data.description,
    alternates: { canonical: page.url },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      images: getPageImageUrl(page).url,
    },
  };
}
