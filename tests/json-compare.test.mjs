import assert from "node:assert/strict";
import test from "node:test";
import { compareJson } from "../src/lib/json-compare.ts";

test("object key order and whitespace do not create structural changes", () => {
  assert.deepEqual(compareJson(JSON.parse('{"a":1,"b":{"c":2}}'), JSON.parse('{ "b": { "c": 2 }, "a": 1 }')), []);
});

test("reports added, removed and changed nested values", () => {
  assert.deepEqual(compareJson({ user: { name: "A", old: true } }, { user: { name: "B", added: null } }), [
    { path: "/user/name", kind: "changed", before: "A", after: "B" },
    { path: "/user/old", kind: "removed", before: true },
    { path: "/user/added", kind: "added", after: null },
  ]);
});

test("arrays are compared by position, including additions and removals", () => {
  assert.deepEqual(compareJson([1, 2], [2, 1, 3]), [
    { path: "/0", kind: "changed", before: 1, after: 2 },
    { path: "/1", kind: "changed", before: 2, after: 1 },
    { path: "/2", kind: "added", after: 3 },
  ]);
  assert.deepEqual(compareJson([null], []), [{ path: "/0", kind: "removed", before: null }]);
});

test("distinguishes null, missing keys, arrays and primitive types", () => {
  assert.deepEqual(compareJson({}, { a: null }), [{ path: "/a", kind: "added", after: null }]);
  for (const [before, after] of [[null, {}], [{}, []], [false, 0], [1, "1"]]) {
    assert.deepEqual(compareJson(before, after), [{ path: "", kind: "changed", before, after }]);
  }
});

test("JSON Pointer paths escape slashes and tildes and preserve empty keys", () => {
  assert.deepEqual(compareJson({ "a/b": { "~": 1 }, "": 1 }, { "a/b": { "~": 2 }, "": 2 }).map((d) => d.path), ["/a~1b/~0", "/"]);
});

test("prototype-related property names are treated as ordinary JSON keys", () => {
  const before = JSON.parse('{"__proto__":1,"constructor":2}');
  assert.deepEqual(compareJson(before, {}).map((d) => d.path), ["/__proto__", "/constructor"]);
  assert.equal({}.polluted, undefined);
});

test("large change sets fail explicitly instead of silently truncating", () => {
  assert.throws(() => compareJson([], Array(2001).fill(0)), /2000/);
});

test("deep inputs produce a useful error instead of a call stack overflow", () => {
  let before = 1;
  let after = 2;
  for (let i = 0; i < 205; i++) { before = { child: before }; after = { child: after }; }
  assert.throws(() => compareJson(before, after), /200/);
});

test("depth limits cover whole added, removed and type-changed subtrees", () => {
  let deep = 0;
  for (let i = 0; i < 205; i++) deep = { child: deep };
  for (const [before, after] of [[{}, { deep }], [{ deep }, {}], [null, deep], [deep, []]]) {
    assert.throws(() => compareJson(before, after), /200/);
  }
});

test("numeric overflow cannot silently become null in displayed or exported differences", () => {
  const overflow = JSON.parse("1e999");
  for (const [before, after] of [[overflow, null], [{}, { value: overflow }], [{ value: overflow }, {}], [overflow, overflow]]) {
    assert.throws(() => compareJson(before, after), /超出数值范围/);
  }
});
