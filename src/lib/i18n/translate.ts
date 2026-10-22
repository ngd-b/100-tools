import en from "./en.json" with { type: "json" };
import type { Locale } from "./locale";

const english: Record<string, string> = en;
export type Translator = (source: string | null | undefined, values?: readonly (string | number)[]) => string;
const interpolate = (text: string, values: readonly (string | number)[]) =>
  text.replace(/\{(\d+)\}/g, (match, index) => String(values[Number(index)] ?? match));

// Existing helpers return formatted status/error messages. Translate their known templates
// at the UI boundary; editable inputs and generated data are never passed through this.
const messageTemplates = Object.entries(english).filter(([key]) => /\{\d+\}/.test(key) && /[\u3400-\u9fff]/.test(key)).map(([key, value]) => {
  const indexes: number[] = [];
  const pattern = key.split(/(\{\d+\})/).map((part) => {
    if (/^\{\d+\}$/.test(part)) { indexes.push(Number(part.slice(1, -1))); return "(.*?)"; }
    return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("");
  return { pattern: new RegExp(`^${pattern}$`, "s"), value, indexes };
});

function englishText(source: string, depth = 0): string {
  if (Object.hasOwn(english, source)) return english[source];
  const trimmed = source.trim();
  if (Object.hasOwn(english, trimmed)) return source.replace(trimmed, () => english[trimmed]);
  if (depth < 2) {
    for (const { pattern, value, indexes } of messageTemplates) {
      const match = pattern.exec(source);
      if (!match) continue;
      const values: string[] = [];
      indexes.forEach((index, capture) => { values[index] = englishText(match[capture + 1], depth + 1); });
      return interpolate(value, values);
    }
  }
  return source;
}

const translators: Record<Locale, Translator> = {
  zh: (source, values) => values ? interpolate(source ?? "", values) : source ?? "",
  en: (source, values) => {
    const translated = englishText(source ?? "");
    return values ? interpolate(translated, values.map((value) => typeof value === "string" ? englishText(value) : value)) : translated;
  },
};

export function getTranslator(locale: Locale): Translator {
  return translators[locale];
}
