import { serverCard } from "@/lib/mcp";
import { validatePublicMcpRequest } from "@/lib/mcp-http";

export const dynamic = "force-static";

const body = JSON.stringify(serverCard);
const etag = `\"${Buffer.from(body).toString("base64url")}\"`;

export function GET(request: Request) {
  const denied = validatePublicMcpRequest(request);
  if (denied) return denied;
  const headers = {
    "content-type": "application/mcp-server-card+json; charset=utf-8",
    "cache-control": "public, max-age=3600",
    etag,
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type, if-none-match",
    "access-control-expose-headers": "etag",
  };
  if (request.headers.get("if-none-match")?.split(",").some((value) => value.trim().replace(/^W\//, "") === etag)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(body, { headers });
}

export function OPTIONS(request: Request) {
  return validatePublicMcpRequest(request) ?? new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, OPTIONS", "access-control-allow-headers": "content-type, if-none-match" } });
}
