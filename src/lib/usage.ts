import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

let database: DatabaseSync | null = null;

function databaseFile(): string {
  return process.env.USAGE_DB_PATH
    ?? join(process.env.DATA_DIR ?? join(process.cwd(), "data"), "usage.sqlite");
}

function getDatabase(): DatabaseSync {
  if (database) return database;
  const file = databaseFile();
  mkdirSync(dirname(file), { recursive: true });
  const instance = new DatabaseSync(file);
  instance.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS tool_usage (
      tool_id TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    );
  `);
  database = instance;
  return instance;
}

export function getUsageCounts(): Record<string, number> {
  const rows = getDatabase().prepare("SELECT tool_id, count FROM tool_usage").all() as { tool_id: string; count: number }[];
  return Object.fromEntries(rows.map((row) => [row.tool_id, Number(row.count)]));
}

export function incrementUsage(toolId: string): number {
  const row = getDatabase()
    .prepare("INSERT INTO tool_usage (tool_id, count) VALUES (?, 1) ON CONFLICT(tool_id) DO UPDATE SET count = count + 1 RETURNING count")
    .get(toolId) as { count: number } | undefined;
  return Number(row?.count ?? 0);
}
