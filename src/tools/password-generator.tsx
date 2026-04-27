"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

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

const ALL_SYMBOLS = [..."!@#$%^&*()_+-=[]{}|;:,.<>?"];

const PAIRS: Record<string, string> = { "(": ")", "[": "]", "{": "}", ")": "(", "]": "[", "}": "{", "<": ">", ">": "<" };

export function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [selectedSymbols, setSelectedSymbols] = useState<Set<string>>(new Set(ALL_SYMBOLS));
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleSymbol = (s: string) => {
    setSelectedSymbols((prev) => {
      const next = new Set(prev);
      const pair = PAIRS[s];
      if (pair) {
        // Toggle the pair together
        if (next.has(s)) { next.delete(s); next.delete(pair); }
        else { next.add(s); next.add(pair); }
      } else {
        next.has(s) ? next.delete(s) : next.add(s);
      }
      return next;
    });
  };

  const activeSymbols = useMemo(() => [...selectedSymbols].join(""), [selectedSymbols]);

  const charset = useMemo(() => {
    let c = "";
    if (lowercase) c += "abcdefghijklmnopqrstuvwxyz";
    if (uppercase) c += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (numbers) c += "0123456789";
    if (activeSymbols) c += activeSymbols;
    return c;
  }, [uppercase, lowercase, numbers, activeSymbols]);

  const handleGenerate = useCallback(() => {
    if (!charset) return;
    setPasswords(Array.from({ length: 5 }, () => generateSecurePassword(length, charset)));
  }, [length, charset]);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">密码长度</Label>
        <div className="flex items-center gap-3">
          <Slider min={4} max={64} value={[length]} onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setLength(val as number) }} className="flex-1" />
          <span className="w-12 text-right font-mono text-lg font-bold">{length}</span>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">字符集</Label>
        <div className="flex flex-col gap-3">
          {[
            { label: "大写字母 (A-Z)", checked: uppercase, setter: setUppercase },
            { label: "小写字母 (a-z)", checked: lowercase, setter: setLowercase },
            { label: "数字 (0-9)", checked: numbers, setter: setNumbers },
          ].map(({ label, checked, setter }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={checked} onCheckedChange={(v) => setter(v as boolean)} />
              <span className="text-sm">{label}</span>
            </label>
          ))}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-3">
              <Checkbox checked={selectedSymbols.size === ALL_SYMBOLS.length}
                onCheckedChange={(v) => {
                  if (v) setSelectedSymbols(new Set(ALL_SYMBOLS));
                  else setSelectedSymbols(new Set());
                }} />
              <span className="text-sm">特殊符号</span>
              <button className="text-xs text-blue-500 hover:text-blue-600 ml-auto"
                onClick={() => setSelectedSymbols(new Set(ALL_SYMBOLS))}>全选</button>
            </div>
            <div className="flex flex-wrap gap-2 pl-8">
              {(() => {
                const seen = new Set<string>();
                const items: { key: string; display: string }[] = [];
                for (const s of ALL_SYMBOLS) {
                  if (seen.has(s)) continue;
                  const pair = PAIRS[s];
                  if (pair && pair > s) {
                    seen.add(s); seen.add(pair);
                    items.push({ key: s + pair, display: `${s} ${pair}` });
                  } else {
                    seen.add(s);
                    items.push({ key: s, display: s });
                  }
                }
                return items.map(({ key, display }) => {
                  const isSelected = key.length > 1 ? selectedSymbols.has(key[0]) && selectedSymbols.has(key[1]) : selectedSymbols.has(key);
                  return (
                    <label key={key} className="flex items-center gap-1 cursor-pointer rounded-lg px-2 py-1 text-sm font-mono"
                      style={{ backgroundColor: isSelected ? "#eff6ff" : "#fff" }}>
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleSymbol(key[0])} />
                      <span>{display}</span>
                    </label>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      <Button variant="gradient" className="w-full mb-6" onClick={handleGenerate} disabled={!charset}>
        生成 5 个密码
      </Button>

      {passwords.length > 0 && (
        <div className="glass-card">
          <Label className="mb-3 block">生成结果</Label>
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
                      onClick={() => { navigator.clipboard.writeText(p); setCopiedIndex(i); setTimeout(() => setCopiedIndex(null), 1500); }}>
                      {copiedIndex === i ? "✓" : "复制"}
                    </button>
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
