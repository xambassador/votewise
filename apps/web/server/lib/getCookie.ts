import type { GetServerSidePropsContext, NextApiRequest } from "next";

const { COOKIE_ACCESS_TOKEN_KEY, COOKIE_REFRESH_TOKEN_KEY, COOKIE_IS_ONBOARDED_KEY } = process.env;

export function getCookie(
  req: NextApiRequest | GetServerSidePropsContext["req"],
  key: "ACCESS_TOKEN" | "REFRESH_TOKEN" | "IS_ONBOARDED"
) {
  const { cookies } = req;

  if (!cookies) {
    return null;
  }

  switch (key) {
    case "ACCESS_TOKEN":
      return cookies[COOKIE_ACCESS_TOKEN_KEY as string];
    case "REFRESH_TOKEN":
      return cookies[COOKIE_REFRESH_TOKEN_KEY as string];
    case "IS_ONBOARDED":
      return cookies[COOKIE_IS_ONBOARDED_KEY as string];
    default:
      throw new Error("Invalid key");
  }
}
