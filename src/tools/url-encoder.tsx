"use client";

import { useState, useCallback } from "react";

export function UrlEncoder() {
  const [input, setInput] = useState("");
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");
  const [error, setError] = useState("");

  const handleEncode = useCallback(() => {
    setError("");
    setEncoded("");
    if (!input.trim()) { setError("请输入内容"); return; }
    setEncoded(encodeURIComponent(input));
  }, [input]);

  const handleDecode = useCallback(() => {
    setError("");
    setDecoded("");
    if (!input.trim()) { setError("请输入内容"); return; }
    try {
      setDecoded(decodeURIComponent(input.trim()));
    } catch {
      setError("无效的编码格式");
    }
  }, [input]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">输入内容</span>
        <textarea
          className="input min-h-[100px] w-full resize-y font-mono text-sm"
          placeholder="输入 URL、文字或编码内容..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <button className="btn btn-primary flex-1" onClick={handleEncode}>编码</button>
        <button className="btn btn-secondary flex-1" onClick={handleDecode}>解码</button>
        <button className="btn btn-secondary" onClick={() => { setInput(""); setEncoded(""); setDecoded(""); setError(""); }}>
          清空
        </button>
      </div>

      {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

      {encoded && (
        <div className="glass-card mb-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="field-label">编码结果</span>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={() => handleCopy(encoded)}>
              复制
            </button>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 font-mono text-sm break-all">{encoded}</div>
        </div>
      )}

      {decoded && (
        <div className="glass-card mb-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="field-label">解码结果</span>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={() => handleCopy(decoded)}>
              复制
            </button>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 font-mono text-sm break-all whitespace-pre-wrap">{decoded}</div>
        </div>
      )}

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">常见编码对照</span>
        <div className="grid grid-cols-1 gap-2 text-sm">
          {[
            ["空格", "%20"], ["#", "%23"], ["&", "%26"],
            ["?", "%3F"], ["/", "%2F"], ["=", "%3D"],
          ].map(([char, code]) => (
            <div key={char} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
              <span className="font-mono">{char}</span>
              <span className="font-mono text-gray-500">{code}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 encodeURIComponent 会对所有特殊字符进行百分号编码，适用于 URL 查询参数。
      </div>
    </div>
  );
}
