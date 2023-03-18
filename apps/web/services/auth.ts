import { axioInstance } from "lib/axios";

/**
 * @description Sign out user
 */
export const signout = async () => {
  const response = await axioInstance.post("/signout");
  return response.data;
};
