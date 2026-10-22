import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/Brand";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-inner">
        <Link href="/" aria-label="100-tools 首页"><Brand compact /></Link>
        <p>免费在线工具，给日常多一点从容。</p>
        <a href="https://hboot.fun" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">Made by hboot <ArrowUpRight className="size-3" aria-hidden="true" /></a>
      </div>
    </footer>
  );
}
