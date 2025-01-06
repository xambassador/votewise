import { Client } from ".";

export function uploadClientFactory() {
  const client = new Client({ url: "/votewise-bucket/api" });
  return client;
}
