import { Client } from "@votewise/client/client";
import { Comment } from "@votewise/client/comment";
import { Feed } from "@votewise/client/feed";
import { Onboard } from "@votewise/client/onboard";
import { uploadClientFactory } from "@votewise/client/upload";

export const client = new Client();
export const feedClient = new Feed({ client });
export const onboardClinet = new Onboard({ client });
export const commentClient = new Comment({ client });
export const uploadClient = uploadClientFactory(process.env.NEXT_PUBLIC_VOTEWISE_BUCKET_NAME);
