"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CURRENCIES = [
  { code: "CNY", name: "人民币 (CNY)", symbol: "¥", rate: 1 },
  { code: "USD", name: "美元 (USD)", symbol: "$", rate: 0.1374 },
  { code: "EUR", name: "欧元 (EUR)", symbol: "€", rate: 0.1278 },
  { code: "GBP", name: "英镑 (GBP)", symbol: "£", rate: 0.1093 },
  { code: "JPY", name: "日元 (JPY)", symbol: "¥", rate: 21.25 },
  { code: "KRW", name: "韩元 (KRW)", symbol: "₩", rate: 194.8 },
  { code: "HKD", name: "港币 (HKD)", symbol: "HK$", rate: 1.072 },
  { code: "TWD", name: "新台币 (TWD)", symbol: "NT$", rate: 4.45 },
  { code: "SGD", name: "新加坡元 (SGD)", symbol: "S$", rate: 0.186 },
  { code: "THB", name: "泰铢 (THB)", symbol: "฿", rate: 4.68 },
  { code: "AUD", name: "澳元 (AUD)", symbol: "A$", rate: 0.212 },
  { code: "CAD", name: "加元 (CAD)", symbol: "C$", rate: 0.195 },
];

export function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [fromCode, setFromCode] = useState("CNY");
  const [toCode, setToCode] = useState("USD");
  const [customRate, setCustomRate] = useState("");
  const hasCustomRate = customRate.trim() !== "";
  const validCustomRate = Number.isFinite(Number(customRate)) && Number(customRate) > 0;

  const result = useMemo(() => {
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || (hasCustomRate && !validCustomRate)) return null;
    if (hasCustomRate) {
      const converted = n * Number(customRate);
      return Number.isFinite(converted) ? converted.toFixed(4) : null;
    }
    const from = CURRENCIES.find((c) => c.code === fromCode)!;
    const to = CURRENCIES.find((c) => c.code === toCode)!;
    const converted = (n / from.rate) * to.rate;
    return Number.isFinite(converted) ? converted.toFixed(4) : null;
  }, [amount, fromCode, toCode, customRate, hasCustomRate, validCustomRate]);

  const quickResults = useMemo(() => {
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || hasCustomRate) return [];
    const from = CURRENCIES.find((c) => c.code === fromCode)!;
    return CURRENCIES.filter((c) => c.code !== toCode && Number.isFinite((n / from.rate) * c.rate)).map((c) => ({
      ...c,
      value: ((n / from.rate) * c.rate).toFixed(4),
    }));
  }, [amount, fromCode, toCode, hasCustomRate]);

  return (
    <div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 mb-6 text-xs text-gray-500">
        内置汇率是项目预设的参考值，来源和采集日期未记录，不会联网更新。可输入自行查询的汇率进行计算。
      </div>

      {/* Main Conversion */}
      <div className="glass-card mb-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>从</Label>
            <Select value={fromCode} onValueChange={(v) => { if (v) { setFromCode(v); setCustomRate(""); } }}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input className="mt-3" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="输入金额" />
          </div>
          <div>
            <Label>到</Label>
            <Select value={toCode} onValueChange={(v) => { if (v) { setToCode(v); setCustomRate(""); } }}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="mt-3 h-10 flex items-center rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono font-semibold">
              {result !== null ? `${result} ${toCode}` : "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label htmlFor="custom-rate">自定义汇率：1 {fromCode} = 多少 {toCode}</Label>
        <Input id="custom-rate" type="number" min="0" step="any" className="mt-3" value={customRate} onChange={(event) => setCustomRate(event.target.value)} placeholder="留空使用内置参考值" />
        {hasCustomRate && !validCustomRate && <p role="alert" className="mt-2 text-xs text-red-600">请输入大于 0 的有效汇率。</p>}
        {Number.isFinite(parseFloat(amount)) && (!hasCustomRate || validCustomRate) && result === null && <p role="alert" className="mt-2 text-xs text-red-600">计算结果超出数值范围，请减小金额或汇率。</p>}
        <p className="mt-2 text-xs text-gray-500">{hasCustomRate ? "使用自定义汇率，切换货币后会清空。" : "使用内置参考汇率。"}</p>
      </div>

      {/* Quick Conversion */}
      {quickResults.length > 0 && (
        <div className="glass-card">
          <Label>换算到所有货币</Label>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {quickResults.map((c) => (
              <div key={c.code} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-500">{c.symbol} {c.code}</span>
                <span className="font-mono font-semibold">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
