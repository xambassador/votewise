type CreateGroupPayload = {
  name: string;
  description: string;
  type: "PUBLIC" | "PRIVATE";
  status: "OPEN" | "CLOSED" | "INACTIVE";
  joinThroghInvite: boolean;
};

type AcceptRejectGroupRequestPayload = {
  action: "ACCEPT" | "REJECT";
};

type AcceptRejectGroupInvitationPayload = {
  action: "ACCEPT" | "REJECT";
};

type UpdateGroupDetailsPayload = {
  name: string;
  description: string;
  type: "PUBLIC" | "PRIVATE";
  status: "OPEN" | "CLOSED" | "INACTIVE";
  joinThroghInvite: boolean;
};

export type {
  CreateGroupPayload,
  AcceptRejectGroupRequestPayload,
  AcceptRejectGroupInvitationPayload,
  UpdateGroupDetailsPayload,
};
