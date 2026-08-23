import { getMarkdownForPath, markdownRecoveryBody } from "@/lib/markdown-content";

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
  return new Response(body ?? markdownRecoveryBody(path), {
    status: body ? 200 : 404,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "X-Robots-Tag": "noindex",
    },
  });
}
