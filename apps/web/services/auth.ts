import { axioInstance } from "lib/axios";

/**
 * @description Sign out user
 */
export const signout = async () => {
  const response = await axioInstance.post("/auth/signout");
  return response.data;
};
