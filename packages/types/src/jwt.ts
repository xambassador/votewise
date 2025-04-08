export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  amr: { method: string; timestamp: number }[];
  aal: "aal1" | "aal2";
  session_id: string;
  user_aal_level: "aal1" | "aal2";
};
