import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ToolPage } from "@/components/ToolPage";
import { getToolByPath, toolPathRedirects, tools } from "@/data/tools";
import { toolGuides } from "@/data/tool-guides";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ toolPath: string[] }> };

export function generateStaticParams() {
  return [...tools.map((tool) => tool.path), ...Object.keys(toolPathRedirects)]
    .map((path) => ({ toolPath: path.slice(1).split("/") }));
}

async function resolveTool(params: Props["params"]) {
  const { toolPath } = await params;
  const path = `/${toolPath.join("/")}`;
  if (Object.hasOwn(toolPathRedirects, path)) permanentRedirect(toolPathRedirects[path]);
  const tool = getToolByPath(path);
  if (!tool) notFound();
  return tool;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = await resolveTool(params);
  const guide = toolGuides[tool.id];
  return createPageMetadata({ title: guide.title, description: guide.description, path: tool.path }, siteConfig);
}

export default async function Page({ params }: Props) {
  const tool = await resolveTool(params);
  return <ToolPage tool={tool} />;
}
