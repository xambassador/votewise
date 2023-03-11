import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const isTokenAvailable = req.cookies.get("votewise-utoken")?.value;

  if (isTokenAvailable && (req.nextUrl.pathname === "/signin" || req.nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
