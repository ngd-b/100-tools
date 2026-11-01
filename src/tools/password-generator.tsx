"use client";

import { useI18n } from "@/components/LanguageProvider";
import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  base64Length,
  bytesToBase64,
  bytesToHex,
  entropyScore,
  generateSecurePassword,
  opensslCommand,
  randomBytes,
  strengthScore,
  type SecretFormat,
} from "@/lib/password";

const ALL_SYMBOLS = [..."!@#$%^&*()_+-=[]{}|;:,.<>?"];

const PAIRS: Record<string, string> = { "(": ")", "[": "]", "{": "}", ")": "(", "]": "[", "}": "{", "<": ">", ">": "<" };

const FORMATS: { id: SecretFormat; label: string }[] = [
  { id: "chars", label: "自定义字符" },
  { id: "hex", label: "Hex" },
  { id: "base64", label: "Base64" },
];

type Result = { value: string; score: number };

export function PasswordGenerator() {
  const { t } = useI18n();
  const [format, setFormat] = useState<SecretFormat>("chars");
  const [length, setLength] = useState(16);
  const [byteLength, setByteLength] = useState(32);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [selectedSymbols, setSelectedSymbols] = useState<Set<string>>(new Set(ALL_SYMBOLS));
  const [results, setResults] = useState<Result[]>([]);
  const [meta, setMeta] = useState<{ command: string; bits: number } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCommand, setCopiedCommand] = useState(false);

  const resetResults = useCallback(() => {
    setResults([]);
    setMeta(null);
    setCopiedIndex(null);
    setCopiedCommand(false);
  }, []);

  const toggleSymbol = (s: string) => {
    setSelectedSymbols((prev) => {
      const next = new Set(prev);
      const pair = PAIRS[s];
      if (pair) {
        // Toggle the pair together
        if (next.has(s)) { next.delete(s); next.delete(pair); }
        else { next.add(s); next.add(pair); }
      } else if (next.has(s)) {
        next.delete(s);
      } else {
        next.add(s);
      }
      return next;
    });
    resetResults();
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

  const changeFormat = useCallback((next: SecretFormat) => {
    if (next === format) return;
    setFormat(next);
    resetResults();
  }, [format, resetResults]);

  const handleGenerate = useCallback(() => {
    setCopiedIndex(null);
    setCopiedCommand(false);
    if (format === "chars") {
      if (!charset) return;
      setMeta(null);
      setResults(Array.from({ length: 5 }, () => {
        const value = generateSecurePassword(length, charset);
        return { value, score: strengthScore(value) };
      }));
      return;
    }

    const generateOne = () => format === "hex" ? bytesToHex(randomBytes(byteLength)) : bytesToBase64(randomBytes(byteLength));
    setMeta({ command: opensslCommand(format, byteLength), bits: byteLength * 8 });
    setResults(Array.from({ length: 5 }, () => ({ value: generateOne(), score: entropyScore(byteLength) })));
  }, [format, charset, length, byteLength]);

  const outputLength = format === "hex" ? byteLength * 2 : base64Length(byteLength);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">{t("输出格式")}</Label>
        <div className="flex gap-3">
          {FORMATS.map((item) => (
            <Button
              key={item.id}
              variant={format === item.id ? "gradient" : "secondary"}
              className="flex-1"
              onClick={() => changeFormat(item.id)}
            >
              {item.id === "chars" ? t(item.label) : item.label}
            </Button>
          ))}
        </div>
        {format !== "chars" && (
          <p className="mt-3 text-xs text-gray-500">
            {t("Hex 每字节输出 2 个字符；Base64 输出含填充符，字符内容与 openssl rand -base64 一致。")}
          </p>
        )}
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">{format === "chars" ? t("密码长度") : t("字节数")}</Label>
        <div className="flex items-center gap-3">
          <Slider
            min={4}
            max={64}
            value={[format === "chars" ? length : byteLength]}
            onValueChange={(v) => {
              const val = (Array.isArray(v) ? v[0] : v) as number;
              if (format === "chars") {
                if (val === length) return;
                setLength(val);
                // Length is part of every generated value, so stale results would mislead.
                resetResults();
                return;
              }
              if (val === byteLength) return;
              setByteLength(val);
              // The displayed command and result lengths depend on the byte count.
              resetResults();
            }}
            className="flex-1"
          />
          <span className="w-12 text-right font-mono text-lg font-bold">{format === "chars" ? length : byteLength}</span>
        </div>
        {format !== "chars" && (
          <p className="mt-2 text-xs text-gray-500">{t("输出 {0} 个字符", [outputLength])}</p>
        )}
      </div>

      {format === "chars" && (
        <div className="glass-card mb-6">
          <Label className="mb-3 block">{t("字符集")}</Label>
          <div className="flex flex-col gap-3">
            {[
              { label: t("大写字母 (A-Z)"), checked: uppercase, setter: setUppercase },
              { label: t("小写字母 (a-z)"), checked: lowercase, setter: setLowercase },
              { label: t("数字 (0-9)"), checked: numbers, setter: setNumbers },
            ].map(({ label, checked, setter }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={checked} onCheckedChange={(v) => { setter(v as boolean); resetResults(); }} />
                <span className="text-sm">{t(label)}</span>
              </label>
            ))}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-3">
                <Checkbox checked={selectedSymbols.size === ALL_SYMBOLS.length}
                  onCheckedChange={(v) => {
                    if (v) setSelectedSymbols(new Set(ALL_SYMBOLS));
                    else setSelectedSymbols(new Set());
                    resetResults();
                  }} />
                <span className="text-sm">{t("特殊符号")}</span>
                <button className="text-xs text-blue-500 hover:text-blue-600 ml-auto"
                  onClick={() => { setSelectedSymbols(new Set(ALL_SYMBOLS)); resetResults(); }}>{t("全选")}</button>
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
      )}

      <Button variant="gradient" className="w-full mb-6" onClick={handleGenerate} disabled={format === "chars" && !charset}>
        {format === "chars" ? t("生成 5 个密码") : t("生成 5 个随机串")}
      </Button>

      {results.length > 0 && (
        <div className="glass-card">
          <Label className="mb-3 block">{t("生成结果")}</Label>
          {meta && (
            <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-blue-50/60 px-3 py-2 text-xs">
              <span className="text-gray-500">{t("等价命令：")}</span>
              <code className="font-mono text-blue-700 break-all">{meta.command}</code>
              <button className="copy-btn ml-auto text-xs text-blue-500 hover:text-blue-600"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(meta.command);
                    setCopiedCommand(true);
                    setTimeout(() => setCopiedCommand(false), 1500);
                  } catch {
                    setCopiedCommand(false);
                  }
                }}>
                {copiedCommand ? "✓" : t("复制命令")}
              </button>
              <span className="w-full text-gray-400">{t("约 {0} 位熵", [meta.bits])}</span>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {results.map((result, i) => {
              const bar = (result.score / 7) * 100;
              const color = result.score <= 3 ? "bg-red-400" : result.score <= 5 ? "bg-yellow-400" : "bg-green-500";
              return (
                <div key={i} className="rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <code className="font-mono text-sm break-all flex-1 mr-3">{result.value}</code>
                    <button className="copy-btn text-xs text-blue-500 hover:text-blue-600"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(result.value);
                          setCopiedIndex(i);
                          setTimeout(() => setCopiedIndex(null), 1500);
                        } catch {
                          setCopiedIndex(null);
                        }
                      }}>
                      {copiedIndex === i ? "✓" : t("复制")}
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
        {t("💡 使用 crypto.getRandomValues() 生成随机数据；Hex/Base64 的字符内容与 openssl rand 一致，命令输出末尾的换行可在脚本中用 $(…) 去除。")}</div>
    </div>
  );
}
