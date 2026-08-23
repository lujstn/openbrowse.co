import { handlePublicMcpRequest, optionsResponse, validatePublicMcpHost, validatePublicMcpRequest } from "@/lib/mcp-http";
import { NextResponse } from "next/server";

export const POST = handlePublicMcpRequest;

export function GET(request: Request) {
  const denied = validatePublicMcpHost(request);
  if (denied) return denied;
  return NextResponse.redirect(new URL("/mcp/server-card", request.url), 308);
}

export function OPTIONS(request: Request) {
  return validatePublicMcpRequest(request) ?? optionsResponse();
}
