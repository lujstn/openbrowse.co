const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
const publicHosts = new Set(["openbrowse.co", "www.openbrowse.co"]);

function previewHost() {
  const value = process.env.VERCEL_URL?.trim().toLocaleLowerCase();
  return value?.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "") ?? null;
}

function isPreviewHost(host: string) {
  return host === previewHost();
}

function requestHost(request: Request) {
  const value = request.headers.get("host") ?? new URL(request.url).host;
  return value.toLocaleLowerCase().replace(/:\d+$/, "");
}

function requestProtocol(request: Request) {
  return (request.headers.get("x-forwarded-proto")?.split(",", 1)[0] ?? new URL(request.url).protocol.replace(":", "")).toLocaleLowerCase();
}

export function isAllowedMcpRequest(request: Request) {
  const host = requestHost(request);
  const protocol = requestProtocol(request);
  const publicHost = publicHosts.has(host) || isPreviewHost(host);
  if ((!publicHost && !localHosts.has(host)) || !["http", "https"].includes(protocol)) return false;
  if (publicHost && protocol !== "https") return false;

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
