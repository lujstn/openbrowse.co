import { handlePublicMcpRequest, optionsResponse, validatePublicMcpRequest } from "@/lib/mcp-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handlePublicMcpRequest;

function methodNotAllowed() {
  return new Response(null, { status: 405, headers: { Allow: "POST, OPTIONS" } });
}

export const GET = methodNotAllowed;
export const DELETE = methodNotAllowed;

export function OPTIONS(request: Request) {
  return validatePublicMcpRequest(request) ?? optionsResponse();
}
