import spec from "@/data/openapi.json";

export const dynamic = "force-static";

export function GET() {
  return Response.json(spec, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
