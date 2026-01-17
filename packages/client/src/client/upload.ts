import { environment } from "@votewise/env";

import { Client } from ".";

export function uploadClientFactory(opts?: { bucketName?: string; isSandbox?: boolean }) {
  const bucket = opts?.bucketName || environment.VOTEWISE_BUCKET_NAME;
  if (!bucket) throw new Error("No bucket name provided");
  const client = new Client({ url: `/${bucket}/api`, isSandbox: opts?.isSandbox });
  return client;
}
