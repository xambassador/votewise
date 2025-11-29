import "server-only";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { cookies } from "next/headers";
import { parse } from "cookie";
import { signedCookie } from "cookie-parser";

import { symmetricDecrypt, symmetricEncrypt } from "@votewise/crypto";
import { environment } from "@votewise/env";

export const COOKIE_KEYS = {
  userId: "__votewise_uid",
  verificationCode: "__votewise_vcode",
  email: "__votewise_email",
  flash: "__votewise_flash_message",
  accessToken: "__votewise_access_token",
  refreshToken: "__votewise_refresh_token",
  onboard: "__votewise_onboard",
  isOnboarded: "__votewise_is_onboarded",
  challengeId: "__votewise_challenge_id",
  factorId: "__votewise_factor_id"
};

export function getCookie(name: string): string | null {
  const cookieStore = cookies();
  const cookie = cookieStore.get(name);
  if (!cookie) return null;
  if (!cookie.value) return null;
  if ([COOKIE_KEYS.accessToken, COOKIE_KEYS.refreshToken].includes(name)) {
    const v = signedCookie(cookie.value, environment.API_COOKIE_SECRET);
    if (!v) return null;
    return v;
  }
  return symmetricDecrypt(cookie.value, environment.APP_COOKIE_SECRET);
}

export function setCookie(name: string, value: string, options?: Partial<ResponseCookie>) {
  const cookieStore = cookies();
  const encryptedValue = symmetricEncrypt(value, environment.APP_COOKIE_SECRET);
  cookieStore.set(name, encryptedValue, {
    path: "/",
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: "strict",
    httpOnly: environment.NODE_ENV === "production",
    ...options
  });
}

export function clearAllCookies(list: string[] = []) {
  const cookieStore = cookies();
  if (list.length > 0) {
    cookieStore.getAll().forEach((cookie) => {
      if (list.includes(cookie.name) && !cookie.name.includes(COOKIE_KEYS.flash)) {
        cookieStore.delete(cookie.name);
      }
    });
    return;
  }
  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name.includes(COOKIE_KEYS.flash)) return;
    cookieStore.delete(cookie.name);
  });
}

export function clearCookie(name: string) {
  const cookieStore = cookies();
  cookieStore.delete(name);
}

export function getFlashMessage() {
  const flash = getCookie(COOKIE_KEYS.flash);
  if (!flash) return null;
  try {
    const data = JSON.parse(flash) as { title: string; message: string; type: string };
    return data;
  } catch (err) {
    return null;
  }
}

export function setFlashMessage(title: string, message: string, type: "success" | "error") {
  setCookie(COOKIE_KEYS.flash, JSON.stringify({ title, message, type }));
}

const knownCookies = Object.values(COOKIE_KEYS);

export function forwardCookie(header: Record<string, string | string[]> = {}) {
  const cookieHeader = header["set-cookie"];
  if (!cookieHeader) return;
  const cookieStore = cookies();
  if (Array.isArray(cookieHeader)) {
    cookieHeader.forEach((cookie) => {
      const parsed = parse(cookie);
      const options = {} as Partial<ResponseCookie>;
      Object.keys(parsed).forEach((key) => {
        if (knownCookies.includes(key)) {
          const value = parsed[key] || "";
          if (parsed.SameSite) {
            options.sameSite = parsed.SameSite as "strict" | "lax" | "none";
          }

          if (parsed.Path) {
            options.path = parsed.Path;
          }

          if (parsed.Expires) {
            options.expires = new Date(parsed.Expires);
          }

          if (parsed.Domain) {
            options.domain = parsed.Domain;
          }

          if (parsed.Secure) {
            options.secure = true;
          }

          cookieStore.set(key, value, {
            secure: environment.NODE_ENV === "production",
            httpOnly: environment.NODE_ENV === "production",
            ...options
          });
        }
      });
    });
  }
}
