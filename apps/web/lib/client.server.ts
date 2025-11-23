import { headers } from "next/headers";

import { Auth } from "@votewise/client/auth";
import { Comment } from "@votewise/client/comment";
import { Feed } from "@votewise/client/feed";
import { Group } from "@votewise/client/group";
import { MFA } from "@votewise/client/mfa";
import { Notification } from "@votewise/client/notification";
import { Onboard } from "@votewise/client/onboard";
import { Search } from "@votewise/client/search";
import { Client } from "@votewise/client/server";
import { Trending } from "@votewise/client/trending";
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

export function getCommentClient() {
  const client = getClient();
  return new Comment({ client });
}

export function getGroupClient() {
  const client = getClient();
  return new Group({ client });
}

export function getNotificationClient() {
  const client = getClient();
  return new Notification({ client });
}

export function getSearchClient() {
  const client = getClient();
  return new Search({ client });
}

export function getTrendingClient() {
  const client = getClient();
  return new Trending({ client });
}
