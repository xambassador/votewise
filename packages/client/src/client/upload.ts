import { environment } from "@votewise/env";

import { Client } from ".";

export function uploadClientFactory(bucketName?: string) {
  const bucket = bucketName || environment.VOTEWISE_BUCKET_NAME;
  if (!bucket) throw new Error("No bucket name provided");
  const client = new Client({ url: `/${bucket}/api` });
  return client;
}
