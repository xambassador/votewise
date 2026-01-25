import { Client } from "@votewise/client/client";
import { Comment } from "@votewise/client/comment";
import { Feed } from "@votewise/client/feed";
import { Follow } from "@votewise/client/follow";
import { Group } from "@votewise/client/group";
import { Notification } from "@votewise/client/notification";
import { Onboard } from "@votewise/client/onboard";
import { Search } from "@votewise/client/search";
import { Trending } from "@votewise/client/trending";
import { uploadClientFactory } from "@votewise/client/upload";
import { User } from "@votewise/client/user";

const isSandbox = (process.env.NEXT_PUBLIC_IS_SANDBOX as unknown as string) === "true";
export const client = new Client({ isSandbox });
export const feedClient = new Feed({ client });
export const onboardClient = new Onboard({ client });
export const commentClient = new Comment({ client });
export const followClient = new Follow({ client });
export const groupClient = new Group({ client });
export const userClient = new User({ client });
export const notificationClient = new Notification({ client });
export const searchClient = new Search({ client });
export const trendingClient = new Trending({ client });
export const uploadClient = uploadClientFactory({
  isSandbox,
  bucketName: process.env.NEXT_PUBLIC_VOTEWISE_BUCKET_NAME
});
