import cookie from "cookie";

import type { NextApiRequest, NextApiResponse } from "next";

const { COOKIE_ACCESS_TOKEN_KEY, COOKIE_REFRESH_TOKEN_KEY } = process.env;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", [
    cookie.serialize(COOKIE_ACCESS_TOKEN_KEY as string, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    }),
    cookie.serialize(COOKIE_REFRESH_TOKEN_KEY as string, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    }),
  ]);

  res.status(200).json({ message: "Signed out" });
}
