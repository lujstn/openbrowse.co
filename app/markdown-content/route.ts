import { getMarkdownForPath, markdownRecoveryBody } from "@/lib/markdown-content";
import { canonicalPathFor } from "@/lib/markdown-path";
import { site } from "@/content/landing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (request.headers.get("x-openbrowse-markdown-request") !== "1") {
    return new Response("Not found", { status: 404 });
  }

  const path =
    request.headers.get("x-openbrowse-markdown-path") ??
    new URL(request.url).searchParams.get("path") ??
    "/";
  const body = await getMarkdownForPath(path);

  if (!body) {
    return new Response(markdownRecoveryBody(path), {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "no-store",
        Vary: "Accept, Accept-Encoding",
        "X-Robots-Tag": "noindex",
      },
    });
  }

  // @nonobvious(mirrors) the markdown is a duplicate representation of an indexable HTML page, so it names
  // that page as canonical and stays out of the index; a markdown file cannot carry a rel=canonical element,
  // and the Link header is the documented equivalent for a non-HTML resource.
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, must-revalidate",
      Link: `<${site.url}${canonicalPathFor(path)}>; rel="canonical"`,
      Vary: "Accept, Accept-Encoding",
      "X-Robots-Tag": "noindex",
    },
  });
}
