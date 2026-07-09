import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const adminPaths = ["/admin"];
const learnerPaths = ["/dashboard"];
const orgPaths = ["/org"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = routing.locales.find((l) => pathname.startsWith(`/${l}/`)) ?? "fr";
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const isAdminRoute = adminPaths.some((p) => pathWithoutLocale.startsWith(p));
  const isLearnerRoute = learnerPaths.some((p) => pathWithoutLocale.startsWith(p));
  const isOrgRoute = orgPaths.some((p) => pathWithoutLocale.startsWith(p));

  if (isAdminRoute || isLearnerRoute || isOrgRoute) {
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAdminRoute && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
    if (isOrgRoute && session.user.role !== "ORG_ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
