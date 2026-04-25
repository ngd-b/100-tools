"use client";

import { useState, useCallback, useMemo } from "react";

function generateSecurePassword(length: number, charset: string): string {
  const chars = [...charset];
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function strengthScore(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return score;
}

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [passwords, setPasswords] = useState<string[]>([]);

  const charset = useMemo(() => {
    let c = "";
    if (lowercase) c += "abcdefghijklmnopqrstuvwxyz";
    if (uppercase) c += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (numbers) c += "0123456789";
    if (symbols) c += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    return c;
  }, [uppercase, lowercase, numbers, symbols]);

  const handleGenerate = useCallback(() => {
    if (!charset) return;
    setPasswords(Array.from({ length: 5 }, () => generateSecurePassword(length, charset)));
  }, [length, charset]);

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">密码长度</span>
        <div className="flex items-center gap-3">
          <input type="range" min={4} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="flex-1" />
          <span className="w-12 text-right font-mono text-lg font-bold">{length}</span>
        </div>
      </div>

      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">字符集</span>
        <div className="flex flex-col gap-3">
          {[
            { label: "大写字母 (A-Z)", checked: uppercase, setter: setUppercase },
            { label: "小写字母 (a-z)", checked: lowercase, setter: setLowercase },
            { label: "数字 (0-9)", checked: numbers, setter: setNumbers },
            { label: "特殊符号 (!@#$)", checked: symbols, setter: setSymbols },
          ].map(({ label, checked, setter }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)}
                className="h-5 w-5 rounded accent-blue-500" />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="btn btn-primary w-full mb-6" onClick={handleGenerate} disabled={!charset}>
        生成 5 个密码
      </button>

      {passwords.length > 0 && (
        <div className="glass-card">
          <span className="field-label mb-3 block">生成结果</span>
          <div className="flex flex-col gap-3">
            {passwords.map((p, i) => {
              const score = strengthScore(p);
              const bar = (score / 7) * 100;
              const color = score <= 3 ? "bg-red-400" : score <= 5 ? "bg-yellow-400" : "bg-green-500";
              return (
                <div key={i} className="rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <code className="font-mono text-sm break-all flex-1 mr-3">{p}</code>
                    <button className="copy-btn text-xs text-blue-500 hover:text-blue-600"
                      onClick={() => navigator.clipboard.writeText(p)}>复制</button>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-200">
                    <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${bar}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 使用 crypto.getRandomValues() 生成密码，比 Math.random() 更安全。
      </div>
    </div>
  );
}
