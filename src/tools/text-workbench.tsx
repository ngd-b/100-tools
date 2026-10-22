"use client";

import { useI18n } from "@/components/LanguageProvider";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { defaultTextOptions, processText, type TextOptions } from "@/lib/text-workbench";
import { downloadText } from "@/lib/download-text";

const toggles = [
  ["trim", "清理每行首尾空白"],
  ["removeEmpty", "删除空行"],
  ["removeInvisible", "清理零宽空格与 BOM"],
  ["deduplicate", "删除重复行"],
  ["ignoreCase", "去重时忽略大小写"],
] as const;

export function TextWorkbench() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<TextOptions>({ ...defaultTextOptions });
  const [message, setMessage] = useState("");
  const output = useMemo(() => processText(input, options), [input, options]);
  function update<K extends keyof TextOptions>(key: K, value: TextOptions[K]) {
    setOptions((previous) => ({ ...previous, [key]: value }));
    setMessage("");
  }
  async function copy() {
    try { await navigator.clipboard.writeText(output); setMessage("结果已复制"); }
    catch { setMessage("复制失败，请选择结果文本复制，或下载文件。"); }
  }

  return (
    <div className="space-y-5">
      <details className="glass-card" aria-label={t("文本处理设置")}>
        <summary className="cursor-pointer text-sm font-semibold">{t("处理设置")}<span className="ml-2 text-xs font-normal text-gray-500">{t("展开设置去重、排序、大小写和前后缀")}</span></summary>
        <div className="mt-5">
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          {toggles.map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={options[key]} disabled={key === "ignoreCase" && !options.deduplicate} onChange={(event) => update(key, event.target.checked)} />{t(label)}</label>)}
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div><label htmlFor="text-order" className="mb-2 block text-sm">{t("行顺序")}</label><select id="text-order" className="select-field" value={options.sort} onChange={(event) => update("sort", event.target.value as TextOptions["sort"])}><option value="original">{t("保持原顺序")}</option><option value="ascending">{t("自然升序（2 在 10 前）")}</option><option value="descending">{t("自然降序")}</option><option value="reverse">{t("反转行顺序")}</option></select></div>
          <div><label htmlFor="text-case" className="mb-2 block text-sm">{t("字母大小写")}</label><select id="text-case" className="select-field" value={options.letterCase} onChange={(event) => update("letterCase", event.target.value as TextOptions["letterCase"])}><option value="original">{t("保持原样")}</option><option value="lower">{t("全部小写")}</option><option value="upper">{t("全部大写")}</option></select></div>
          <div><label htmlFor="text-prefix" className="mb-2 block text-sm">{t("每行前缀")}</label><Input id="text-prefix" value={options.prefix} onChange={(event) => update("prefix", event.target.value)} placeholder={t("例如：- ")} /></div>
          <div><label htmlFor="text-suffix" className="mb-2 block text-sm">{t("每行后缀")}</label><Input id="text-suffix" value={options.suffix} onChange={(event) => update("suffix", event.target.value)} placeholder={t("例如：;")} /></div>
        </div>
        <p className="mt-4 text-xs leading-5 text-gray-500">{t("处理顺序：清理空白和字符 → 大小写转换 → 删除空行 → 去重 → 排序 → 添加前后缀。去重保留首次出现的行。内容在本地处理，每次最多 100 万字符。")}</p>
        </div>
      </details>
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <div className="glass-card min-w-0"><label htmlFor="text-input" className="mb-3 block text-sm font-medium">{t("原始文本")}</label><Textarea id="text-input" className="min-h-72 font-mono text-sm" value={input} maxLength={1000000} onChange={(event) => { setInput(event.target.value); setMessage(""); }} placeholder={t("粘贴需要整理的文本，每行一项…")} /><p className="mt-2 text-xs text-gray-500">{input ? input.split(/\r\n|\r|\n/).length : 0} {t(" 行")}</p></div>
        <div className="glass-card min-w-0"><label htmlFor="text-output" className="mb-3 block text-sm font-medium">{t("处理结果")}</label><Textarea id="text-output" className="min-h-72 font-mono text-sm" value={output} readOnly placeholder={t("结果会随输入和设置实时更新")} /><p className="mt-2 text-xs text-gray-500">{output ? output.split("\n").length : 0} {t(" 行")}</p></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="gradient" disabled={!output} onClick={copy}>{t("复制结果")}</Button>
        <Button variant="outline" disabled={!output} onClick={() => downloadText(output, "text-result.txt")}>{t("下载 TXT")}</Button>
        <Button variant="secondary" onClick={() => { setInput(" Apple \nBanana\nApple\n\norange\nbanana "); setMessage(""); }}>{t("填入示例")}</Button>
        <Button variant="ghost" onClick={() => { setOptions({ ...defaultTextOptions }); setMessage(""); }}>{t("重置设置")}</Button>
        <Button variant="ghost" onClick={() => { setInput(""); setMessage(""); }}>{t("清空")}</Button>
      </div>
      <p className="text-xs text-gray-500" role="status">{t(message)}</p>
    </div>
  );
}
