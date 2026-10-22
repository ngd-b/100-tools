import assert from "node:assert/strict";
import test from "node:test";
import { createSiteConfig, getSiteConfig, DEFAULT_SITE_URL } from "../src/lib/site-config.ts";
import { absoluteUrl, createPageMetadata, createSitemap, createRobots, createCollectionSchema, createToolSchema, serializeJsonLd, homeSeo } from "../src/lib/seo.ts";
import { tools, categories, toolPathRedirects } from "../src/data/tools.ts";
import { toolGuides } from "../src/data/tool-guides.ts";
import { categoryGuides } from "../src/data/category-guides.ts";

const site = createSiteConfig({ SITE_URL: "https://tools.example/", NODE_ENV: "production" });

test("production defaults to the confirmed domain, including empty Docker arguments, and supports overrides", () => {
  assert.equal(DEFAULT_SITE_URL, "https://tools.hboot.fun");
  for (const value of [undefined, "", "  "]) {
    const config = getSiteConfig({ SITE_URL: value, NODE_ENV: "production" });
    assert.equal(config.url, DEFAULT_SITE_URL);
    assert.equal(config.indexable, true);
    assert.equal(createRobots(config).sitemap, `${DEFAULT_SITE_URL}/sitemap.xml`);
  }
  const preview = getSiteConfig({ SITE_URL: "https://preview.example", SITE_INDEXABLE: "false" });
  assert.equal(preview.url, "https://preview.example");
  assert.equal(preview.indexable, false);
  assert.equal(getSiteConfig({ NODE_ENV: "development" }).indexable, false);
});

test("site origin is normalized and malformed configurations are rejected", () => {
  assert.equal(site.url, "https://tools.example");
  assert.equal(absoluteUrl("/", site), site.url);
  for (const value of ["tools.example", "https://tools.example/sub", "https://a:b@tools.example", "https://tools.example/?x=1", "https://tools.example/#x", "ftp://tools.example"]) {
    assert.throws(() => createSiteConfig({ SITE_URL: value }));
  }
});

test("missing domain never invents a canonical URL or sitemap host", () => {
  const missing = createSiteConfig({});
  assert.equal(missing.url, undefined);
  assert.equal(absoluteUrl("/", missing), undefined);
  assert.equal(createPageMetadata({ ...homeSeo, path: "/" }, missing).alternates, undefined);
  assert.deepEqual(createSitemap(missing, tools, categories), []);
  assert.equal(createRobots(missing).sitemap, undefined);
});

test("preview and local configurations disable indexing without putting preview URLs in a sitemap", () => {
  for (const config of [createSiteConfig({ SITE_URL: site.url, SITE_INDEXABLE: "false" }), createSiteConfig({ SITE_URL: "http://localhost:3000" }), createSiteConfig({ SITE_URL: site.url, NODE_ENV: "development" })]) {
    assert.equal(config.indexable, false);
    assert.deepEqual(createSitemap(config, tools, categories), []);
    assert.equal(createRobots(config).rules.disallow, "/");
  }
});

test("every tool and category has distinct descriptive content and three actual use steps", () => {
  assert.deepEqual(new Set(Object.keys(toolGuides)), new Set(tools.map((tool) => tool.id)));
  assert.deepEqual(new Set(Object.keys(categoryGuides)), new Set(categories.map((category) => category.id)));
  assert.equal(new Set(Object.values(toolGuides).map((guide) => guide.title)).size, tools.length);
  assert.equal(new Set(Object.values(toolGuides).map((guide) => guide.description)).size, tools.length);
  for (const guide of Object.values(toolGuides)) {
    assert.ok(guide.description.length >= 30);
    assert.equal(guide.steps.length, 3);
    assert.ok(guide.steps.every((step) => step.length > 5));
    assert.ok(guide.note.length > 10);
  }
});

test("page canonical and social URLs refer to each page, not the homepage", () => {
  for (const tool of tools) {
    const meta = createPageMetadata({ ...toolGuides[tool.id], path: tool.path }, site);
    assert.equal(meta.alternates.canonical, site.url + tool.path);
    assert.equal(meta.openGraph.url, meta.alternates.canonical);
    assert.equal(meta.description, toolGuides[tool.id].description);
    assert.equal(meta.openGraph.images[0].url, site.url + "/opengraph-image");
    assert.equal(meta.twitter.card, "summary_large_image");
  }
});

test("sitemap includes canonical homepage, categories and tools without aliases or invented timestamps", () => {
  const entries = createSitemap(site, tools, categories);
  assert.equal(entries.length, tools.length + categories.length + 1);
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  for (const entry of entries) {
    assert.equal(new URL(entry.url).origin, site.url);
    assert.equal(entry.lastModified, undefined);
    assert.ok(!Object.hasOwn(toolPathRedirects, new URL(entry.url).pathname));
  }
  assert.equal(createRobots(site).sitemap, site.url + "/sitemap.xml");
});

test("tool structured data has matching URLs, real breadcrumb levels and no invented ratings", () => {
  for (const tool of tools) {
    const category = categories.find((item) => item.id === tool.category);
    const schema = createToolSchema(tool, category, toolGuides[tool.id].description, site);
    const app = schema["@graph"][0];
    const breadcrumbs = schema["@graph"][1].itemListElement;
    assert.equal(app.url, site.url + tool.path);
    assert.equal(app.description, toolGuides[tool.id].description);
    assert.equal(app.offers.price, "0");
    assert.equal(app.aggregateRating, undefined);
    assert.deepEqual(breadcrumbs.map((item) => item.position), [1, 2, 3]);
    assert.equal(breadcrumbs[1].item, `${site.url}/category/${category.id}`);
    assert.equal(breadcrumbs[2].item, app.url);
  }
});

test("collection data lists the same tools as its visible category", () => {
  const items = tools.filter((tool) => tool.category === "image");
  const schema = createCollectionSchema({ ...categoryGuides.image, path: "/category/image" }, items, site);
  assert.equal(schema.mainEntity.numberOfItems, items.length);
  assert.deepEqual(schema.mainEntity.itemListElement.map((item) => item.url), items.map((tool) => site.url + tool.path));
});

test("JSON-LD serialization cannot terminate its script element", () => {
  const value = { text: '</script><img src=x onerror="alert(1)">\u2028\u2029' };
  const serialized = serializeJsonLd(value);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), value);
});
