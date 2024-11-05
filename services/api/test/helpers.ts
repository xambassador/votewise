import type { User } from "@votewise/prisma/client";
import type { Request, Response } from "express";

export function buildReq(overrides: Partial<Request> = {}) {
  const req = { body: {}, query: {}, params: {}, headers: {}, ...overrides };
  return req as Request;
}

export function buildRes(overrides: Partial<Response> = {}) {
  const res: unknown = {
    json: jest.fn(() => res).mockName("json"),
    status: jest.fn(() => res).mockName("status"),
    locals: {},
    ...overrides
  };
  return res as Response;
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
    is_2fa_enabled: false,
    totp_secret: null,
    ...overrides
  };
}

export type { User };
