/**
 * @file: axios.ts
 * @description: Axios instance for NextJS client side code. This must be used in client side only.
 * This is used to make API calls to NextJS API routes.
 */
import axios from "axios";
import httpStatusCodes from "http-status-codes";

import { useRouter } from "next/router";

const { UNAUTHORIZED } = httpStatusCodes;

/**
 * @description: Axios instance for NextJS client side code. This must be used in client side only.
 * This is used to make API calls to NextJS API routes. Don't make API calls to the backend server using this instance.
 */
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
