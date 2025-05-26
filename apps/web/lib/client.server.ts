import { headers } from "next/headers";

import { Auth } from "@votewise/client/auth";
import { Feed } from "@votewise/client/feed";
import { MFA } from "@votewise/client/mfa";
import { Onboard } from "@votewise/client/onboard";
import { Client } from "@votewise/client/server";
import { User } from "@votewise/client/user";

import { clearCookie, getCookie, setCookie } from "./cookie";

export function getClient() {
  return new Client({
    storage: {
      set: setCookie,
      get: getCookie,
      remove: clearCookie
    },
    headersFactory() {
      const headersList = headers();
      const headersRecord: Record<string, string> = {};
      headersList.forEach((value, key) => {
        headersRecord[key] = value;
      });
      return headersRecord;
    }
  });
}

export function getAuthClient() {
  const client = getClient();
  return new Auth({ client });
}

export function getOnboardClient() {
  const client = getClient();
  return new Onboard({ client });
}

export function getMFAClient() {
  const client = getClient();
  return new MFA({ client });
}

export function getFeedClient() {
  const client = getClient();
  return new Feed({ client });
}

export function getUserClient() {
  const client = getClient();
  return new User({ client });
}
