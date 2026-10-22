import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { detectLocale, isLocale, localePath, stripLocale } from "../src/lib/i18n/locale.ts";
import { getTranslator } from "../src/lib/i18n/translate.ts";
import { localizedTools, localizedCategories, getToolGuide, getCategoryGuide } from "../src/lib/i18n/content.ts";
import { tools, categories } from "../src/data/tools.ts";
import { toolGuides } from "../src/data/tool-guides.ts";
import { categoryGuides } from "../src/data/category-guides.ts";

const dictionary = JSON.parse(readFileSync(new URL("../src/lib/i18n/en.json", import.meta.url), "utf8"));

test("browser language uses supported regional variants and weighted preferences", () => {
  assert.equal(detectLocale("zh-CN,zh;q=0.9,en;q=0.8"), "zh");
  assert.equal(detectLocale("zh-TW, en-US;q=0.5"), "zh");
  assert.equal(detectLocale("en-GB,en;q=0.9,zh;q=0.8"), "en");
  assert.equal(detectLocale("en;q=0.4,zh;q=0.9"), "zh");
  assert.equal(detectLocale("fr-FR,zh-CN;q=0.7,en;q=0.5"), "zh");
  assert.equal(detectLocale("zh;q=0,en;q=1"), "en");
  for (const header of [null, "", "fr-FR", "*", "zh;q=invalid", "zh;q=2"]) assert.equal(detectLocale(header), "en");
});

test("manual language takes precedence over browser language and invalid saved values are ignored", () => {
  assert.equal(detectLocale("en-US,en;q=0.9", "zh"), "zh");
  assert.equal(detectLocale("zh-CN,zh;q=0.9", "en"), "en");
  for (const saved of [undefined, "fr", "EN", "", "../../en"]) assert.equal(detectLocale("zh-CN", saved), "zh");
  assert.equal(isLocale("zh"), true);
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("fr"), false);
});

test("language navigation preserves tool, query and hash without duplicating prefixes", () => {
  assert.equal(localePath("/", "en"), "/en");
  assert.equal(localePath("/zh/dev/json?example=1#result", "en"), "/en/dev/json?example=1#result");
  assert.equal(localePath("/en/category/image", "zh"), "/zh/category/image");
  assert.equal(localePath("/en", "zh"), "/zh");
  assert.equal(localePath("/enough", "zh"), "/zh/enough");
  assert.equal(localePath("/#tool-library", "en"), "/en/#tool-library");
  for (const path of ["https://example.com/en", "//example.com/en", "#result", "mailto:test@example.com"]) assert.equal(localePath(path, "zh"), path);
  assert.equal(stripLocale("/zh/dev/json"), "/dev/json");
});

test("all tool names, descriptions, guides and category content have English translations", () => {
  const contents = tools.flatMap((tool) => [tool.name, tool.description, toolGuides[tool.id].title, toolGuides[tool.id].description, ...toolGuides[tool.id].steps, toolGuides[tool.id].note]);
  contents.push(...categories.flatMap((category) => [category.name, ...Object.values(categoryGuides[category.id])]));
  for (const text of contents) {
    assert.ok(dictionary[text], `Missing translation: ${text}`);
    assert.doesNotMatch(dictionary[text], /[\p{Script=Han}]/u);
  }
  assert.deepEqual(localizedTools("zh"), tools);
  assert.equal(localizedTools("en").length, tools.length);
  assert.equal(localizedCategories("en").length, categories.length);
  for (const tool of tools) {
    const guide = getToolGuide(tool.id, "en");
    assert.equal(guide.steps.length, 3);
    assert.ok(guide.note.length > 10);
  }
  for (const category of categories) assert.ok(getCategoryGuide(category.id, "en").intro.length > 30);
});

test("translation supports interpolation, helper error messages, whitespace and Chinese passthrough", () => {
  const en = getTranslator("en"), zh = getTranslator("zh");
  assert.equal(en("共 {0} 项差异", [3]), "3 differences");
  assert.equal(en("共 3 项差异"), "3 differences");
  assert.equal(en("请输入左侧 JSON。"), "Enter the left JSON.");
  assert.equal(en("每天 3:00 执行"), "Runs daily at 3:00");
  assert.equal(en(" 左侧 "), " left ");
  assert.equal(en("JSON 内容一致"), "JSON contents match");
  assert.equal(zh("共 {0} 项差异", [3]), "共 3 项差异");
  assert.equal(zh("原始文本"), "原始文本");
  assert.equal(en("unrecognized external error"), "unrecognized external error");
  assert.equal(en(undefined), "");
});
