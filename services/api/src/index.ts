/* eslint-disable no-console */
import "dotenv/config";

import chalk from "chalk";

import { migrateToLatest } from "@votewise/db/migrator";
import { environment } from "@votewise/env";
import { Day, Minute } from "@votewise/times";

import { Server } from "@/http/server";

import { Cors, JWT, ServerConfig, ServerSecrets } from "./configs";

const cors = new Cors({ origin: "*" });
const jwt = new JWT({ accessTokenExpiration: Day * 7, refreshTokenExpiration: Minute * 60 * 24 * 7 });
const cfg = new ServerConfig({
  hostname: "",
  jwt,
  cors,
  publicUrl: environment.VOTEWISE_API_URL,
  port: environment.VOTEWISE_API_PORT,
  devMode: environment.NODE_ENV === "development",
  blobUploadLimit: environment.BLOB_UPLOAD_LIMIT,
  appUrl: environment.VOTEWISE_APP_URL,
  bucketUrl: environment.VOTEWISE_BUCKET_URL,
  appName: environment.APP_NAME,
  avatarsBucket: environment.AVATAR_BUCKET_NAME,
  backgroundsBucket: environment.BACKGROUND_BUCKET_NAME,
  uploadBucket: environment.UPLOAD_BUCKET_NAME,
  isSandboxMode: environment.IS_SANDBOX
});
const secrets = new ServerSecrets({
  cronSecret: environment.CRON_SECRET,
  jwtSecret: environment.ACCESS_TOKEN_SECRET,
  jwtRefreshSecret: environment.REFRESH_TOKEN_SECRET
});

async function bootstrap() {
  if (environment.NODE_ENV === "production") {
    console.log(chalk.blue("Checking pending database migrations..."));
    const { error, results } = await migrateToLatest(environment.DATABASE_URL);
    if (error) {
      console.error(chalk.red("Database migration failed:"), error);
      throw error;
    }
    results?.forEach((result) => {
      if (result.status === "Success") {
        console.log(chalk.green(`- Migrated: ${result.migrationName}`));
      }
      if (result.status === "Error") {
        console.error(chalk.red(`- Migration failed: ${result.migrationName}`));
      }
    });
    console.log(chalk.blue("Database migrations checked.\n"));
  }

  const server = await Server.create({ cfg, secrets });
  await server.start();
  server.ctx.logger.logSync(chalk.blue("Press Ctrl+C to shutdown Votewise API\n\n"));
  server.ctx.logger.logSync(`Votewise API is running on port ${cfg.port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
