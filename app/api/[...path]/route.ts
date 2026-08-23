function endpointNotFound(request: Request) {
  const url = new URL(request.url);
  return Response.json(
    {
      code: "API_ENDPOINT_NOT_FOUND",
      message: `No openbrowse.co API endpoint matches ${request.method} ${url.pathname}.`,
      resolution:
        "Read /developers or /openapi.json. The browser-agent API runs on your self-hosted instance under /v3.",
      detail: "Not found",
    },
    {
      status: 404,
      headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
    },
  );
}

export const dynamic = "force-dynamic";

export const GET = endpointNotFound;
export const POST = endpointNotFound;
export const PUT = endpointNotFound;
export const PATCH = endpointNotFound;
export const DELETE = endpointNotFound;
export const OPTIONS = endpointNotFound;

export function HEAD(request: Request) {
  const { headers } = endpointNotFound(request);
  return new Response(null, { status: 404, headers });
}
