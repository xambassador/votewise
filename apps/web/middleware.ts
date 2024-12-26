import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { routes } from "./lib/routes";

export function middleware(request: NextRequest) {
  const nextUrl = request.nextUrl;
  const isLogoutRoute = nextUrl.pathname.includes(routes.auth.logout());
  if (isLogoutRoute) {
    const url = nextUrl.clone();
    url.pathname = routes.auth.signIn();
    const response = NextResponse.redirect(url);
    request.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, "", { expires: new Date(0) });
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"]
};
