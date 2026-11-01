import assert from "node:assert/strict";
import test from "node:test";
import { createUsageLimiter, isSameOriginRequest, usageClientKey } from "../src/lib/usage-guard.ts";

test("token bucket allows a burst, rejects excess and refills over time", () => {
  const consume = createUsageLimiter({ capacity: 3, refillMs: 1000 });
  assert.equal(consume("a", 0).allowed, true);
  assert.equal(consume("a", 0).allowed, true);
  assert.equal(consume("a", 0).allowed, true);
  const denied = consume("a", 0);
  assert.equal(denied.allowed, false);
  assert.ok(denied.retryAfterSeconds >= 1);
  assert.equal(consume("a", 1000).allowed, true);
  assert.equal(consume("a", 1000).allowed, false);
});

test("buckets are isolated per client and do not refill past capacity", () => {
  const consume = createUsageLimiter({ capacity: 2, refillMs: 1000 });
  assert.equal(consume("a", 0).allowed, true);
  assert.equal(consume("a", 0).allowed, true);
  assert.equal(consume("a", 0).allowed, false);
  assert.equal(consume("b", 0).allowed, true);
  assert.equal(consume("a", 100000).allowed, true);
  assert.equal(consume("a", 100000).allowed, true);
  assert.equal(consume("a", 100000).allowed, false);
});

test("client key uses the trusted proxy headers, not the spoofable first hop", () => {
  assert.equal(usageClientKey(new Request("https://example.com", { headers: { "x-forwarded-for": "spoofed, 203.0.113.7" } })), "203.0.113.7");
  assert.equal(usageClientKey(new Request("https://example.com", { headers: { "x-real-ip": "203.0.113.8", "x-forwarded-for": "spoofed, 203.0.113.7" } })), "203.0.113.8");
  assert.equal(usageClientKey(new Request("https://example.com")), "local");
});

test("cross-site and mismatched origins are rejected", () => {
  assert.equal(isSameOriginRequest(new Request("https://example.com", { headers: { "sec-fetch-site": "cross-site" } })), false);
  assert.equal(isSameOriginRequest(new Request("https://example.com", { headers: { origin: "https://evil.example", host: "example.com" } })), false);
  assert.equal(isSameOriginRequest(new Request("https://example.com", { headers: { origin: "https://example.com", host: "example.com" } })), true);
  assert.equal(isSameOriginRequest(new Request("https://example.com", { headers: { origin: "not a url", host: "example.com" } })), false);
  assert.equal(isSameOriginRequest(new Request("https://example.com")), true);
});

test("same-origin requests survive proxy Host rewriting", () => {
  assert.equal(isSameOriginRequest(new Request("https://example.com", {
    headers: { origin: "https://tools.example.com", host: "127.0.0.1:3000", "x-forwarded-host": "tools.example.com" },
  })), true);
  assert.equal(isSameOriginRequest(new Request("https://example.com", {
    headers: { origin: "https://tools.example.com", host: "127.0.0.1:3000", "sec-fetch-site": "same-origin" },
  })), true);
  assert.equal(isSameOriginRequest(new Request("https://example.com", {
    headers: { origin: "https://evil.example", host: "127.0.0.1:3000", "x-forwarded-host": "tools.example.com" },
  })), false);
});

test("origin comparison covers port, IPv6 and SITE_URL fallback", () => {
  // Another port on the same hostname is cross-origin.
  assert.equal(isSameOriginRequest(new Request("http://example.com", {
    headers: { origin: "http://example.com:9999", host: "example.com", "sec-fetch-site": "same-site" },
  })), false);
  // Host and Origin default to port 443 for https.
  assert.equal(isSameOriginRequest(new Request("https://example.com", {
    headers: { origin: "https://example.com", host: "example.com:443" },
  })), true);
  // Bracketed IPv6 hosts must not be split at the colon.
  assert.equal(isSameOriginRequest(new Request("http://[::1]:3000", {
    headers: { origin: "http://[::1]:3000", host: "[::1]:3000" },
  })), true);
  // A proxy that rewrites Host can still be validated against SITE_URL.
  process.env.SITE_URL = "https://tools.example.com";
  try {
    assert.equal(isSameOriginRequest(new Request("http://127.0.0.1:3000", {
      headers: { origin: "https://tools.example.com", host: "127.0.0.1:3000" },
    })), true);
  } finally {
    delete process.env.SITE_URL;
  }
});

test("bucket eviction drops least recently used clients", () => {
  const consume = createUsageLimiter({ capacity: 1, refillMs: 1_000_000 });
  for (let i = 0; i < 10_000; i += 1) consume(`idle-${i}`, 0);
  // Touching a key moves it to the end, so it must survive the next eviction.
  consume("idle-0", 0);
  consume("newcomer", 0);
  assert.equal(consume("idle-1", 0).allowed, true); // evicted, recreated fresh
  assert.equal(consume("idle-0", 0).allowed, false); // kept, still exhausted
});
