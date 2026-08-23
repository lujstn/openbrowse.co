const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
const publicHosts = new Set(["openbrowse.co", "www.openbrowse.co"]);

function normalisePreviewHost(value: string | undefined) {
  return value
    ?.trim()
    .toLocaleLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");
}

function isPreviewHost(host: string) {
  return [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].some(
    (value) => host === normalisePreviewHost(value),
  );
}

function requestHost(request: Request) {
  const value = request.headers.get("host") ?? new URL(request.url).host;
  return value.toLocaleLowerCase().replace(/:\d+$/, "");
}

function requestProtocol(request: Request) {
  return (request.headers.get("x-forwarded-proto")?.split(",", 1)[0] ?? new URL(request.url).protocol.replace(":", "")).toLocaleLowerCase();
}

// @nonobvious(must-hold) Host validation alone defeats DNS rebinding (a rebound request carries the attacker's Host), so public read-only discovery documents gate on this and ignore Origin, which lets legitimate cross-origin agents through
export function isAllowedMcpHost(request: Request) {
  const host = requestHost(request);
  const protocol = requestProtocol(request);
  const publicHost = publicHosts.has(host) || isPreviewHost(host);
  if ((!publicHost && !localHosts.has(host)) || !["http", "https"].includes(protocol)) return false;
  if (publicHost && protocol !== "https") return false;
  return true;
}

export function isAllowedMcpRequest(request: Request) {
  if (!isAllowedMcpHost(request)) return false;

  const host = requestHost(request);
  const publicHost = publicHosts.has(host) || isPreviewHost(host);
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.hostname.toLocaleLowerCase();
    return (
      (publicHost && originUrl.protocol === "https:" && (publicHosts.has(originHost) || isPreviewHost(originHost))) ||
      (localHosts.has(host) && originUrl.protocol === "http:" && localHosts.has(originHost))
    );
  } catch {
    return false;
  }
}
