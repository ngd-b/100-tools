import type { Metadata } from "next";
import { NavigationLink as Link } from "@/components/NavigationLink";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ArrowUpRight, Code2 } from "lucide-react";
import { Brand } from "@/components/Brand";
import { NavigationProgress } from "@/components/NavigationProgress";
import { Footer } from "@/components/Footer";
import { siteConfig } from "@/lib/site-config";
import { homeSeo } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteConfig.url ? new URL(siteConfig.url) : undefined,
  title: { default: `${homeSeo.title} — 100-tools`, template: "%s — 100-tools" },
  description: homeSeo.description,
  applicationName: "100-tools",
  robots: {
    index: siteConfig.indexable,
    follow: true,
    googleBot: { index: siteConfig.indexable, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <NavigationProgress />
        <header className="site-header">
          <div className="site-container header-inner">
            <Link href="/" aria-label="100-tools 首页"><Brand /></Link>
            <nav className="header-nav" aria-label="主导航">
              <Link href="/#tool-library">工具目录</Link>
              <Link href="/#browse-categories" className="header-categories">分类探索</Link>
              <a href="https://github.com/ngd-b/100-tools" target="_blank" rel="noopener noreferrer" className="header-github" aria-label="在 GitHub 查看源代码"><Code2 className="size-4" aria-hidden="true" /><span>开源项目</span><ArrowUpRight className="hidden size-3 sm:block" aria-hidden="true" /></a>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
