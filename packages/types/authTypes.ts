/**
 * @file: authTypes.ts
 * @description: This file contains types that are shared between the server and client
 */

type RegisterUserPayload = {
  email: string;
  password: string;
};

type LoginPayload = {
  username: string;
  password: string;
  rememberMe: boolean;
};

type RevokeAccessTokenPayload = {
  refreshToken: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  password: string;
};

type ResetPasswordQuery = {
  token: string;
  email: string;
};

export type {
  RegisterUserPayload,
  LoginPayload,
  RevokeAccessTokenPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ResetPasswordQuery,
};
