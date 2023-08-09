import cookie from "cookie";
import type { GetServerSidePropsContext, NextApiResponse } from "next";

const tokenKey = process.env.COOKIE_ACCESS_TOKEN_KEY;
const refreshTokenKey = process.env.COOKIE_REFRESH_TOKEN_KEY;

/**
 * Clear cookies from response
 */
export function clearCookies(res: GetServerSidePropsContext["res"] | NextApiResponse) {
  res.setHeader("Set-Cookie", [
    cookie.serialize(tokenKey as string, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    }),
    cookie.serialize(refreshTokenKey as string, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    }),
  ]);
}
