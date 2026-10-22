export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
export const LOCALE_COOKIE = "100-tools-language";
export const LOCALE_STORAGE_KEY = "100-tools-language";
export const LANGUAGE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return value === "zh" || value === "en";
}

// Only Chinese and English are available. Other browser languages fall back to English.
export function detectLocale(acceptLanguage: string | null, saved?: unknown): Locale {
  if (isLocale(saved)) return saved;
  const preferences = (acceptLanguage ?? "").split(",").map((part, index) => {
    const [language, ...parameters] = part.trim().split(";");
    const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
    const q = quality ? Number(quality.trim().slice(2)) : 1;
    return { language: language.toLowerCase(), q, index };
  }).filter(({ language, q }) => language && Number.isFinite(q) && q > 0 && q <= 1)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { language } of preferences) {
    const primary = language.split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return "en";
}

export function stripLocale(path: string): string {
  return path.replace(/^\/(zh|en)(?=\/|[?#]|$)/, "") || "/";
}

export function localePath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const bare = stripLocale(path);
  return `/${locale}${bare === "/" ? "" : bare}`;
}
