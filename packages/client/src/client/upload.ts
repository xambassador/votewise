import { Client } from ".";
import { env } from "../utils";

export function uploadClientFactory(bucketName?: string) {
  const bucket = bucketName || env.VOTEWISE_BUCKET_NAME;
  if (!bucket) throw new Error("No bucket name provided");
  const client = new Client({ url: `/${bucket}/api` });
  return client;
}
