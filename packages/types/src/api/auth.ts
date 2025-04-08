export type SigninResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: {
    id: string;
    email: string;
    role: string;
    email_confirmed_at: string;
    email_confirmation_sent_at: string;
    last_sign_in_at: string;
    is_onboarded: boolean;
    user_aal_level: "aal1" | "aal2";
    factors: {
      id: string;
      type: string;
      status: string;
      name: string;
    }[];
  };
};

export type SignupResponse = {
  user_id: string;
  verification_code: string;
  expires_in: number;
};

export type VerifyEmailResponse = {
  user_id: string;
  email: string;
  is_email_verify: boolean;
};

export type ChallengeFactorResponse = { id: string; expires_at: string; type: string };

export type VerifyResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
};
