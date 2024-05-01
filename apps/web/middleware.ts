import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

const { COOKIE_IS_ONBOARDED_KEY } = process.env;

const routesWithOnboarding = ["/"];

export async function middleware(req: NextRequest) {
  const isOnboarded = req.cookies.get(COOKIE_IS_ONBOARDED_KEY as string)?.value;
  if (isOnboarded === "false" && routesWithOnboarding.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
}
