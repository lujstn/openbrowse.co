import { routes, type VercelConfig } from "@vercel/config/v1";
import headers from "./config/headers.json";

// @nonobvious(mirrors) the rules come from config/headers.json rather than being written here, because
// scripts/check-served.mjs fetches the running site and asserts the headers this file declares are the
// ones actually served. A guard reading a different list from the one deployed would not catch a header
// that silently went missing.
export const config: VercelConfig = {
  headers: headers.rules.map((rule) =>
    routes.header(
      rule.source,
      Object.entries(rule.headers).map(([key, value]) => ({ key, value })),
    ),
  ),
};
