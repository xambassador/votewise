import type { Challange, Factor, RefreshToken, User } from "@votewise/prisma/client";
import type { AccessTokenPayload } from "@votewise/types";
import type { Request, Response } from "express";

import { faker } from "@faker-js/faker";

export const appUrl = "http://localhost:3000";
export const ip = "192.168.4.45";
export const session = { ip, userAgent: faker.internet.userAgent(), aal: "aal1" };
export const locals = { meta: { ip }, session };

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
    id: faker.string.uuid(),
    email: faker.internet.email(),
    user_name: faker.internet.userName(),
    password: faker.internet.password(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    about: faker.lorem.sentence(),
    avatar_url: faker.image.avatar(),
    cover_image_url: faker.image.urlLoremFlickr({ category: "nature" }),
    created_at: faker.date.past(),
    twitter_profile_url: null,
    location: faker.location.city(),
    last_login: faker.date.recent(),
    is_onboarded: false,
    is_email_verify: false,
    instagram_profile_url: null,
    github_profile_url: null,
    gender: faker.person.sexType() === "male" ? "MALE" : "FEMALE",
    facebook_profile_url: null,
    updated_at: new Date(),
    secret: faker.string.alphanumeric(32),
    banned_until: null,
    email_confirmation_sent_at: null,
    email_confirmed_at: null,
    ...overrides
  };
}

export function buildRefreshToken(overrides: Partial<RefreshToken> = {}): RefreshToken {
  return {
    user_id: faker.string.uuid(),
    id: faker.string.uuid(),
    updated_at: new Date(),
    token: faker.string.alphanumeric(64),
    revoked: false,
    created_at: new Date(),
    ...overrides
  };
}

export function buildFactor(overrides: Partial<Factor> = {}): Factor {
  return {
    id: faker.string.uuid(),
    user_id: faker.string.uuid(),
    updated_at: new Date(),
    status: "UNVERIFIED",
    secret: faker.string.alphanumeric(32),
    phone: null,
    last_challenged_at: null,
    friendly_name: faker.person.firstName(),
    factor_type: "TOTP",
    created_at: new Date(),
    ...overrides
  };
}

export function buildChallenge(overrides: Partial<Challange> = {}): Challange {
  return {
    id: faker.string.uuid(),
    ip: "",
    otp_code: faker.string.numeric(6),
    verified_at: null,
    factor_id: faker.string.uuid(),
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
    session_id: faker.string.uuid(),
    role: "user",
    email: faker.internet.email(),
    user_aal_level: "aal1",
    ...data
  };
}

export function getLocals() {
  const userId = faker.string.uuid();
  const accessTokenPayload = buildAccessToken({ sub: userId });
  const session = {
    ip,
    userAgent: faker.internet.userAgent(),
    aal: "aal1"
  };
  const body = { code: "123456", challenge_id: faker.string.uuid() };
  const locals = { meta: { ip }, payload: accessTokenPayload, session };
  const user = buildUser({ id: userId, is_onboarded: false });
  return { locals, body, ip, user };
}

export type { User };
