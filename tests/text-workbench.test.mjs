import assert from "node:assert/strict";
import test from "node:test";
import { defaultTextOptions, processText } from "../src/lib/text-workbench.ts";

const run = (input, options = {}) => processText(input, { ...defaultTextOptions, ...options });

test("cleans whitespace and blank lines and normalizes platform line endings", () => {
  assert.equal(run(" a \r\n \r\nb\rc\n"), "a\nb\nc");
});

test("empty input does not become a prefix-only line", () => {
  assert.equal(run("", { prefix: "- " }), "");
});

test("deduplication retains the first spelling and can ignore case", () => {
  assert.equal(run("A\na\nA", { deduplicate: true }), "A\na");
  assert.equal(run("A\na\nA", { deduplicate: true, ignoreCase: true }), "A");
});

test("case conversion precedes deduplication and affixes follow sorting", () => {
  assert.equal(run("B\na\nA", { letterCase: "lower", deduplicate: true, sort: "ascending", prefix: "[", suffix: "]" }), "[a]\n[b]");
});

test("natural sort handles numeric portions, descending and reverse", () => {
  assert.equal(run("item10\nitem2\nitem1", { sort: "ascending" }), "item1\nitem2\nitem10");
  assert.equal(run("2\n10\n1", { sort: "descending" }), "10\n2\n1");
  assert.equal(run("2\n10\n1", { sort: "reverse" }), "1\n10\n2");
});

test("blank lines and whitespace can be preserved explicitly", () => {
  assert.equal(run(" a \n\n b ", { trim: false, removeEmpty: false }), " a \n\n b ");
});

test("invisible cleanup removes BOM and zero-width spaces but preserves joined emoji", () => {
  assert.equal(run("\u200B👩‍💻\uFEFF", { removeInvisible: true }), "👩‍💻");
});

test("non-Latin text is preserved and options are not mutated", () => {
  const options = { ...defaultTextOptions, sort: "ascending" };
  const original = { ...options };
  assert.equal(processText("中文\n中文", options), "中文\n中文");
  assert.deepEqual(options, original);
});
