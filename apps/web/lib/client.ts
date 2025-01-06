import { Client } from "@votewise/client/client";
import { uploadClientFactory } from "@votewise/client/upload";

export const client = new Client();
export const uploadClient = uploadClientFactory();
