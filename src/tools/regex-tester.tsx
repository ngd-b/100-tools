"use client";

import { useState, useMemo, useEffect } from "react";

export function RegexTester() {
  const [pattern, setPattern] = useState("[a-z]+");
  const [flags, setFlags] = useState("gi");
  const [testText, setTestText] = useState("Hello World 123 Foo Bar 456");
  const [error, setError] = useState("");

  const result = useMemo(() => {
    if (!pattern.trim()) return null;
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { index: number; text: string }[] = [];
      const global = flags.includes("g");

      if (global) {
        let m: RegExpExecArray | null;
        while ((m = regex.exec(testText)) !== null) {
          matches.push({ index: m.index, text: m[0] });
          if (!m[0].length) { regex.lastIndex++; if (regex.lastIndex > testText.length) break; }
        }
      } else {
        const m = regex.exec(testText);
        if (m) matches.push({ index: m.index, text: m[0] });
      }

      return { regex, matches, count: matches.length };
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [pattern, flags, testText]);

  useEffect(() => {
    if (result) setError("");
  }, [result]);

  const highlighted = useMemo(() => {
    if (!result || !result.matches.length) return null;
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;
    result.matches.forEach((m, i) => {
      if (m.index > lastEnd) {
        parts.push(<span key={`t${i}`}>{testText.slice(lastEnd, m.index)}</span>);
      }
      parts.push(
        <mark key={`m${i}`} className="bg-yellow-200 rounded px-0.5">
          {m.text}
        </mark>
      );
      lastEnd = m.index + m.text.length;
    });
    if (lastEnd < testText.length) {
      parts.push(<span key="t-end">{testText.slice(lastEnd)}</span>);
    }
    return parts;
  }, [result, testText]);

  const flagOptions = [
    { key: "g", label: "全局" },
    { key: "i", label: "忽略大小写" },
    { key: "m", label: "多行" },
    { key: "s", label: "点号匹配换行" },
  ];

  const toggleFlag = (key: string) => {
    setFlags((f) => f.includes(key) ? f.replace(key, "") : f + key);
  };

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">正则表达式</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg text-gray-400">/</span>
          <input
            className="input flex-1 font-mono text-sm"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式..."
          />
          <span className="font-mono text-lg text-gray-400">/</span>
          <input
            className="input w-16 font-mono text-sm text-center"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {flagOptions.map((f) => (
            <button key={f.key}
              className={`btn text-xs ${flags.includes(f.key) ? "btn-primary" : "btn-secondary"}`}
              onClick={() => toggleFlag(f.key)}>
              {f.key} — {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-6 text-sm text-red-500 font-mono bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      {result && (
        <div className="glass-card mb-6">
          <span className="field-label mb-3 block">
            匹配结果: <span className="text-blue-500">{result.count} 个匹配</span>
          </span>
          {result.matches.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.matches.slice(0, 50).map((m, i) => (
                <span key={i} className="rounded bg-blue-50 px-2 py-1 font-mono text-xs text-blue-700">
                  [{m.index}] {m.text}
                </span>
              ))}
              {result.count > 50 && <span className="text-xs text-gray-400">... 还有 {result.count - 50} 个</span>}
            </div>
          )}
        </div>
      )}

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">测试文本</span>
        <textarea
          className="input min-h-[100px] w-full resize-y font-mono text-sm"
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
        />
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">高亮显示</span>
        <div className="rounded-xl bg-gray-50 p-4 font-mono text-sm min-h-[60px] whitespace-pre-wrap break-all">
          {highlighted || <span className="text-gray-400">{testText || "输入测试文本后显示高亮"}</span>}
        </div>
      </div>

      <div className="glass-card">
        <span className="field-label mb-3 block">快速测试用例</span>
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {[
            ["邮箱", "[\\w.-]+@[\\w.-]+\\.\\w+", "test@example.com foo@bar.org"],
            ["URL", "https?://[^\\s]+", "https://google.com http://test.org"],
            ["数字", "\\d+", "价格: 123 数量: 456 折扣: 0.7"],
            ["中文", "[\\u4e00-\\u9fa5]+", "你好世界 Hello World 测试"],
          ].map(([label, p, t]) => (
            <button key={label}
              className="rounded-lg bg-gray-50 px-4 py-3 text-left hover:bg-gray-100 transition-colors"
              onClick={() => { setPattern(p); setTestText(t); }}>
              <span className="font-semibold">{label}</span>
              <span className="font-mono text-xs text-gray-400 ml-2 block">{p}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
