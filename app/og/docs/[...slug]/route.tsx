import { notFound } from "next/navigation";
import { source } from "@/lib/source";
import { ogImage } from "@/lib/og";

export const dynamic = "force-static";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return ogImage({
    kicker: "documentation",
    title: page.data.title,
    stats: [],
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: [...page.slugs, "image.png"],
  }));
}
