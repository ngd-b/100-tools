import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import { tools, categories, getToolById, getToolByPath, legacyToolIds, quickToolIds, toolPathRedirects } from "../src/data/tools.ts";
import { normalizeFavorites } from "../src/lib/favorites.ts";

const validIds = new Set(tools.map((tool) => tool.id));

test("every registered tool has a unique URL and a lazy-loaded implementation", () => {
  assert.equal(validIds.size, tools.length);
  assert.equal(new Set(tools.map((tool) => tool.path)).size, tools.length);
  const renderer = readFileSync(new URL("../src/components/ToolRenderer.tsx", import.meta.url), "utf8");
  const entries = [...renderer.matchAll(/"([^"]+)": dynamic\(\(\) => import\("@\/tools\/([^"]+)"\)/g)];
  assert.deepEqual(new Set(entries.map((match) => match[1])), validIds);
  for (const entry of entries) assert.ok(existsSync(new URL(`../src/tools/${entry[2]}.tsx`, import.meta.url)));
  for (const tool of tools) {
    assert.ok(categories.some((category) => category.id === tool.category));
    assert.match(tool.path, /^\/[a-z-]+\/[a-z0-9-]+$/);
    assert.equal(getToolByPath(tool.path), tool);
  }
});

test("shortcuts refer to available tools and legacy links resolve correctly", () => {
  assert.equal(new Set(quickToolIds).size, quickToolIds.length);
  assert.ok(quickToolIds.every((id) => validIds.has(id)));
  assert.equal(getToolById("json-minifier")?.id, "json-formatter");
  assert.equal(getToolById("__proto__"), undefined);
  assert.equal(getToolByPath("/not-a-tool"), undefined);
  for (const target of Object.values(toolPathRedirects)) assert.ok(getToolByPath(target));
});

test("favorites migrate old JSON IDs, remove unknown tools and deduplicate", () => {
  assert.deepEqual(normalizeFavorites('["json-minifier","json-formatter","missing",null,42,"text-stats"]', validIds, legacyToolIds), ["json-formatter", "text-stats"]);
});

test("malformed storage cannot break favorites or the homepage", () => {
  for (const raw of [null, "bad json", "{}", '"text-stats"', '["__proto__"]']) {
    assert.deepEqual(normalizeFavorites(raw, validIds, legacyToolIds), []);
  }
});
