import { routes, type VercelConfig } from "@vercel/config/v1";
import headers from "./config/headers.json";

// @nonobvious(mirrors) the rules come from config/headers.json rather than being written here, because
// scripts/check-export.mjs asserts against that same file: OG images export with no extension and are
// served as application/octet-stream without an explicit Content-Type, which breaks every social preview
// silently. A guard reading a different list from the one deployed would not catch that.
export const config: VercelConfig = {
  headers: headers.rules.map((rule) =>
    routes.header(
      rule.source,
      Object.entries(rule.headers).map(([key, value]) => ({ key, value })),
    ),
  ),
};
