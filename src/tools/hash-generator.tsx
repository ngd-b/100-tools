"use client";

import { useState, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha1(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function HashGenerator() {
  const [input, setInput] = useState("");
  const [sha256Hash, setSha256Hash] = useState("");
  const [sha1Hash, setSha1Hash] = useState("");
  const [md5Like, setMd5Like] = useState("");

  useEffect(() => {
    if (!input) {
      setSha256Hash("");
      setSha1Hash("");
      setMd5Like("");
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    // Simple hash for MD5-like (not real MD5, just a fast hash for demo)
    let h = 0;
    for (let i = 0; i < data.length; i++) {
      h = Math.imul(31, h) + data[i] | 0;
    }
    setMd5Like((h >>> 0).toString(16).padStart(8, "0"));

    crypto.subtle.digest("SHA-256", data).then((buf) => {
      setSha256Hash(Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join(""));
    });
    crypto.subtle.digest("SHA-1", data).then((buf) => {
      setSha1Hash(Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join(""));
    });
  }, [input]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  const HashRow = ({ label, value }: { label: string; value: string }) => (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {value && (
          <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={() => handleCopy(value)}>
            {copied ? "✓" : "复制"}
          </button>
        )}
      </div>
      <div className="rounded-xl bg-gray-50 p-3 font-mono text-xs break-all">
        {value || "等待输入..."}
      </div>
    </div>
  );

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">输入文本</Label>
        <Textarea
          className="min-h-[100px] w-full resize-y font-mono text-sm"
          placeholder="输入任意文本..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {input && (
        <div className="glass-card">
          <Label className="mb-4 block">哈希结果</Label>
          <HashRow label="SHA-256" value={sha256Hash} />
          <HashRow label="SHA-1" value={sha1Hash} />
          <HashRow label="CRC32 (模拟)" value={md5Like} />
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 使用浏览器原生 Web Crypto API 计算，无需后端。SHA-256 / SHA-1 适用于文件校验、数据完整性验证等场景。
      </div>
    </div>
  );
}
