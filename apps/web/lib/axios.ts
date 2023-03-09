import axios from "axios";

export const axioInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
