import assert from "node:assert/strict";
import { tools, categories, toolPathRedirects } from "../src/data/tools.ts";
import { toolGuides } from "../src/data/tool-guides.ts";
import { categoryGuides } from "../src/data/category-guides.ts";

const base = process.env.SEO_BASE_URL ?? "http://127.0.0.1:3000";
const expectedOrigin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : undefined;
const paths = ["/", ...categories.map((category) => `/category/${category.id}`), ...tools.map((tool) => tool.path)];
const canonicalPattern = /<link\b(?=[^>]*\brel="canonical")(?=[^>]*\bhref="([^"]+)")[^>]*>/;
const decode = (text) => text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
function meta(html, key) {
  const tag = html.match(new RegExp(`<meta\\b(?=[^>]*(?:name|property)="${key}")(?=[^>]*content="([^"]+)")[^>]*>`));
  return tag ? decode(tag[1]) : undefined;
}
const results = [];
for (const path of paths) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  assert.ok(head, path);
  const canonical = head.match(canonicalPattern)?.[1];
  assert.ok(canonical, `${path}: canonical missing; configure SITE_URL before building`);
  const url = new URL(canonical);
  assert.equal(url.pathname, path);
  assert.equal(url.search, "");
  assert.equal(url.hash, "");
  if (expectedOrigin) assert.equal(url.origin, expectedOrigin);
  assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, path);
  const title = decode(head.match(/<title>([^<]+)<\/title>/)?.[1] ?? "");
  const description = meta(head, "description");
  assert.ok(title && description, path);
  assert.equal(meta(head, "og:url"), canonical, path);
  assert.ok(meta(head, "og:title"), path);
  assert.equal(meta(head, "og:description"), description, path);
  assert.equal(meta(head, "twitter:card"), "summary_large_image", path);
  assert.equal(new URL(meta(head, "og:image")).origin, url.origin, path);
  assert.ok(!meta(head, "robots")?.includes("noindex"), `${path}: production SEO audit requires indexable configuration`);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, path);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  assert.ok(schemas.length, path);
  const tool = tools.find((item) => item.path === path);
  if (tool) {
    const guide = toolGuides[tool.id];
    assert.ok(html.includes(guide.note), `${path}: usage notes must be present without JavaScript`);
    for (const step of guide.steps) assert.ok(html.includes(step), `${path}: steps must be rendered on the server`);
    const graph = schemas[0]["@graph"];
    assert.equal(graph[0].url, canonical);
    assert.equal(graph[1].itemListElement[1].item, `${url.origin}/category/${tool.category}`);
  } else if (path !== "/") {
    const category = path.split("/").at(-1);
    assert.ok(html.includes(categoryGuides[category].intro));
  } else {
    for (const item of paths.slice(1)) assert.ok(html.includes(`href="${item}"`), `homepage does not link to ${item}`);
  }
  results.push({ path, canonical, title, description });
}
const origin = new URL(results[0].canonical).origin;
assert.equal(new Set(results.map((item) => item.title)).size, paths.length);
assert.equal(new Set(results.map((item) => item.description)).size, paths.length);
const sitemapResponse = await fetch(new URL("/sitemap.xml", base));
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decode(match[1]));
assert.deepEqual(new Set(locations), new Set(results.map((item) => item.canonical)));
const robotsResponse = await fetch(new URL("/robots.txt", base));
assert.equal(robotsResponse.status, 200);
const robots = await robotsResponse.text();
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
assert.ok(robots.includes("Allow: /"));
for (const [path, target] of Object.entries(toolPathRedirects)) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 308);
  assert.equal(new URL(response.headers.get("location"), base).pathname, target);
}
for (const path of ["/seo-check-unknown-page", "/category/unknown"]) {
  const unknown = await fetch(new URL(path, base));
  assert.equal(unknown.status, 404, path);
  assert.match(await unknown.text(), /content="noindex"/);
}
const query = await fetch(new URL("/dev/json?utm_source=seo-check", base)).then((response) => response.text());
assert.equal(query.match(canonicalPattern)?.[1], origin + "/dev/json");
const imageResponse = await fetch(new URL("/opengraph-image", base));
assert.equal(imageResponse.status, 200);
assert.match(imageResponse.headers.get("content-type"), /image\/png/);
const image = Buffer.from(await imageResponse.arrayBuffer());
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
console.log(`SEO audit passed: ${paths.length} canonical pages, unique metadata, server-rendered content, JSON-LD, sitemap, robots, redirects, 404, tracking queries and 1200×630 share image.`);
