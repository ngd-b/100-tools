import { NextResponse, type NextRequest } from "next/server";
import { detectLocale, isLocale, localePath, LOCALE_COOKIE } from "@/lib/i18n/locale";

export function proxy(request: NextRequest) {
  if (isLocale(request.nextUrl.pathname.split("/")[1])) return NextResponse.next();
  const locale = detectLocale(request.headers.get("accept-language"), request.cookies.get(LOCALE_COOKIE)?.value);
  const url = request.nextUrl.clone();
  url.pathname = localePath(url.pathname, locale);
  const response = NextResponse.redirect(url);
  response.headers.set("Vary", "Accept-Language, Cookie");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|opengraph-image|.*\\..*).*)"],
};
