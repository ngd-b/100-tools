"use client";

import { useState, useMemo, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function DiffChecker() {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [showResult, setShowResult] = useState(false);

  const diff = useMemo(() => {
    if (!text1 && !text2) return null;
    if (!showResult) return null;

    const lines1 = text1.split("\n");
    const lines2 = text2.split("\n");
    const maxLen = Math.max(lines1.length, lines2.length);
    const result: { type: "same" | "added" | "removed" | "changed"; line1?: string; line2?: string; lineNum: number }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const l1 = lines1[i];
      const l2 = lines2[i];
      if (l1 === undefined) {
        result.push({ type: "added", line2: l2, lineNum: i + 1 });
      } else if (l2 === undefined) {
        result.push({ type: "removed", line1: l1, lineNum: i + 1 });
      } else if (l1 === l2) {
        result.push({ type: "same", line1: l1, lineNum: i + 1 });
      } else {
        result.push({ type: "changed", line1: l1, line2: l2, lineNum: i + 1 });
      }
    }
    return result;
  }, [text1, text2, showResult]);

  const handleCompare = useCallback(() => setShowResult(true), []);
  const handleClear = useCallback(() => { setText1(""); setText2(""); setShowResult(false); }, []);

  const addedCount = diff?.filter((d) => d.type === "added").length ?? 0;
  const removedCount = diff?.filter((d) => d.type === "removed").length ?? 0;
  const changedCount = diff?.filter((d) => d.type === "changed").length ?? 0;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass-card">
          <Label className="mb-3 block">原文</Label>
          <Textarea
            className="min-h-[200px] w-full resize-y font-mono text-xs"
            placeholder="粘贴原文..."
            value={text1}
            onChange={(e) => setText1(e.target.value)}
          />
        </div>
        <div className="glass-card">
          <Label className="mb-3 block">修改后</Label>
          <Textarea
            className="min-h-[200px] w-full resize-y font-mono text-xs"
            placeholder="粘贴修改后的文本..."
            value={text2}
            onChange={(e) => setText2(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6 mb-6">
        <Button variant="gradient" className="flex-1" onClick={handleCompare}>
          对比差异
        </Button>
        <Button variant="secondary" onClick={handleClear}>
          清空
        </Button>
      </div>

      {diff && (
        <div className="glass-card">
          <div className="mb-4 flex flex-wrap gap-3">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">+ {addedCount} 新增</span>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">- {removedCount} 删除</span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">~ {changedCount} 修改</span>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 font-mono text-xs leading-relaxed max-h-[400px] overflow-y-auto">
            {diff.map((d, i) => (
              <div key={i} className={
                d.type === "added" ? "bg-green-50 -mx-4 px-4 text-green-700" :
                d.type === "removed" ? "bg-red-50 -mx-4 px-4 text-red-600 line-through" :
                d.type === "changed" ? "bg-yellow-50 -mx-4 px-4" :
                "text-gray-400"
              }>
                <span className="mr-2 text-gray-300 select-none">{d.lineNum}</span>
                {d.type === "added" && <span className="mr-1">+</span>}
                {d.type === "removed" && <span className="mr-1">-</span>}
                {d.type === "changed" && <span className="mr-1">~</span>}
                {d.line2 ?? d.line1}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 逐行对比文本差异，适用于代码审查、文案修改对比等场景。
      </div>
    </div>
  );
}
