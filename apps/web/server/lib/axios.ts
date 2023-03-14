import axios from "axios";

import { logger } from "@votewise/lib/logger";

export const axiosServerInstance = axios.create({
  baseURL: `${process.env.BACKEND_URL}`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const getAxiosServerWithAuth = (token: string) => {
  axiosServerInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  return axiosServerInstance;
};

axiosServerInstance.interceptors.request.use((config) => {
  logger(`====> Request: ${config.method} ${config.url} ${JSON.stringify(config.data)}`);
  return config;
});
