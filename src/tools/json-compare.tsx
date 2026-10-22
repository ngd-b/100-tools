"use client";

import { useI18n } from "@/components/LanguageProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { compareJson, type JsonDifference, type JsonValue } from "@/lib/json-compare";
import { downloadText } from "@/lib/download-text";

const labels = { added: "新增", removed: "删除", changed: "修改" };
const styles = { added: "bg-green-50 text-green-700", removed: "bg-red-50 text-red-700", changed: "bg-amber-50 text-amber-700" };

function parseInput(value: string, side: string): JsonValue {
  if (!value.trim()) throw new Error(`请输入${side} JSON。`);
  try { return JSON.parse(value) as JsonValue; }
  catch (error) { throw new Error(`${side} JSON 格式错误：${error instanceof Error ? error.message : "请检查语法"}`); }
}

export function JsonCompare() {
  const { t } = useI18n();
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [result, setResult] = useState<JsonDifference[] | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function invalidate() { setResult(null); setError(""); setMessage(""); }
  function compare() {
    invalidate();
    try { setResult(compareJson(parseInput(left, "左侧"), parseInput(right, "右侧"))); }
    catch (error) { setError(error instanceof Error ? error.message : "无法完成对比，请检查输入。"); }
  }
  function example() {
    setLeft('{\n  "name": "工具箱",\n  "version": 1,\n  "tags": ["图片", "文本"],\n  "old": true\n}');
    setRight('{\n  "version": 2,\n  "name": "工具箱",\n  "tags": ["图片", "文本", "开发"],\n  "new": null\n}');
    invalidate();
  }
  async function copy() {
    try { await navigator.clipboard.writeText(JSON.stringify(result, null, 2)); setMessage("对比结果已复制"); }
    catch { setMessage("复制失败，可以下载结果文件。"); }
  }

  return (
    <div className="space-y-5">
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <div className="glass-card min-w-0"><label htmlFor="json-before" className="mb-3 block text-sm font-medium">{t("原始 JSON（左侧）")}</label><Textarea id="json-before" value={left} maxLength={1000000} onChange={(event) => { setLeft(event.target.value); invalidate(); }} placeholder={t("{\"name\": \"原始内容\"}")} className="min-h-64 font-mono text-sm" /></div>
        <div className="glass-card min-w-0"><label htmlFor="json-after" className="mb-3 block text-sm font-medium">{t("修改后 JSON（右侧）")}</label><Textarea id="json-after" value={right} maxLength={1000000} onChange={(event) => { setRight(event.target.value); invalidate(); }} placeholder={t("{\"name\": \"修改内容\"}")} className="min-h-64 font-mono text-sm" /></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="gradient" onClick={compare}>{t("对比 JSON")}</Button>
        <Button variant="secondary" onClick={example}>{t("填入示例")}</Button>
        <Button variant="outline" onClick={() => { setLeft(right); setRight(left); invalidate(); }}>{t("交换左右")}</Button>
        <Button variant="ghost" onClick={() => { setLeft(""); setRight(""); invalidate(); }}>{t("清空")}</Button>
      </div>
      <p className="text-xs leading-5 text-gray-500">{t("忽略对象键顺序，数组按位置比较。路径采用 JSON Pointer，根值显示为“根节点”。数字按 JavaScript 数值精度解析。每侧最多 100 万字符，超过 2000 项差异时提示缩小范围。内容在本地处理。")}</p>
      {error && <p role="alert" className="text-sm text-red-600">{t(error)}</p>}
      {result !== null && (
        <section className="glass-card min-w-0" aria-label={t("JSON 对比结果")}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold" role="status">{result.length ? t("共 {0} 项差异", [result.length]) : t("JSON 内容一致")}</h2>
            <div className="flex gap-2"><Button size="sm" variant="outline" onClick={copy}>{t("复制结果")}</Button><Button size="sm" variant="outline" onClick={() => downloadText(JSON.stringify(result, null, 2), "json-diff.json", "application/json")}>{t("下载 JSON")}</Button></div>
          </div>
          {result.length > 0 && (
            <div className="space-y-3">
              {result.map((difference) => (
                <article key={difference.path} className="min-w-0 rounded-xl border border-gray-100 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2"><span className={`rounded px-2 py-1 text-xs ${styles[difference.kind]}`}>{t(labels[difference.kind])}</span><code className="break-all text-xs">{difference.path || t("根节点")}</code></div>
                  <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                    <div className="min-w-0"><p className="mb-1 text-xs text-gray-500">{t("原始值")}</p><pre className="max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs whitespace-pre-wrap break-all">{difference.kind === "added" ? t("（不存在）") : JSON.stringify(difference.before, null, 2)}</pre></div>
                    <div className="min-w-0"><p className="mb-1 text-xs text-gray-500">{t("修改后")}</p><pre className="max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs whitespace-pre-wrap break-all">{difference.kind === "removed" ? t("（不存在）") : JSON.stringify(difference.after, null, 2)}</pre></div>
                  </div>
                </article>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-gray-500" role="status">{t(message)}</p>
        </section>
      )}
    </div>
  );
}
