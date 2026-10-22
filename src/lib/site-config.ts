export type SiteConfig = {
  name: string;
  url?: string;
  indexable: boolean;
};

type SiteEnvironment = { SITE_URL?: string; SITE_INDEXABLE?: string; NODE_ENV?: string };

export const DEFAULT_SITE_URL = "https://tools.hboot.fun";

export function createSiteConfig(env: SiteEnvironment): SiteConfig {
  const value = env.SITE_URL?.trim();
  let url: string | undefined;
  let local = false;
  if (value) {
    const parsed = new URL(value);
    if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") {
      throw new Error("SITE_URL 必须是完整的 HTTP(S) 站点根地址，不包含路径、查询参数或登录信息。");
    }
    url = parsed.origin;
    local = ["localhost", "127.0.0.1", "[::1]", "0.0.0.0"].includes(parsed.hostname) || parsed.hostname.endsWith(".localhost");
  }
  return { name: "100-tools", url, indexable: env.SITE_INDEXABLE !== "false" && env.NODE_ENV !== "development" && !local };
}

export function getSiteConfig(env: SiteEnvironment): SiteConfig {
  return createSiteConfig({
    SITE_URL: env.SITE_URL?.trim() || DEFAULT_SITE_URL,
    SITE_INDEXABLE: env.SITE_INDEXABLE,
    NODE_ENV: env.NODE_ENV,
  });
}

export const siteConfig = getSiteConfig(process.env);
