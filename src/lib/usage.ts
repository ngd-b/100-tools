import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";

type Statement = ReturnType<DatabaseSync["prepare"]>;

let database: DatabaseSync | null = null;
let selectStatement: Statement | null = null;
let incrementStatement: Statement | null = null;

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
  const statement = selectStatement
    ?? (selectStatement = getDatabase().prepare("SELECT tool_id, count FROM tool_usage"));
  const rows = statement.all() as { tool_id: string; count: number }[];
  return Object.fromEntries(rows.map((row) => [row.tool_id, Number(row.count)]));
}

export function incrementUsage(toolId: string): number {
  const statement = incrementStatement
    ?? (incrementStatement = getDatabase().prepare(
      "INSERT INTO tool_usage (tool_id, count) VALUES (?, 1) ON CONFLICT(tool_id) DO UPDATE SET count = count + 1 RETURNING count",
    ));
  const row = statement.get(toolId) as { count: number } | undefined;
  return Number(row?.count ?? 0);
}
