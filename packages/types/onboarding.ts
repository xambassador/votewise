type OnboardingPayload = {
  username: string;
  name: string;
  about: string;
  location: string;
  profile_image: string;
  cover_image: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
};

type OnboardingResponse = {
  success: boolean;
  message: string;
  error: null;
  data: {
    user: {
      id: number;
      username: string;
      name: string;
      profile_image: string;
      cover_image: string;
      location: string;
      gender: string;
      twitter: string;
      email: string;
      facebook: string;
      about: string;
      onboarded: boolean;
      last_login: Date;
      is_email_verify: boolean;
      updated_at: Date;
    };
  };
};

export type { OnboardingPayload, OnboardingResponse };
