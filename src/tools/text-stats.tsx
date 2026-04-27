"use client";

import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function TextStats() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    if (!text) return null;

    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const chinese = (text.match(/[一-鿿]/g) || []).length;
    const english = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/[0-9]/g) || []).length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = (text.match(/[.!?。！？]+/g) || []).length || (text.trim() ? 1 : 0);
    const lines = text.split("\n").length;
    const bytes = new Blob([text]).size;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const speakTime = Math.max(1, Math.ceil(chars / 250));

    return { chars, charsNoSpace, chinese, english, digits, words, sentences, lines, bytes, readTime, speakTime };
  }, [text]);

  const StatItem = ({ label, value, unit }: { label: string; value: number; unit?: string }) => (
    <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4">
      <span className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</span>
      <span className="mt-1 text-xs text-gray-500">
        {label}{unit ? ` (${unit})` : ""}
      </span>
    </div>
  );

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">输入文本</Label>
        <Textarea
          className="min-h-[160px] w-full resize-y font-mono text-sm"
          placeholder="粘贴或输入任意文本..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {text && (
          <p className="mt-2 text-xs text-gray-400">
            {text.length} 字符 · {text.split("\n").length} 行
          </p>
        )}
      </div>

      {stats && (
        <>
          <div className="glass-card mb-6">
            <Label className="mb-4 block">基础统计</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatItem label="字符" value={stats.chars} />
              <StatItem label="字符(无空格)" value={stats.charsNoSpace} />
              <StatItem label="词数" value={stats.words} />
              <StatItem label="句子" value={stats.sentences} />
            </div>
          </div>

          <div className="glass-card mb-6">
            <Label className="mb-4 block">字符构成</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatItem label="中文" value={stats.chinese} />
              <StatItem label="英文" value={stats.english} />
              <StatItem label="数字" value={stats.digits} />
              <StatItem label="字节" value={stats.bytes} unit="B" />
            </div>
          </div>

          <div className="glass-card mb-6">
            <Label className="mb-4 block">预估时间</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatItem label="阅读" value={stats.readTime} unit="分钟" />
              <StatItem label="朗读" value={stats.speakTime} unit="分钟" />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              阅读按 200词/分，朗读按 250字符/分估算
            </p>
          </div>
        </>
      )}

      {!text && (
        <div className="glass-card text-center py-12">
          <p className="text-gray-400">输入文本后将自动显示统计</p>
        </div>
      )}
    </div>
  );
}
