import jsonwebtoken from "jsonwebtoken";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

const secret = process.env.JWT_SALT_ACCESS_TOKEN_SECRET;

if (!secret) {
  throw new Error("JWT_SALT_ACCESS_TOKEN_SECRET is not defined");
}

// This should be run on the server side only. It will not work on the client side as env variable is not available on client.
export const getServerSession = (options: {
  req: NextApiRequest | GetServerSidePropsContext["req"];
  res: NextApiResponse | GetServerSidePropsContext["res"];
}): { userId: number } | null => {
  const { req } = options;
  const { cookies } = req;
  // TODO: replace cookie key with env variable
  if (cookies && cookies["votewise-utoken"]) {
    const token = cookies["votewise-utoken"];
    try {
      const decoded = jsonwebtoken.verify(token, secret as string);
      return decoded as { userId: number };
    } catch (err) {
      return null;
    }
  }
  return null;
};
