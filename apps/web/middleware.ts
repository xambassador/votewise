import { NextResponse } from "next/server";

export async function middleware() {
  // const cookies = req.cookies.get("saraword_user_id");
  // const isTokenAvailable = cookies?.value;

  NextResponse.next();
}
