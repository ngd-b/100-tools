"use client";
import {
  ToolPanel,
  ToolHint,
  ToolFeedback,
  ToolSegments,
  ToolEmpty,
} from "@/components/ToolWorkspace";
import { Copy, Download, Shuffle, Dices } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { drawIndices, drawNumbers, parseNames } from "@/lib/random-picker";
import { downloadText } from "@/lib/download-text";
export function RandomPicker() {
  const { t } = useI18n();
  const [mode, setMode] = useState("names");
  const [names, setNames] = useState("");
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [repeat, setRepeat] = useState(false);
  const [result, setResult] = useState<string[] | null>(null);
  const [message, setMessage] = useState("");
  function reset() {
    setResult(null);
    setMessage("");
  }
  function draw() {
    reset();
    try {
      if (!count.trim() || (mode === "numbers" && (!min.trim() || !max.trim())))
        throw new Error("请填写全部数字字段。");
      if (mode === "names") {
        const entries = parseNames(names);
        setResult(
          drawIndices(entries.length, Number(count), repeat).map(
            (i) => entries[i],
          ),
        );
      } else
        setResult(
          drawNumbers(Number(min), Number(max), Number(count), repeat).map(
            String,
          ),
        );
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  return (
    <div className="tool-workspace">
      <div className="workspace-grid">
        <ToolPanel title={t("抽取设置")}>
          <ToolSegments
            label={t("抽取模式")}
            value={mode}
            options={[
              { value: "names", label: t("名单抽签") },
              { value: "numbers", label: t("整数范围") },
            ]}
            onChange={(value) => {
              setMode(value);
              reset();
            }}
          />
          {mode === "names" ? (
            <div className="space-y-3">
              <div className="workspace-toolbar">
                <label htmlFor="draw-names">{t("候选名单（每行一项）")}</label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setNames("Alice\nBob\nCharlie\nDiana");
                    reset();
                  }}
                >
                  {t("填入示例")}
                </Button>
              </div>
              <Textarea
                id="draw-names"
                value={names}
                maxLength={1000000}
                className="min-h-52"
                placeholder={"Alice\nBob\nCharlie"}
                onChange={(event) => {
                  setNames(event.target.value);
                  reset();
                }}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                {t("最小值")}
                <Input
                  type="number"
                  value={min}
                  onChange={(event) => {
                    setMin(event.target.value);
                    reset();
                  }}
                />
              </label>
              <label>
                {t("最大值")}
                <Input
                  type="number"
                  value={max}
                  onChange={(event) => {
                    setMax(event.target.value);
                    reset();
                  }}
                />
              </label>
            </div>
          )}
          <label>
            {t("抽取数量")}
            <Input
              type="number"
              min={1}
              max={10000}
              value={count}
              onChange={(event) => {
                setCount(event.target.value);
                reset();
              }}
            />
          </label>
          <label className="workspace-toggle">
            {t("允许重复")}
            <input
              type="checkbox"
              checked={repeat}
              onChange={(event) => {
                setRepeat(event.target.checked);
                reset();
              }}
            />
          </label>
          <div className="workspace-actionbar">
            <Button variant="gradient" onClick={draw}>
              <Shuffle size={16} />
              {t("开始抽取")}
            </Button>
          </div>
        </ToolPanel>
        <ToolPanel
          title={t("抽取结果")}
          actions={
            result && (
              <span className="text-xs text-muted-foreground">
                {t("共 {0} 项", [result.length])}
              </span>
            )
          }
        >
          {result ? (
            <>
              <div className="workspace-draw-results">
                {result.slice(0, 100).map((value, index) => (
                  <span className="workspace-draw-result" key={index}>
                    {value}
                  </span>
                ))}
              </div>
              {result.length > 100 && (
                <p className="text-xs text-muted-foreground">
                  {t("卡片展示前 100 项，完整结果可复制或下载")}
                </p>
              )}
              <Textarea
                id="draw-result"
                aria-label={t("抽取结果")}
                readOnly
                value={result.join("\n")}
                className="min-h-32"
              />
              <div className="workspace-actions">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(result.join("\n"));
                      setMessage("已复制");
                    } catch {
                      setMessage("复制失败，可以下载结果文件。");
                    }
                  }}
                >
                  <Copy size={15} />
                  {t("复制结果")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadText(result.join("\n"), "draw.txt")}
                >
                  <Download size={15} />
                  {t("下载结果")}
                </Button>
              </div>
            </>
          ) : (
            <ToolEmpty
              icon={<Dices size={30} />}
              title={t("下一位幸运者会是谁？")}
              description={t("设置候选名单或数字范围，点击开始抽取")}
            />
          )}
        </ToolPanel>
      </div>
      <ToolFeedback>{t(message)}</ToolFeedback>
      <ToolHint>
        {t(
          "名单自动去除空行、首尾空格和完全相同的项。允许重复仅作用于本轮抽取；每轮重新开始。使用浏览器安全随机数，最多抽取 10000 项。",
        )}
      </ToolHint>
    </div>
  );
}
