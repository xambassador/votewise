import chalk from "chalk";

import logger from "@votewise/lib/logger";

import env from "@/infra/env";

export async function checkEnv() {
  await env.validate().then((errors) => {
    if (errors.length > 0) {
      logger.warn("Environment configuration is invalid, please check the following:\n\n");

      for (const error of errors) {
        const values = Object.values(error.constraints ?? {}).join(", ") as unknown as Record<
          string,
          unknown
        >;
        logger.warn(values.toString());
      }

      process.exit(1);
    }
  });

  if (env.ENVIRONMENT === "development") {
    logger.warn(
      `Running ${env.APP_NAME} in ${chalk.bold("development mode")}. To run ${chalk.bold(
        env.APP_NAME
      )} in production mode, set the ${chalk.bold("NODE_ENV")} env variable to ${chalk.bold("production")}.`
    );
  }
}
