import { NextResponse } from "next/server";
import { clearCookie, COOKIE_KEYS } from "@/lib/cookie";

export async function GET() {
  clearCookie(COOKIE_KEYS.flash);
  return NextResponse.json({ message: "Ok" });
}
