import axios from "axios";
import httpStatusCodes from "http-status-codes";

import { useRouter } from "next/router";

const { UNAUTHORIZED } = httpStatusCodes;

export const axioInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axioInstance.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response.status === UNAUTHORIZED) {
      const router = useRouter();
      router.push("/signin");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
