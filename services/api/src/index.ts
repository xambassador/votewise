import "dotenv/config";

import { environment } from "@votewise/lib/environment";

import { Server } from "@/http/server";

import { Cors, JWT, ServerConfig, ServerSecrets } from "./configs";

const cors = new Cors({ origin: "*" });
const jwt = new JWT({ accessTokenExpiration: "15m", refreshTokenExpiration: "7d" });
const cfg = new ServerConfig({
  hostname: "",
  jwt,
  cors,
  publicUrl: environment.VOTEWISE_API_URL,
  port: environment.VOTEWISE_API_PORT,
  devMode: environment.NODE_ENV === "development",
  blobUploadLimit: 10 * 1024 * 1024, // 10 MB. TODO: Move to env
  appUrl: environment.VOTEWISE_APP_URL,
  bucketUrl: environment.VOTEWISE_BUCKET_URL
});
const secrets = new ServerSecrets({
  cronSecret: environment.CRON_SECRET,
  jwtSecret: environment.ACCESS_TOKEN_SECRET,
  jwtRefreshSecret: environment.REFRESH_TOKEN_SECRET
});

async function bootstrap() {
  const server = await Server.create({ cfg, secrets });
  await server.start();
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
