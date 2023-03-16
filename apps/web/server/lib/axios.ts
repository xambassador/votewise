/**
 * @file: axios.ts
 * @description: Axios instance for NextJS API routes and server side code. This must be used in server side only.
 * This is used to make API calls to the backend server.
 *
 */
import axios from "axios";

import { logger } from "@votewise/lib/logger";

/**
 * @description: Axios instance for NextJS API routes and server side code. This must be used in server side only.
 * This is used to make API calls to the backend server. Don't make API calls to NextJS API routes using this instance.
 */
export const axiosServerInstance = axios.create({
  baseURL: `${process.env.BACKEND_URL}`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 *
 * @param token JWT token
 * @returns Axios instance with Authorization header set
 */
export const getAxiosServerWithAuth = (token: string) => {
  axiosServerInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  return axiosServerInstance;
};

axiosServerInstance.interceptors.request.use((config) => {
  logger(`====> Request: ${config.method} ${config.url} Body payload:====> ${JSON.stringify(config.data)}`);
  return config;
});
