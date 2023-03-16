/**
 * @file: authTypes.ts
 * @description: This file contains types that are shared between the server and client
 */

type RegisterUserPayload = {
  email: string;
  password: string;
};

type BaseResponse = {
  success: boolean;
  message: string;
  error: null;
};

type RegisterUserResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
  };
} & BaseResponse;

type LoginPayload = {
  username: string;
  password: string;
  rememberMe: boolean;
};

type LoginResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
  };
} & BaseResponse;

type RevokeAccessTokenPayload = {
  refreshToken: string;
};

type RevokeAccessTokenResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
  };
} & BaseResponse;

type ForgotPasswordPayload = {
  email: string;
};

type ForgotPasswordResponse = {
  data: {
    message: string;
  };
} & BaseResponse;

type ResetPasswordPayload = {
  password: string;
};

type ResetPasswordResponse = {
  data: {
    message: string;
  };
} & BaseResponse;

type ResetPasswordQuery = {
  token: string;
  email: string;
};

type VerifyEmailQuery = {
  token: string;
};

type VerifyEmailResponse = {
  data: {
    message: string;
  };
} & BaseResponse;

type ResendEmailVerificationPayload = {
  email: string;
};

type ResendEmailVerificationResponse = {
  data: {
    message: string;
  };
} & BaseResponse;

export type {
  RegisterUserPayload,
  LoginPayload,
  RevokeAccessTokenPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ResetPasswordQuery,
  VerifyEmailQuery,
  ResendEmailVerificationPayload,
  RegisterUserResponse,
  LoginResponse,
  ForgotPasswordResponse,
  ResendEmailVerificationResponse,
  VerifyEmailResponse,
  ResetPasswordResponse,
  RevokeAccessTokenResponse,
};
