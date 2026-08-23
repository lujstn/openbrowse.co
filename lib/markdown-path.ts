// @nonobvious(mirrors) the home page advertises its markdown alternate as /index.md, so /index must map
// back to the site root "/" or that advertised URL 404s. Kept import-free so it is unit-testable under the
// plain node test runner, which does not resolve the @/ path alias.
export function canonicalPathFor(path: string) {
  const stripped = path.replace(/\/$/, "") || "/";
  return stripped === "/index" ? "/" : stripped;
}
