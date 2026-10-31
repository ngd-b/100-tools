import assert from "node:assert/strict";
import test, { after } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "100-tools-usage-"));
process.env.USAGE_DB_PATH = join(directory, "usage.sqlite");
const { getUsageCounts, incrementUsage } = await import("../src/lib/usage.ts");

after(() => rmSync(directory, { recursive: true, force: true }));

test("usage counts start empty and accumulate per tool", () => {
  assert.deepEqual(getUsageCounts(), {});
  assert.equal(incrementUsage("json-formatter"), 1);
  assert.equal(incrementUsage("json-formatter"), 2);
  assert.equal(incrementUsage("password-generator"), 1);
  assert.deepEqual(getUsageCounts(), { "json-formatter": 2, "password-generator": 1 });
});
