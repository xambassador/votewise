import { headers } from "next/headers";

import { Auth } from "@votewise/client/auth";
import { Client } from "@votewise/client/server";

import { clearCookie, getCookie, setCookie } from "./cookie";

export const client = new Client({
  storage: {
    set(key, value, options) {
      setCookie(key, value, options);
    },
    get(key) {
      return getCookie(key);
    },
    remove(key) {
      clearCookie(key);
    }
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
export const auth = new Auth({ client });
