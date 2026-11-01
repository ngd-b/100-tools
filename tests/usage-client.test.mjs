import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/hooks/use-usage.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function createClient() {
  const exports = {};
  const pending = [];
  // Exercise the actual client store with controlled network responses. React's
  // adapter only reads the snapshot here; no component rendering is needed.
  runInNewContext(outputText, {
    exports,
    require(name) {
      assert.equal(name, "react");
      return { useSyncExternalStore: (_subscribe, snapshot) => snapshot() };
    },
    fetch(_url, options) {
      if (options.method === "POST") {
        return new Promise((resolve) => pending.push(resolve));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ counts: { "password-generator": 40, "json-formatter": 7 } }),
      });
    },
  });
  return { ...exports, pending };
}

for (const order of [[0, 1], [1, 0]]) {
  test(`usage counts stay monotonic when POST responses arrive ${order[0] === 0 ? "in order" : "in reverse order"}`, async () => {
    const client = createClient();
    const requests = [
      client.recordUsage("password-generator"),
      client.recordUsage("password-generator"),
      client.recordUsage("json-formatter"),
    ];
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(client.pending.length, 3);

    client.pending[2]({ ok: true, json: async () => ({ count: 8 }) });
    await requests[2];

    let highest = 40;
    for (const index of order) {
      const count = 41 + index;
      client.pending[index]({ ok: true, json: async () => ({ count }) });
      await requests[index];
      highest = Math.max(highest, count);
      const counts = client.useUsageCounts();
      assert.equal(counts["password-generator"], highest);
      assert.equal(counts["json-formatter"], 8);
    }
  });
}
