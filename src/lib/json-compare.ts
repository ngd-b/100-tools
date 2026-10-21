export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export type JsonDifference = {
  path: string;
  kind: "added" | "removed" | "changed";
  before?: JsonValue;
  after?: JsonValue;
};

function validateJson(value: JsonValue, depth = 0): void {
  if (depth > 200) throw new Error("JSON 嵌套超过 200 层，请缩小对比范围。");
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error("JSON 包含超出数值范围的数字，请将大数改为字符串后对比。");
  }
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) validateJson(child, depth + 1);
  }
}

// Paths follow JSON Pointer (RFC 6901); an empty path identifies the root.
export function compareJson(before: JsonValue, after: JsonValue): JsonDifference[] {
  // Validate both complete inputs, including subtrees reported as a single change.
  validateJson(before);
  validateJson(after);
  const differences: JsonDifference[] = [];
  const pointer = (path: string, key: string) => `${path}/${key.replace(/~/g, "~0").replace(/\//g, "~1")}`;
  function add(difference: JsonDifference) {
    if (differences.length >= 2000) throw new Error("差异超过 2000 项，请缩小对比范围。");
    differences.push(difference);
  }
  function visit(left: JsonValue, right: JsonValue, path: string) {
    if (left === right) return;
    if (Array.isArray(left) && Array.isArray(right)) {
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        const itemPath = pointer(path, String(i));
        if (i >= left.length) add({ path: itemPath, kind: "added", after: right[i] });
        else if (i >= right.length) add({ path: itemPath, kind: "removed", before: left[i] });
        else visit(left[i], right[i], itemPath);
      }
    } else if (left !== null && right !== null && typeof left === "object" && typeof right === "object" && !Array.isArray(left) && !Array.isArray(right)) {
      for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
        const itemPath = pointer(path, key);
        if (!Object.hasOwn(left, key)) add({ path: itemPath, kind: "added", after: right[key] });
        else if (!Object.hasOwn(right, key)) add({ path: itemPath, kind: "removed", before: left[key] });
        else visit(left[key], right[key], itemPath);
      }
    } else {
      add({ path, kind: "changed", before: left, after: right });
    }
  }
  visit(before, after, "");
  return differences;
}
