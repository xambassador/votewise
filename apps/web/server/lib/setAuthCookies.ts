import cookie from "cookie";
import type { GetServerSidePropsContext, NextApiResponse } from "next";

const tokenKey = process.env.COOKIE_ACCESS_TOKEN_KEY;
const refreshTokenKey = process.env.COOKIE_REFRESH_TOKEN_KEY;

/**
 * Set auth cookies to response
 * @param res NextApiResponse
 */
export function setAuthCookies(
  res: GetServerSidePropsContext["res"] | NextApiResponse,
  {
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }
) {
  res.setHeader("Set-Cookie", [
    cookie.serialize(tokenKey as string, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    }),
    cookie.serialize(refreshTokenKey as string, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    }),
  ]);
}
