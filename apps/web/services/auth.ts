import { axiosInstance } from "lib/axios";

/**
 * @description Sign out user
 */
export const signout = async () => {
  const response = await axiosInstance.post("/auth/signout");
  return response.data;
};
