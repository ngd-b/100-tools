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

  const result = useMemo(() => {
    const n = parseFloat(amount);
    if (isNaN(n)) return null;
    const from = CURRENCIES.find((c) => c.code === fromCode)!;
    const to = CURRENCIES.find((c) => c.code === toCode)!;
    return ((n / from.rate) * to.rate).toFixed(4);
  }, [amount, fromCode, toCode]);

  const quickResults = useMemo(() => {
    const n = parseFloat(amount);
    if (isNaN(n)) return [];
    const from = CURRENCIES.find((c) => c.code === fromCode)!;
    return CURRENCIES.filter((c) => c.code !== toCode).map((c) => ({
      ...c,
      value: ((n / from.rate) * c.rate).toFixed(4),
    }));
  }, [amount, fromCode, toCode]);

  return (
    <div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 mb-6 text-xs text-gray-500">
        💡 汇率仅供参考，实际交易请以银行或交易所汇率为准。
      </div>

      {/* Main Conversion */}
      <div className="glass-card mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>从</Label>
            <Select value={fromCode} onValueChange={(v) => { if (v) setFromCode(v); }}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input className="mt-3" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="输入金额" />
          </div>
          <div>
            <Label>到</Label>
            <Select value={toCode} onValueChange={(v) => { if (v) setToCode(v); }}>
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

      {/* Quick Conversion */}
      {amount && !isNaN(parseFloat(amount)) && (
        <div className="glass-card">
          <Label>换算到所有货币</Label>
          <div className="mt-3 grid grid-cols-2 gap-2">
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
