"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLocale, localePath, LOCALE_COOKIE, LOCALE_STORAGE_KEY, LANGUAGE_MAX_AGE, type Locale } from "@/lib/i18n/locale";
import { getTranslator } from "@/lib/i18n/translate";

const LanguageContext = createContext<Locale>("zh");

export function saveLanguage(locale: Locale) {
  try { localStorage.setItem(LOCALE_STORAGE_KEY, locale); } catch { /* Cookies still persist the preference when storage is unavailable. */ }
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LANGUAGE_MAX_AGE}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
}

export function LanguageProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const cookie = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${LOCALE_COOKIE}=`))?.slice(LOCALE_COOKIE.length + 1);
    if (isLocale(cookie)) {
      saveLanguage(cookie);
      return;
    }
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (!isLocale(saved)) return;
      saveLanguage(saved);
      // Restore the manual choice if cookies expired or are unavailable.
      if (saved !== locale) router.replace(localePath(pathname, saved) + window.location.search + window.location.hash);
    } catch { /* Automatic language routing still works without local storage. */ }
  }, [locale, pathname, router]);
  return <LanguageContext.Provider value={locale}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const locale = useContext(LanguageContext);
  return { locale, t: getTranslator(locale) };
}

export function LanguageSwitcher() {
  const { locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  function choose(next: Locale) {
    saveLanguage(next);
    if (next !== locale) router.push(localePath(pathname, next) + window.location.search + window.location.hash);
  }
  return (
    <div className="language-switcher" role="group" aria-label={locale === "zh" ? "界面语言" : "Interface language"}>
      <button type="button" lang="zh-CN" aria-label="中文" aria-pressed={locale === "zh"} onClick={() => choose("zh")}>中文</button>
      <button type="button" lang="en" aria-label="English" aria-pressed={locale === "en"} onClick={() => choose("en")}>EN</button>
    </div>
  );
}
