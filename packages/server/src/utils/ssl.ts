import fs from "fs";
import path from "path";

import env from "@/src/env";

function safeReadFile(file: string) {
  try {
    return fs.readFileSync(path.normalize(`${__dirname}/../../../${file}`));
  } catch (err) {
    return undefined;
  }
}

export function getSSL() {
  try {
    const key =
      (env.SSL_KEY ? Buffer.from(env.SSL_KEY, "base64").toString("ascii") : undefined) ||
      safeReadFile("private.key") ||
      safeReadFile("private.pem") ||
      safeReadFile("src/configs/certs/private.key");
    const cert =
      (env.SSL_CERT ? Buffer.from(env.SSL_CERT, "base64").toString("ascii") : undefined) ||
      safeReadFile("public.crt") ||
      safeReadFile("public.pem") ||
      safeReadFile("src/configs/certs/public.crt");
    return {
      key,
      cert,
    };
  } catch (err) {
    return {
      key: undefined,
      cert: undefined,
    };
  }
}
