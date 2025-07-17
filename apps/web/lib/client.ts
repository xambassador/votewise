import { Client } from "@votewise/client/client";
import { Comment } from "@votewise/client/comment";
import { Feed } from "@votewise/client/feed";
import { Follow } from "@votewise/client/follow";
import { Onboard } from "@votewise/client/onboard";
import { uploadClientFactory } from "@votewise/client/upload";

export const client = new Client();
export const feedClient = new Feed({ client });
export const onboardClient = new Onboard({ client });
export const commentClient = new Comment({ client });
export const followClient = new Follow({ client });
// TODO: Move NEXT_PUBLIC_VOTEWISE_BUCKET_NAME to env package
export const uploadClient = uploadClientFactory(process.env.NEXT_PUBLIC_VOTEWISE_BUCKET_NAME);
