import { tools, categories } from "../../data/tools.ts";
import { toolGuides } from "../../data/tool-guides.ts";
import { categoryGuides } from "../../data/category-guides.ts";
import type { Tool } from "../../types/tools";
import { getTranslator } from "./translate.ts";
import type { Locale } from "./locale";

export function localizeTool(tool: Tool, locale: Locale): Tool {
  const t = getTranslator(locale);
  return { ...tool, name: t(tool.name), description: t(tool.description) };
}
export function localizedTools(locale: Locale) {
  return tools.map((tool) => localizeTool(tool, locale));
}
export function localizedCategories(locale: Locale) {
  const t = getTranslator(locale);
  return categories.map((category) => ({ ...category, name: t(category.name) }));
}
export function getToolGuide(id: string, locale: Locale) {
  const guide = toolGuides[id];
  const t = getTranslator(locale);
  return { title: t(guide.title), description: t(guide.description), steps: guide.steps.map((step) => t(step)), note: t(guide.note) };
}
export function getCategoryGuide(id: string, locale: Locale) {
  const guide = categoryGuides[id];
  const t = getTranslator(locale);
  return { title: t(guide.title), description: t(guide.description), intro: t(guide.intro) };
}
