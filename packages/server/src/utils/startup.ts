import chalk from "chalk";

import env from "@/src/env";

import Logger from "@votewise/lib/logger";

export async function checkEnv() {
  await env.validate().then((errors) => {
    if (errors.length > 0) {
      Logger.warn("Environment configuration is invalid, please check the following:\n\n");

      // eslint-disable-next-line no-restricted-syntax
      for (const error of errors) {
        Logger.warn(
          "- ",
          Object.values(error.constraints ?? {}).join(", ") as unknown as Record<string, unknown>
        );
      }

      process.exit(1);
    }
  });

  if (env.ENVIRONMENT === "development") {
    Logger.warn(
      `Running ${env.APP_NAME} in ${chalk.bold("development mode")}. To run ${chalk.bold(
        env.APP_NAME
      )} in production mode, set the ${chalk.bold("NODE_ENV")} env variable to ${chalk.bold("production")}.`
    );
  }
}
