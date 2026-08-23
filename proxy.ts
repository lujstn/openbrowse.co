import { NextResponse, type NextRequest } from "next/server";
import { prefersMarkdown } from "@/lib/accept-negotiation";

const EXCLUDED_PREFIXES = ["/_next", "/api", "/mcp", "/.well-known"];
// @nonobvious(must-hold) only a dotted path the matcher lets through needs listing here: the config matcher
// already excludes .ico/.txt/.xml/.json and images, so /agents.md is the one dedicated-route file that
// reaches the middleware and would otherwise be shadowed by the .md negotiation
const EXCLUDED_FILES = ["/agents.md"];

function isPublicContentPath(pathname: string) {
  return !EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    !EXCLUDED_FILES.includes(pathname) &&
    !pathname.includes(".");
}

function nextWithVary() {
  const response = NextResponse.next();
  response.headers.set("Vary", "Accept, Accept-Encoding");
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const explicitMarkdown = pathname.endsWith(".md");
  const canonicalPath = explicitMarkdown ? pathname.slice(0, -3) || "/" : pathname;

  if (
    explicitMarkdown
      ? EXCLUDED_PREFIXES.some((prefix) => canonicalPath.startsWith(prefix)) ||
        EXCLUDED_FILES.includes(pathname)
      : !isPublicContentPath(canonicalPath)
  ) {
    return NextResponse.next();
  }
  if (!explicitMarkdown && !prefersMarkdown(request.headers.get("accept"))) {
    return nextWithVary();
  }

  const target = new URL("/markdown-content", request.url);
  target.searchParams.set("path", canonicalPath);
  const headers = new Headers(request.headers);
  headers.set("x-openbrowse-markdown-request", "1");
  headers.set("x-openbrowse-markdown-path", canonicalPath);
  return NextResponse.rewrite(target, { request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt|xml|json|mp4)$).*)"],
};
