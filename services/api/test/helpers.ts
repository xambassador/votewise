import type { AccessTokenPayload } from "@votewise/jwt";
import type { Challange, Factor, RefreshToken, User } from "@votewise/prisma/client";
import type { Request, Response } from "express";

export function buildReq(overrides: Partial<Request> = {}) {
  const req = { body: {}, query: {}, params: {}, headers: {}, ...overrides };
  return req as jest.Mocked<Request>;
}

export function buildRes(overrides: Partial<Response> = {}) {
  const res: unknown = {
    json: jest.fn(() => res).mockName("json"),
    status: jest.fn(() => res).mockName("status"),
    locals: {},
    cookie: jest.fn(),
    ...overrides
  };
  return res as jest.Mocked<Response>;
}

export function buildNext(impl: () => void) {
  return jest.fn(impl).mockName("next");
}

export function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: "clzy0090n000013gtnqrebopz",
    email: "johndoe@gmail.com",
    user_name: "john_doe",
    password: "hashed-password",
    first_name: "john",
    last_name: "doe",
    about: null,
    avatar_url: null,
    cover_image_url: null,
    created_at: new Date(),
    twitter_profile_url: null,
    location: null,
    last_login: null,
    is_onboarded: false,
    is_email_verify: false,
    instagram_profile_url: null,
    github_profile_url: null,
    gender: "MALE",
    facebook_profile_url: null,
    updated_at: new Date(),
    secret: "clzy0090n000013gtnqrebopz",
    banned_until: null,
    email_confirmation_sent_at: null,
    email_confirmed_at: null,
    ...overrides
  };
}

export function buildRefreshToken(overrides: Partial<RefreshToken> = {}): RefreshToken {
  return {
    user_id: "user_id",
    id: "id",
    updated_at: new Date(),
    token: "token",
    revoked: false,
    created_at: new Date(),
    ...overrides
  };
}

export function buildFactor(overrides: Partial<Factor> = {}): Factor {
  return {
    id: "factor_id",
    user_id: "user_id",
    updated_at: new Date(),
    status: "UNVERIFIED",
    secret: "secret",
    phone: null,
    last_challenged_at: null,
    friendly_name: "friendly_name",
    factor_type: "TOTP",
    created_at: new Date(),
    ...overrides
  };
}

export function buildChallenge(overrides: Partial<Challange> = {}): Challange {
  return {
    id: "challenge_id",
    ip: "",
    otp_code: "otp_code",
    verified_at: null,
    factor_id: "factor_id",
    created_at: new Date(),
    ...overrides
  };
}

export function buildAccessToken(data: Partial<AccessTokenPayload>): AccessTokenPayload {
  return {
    aal: "aal1",
    amr: [{ method: "password", timestamp: Date.now() }],
    user_metadata: {},
    app_metadata: {},
    sub: "sub",
    session_id: "session_id",
    role: "user",
    email: "test@gmail.com",
    user_aal_level: "aal1",
    ...data
  };
}

export type { User };
