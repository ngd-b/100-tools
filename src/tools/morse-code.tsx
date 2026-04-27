"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const MORSE_CODE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---",
  "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...",
  "8": "---..", "9": "----.", ".": ".-.-.-", ",": "--..--", "?": "..--..",
  "!": "-.-.--", " ": "/",
};

const REVERSE_MORSE: Record<string, string> = {};
Object.entries(MORSE_CODE).forEach(([k, v]) => { REVERSE_MORSE[v] = k; });

function encodeMorse(text: string): string {
  return text.toUpperCase().split("").map((c) => MORSE_CODE[c] ?? c).join(" ");
}

function decodeMorse(morse: string): string {
  return morse.split(" / ").map((word) =>
    word.split(" ").map((c) => REVERSE_MORSE[c] ?? c).join("")
  ).join(" ");
}

export function MorseCode() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) { setError("请输入内容"); return; }
    try {
      setOutput(mode === "encode" ? encodeMorse(input) : decodeMorse(input.trim()));
    } catch {
      setError("转换失败，请检查输入");
    }
  }, [input, mode]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  return (
    <div>
      <div className="glass-card mb-6">
        <Label className="mb-3 block">模式</Label>
        <div className="flex gap-3">
          <Button variant={mode === "encode" ? "gradient" : "secondary"} className="flex-1" onClick={() => { setMode("encode"); setOutput(""); setError(""); }}>
            文字 → 摩斯码
          </Button>
          <Button variant={mode === "decode" ? "gradient" : "secondary"} className="flex-1" onClick={() => { setMode("decode"); setOutput(""); setError(""); }}>
            摩斯码 → 文字
          </Button>
        </div>
      </div>

      <div className="glass-card mb-6">
        <Label className="mb-3 block">{mode === "encode" ? "输入文字（英文/数字）" : "输入摩斯码"}</Label>
        <Textarea
          className="min-h-[100px] w-full resize-y font-mono text-sm"
          placeholder={mode === "encode" ? "Hello World" : ".... . .-.. .-.. --- / .-- --- .-. .-.. -.."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Button variant="gradient" className="flex-1" onClick={handleConvert}>转换</Button>
        <Button variant="secondary" onClick={() => { setInput(""); setOutput(""); }}>清空</Button>
      </div>

      {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

      {output && (
        <div className="glass-card">
          <div className="mb-3 flex items-center justify-between">
            <Label>转换结果</Label>
            <button className="copy-btn text-xs text-blue-500 hover:text-blue-600" onClick={handleCopy}>
              {copied ? "✓" : "复制"}
            </button>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 font-mono text-sm break-all">{output}</div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 摩斯码是一种用点（.）和划（-）表示字母的编码方式，支持英文字母、数字和基本标点。
      </div>
    </div>
  );
}
