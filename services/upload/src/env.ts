import { validateEnv } from "@votewise/lib/environment";

export function checkEnv(env: unknown) {
  try {
    const environment = validateEnv(env);
    return environment;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return process.exit(1);
  }
}
