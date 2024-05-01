/**
 * @file: axios.ts
 * @description: Axios instance for NextJS client side code. This must be used in client side only.
 * This is used to make API calls to NextJS API routes.
 */

import axios from "axios";
import { StatusCodes } from "http-status-codes";

import { INVALID_CREDENTIALS_MSG } from "@votewise/lib/constants";

const { UNAUTHORIZED } = StatusCodes;

/**
 * @description: Axios instance for NextJS client side code. This must be used in client side only.
 * This is used to make API calls to NextJS API routes. Don't make API calls to the backend server using this instance.
 */
export const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response.status === UNAUTHORIZED) {
      if (error.response.data.message === INVALID_CREDENTIALS_MSG) {
        return Promise.reject(error);
      }
      window.location.href = "/signin";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
