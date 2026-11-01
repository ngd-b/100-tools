export type LimitVerdict =
  | { allowed: true; retryAfterSeconds: 0 }
  | { allowed: false; retryAfterSeconds: number };

const MAX_BUCKETS = 10_000;

// In-memory token bucket: one instance per server process. Buckets are pruned
// once they would have refilled completely, and the map size is bounded so
// spoofed client keys cannot grow memory without limit.
export function createUsageLimiter({ capacity = 20, refillMs = 2000 } = {}) {
  const buckets = new Map<string, { tokens: number; updatedAt: number }>();
  const fullRefillWindow = capacity * refillMs;
  let operations = 0;

  function prune(now: number) {
    const staleBefore = now - fullRefillWindow;
    for (const [key, bucket] of buckets) {
      if (bucket.updatedAt <= staleBefore) buckets.delete(key);
    }
    if (buckets.size <= MAX_BUCKETS) return;
    // consume() re-inserts used keys, so iteration order is least-recently-used.
    let excess = buckets.size - MAX_BUCKETS;
    for (const key of buckets.keys()) {
      if (excess <= 0) break;
      buckets.delete(key);
      excess -= 1;
    }
  }

  return function consume(key: string, now = Date.now()): LimitVerdict {
    const bucket = buckets.get(key) ?? { tokens: capacity, updatedAt: now };
    const elapsed = Math.max(0, now - bucket.updatedAt);
    bucket.tokens = Math.min(capacity, bucket.tokens + elapsed / refillMs);
    bucket.updatedAt = now;

    if (bucket.tokens < 1) {
      buckets.delete(key);
      buckets.set(key, bucket);
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil(((1 - bucket.tokens) * refillMs) / 1000)),
      };
    }

    bucket.tokens -= 1;
    // Re-inserting moves the key to the end, keeping Map order LRU.
    buckets.delete(key);
    buckets.set(key, bucket);

    operations += 1;
    if (buckets.size > MAX_BUCKETS || operations % 1000 === 0) prune(now);
    return { allowed: true, retryAfterSeconds: 0 };
  };
}

// Prefer the proxy-set X-Real-IP. For X-Forwarded-For, use the last hop
// instead of the first: proxies that append (e.g. nginx's
// $proxy_add_x_forwarded_for) leave client-supplied values at the front.
// Direct exposure still lets callers spoof these headers; bind to loopback.
export function usageClientKey(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded.split(",").map((hop) => hop.trim()).filter(Boolean);
    const last = hops.at(-1);
    if (last) return last;
  }
  return "local";
}

// Browsers send Origin/Sec-Fetch-Site; non-browser clients may send neither.
// A reverse proxy may rewrite Host, so also accept X-Forwarded-Host and the
// configured SITE_URL. Compare host and port: a page on another port of the
// same hostname is cross-origin.
export function isSameOriginRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin") return true;
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  const hosts = [request.headers.get("host"), request.headers.get("x-forwarded-host"), configuredSiteHost()]
    .flatMap((value) => value?.split(",") ?? [])
    .map((value) => value.trim())
    .filter(Boolean);

  return hosts.length === 0 || hosts.some((host) => matchesHost(host, originUrl));
}

function configuredSiteHost(): string | null {
  const value = process.env.SITE_URL?.trim();
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

// Host headers carry no scheme; parse them with the Origin's protocol so the
// default port is resolved the same way on both sides.
function matchesHost(hostHeader: string, originUrl: URL): boolean {
  let hostUrl: URL;
  try {
    hostUrl = new URL(`${originUrl.protocol}//${hostHeader}`);
  } catch {
    return false;
  }
  return hostUrl.hostname === originUrl.hostname
    && effectivePort(hostUrl) === effectivePort(originUrl);
}

function effectivePort(url: URL): string {
  return url.port || (url.protocol === "https:" ? "443" : "80");
}
