"use client";
import {
  ToolPanel,
  ToolHint,
  ToolFeedback,
  ToolSegments,
  ToolEmpty,
} from "@/components/ToolWorkspace";
import { ArrowRightLeft, Copy, Download, Table2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  jsonTable,
  parseCsv,
  writeCsv,
  tableJson,
  type Table,
} from "@/lib/json-csv";
import { downloadText } from "@/lib/download-text";
export function JsonCsv() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("csv");
  const [delimiter, setDelimiter] = useState(",");
  const [result, setResult] = useState<{ table: Table; text: string } | null>(
    null,
  );
  const [message, setMessage] = useState("");
  function reset() {
    setResult(null);
    setMessage("");
  }
  function convert() {
    reset();
    try {
      const table =
        mode === "csv" ? jsonTable(input) : parseCsv(input, delimiter);
      setResult({
        table,
        text: mode === "csv" ? writeCsv(table, delimiter) : tableJson(table),
      });
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <div className="tool-workspace">
      <ToolPanel title={t("转换设置")}>
        <div className="workspace-toolbar">
          <ToolSegments
            label={t("转换方向")}
            value={mode}
            options={[
              { value: "csv", label: "JSON → CSV" },
              { value: "json", label: "CSV → JSON" },
            ]}
            onChange={(value) => {
              setMode(value);
              reset();
            }}
          />
          <label className="w-full sm:w-44">
            {t("分隔符")}
            <select
              value={delimiter}
              onChange={(event) => {
                setDelimiter(event.target.value);
                reset();
              }}
            >
              <option value=",">{t("逗号")}</option>
              <option value=";">{t("分号")}</option>
              <option value={"\t"}>Tab</option>
            </select>
          </label>
        </div>
      </ToolPanel>
      <div className="workspace-grid">
        <ToolPanel
          title={t("输入内容")}
          detail={mode === "csv" ? "JSON" : "CSV"}
          actions={
            <div className="workspace-actions">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setInput(
                    mode === "csv"
                      ? '[{"name":"Alice","note":"Hello, world","count":2}]'
                      : 'name,note,count\r\nAlice,"Hello, world",2',
                  );
                  reset();
                }}
              >
                {t("填入示例")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setInput("");
                  reset();
                }}
              >
                {t("清空")}
              </Button>
            </div>
          }
        >
          <Textarea
            id="convert-input"
            aria-label={t("输入内容")}
            className="min-h-80 font-mono text-sm"
            value={input}
            maxLength={1000000}
            placeholder={
              mode === "csv"
                ? '[{"name": "Alice", "count": 2}]'
                : "name,count\nAlice,2"
            }
            onChange={(event) => {
              setInput(event.target.value);
              reset();
            }}
          />
          <div className="workspace-actionbar">
            <Button variant="gradient" onClick={convert}>
              <ArrowRightLeft size={16} />
              {t("转换")}
            </Button>
          </div>
        </ToolPanel>
        <ToolPanel
          title={t("转换结果")}
          detail={mode === "csv" ? "CSV" : "JSON"}
          actions={
            result && (
              <div className="workspace-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(result.text);
                      setMessage("已复制");
                    } catch {
                      setMessage("复制失败，可以下载结果文件。");
                    }
                  }}
                >
                  <Copy size={14} />
                  {t("复制结果")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadText(
                      result.text,
                      `converted.${mode}`,
                      mode === "csv"
                        ? "text/csv;charset=utf-8"
                        : "application/json",
                    )
                  }
                >
                  <Download size={14} />
                  {t("下载结果")}
                </Button>
              </div>
            )
          }
        >
          {result ? (
            <Textarea
              aria-label={t("转换结果")}
              readOnly
              value={result.text}
              className="min-h-80 font-mono text-sm"
            />
          ) : (
            <ToolEmpty
              icon={<Table2 size={28} />}
              title={t("转换后的内容会显示在这里")}
              description={t("填入内容，选择转换方向后开始转换")}
            />
          )}
        </ToolPanel>
      </div>
      <ToolFeedback>{t(message)}</ToolFeedback>
      {result && (
        <ToolPanel title={t("表格预览（前 20 行）")}>
          <div className="workspace-table">
            <table>
              <thead>
                <tr>
                  {result.table.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.table.rows.slice(0, 20).map((row, index) => (
                  <tr key={index}>
                    {row.map((value, column) => (
                      <td key={column}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ToolPanel>
      )}
      <ToolHint>
        {t(
          "本地处理，最多 100 万字符。CSV 转 JSON 保留字符串；JSON 空值和缺失字段输出为空，嵌套结构不支持。CSV 单元格可能被表格软件当作公式，请仅打开可信内容。",
        )}
      </ToolHint>
    </div>
  );
}
