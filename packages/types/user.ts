type AcceptOrRejectFriendRequestPayload = {
  requestId: number;
  type: "ACCEPT" | "REJECT";
};

type UsernameAvailableResponse = {
  success: boolean;
  message: string;
  data: {
    username: string;
    message: string;
  };
  error: null;
};

type MyDetailsResponse = {
  success: boolean;
  message: string;
  data: {
    message: string;
    user: {
      id: number;
      username: string;
      about: string;
      cover_image: string;
      profile_image: string;
      name: string;
      email: string;
      facebook: string;
      instagram: string;
      twitter: string;
      updated_at: string;
      last_login: Date;
      created_at: Date;
      location: string;
      is_email_verify: boolean;
      gender: "MALE" | "FEMALE" | "OTHER";
      followers: number;
      following: number;
      posts: number;
    };
  };
  error: null;
};

export type { AcceptOrRejectFriendRequestPayload, UsernameAvailableResponse, MyDetailsResponse };
