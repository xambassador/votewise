import { headers } from "next/headers";

import { Auth } from "@votewise/client/auth";
import { Onboard } from "@votewise/client/onboard";
import { Client } from "@votewise/client/server";

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

export function getAuth() {
  const client = getClient();
  return new Auth({ client });
}

export function getOnboard() {
  const client = getClient();
  return new Onboard({ client });
}
