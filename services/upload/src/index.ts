import "dotenv/config";

import { environment } from "@votewise/env";

import { AppHeaders, Cors, ServerConfig } from "@/config";
import { Server } from "@/http/server";

const cors = new Cors({ origin: "*" });
const appHeaders = new AppHeaders();
const cfg = new ServerConfig({
  hostname: "",
  cors,
  appHeaders,
  uploadBucket: "uploads",
  avatarBucket: "avatars",
  backgroundsBucket: "backgrounds",
  publicUrl: environment.VOTEWISE_BUCKET_URL,
  port: environment.VOTEWISE_BUCKET_PORT,
  devMode: environment.NODE_ENV === "development",
  blobUploadLimit: 100 * 1024 * 1024, // 100 MB
  imageCacheTTL: environment.IMAGE_CACHE_TTL
});

async function bootstrap() {
  const server = await Server.create({ cfg });
  await server.start();
  server.ctx.logger.logSync(`Votewise upload server is running on port ${cfg.port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
