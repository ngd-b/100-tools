"use client";

import { useI18n } from "@/components/LanguageProvider";

import { NavigationLink as Link } from "@/components/NavigationLink";

export default function ToolError() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="mb-3 text-xl font-semibold">{t("工具暂时无法加载")}</h1>
      <p className="mb-6 text-sm text-gray-500">{t("请检查网络后重试，或返回目录选择其他工具。")}</p>
      <button className="btn btn-primary mr-3" onClick={() => window.location.reload()}>{t("重新加载")}</button>
      <Link href="/" className="text-sm text-blue-600">{t("返回首页")}</Link>
    </div>
  );
}
