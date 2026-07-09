import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const adminPaths = ["/admin"];
const learnerPaths = ["/dashboard"];
const orgPaths = ["/org"];

type TokenRole = "LEARNER" | "ADMIN" | "ORG_ADMIN";

function isSecureRequest(request: NextRequest) {
  return (
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https"
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = routing.locales.find((l) => pathname.startsWith(`/${l}/`)) ?? "fr";
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const isAdminRoute = adminPaths.some((p) => pathWithoutLocale.startsWith(p));
  const isLearnerRoute = learnerPaths.some((p) => pathWithoutLocale.startsWith(p));
  const isOrgRoute = orgPaths.some((p) => pathWithoutLocale.startsWith(p));

  if (isAdminRoute || isLearnerRoute || isOrgRoute) {
    const secure = isSecureRequest(request);
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: secure,
    });

    if (!token) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role as TokenRole | undefined;

    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
    if (isOrgRoute && role !== "ORG_ADMIN" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
