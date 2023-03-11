import { axioInstance } from "lib";

export const checkUsernameAvailability = async (username: string) => {
  const { data } = await axioInstance.get(`usernameAvailable?username=${username}`);
  return data;
};

export const onboardUser = async (data: {
  username: string;
  name: string;
  gender: string;
  about: string;
  location: string;
  twitter: string;
  instagram: string;
  facebook: string;
}) => {
  const { data: responseData } = await axioInstance.post("onboarding", data);
  return responseData;
};
