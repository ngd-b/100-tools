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
