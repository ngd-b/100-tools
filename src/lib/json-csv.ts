export type Table = { headers: string[]; rows: string[][] };
const invalid = () => new Error("CSV 格式错误：请检查引号、表头和列数。");
export function parseCsv(input: string, delimiter = ","): Table {
  if (![",", ";", "\t"].includes(delimiter)) throw invalid();
  if (!input.trim() || input.length > 1000000) throw new Error("请输入内容，最多 100 万字符。");
  const text = input.replace(/^\uFEFF/, "");
  const records: string[][] = []; let row: string[] = [], cell = "", quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; closed = true; } }
      else cell += ch;
    } else if (ch === delimiter) { row.push(cell); cell = ""; closed = false; }
    else if (ch === "\n" || ch === "\r") {
      row.push(cell); records.push(row); row = []; cell = ""; closed = false;
      if (ch === "\r" && text[i + 1] === "\n") i++;
    } else if (ch === '"' && !cell && !closed) quoted = true;
    else { if (closed || ch === '"') throw invalid(); cell += ch; }
  }
  if (quoted) throw invalid();
  if (cell || row.length || closed) { row.push(cell); records.push(row); }
  const headers = records.shift()!;
  if (!headers?.length || headers.some(h => !h.trim()) || new Set(headers).size !== headers.length || records.some(r => r.length !== headers.length)) throw invalid();
  return { headers, rows: records };
}
export function jsonTable(input: string): Table {
  if (!input.trim() || input.length > 1000000) throw new Error("请输入内容，最多 100 万字符。");
  let data: unknown;
  try { data = JSON.parse(input); } catch { throw new Error("请输入有效的 JSON 对象数组。"); }
  if (!Array.isArray(data) || !data.length || data.some(r => !r || typeof r !== "object" || Array.isArray(r))) throw new Error("请输入有效的 JSON 对象数组。");
  const headers = [...new Set(data.flatMap(r => Object.keys(r)))];
  if (!headers.length || headers.some(h => !h.trim())) throw invalid();
  const rows = data.map(r => headers.map(h => {
    const v = Object.hasOwn(r, h) ? r[h] : null;
    if (v !== null && typeof v === "object") throw new Error("暂不支持嵌套对象或数组，请先展开数据。");
    if (typeof v === "number" && (!Number.isFinite(v) || (Number.isInteger(v) && !Number.isSafeInteger(v)))) throw new Error("数字超出安全精度范围，请用字符串表示。");
    return v == null ? "" : String(v);
  }));
  return { headers, rows };
}
export function writeCsv(table: Table, delimiter = ",") {
  if (![",", ";", "\t"].includes(delimiter)) throw invalid();
  return [table.headers, ...table.rows].map(row => row.map(v => /["\r\n]/.test(v) || v.includes(delimiter) ? `"${v.replaceAll('"', '""')}"` : v).join(delimiter)).join("\r\n");
}
export function tableJson(table: Table) {
  return JSON.stringify(table.rows.map(row => Object.fromEntries(table.headers.map((h, i) => [h, row[i]]))), null, 2);
}
