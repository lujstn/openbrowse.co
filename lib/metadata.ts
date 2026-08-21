import { site } from "@/content/landing";

// @nonobvious(forced-by) Next merges metadata shallowly and replaces nested objects wholesale rather than
// field by field, so a route that sets any openGraph key silently discards the root layout's siteName and
// locale. Every page on this site sets one, which is why none of them carried either tag. Spreading these
// at each call site is the documented answer; there is no deep merge to opt into.
const shared = {
  siteName: site.name,
  locale: "en_GB",
} as const;

export const pageOpenGraph = { ...shared, type: "website" } as const;

export const articleOpenGraph = { ...shared, type: "article" } as const;
