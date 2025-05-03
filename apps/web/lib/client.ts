import { Client } from "@votewise/client/client";
import { uploadClientFactory } from "@votewise/client/upload";

export const client = new Client();
export const uploadClient = uploadClientFactory(process.env.NEXT_PUBLIC_VOTEWISE_BUCKET_NAME);
