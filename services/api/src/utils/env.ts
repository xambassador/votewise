import { validateEnv } from "@votewise/lib/environment";

export function checkEnv(env: unknown) {
  try {
    const environment = validateEnv(env);
    return environment;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return process.exit(1);
  }
}
