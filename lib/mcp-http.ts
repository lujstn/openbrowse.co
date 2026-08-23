import { handleMcpRequest, MCP_ENDPOINT } from "@/lib/mcp";
import { isAllowedMcpRequest } from "@/lib/mcp-security";

export function validatePublicMcpRequest(request: Request) {
  return isAllowedMcpRequest(request) ? null : new Response("Forbidden", { status: 403 });
}

export function mcpCorsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, mcp-session-id, mcp-protocol-version, last-event-id",
    "access-control-expose-headers": "mcp-session-id, mcp-protocol-version",
    "access-control-max-age": "86400",
  };
}

export function withMcpHeaders(response: Response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(mcpCorsHeaders())) headers.set(name, value);
  headers.set("link", `<${MCP_ENDPOINT}/server-card>; rel=\"mcp-server-card\"`);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function optionsResponse() {
  return new Response(null, { status: 204, headers: mcpCorsHeaders() });
}

export async function handlePublicMcpRequest(request: Request) {
  const denied = validatePublicMcpRequest(request);
  return denied ? denied : withMcpHeaders(await handleMcpRequest(request));
}
