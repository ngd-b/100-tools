import { NextResponse } from "next/server";
import { tools } from "@/data/tools";
import { getUsageCounts, incrementUsage } from "@/lib/usage";
import { createUsageLimiter, isSameOriginRequest, usageClientKey } from "@/lib/usage-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 1024;
const toolIds = new Set(tools.map((tool) => tool.id));
const clientWriteLimiter = createUsageLimiter();
// Without proxy headers every caller shares the "local" key, so use a looser
// bucket instead of silently throttling all traffic after a short burst.
const sharedWriteLimiter = createUsageLimiter({ capacity: 120, refillMs: 100 });
const readLimiter = createUsageLimiter({ capacity: 120, refillMs: 100 });

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { "Cache-Control": "no-store", ...init?.headers },
  });
}

function tooManyRequests(retryAfterSeconds: number) {
  return json({ error: "too many requests" }, {
    status: 429,
    headers: { "Retry-After": String(retryAfterSeconds) },
  });
}

// Stream the body so a chunked request cannot force an unbounded buffer.
async function readBody(request: Request, maxBytes: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export function GET(request: Request) {
  const limit = readLimiter(usageClientKey(request));
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  try {
    return json({ counts: getUsageCounts() });
  } catch (error) {
    console.error("Failed to read tool usage counts", error);
    return json({ error: "usage unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return json({ error: "forbidden" }, { status: 403 });
  }

  const clientKey = usageClientKey(request);
  const limiter = clientKey === "local" ? sharedWriteLimiter : clientWriteLimiter;
  const limit = limiter(clientKey);
  if (!limit.allowed) return tooManyRequests(limit.retryAfterSeconds);

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return json({ error: "payload too large" }, { status: 413 });
  }

  const text = await readBody(request, MAX_BODY_BYTES);
  if (text === null) {
    return json({ error: "payload too large" }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return json({ error: "invalid json" }, { status: 400 });
  }

  const toolId = typeof payload === "object" && payload !== null
    ? (payload as { toolId?: unknown }).toolId
    : undefined;
  if (typeof toolId !== "string" || !toolIds.has(toolId)) {
    return json({ error: "unknown tool" }, { status: 400 });
  }

  try {
    return json({ count: incrementUsage(toolId) });
  } catch (error) {
    console.error(`Failed to record usage for ${toolId}`, error);
    return json({ error: "usage unavailable" }, { status: 500 });
  }
}
