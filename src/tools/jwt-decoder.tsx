"use client";

import { useState, useCallback, useMemo } from "react";

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  if (pad) str += "=".repeat(4 - pad);
  return decodeURIComponent(atob(str).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
}

export function JwtDecoder() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const decoded = useMemo(() => {
    if (!token.trim()) return null;

    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) { setError("JWT 必须包含 3 个部分"); return null; }

      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));

      let expInfo = "";
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const isExpired = expDate < new Date();
        expInfo = isExpired ? `已过期 (${expDate.toLocaleString()})` : `将于 ${expDate.toLocaleString()} 过期`;
      }

      setError("");
      return { header, payload, expInfo };
    } catch (e: any) {
      setError(`解析失败: ${e.message}`);
      return null;
    }
  }, [token]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setToken(text);
  }, []);

  const formatJson = (obj: object) => JSON.stringify(obj, null, 2);

  return (
    <div>
      <div className="glass-card mb-6">
        <span className="field-label mb-3 block">JWT Token</span>
        <textarea
          className="input min-h-[80px] w-full resize-y font-mono text-xs"
          placeholder="粘贴 JWT token，如 eyJhbGciOi..."
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button className="btn btn-secondary mt-3 text-sm" onClick={handlePaste}>从剪贴板粘贴</button>
      </div>

      {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

      {decoded && (
        <>
          {decoded.expInfo && (
            <div className={`glass-card mb-6 ${decoded.expInfo.startsWith("已过期") ? "border-red-200 bg-red-50/50" : "border-green-200 bg-green-50/50"}`}>
              <span className="field-label mb-2 block">过期状态</span>
              <p className={`text-sm font-medium ${decoded.expInfo.startsWith("已过期") ? "text-red-600" : "text-green-600"}`}>
                {decoded.expInfo}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="glass-card">
              <span className="field-label mb-3 block">Header</span>
              <pre className="rounded-xl bg-gray-50 p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
                {formatJson(decoded.header)}
              </pre>
            </div>

            <div className="glass-card">
              <span className="field-label mb-3 block">Payload</span>
              <pre className="rounded-xl bg-gray-50 p-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all">
                {formatJson(decoded.payload)}
              </pre>
            </div>
          </div>
        </>
      )}

      <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-xs leading-relaxed text-gray-500">
        💡 仅解码 token 内容，不验证签名。JWT 签名部分保持原样不做处理。
      </div>
    </div>
  );
}
