import { ImageResponse } from "next/og";
import { tools } from "@/data/tools";

export const dynamic = "force-static";
const size = { width: 1200, height: 630 };

export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "72px", background: "#f4f5f8", color: "#111827" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "74px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "80px", height: "80px", borderRadius: "22px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", fontSize: 30, fontWeight: 700 }}>100</div><span style={{ fontSize: 40, fontWeight: 700 }}>tools</span></div>
      <div style={{ display: "flex", fontSize: 66, fontWeight: 700, letterSpacing: "-2px" }}>Free online tools.</div>
      <div style={{ display: "flex", marginTop: "20px", color: "#64748b", fontSize: 28 }}>Images · Text · Development · Everyday tasks</div>
      <div style={{ display: "flex", marginTop: "auto", paddingTop: "44px", color: "#4f46e5", fontSize: 24 }}>{tools.length} tools. No sign-up. Ready when you are.</div>
    </div>,
    size,
  );
}
