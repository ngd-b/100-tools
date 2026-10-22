import { NavigationLink as Link } from "@/components/NavigationLink";

export default function NotFound() {
  return <div className="mx-auto max-w-xl px-6 py-16 text-center"><h1 className="mb-3 text-2xl font-bold">没有找到这个工具</h1><p className="mb-6 text-sm text-gray-500">链接可能有误，请从工具目录查找。</p><Link href="/" className="btn btn-primary">返回工具目录</Link></div>;
}
