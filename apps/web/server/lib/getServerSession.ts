import jsonwebtoken from "jsonwebtoken";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

const secret = process.env.JWT_SALT_ACCESS_TOKEN_SECRET;
const tokenKey = process.env.COOKIE_ACCESS_TOKEN_KEY;
const refreshTokenKey = process.env.COOKIE_REFRESH_TOKEN_KEY;

if (!secret || !tokenKey || !refreshTokenKey) {
  throw new Error("ENV variables not set");
}

// This should be run on the server side only. It will not work on the client side as env variable is not available on client.
export const getServerSession = (options: {
  req: NextApiRequest | GetServerSidePropsContext["req"];
  res: NextApiResponse | GetServerSidePropsContext["res"];
}): { userId: number } | null => {
  const { req } = options;
  const { cookies } = req;
  // TODO: replace cookie key with env variable
  if (cookies && cookies[tokenKey as string]) {
    const token = cookies[tokenKey as string] as string;
    try {
      const decoded = jsonwebtoken.verify(token, secret as string);
      return decoded as { userId: number };
    } catch (err: any) {
      const msg = err.message;
      if (msg === "jwt expired") {
        // TODO: Refresh token
      }
      return null;
    }
  }
  return null;
};
