"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OutputType = "type" | "interface";

export function JsonToTs() {
  const [json, setJson] = useState(`{
  "name": "John",
  "age": 30,
  "email": "john@example.com",
  "isActive": true,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "tags": ["developer", "designer"],
  "projects": [
    { "title": "Project A", "completed": true },
    { "title": "Project B", "completed": false }
  ]
}`);
  const [output, setOutput] = useState("");
  const [outputType, setOutputType] = useState<OutputType>("type");
  const [rootName, setRootName] = useState("RootObject");
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    try {
      const parsed = JSON.parse(json);
      const ts = generateTsTypes(parsed, rootName, outputType, 0);
      setOutput(ts);
    } catch (e: any) {
      setError(e.message);
      setOutput("");
    }
  }, [json, rootName, outputType]);

  const handleCopy = useCallback(() => {
    if (output) navigator.clipboard.writeText(output);
  }, [output]);

  const handleClear = useCallback(() => {
    setJson("");
    setOutput("");
    setError("");
  }, []);

  const handleExample = useCallback(() => {
    setJson(`{
  "name": "John",
  "age": 30,
  "email": "john@example.com",
  "isActive": true,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "tags": ["developer", "designer"],
  "projects": [
    { "title": "Project A", "completed": true },
    { "title": "Project B", "completed": false }
  ]
}`);
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2">
        <div className="glass-card">
          <Label className="mb-2 block">输入 JSON</Label>
          <Textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder='{"name": "example", "age": 25}'
            rows={12}
            className="font-mono text-sm"
          />
        </div>
        <div className="glass-card">
          <div className="mb-2 flex items-center justify-between">
            <Label>输出 TypeScript</Label>
            <Button variant="secondary" className="text-xs cursor-pointer" onClick={handleCopy} disabled={!output}>
              复制
            </Button>
          </div>
          <div className="h-[288px] overflow-auto rounded-lg border border-gray-100 bg-gray-50/50 p-4 font-mono text-sm leading-relaxed">
            {output ? (
              <pre className="whitespace-pre-wrap text-gray-700">{output}</pre>
            ) : (
              <span className="text-gray-300">TypeScript 类型定义将显示在这里...</span>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label className="mb-2 block">根名称</Label>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="RootObject"
              className="input"
            />
          </div>
          <div>
            <Label className="mb-2 block">输出风格</Label>
            <Select value={outputType} onValueChange={(v) => setOutputType(v as OutputType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="type">Type 别名</SelectItem>
                <SelectItem value="interface">Interface</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="gradient" className="flex-1 cursor-pointer" onClick={handleConvert} disabled={!json}>
              转换
            </Button>
            <Button variant="secondary" className="cursor-pointer" onClick={handleClear}>
              清空
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 px-5 py-3 text-sm text-red-600">
          JSON 解析错误：{error}
        </div>
      )}

      {/* Tips */}
      {!json && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
          💡 粘贴合法的 JSON 字符串，自动推断嵌套类型、数组类型和可选属性。点击{" "}
          <button onClick={handleExample} className="font-medium text-blue-500 underline">加载示例</button> 快速体验。
        </div>
      )}
    </div>
  );
}

function jsonTypeToTs(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const itemType = jsonTypeToTs(value[0]);
    return `${itemType}[]`;
  }
  if (typeof value === "object") return "object";
  return "unknown";
}

function generateTsTypes(
  obj: unknown,
  name: string,
  outputType: OutputType,
  indent: number
): string {
  const lines: string[] = [];
  const pad = "  ".repeat(indent);
  const keyword = outputType === "interface" ? "interface" : "type";

  if (obj === null || obj === undefined) {
    if (outputType === "type") {
      lines.push(`${pad}export type ${name} = null;`);
    }
    return lines.join("\n");
  }

  if (typeof obj !== "object" || Array.isArray(obj)) {
    if (outputType === "type") {
      lines.push(`${pad}export type ${name} = ${jsonTypeToTs(obj)};`);
    }
    return lines.join("\n");
  }

  const entries = Object.entries(obj as Record<string, unknown>);
  const nestedTypes: string[] = [];

  if (outputType === "interface") {
    lines.push(`${pad}export interface ${name} {`);
    for (const [key, value] of entries) {
      const tsType = valueToTsType(value, key, nestedTypes, indent + 1);
      lines.push(`${pad}  ${escapeKey(key)}${isOptional(value) ? "?" : ""}: ${tsType};`);
    }
    lines.push(`${pad}}`);
  } else {
    lines.push(`${pad}export type ${name} = {`);
    for (const [key, value] of entries) {
      const tsType = valueToTsType(value, key, nestedTypes, indent + 1);
      lines.push(`${pad}  ${escapeKey(key)}${isOptional(value) ? "?" : ""}: ${tsType};`);
    }
    lines.push(`${pad}};`);
  }

  // Add nested types
  if (nestedTypes.length > 0) {
    lines.push("");
    lines.push(nestedTypes.join("\n\n"));
  }

  return lines.join("\n");
}

function escapeKey(key: string): string {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return key;
  return `"${key}"`;
}

function isOptional(value: unknown): boolean {
  return value === null || value === undefined;
}

function valueToTsType(
  value: unknown,
  key: string,
  nestedTypes: string[],
  indent: number
): string {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const innerType = valueToTsType(value[0], capitalize(key), nestedTypes, indent);
    return `${innerType}[]`;
  }
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "object") {
    const typeName = capitalize(key);
    const result = generateTsTypes(value, typeName, "type", indent);
    if (!nestedTypes.includes(result)) {
      nestedTypes.push(result);
    }
    return typeName;
  }
  return "unknown";
}

function capitalize(s: string): string {
  const cleaned = s.replace(/[^a-zA-Z0-9]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const result = cleaned.replace(/\s/g, "");
  return result.charAt(0).toUpperCase() + result.slice(1);
}
