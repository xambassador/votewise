import type { Request } from "express";
import type { IncomingMessage } from "http";

import { parse } from "cookie";
import { signedCookie } from "cookie-parser";

import { COOKIE_KEYS } from "@votewise/constant";
import { AuthenticationError } from "@votewise/errors";

export function getAuthorizationToken(req: Request) {
  const signedCookie = req.signedCookies;
  if (signedCookie && signedCookie[COOKIE_KEYS.accessToken]) {
    return signedCookie[COOKIE_KEYS.accessToken];
  }

  const authorization = req.headers.authorization;
  if (!authorization) {
    throw new AuthenticationError("Authorization header is missing");
  }

  const [prefix, token] = authorization.split(" ");

  if (prefix !== "Bearer" && prefix !== "Votewise") {
    throw new AuthenticationError("Invalid authorization header");
  }

  if (!token) {
    throw new AuthenticationError("Token is missing");
  }

  return token;
}

export function getAuthorizationTokenFromIncomingMessage(req: IncomingMessage, secret: string) {
  const cookieHeader = req.headers.cookie;
  const cookies = cookieHeader ? parse(cookieHeader) : null;
  if (!cookies) {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return null;
    }
    const [prefix, authToken] = authorization.split(" ");
    if (prefix !== "Bearer" && prefix !== "Votewise") {
      return null;
    }
    if (!authToken) {
      return null;
    }
    return authToken;
  }

  const signedAccessToken = cookies[COOKIE_KEYS.accessToken];
  if (!signedAccessToken) return null;
  const accessToken = signedCookie(signedAccessToken, secret);
  if (!accessToken) return null;
  return accessToken;
}
