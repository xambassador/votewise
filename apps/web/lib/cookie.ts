import "server-only";

import type { SigninResponse } from "@votewise/client/auth";
import type { TOnboard } from "@votewise/schemas/onboard";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { cookies } from "next/headers";

import { symmetricDecrypt, symmetricEncrypt } from "@votewise/crypto";
import { environment } from "@votewise/env";

export const COOKIE_KEYS = {
  userId: "__votewise_uid",
  verificationCode: "__votewise_vcode",
  email: "__votewise_email",
  flash: "__votewise_flash_message",
  accessToken: "__votewise_access_token",
  refreshToken: "__votewise_refresh_token",
  user: "__votewise_user",
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
      if (list.includes(cookie.name)) {
        cookieStore.delete(cookie.name);
      }
    });
    return;
  }
  cookieStore.getAll().forEach((cookie) => {
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

export function getOnboardingData() {
  const onboardData = getCookie(COOKIE_KEYS.onboard);
  if (!onboardData) return null;
  try {
    const data = JSON.parse(onboardData) as TOnboard;
    return data;
  } catch (err) {
    return null;
  }
}

export function setOnboardingData(data: Partial<TOnboard>) {
  const onboardData = getOnboardingData() || {};
  const updatedData = { ...onboardData, ...data };
  setCookie(COOKIE_KEYS.onboard, JSON.stringify(updatedData));
}

export function getUser() {
  const user = getCookie(COOKIE_KEYS.user);
  if (!user) return null;
  try {
    const data = JSON.parse(user) as SigninResponse;
    return data;
  } catch (err) {
    return null;
  }
}
