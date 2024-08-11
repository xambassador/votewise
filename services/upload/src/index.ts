import "dotenv/config";

import { AppHeaders, Cors, ServerConfig } from "@/config";

import { environment } from "@votewise/lib/environment";

import { Server } from "@/http/server";

const cors = new Cors({ origin: "*" });
const appHeaders = new AppHeaders();
const cfg = new ServerConfig({
  hostname: "",
  cors,
  appHeaders,
  publicUrl: environment.VOTEWISE_BUCKET_URL,
  port: environment.VOTEWISE_BUCKET_PORT,
  devMode: environment.NODE_ENV === "development",
  blobUploadLimit: 100 * 1024 * 1024 // 100 MB
});

async function bootstrap() {
  const server = await Server.create({ cfg });
  await server.start();
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
