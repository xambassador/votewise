type AcceptOrRejectFriendRequestPayload = {
  requestId: number;
  type: "ACCEPT" | "REJECT";
};

type UsernameAvailableResponse = {
  success: true;
  message: string;
  data: {
    username: string;
    message: string;
  };
  error: null;
};

export type { AcceptOrRejectFriendRequestPayload, UsernameAvailableResponse };
