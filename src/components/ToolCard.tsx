import Link from "next/link";
import type { Tool } from "@/types/tools";

const iconBg: Record<string, string> = {
  color: "linear-gradient(135deg, #f59e0b, #f97316)",
  image: "linear-gradient(135deg, #10b981, #14b8a6)",
  audio: "linear-gradient(135deg, #8b5cf6, #a855f7)",
  text: "linear-gradient(135deg, #0ea5e9, #3b82f6)",
  dev: "linear-gradient(135deg, #6b7280, #4b5563)",
};

export function ToolCard({ tool }: { tool: Tool }) {
  const bg = iconBg[tool.category] ?? iconBg.text;

  return (
    <Link href={tool.path} className="tool-card">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white"
        style={{ background: bg }}
      >
        {tool.icon}
      </div>
      <h3 className="text-base font-semibold tracking-tight text-gray-900">
        {tool.name}
      </h3>
      <p className="mt-0.5 text-xs font-medium tracking-wider text-gray-400 uppercase">
        {tool.nameEn}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-gray-500">
        {tool.description}
      </p>
    </Link>
  );
}
