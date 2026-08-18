# Deploying openbrowse.co

Nothing here has been executed. No deployment has been made and no DNS has been
touched. The apex still serves the old redirect described below.

## What it is

A static Next.js export (`output: "export"`), built to `out/`. No server, no
database, no runtime. Vercel serves the directory as static files.

Response headers come from `vercel.ts`, which is generated from
`config/headers.json`. That file is the single source: `scripts/check-export.mjs`
asserts against the same list, so a header the site depends on cannot be
removed without failing the build.

The rule that matters most is `Content-Type: image/png` for the Open Graph
image routes. They export without a file extension, so without an explicit rule
they are served as `application/octet-stream` and every social preview fails
silently.

## Deploying

```bash
npm run check      # must pass before anything ships
npx vercel         # preview
npx vercel --prod  # production
```

Or connect the repository in the Vercel dashboard. The framework preset is
Next.js, the build command is `npm run build`, and the output directory is
`out`.

## The version is pinned

`data/release.json` deliberately holds **v1.2.0** while the product has moved on.
The site publishes that value as `softwareVersion` in the homepage JSON-LD and
as `datePublished` across the documentation.

Two things enforce the pin: `.github/workflows/ci.yml` no longer runs the
citation check, and `refresh-openapi.yml` no longer writes `data/release.json`.

To un-pin after launch, run `npm run sync:citation`, restore the check step in
`ci.yml`, and put `data/release.json` back into the refresh workflow's
`add-paths`. Until that happens the published version will not move on its own.

## Replacing the apex 301

`openbrowse.co` currently returns a Cloudflare-edge 301 to the GitHub
repository. Pointing DNS at Vercel does **not** remove it: Redirect Rules and
Bulk Redirects execute at Cloudflare's edge before any origin is consulted, so
the rule has to be found and deleted.

It could be configured in any of these places, and more than one may exist.
Check all of them rather than stopping at the first hit:

1. **Rules → Redirect Rules** (zone level, static or dynamic)
2. **Rules → Bulk Redirects** (account-level list bound to this zone; check both
   the list and its binding)
3. **Rules → Page Rules** (legacy "Forwarding URL", common on older zones)
4. **DNS → Records** (a record pointing straight at GitHub Pages is a proxy
   rather than a redirect, but still has to be repointed)
5. **Workers Routes** for the zone (a separate Worker bound to
   `openbrowse.co/*` could be issuing the 301 itself)

### Order of operations, no downtime

1. Deploy to Vercel and verify the whole site on its `.vercel.app` URL.
2. Add `openbrowse.co` as a domain in the Vercel project. It will tell you which
   DNS records to set.
3. Set those records at Cloudflare, with the proxy **off** (grey cloud) so
   Vercel can issue its own certificate.
4. **Last:** delete or disable whichever redirect from the list above is still
   firing, and confirm the apex serves the site rather than a 301.
