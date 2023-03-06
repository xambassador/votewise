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

export type { CreateGroupPayload, AcceptRejectGroupRequestPayload, AcceptRejectGroupInvitationPayload };
