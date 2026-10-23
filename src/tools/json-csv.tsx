"use client";
import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { jsonTable, parseCsv, writeCsv, tableJson, type Table } from "@/lib/json-csv";
import { downloadText } from "@/lib/download-text";
export function JsonCsv() {
  const { t } = useI18n();
  const [input, setInput] = useState(""); const [mode, setMode] = useState("csv"); const [delimiter, setDelimiter] = useState(",");
  const [result, setResult] = useState<{ table: Table; text: string } | null>(null); const [message, setMessage] = useState("");
  function reset() { setResult(null); setMessage(""); }
  function convert() { reset(); try { const table = mode === "csv" ? jsonTable(input) : parseCsv(input, delimiter); setResult({ table, text: mode === "csv" ? writeCsv(table, delimiter) : tableJson(table) }); } catch (e) { setMessage((e as Error).message); } }
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-4"><label>{t("转换方向")} <select value={mode} onChange={e => { setMode(e.target.value); reset(); }}><option value="csv">JSON → CSV</option><option value="json">CSV → JSON</option></select></label><label>{t("分隔符")} <select value={delimiter} onChange={e => { setDelimiter(e.target.value); reset(); }}><option value=",">{t("逗号")}</option><option value=";">{t("分号")}</option><option value={"\t"}>Tab</option></select></label></div>
    <label className="block" htmlFor="convert-input">{t("输入内容")}</label><Textarea id="convert-input" className="min-h-56 font-mono" value={input} maxLength={1000000} onChange={e => { setInput(e.target.value); reset(); }} />
    <div className="flex flex-wrap gap-2"><Button onClick={convert}>{t("转换")}</Button><Button variant="outline" onClick={() => { setInput(mode === "csv" ? '[{"name":"Alice","note":"Hello, world","count":2}]' : 'name,note,count\r\nAlice,"Hello, world",2'); reset(); }}>{t("填入示例")}</Button><Button variant="ghost" onClick={() => { setInput(""); reset(); }}>{t("清空")}</Button></div>
    <p className="text-sm text-gray-500">{t("本地处理，最多 100 万字符。CSV 转 JSON 保留字符串；JSON 空值和缺失字段输出为空，嵌套结构不支持。CSV 单元格可能被表格软件当作公式，请仅打开可信内容。")}</p>
    {message && <p role="status">{t(message)}</p>}
    {result && <section className="min-w-0 space-y-3"><h2>{t("转换结果")}</h2><Textarea aria-label={t("转换结果")} readOnly value={result.text} className="min-h-48 font-mono" /><div className="flex gap-2"><Button onClick={async () => { try { await navigator.clipboard.writeText(result.text); setMessage("已复制"); } catch { setMessage("复制失败，可以下载结果文件。"); } }}>{t("复制结果")}</Button><Button onClick={() => downloadText(result.text, `converted.${mode}`, mode === "csv" ? "text/csv;charset=utf-8" : "application/json")}>{t("下载结果")}</Button></div><p>{t("表格预览（前 20 行）")}</p><div className="max-h-80 overflow-auto"><table className="w-full text-sm"><thead><tr>{result.table.headers.map(h => <th className="border p-2" key={h}>{h}</th>)}</tr></thead><tbody>{result.table.rows.slice(0, 20).map((row, i) => <tr key={i}>{row.map((v, j) => <td className="max-w-64 break-all border p-2" key={j}>{v}</td>)}</tr>)}</tbody></table></div></section>}
  </div>;
}
