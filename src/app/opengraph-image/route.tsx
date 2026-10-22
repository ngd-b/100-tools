import { ImageResponse } from "next/og";
import { tools } from "@/data/tools";

export const dynamic = "force-static";
const size = { width: 1200, height: 630 };

export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "64px 76px", background: "#f8f9f6", color: "#242b27" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "66px" }}><svg width="54" height="54" viewBox="0 0 24 24" fill="#2d6250"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M16.5 13h2v9h-2zM13 16.5h9v2h-9z" /></svg><span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-1px" }}>100tools</span><span style={{ marginLeft: "auto", fontSize: 16, letterSpacing: "3px", color: "#7a8972" }}>YOUR EVERYDAY TOOLKIT</span></div>
      <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: "-3px", lineHeight: 1.2 }}>Little tools.</div>
      <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: "-3px", lineHeight: 1.2, color: "#2d6250" }}>A simpler everyday.</div>
      <div style={{ display: "flex", marginTop: "auto", paddingTop: "28px", borderTop: "1px solid #dce3d7", justifyContent: "space-between", color: "#687069", fontSize: 22 }}><span>{tools.length} free tools. No sign-up.</span><span>Images / Text / Code / More</span></div>
    </div>,
    size,
  );
}
