import jsonwebtoken from "jsonwebtoken";

const secret = process.env.JWT_SALT_ACCESS_TOKEN_SECRET;

/**
 * @description Decode JWT Access token
 * @param token Access token
 * @returns
 */
export function decodeJwt(token: string) {
  const decoded = jsonwebtoken.verify(token, secret as string);
  return decoded as { userId: number };
}
