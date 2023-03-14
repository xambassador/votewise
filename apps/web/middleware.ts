import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const { COOKIE_IS_ONBOARDED_KEY } = process.env;

export async function middleware(req: NextRequest) {
  const isOnboarded = req.cookies.get(COOKIE_IS_ONBOARDED_KEY as string);
  if (isOnboarded && isOnboarded.value === "true" && req.nextUrl.pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    (isOnboarded && isOnboarded.value === "false" && req.nextUrl.pathname !== "/onboarding") ||
    !isOnboarded
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
}
