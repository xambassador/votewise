import { axiosInstance } from "lib/axios";

/**
 * Sign out user
 */
export const signout = async () => {
  const response = await axiosInstance.post("/auth/signout");
  return response.data;
};
