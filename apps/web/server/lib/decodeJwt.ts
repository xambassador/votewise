import jsonwebtoken from "jsonwebtoken";

const secret = process.env.JWT_SALT_ACCESS_TOKEN_SECRET;

/**
 * Decode JWT Access token
 * @param token Access token
 */
export function decodeJwt(token: string) {
  const decoded = jsonwebtoken.verify(token, secret as string);
  return decoded as { userId: number };
}
