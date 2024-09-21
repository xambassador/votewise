import fs from "fs";
import path from "path";

import { environment } from "@votewise/env";

function safeReadFile(file: string) {
  try {
    return fs.readFileSync(path.normalize(`${__dirname}/../../../${file}`));
  } catch (err) {
    return undefined;
  }
}

function getSSLFromEnvironment() {
  try {
    const key =
      (environment.SSL_KEY ? Buffer.from(environment.SSL_KEY, "base64").toString("ascii") : undefined) ||
      safeReadFile("private.key") ||
      safeReadFile("private.pem") ||
      safeReadFile("src/configs/certs/private.key");
    const cert =
      (environment.SSL_CERT ? Buffer.from(environment.SSL_CERT, "base64").toString("ascii") : undefined) ||
      safeReadFile("public.crt") ||
      safeReadFile("public.pem") ||
      safeReadFile("src/configs/certs/public.crt");
    return {
      key,
      cert
    };
  } catch (err) {
    return {
      key: undefined,
      cert: undefined
    };
  }
}

export function getSSL(ots?: { key: string; cert: string }) {
  const { key, cert } = ots || getSSLFromEnvironment();
  return key && cert ? { key, cert } : { key: undefined, cert: undefined };
}
