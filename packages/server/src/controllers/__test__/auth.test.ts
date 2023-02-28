/* eslint-disable prefer-const */

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import http from "http";
import httpStatusCodes from "http-status-codes";
import jsonwebtoken from "jsonwebtoken";
import supertest from "supertest";

import prismaMock from "../../../test/__mock__/prisma";
import { getUser } from "../../__mock__";
import {
  AUTH_ROUTE_V1,
  FORGOT_PASSWORD_V1,
  LOGIN_USER_V1,
  REGISTER_USER_V1,
  RESET_PASSWORD_V1,
  REVOKE_ACCESS_TOKEN_V1,
} from "../../configs";
import app from "../../index";
import JWT from "../../services/user/jwt";

jest.mock("@votewise/prisma", () => ({ prisma: prismaMock }));
jest.mock("../../services/email/index", () => {
  class EmailService {
    public data: object;

    private emailType: string;

    constructor(data: object, type: string) {
      this.data = data;
      this.emailType = type;
    }

    addToQueue() {
      return null;
    }
  }
  return EmailService;
});
jest.mock("../../services/user/jwt", () => {
  const JWTService = {
    generateAccessToken: jest.fn().mockReturnValue("accessToken"),
    generateRefreshToken: jest.fn().mockReturnValue("refreshToken"),
    verifyAccessToken: jest.fn().mockReturnValue({ userId: 1 }),
    verifyRefreshToken: jest.fn().mockReturnValue({ userId: 1 }),
    saveRefreshToken: jest.fn(),
    checkIfRefreshTokenExists: jest.fn().mockReturnValue(true),
  };

  return JWTService;
});

describe("POST /api/v1/auth/register", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("Should return BAD_REQUEST if the request body is empty", async () => {
    const request = supertest(server);
    const response = await request.post(`${AUTH_ROUTE_V1}${REGISTER_USER_V1}`).send();
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.CREATED);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
  });

  test("Should return BAD_REQUEST if the request body contains only single property", async () => {
    const request = supertest(server);
    const response = await request.post(`${AUTH_ROUTE_V1}${REGISTER_USER_V1}`).send({
      email: faker.internet.email(),
    });
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.CREATED);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
  });

  test("Should return CONFLICT if the user already exists", async () => {
    const request = supertest(server);
    const email = faker.internet.email();
    const password = faker.internet.password();
    const newUser = getUser({ email, password });

    prismaMock.user.findUnique.mockResolvedValue({
      ...newUser,
      gender: "MALE",
    });

    const response = await request.post(`${AUTH_ROUTE_V1}${REGISTER_USER_V1}`).send({
      email,
      password,
    });

    expect(response.status).toBe(httpStatusCodes.CONFLICT);
    expect(response.status).not.toBe(httpStatusCodes.CREATED);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "User already exists");
    expect(response.body).toHaveProperty("data", null);
  });

  test("Should return CREATED if the user is created successfully and should return accessToken and refreshToken", async () => {
    const request = supertest(app);
    const email = faker.internet.email();
    const password = faker.internet.password();
    const newUser = getUser({ email, password });

    prismaMock.user.create.mockResolvedValue({
      ...newUser,
    });

    const response = await request.post(`${AUTH_ROUTE_V1}${REGISTER_USER_V1}`).send({
      email,
      password,
    });

    expect(response.status).toBe(httpStatusCodes.CREATED);
    expect(response.status).not.toBe(httpStatusCodes.CONFLICT);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "User created successfully");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("refreshToken");
    expect(response.body).toHaveProperty("error", null);
  });
});

describe("POST /api/v1/auth/login", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("Should return BAD_REQUEST if the request body is invalid", async () => {
    const request = supertest(server);
    let response = await request.post(`${AUTH_ROUTE_V1}${LOGIN_USER_V1}`).send();

    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);

    response = await request.post(`${AUTH_ROUTE_V1}${LOGIN_USER_V1}`).send({
      email: faker.internet.email(),
    });

    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
  });

  test("Should return NOT_FOUND if the user does not exist", async () => {
    const request = supertest(server);
    const email = faker.internet.email();
    const password = faker.internet.password();

    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request.post(`${AUTH_ROUTE_V1}${LOGIN_USER_V1}`).send({
      email,
      password,
    });

    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "User not found");
    expect(response.body).toHaveProperty("data", null);
  });

  test("Should return UNAUTHORIZED if the password is incorrect", async () => {
    const request = supertest(server);
    const email = faker.internet.email();
    const password = faker.internet.password();
    const newUser = getUser({ email, password });

    prismaMock.user.findUnique.mockResolvedValue({
      ...newUser,
    });

    const response = await request.post(`${AUTH_ROUTE_V1}${LOGIN_USER_V1}`).send({
      email,
      password: faker.internet.password(),
    });

    expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Invalid credentials");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "Invalid credentials",
    });
  });

  test("Should return OK if the user is logged in successfully and should return accessToken and refreshToken", async () => {
    const request = supertest(server);
    const email = faker.internet.email();
    const password = "test1234";
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = getUser({ email, password });

    prismaMock.user.findUnique.mockResolvedValue({
      ...newUser,
      password: hashedPassword,
    });

    const response = await request.post(`${AUTH_ROUTE_V1}${LOGIN_USER_V1}`).send({
      email,
      password,
    });

    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.status).not.toBe(httpStatusCodes.UNAUTHORIZED);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "Login successful");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("refreshToken");
    expect(response.body).toHaveProperty("error", null);
  });
});

describe("POST /api/v1/auth/revoke-access-token", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("Should return BAD_REQUEST if the request body is invalid", async () => {
    const request = supertest(server);
    let response = await request.post(`${AUTH_ROUTE_V1}${REVOKE_ACCESS_TOKEN_V1}`).send();

    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
  });

  test("Should return UNAUTHORIZED if token is invalid", async () => {
    const request = supertest(server);
    const token = faker.datatype.uuid();
    jest.spyOn(JWT, "verifyRefreshToken").mockImplementation(() => {
      throw new Error("Invalid refresh token");
    });
    const response = await request.post(`${AUTH_ROUTE_V1}${REVOKE_ACCESS_TOKEN_V1}`).send({
      refreshToken: token,
    });

    expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Invalid refresh token");
    expect(response.body).toHaveProperty("data", null);
  });

  test("Should return Invalid refresh token if it is not exists in database", async () => {
    const request = supertest(server);
    const token = faker.datatype.uuid();
    jest.spyOn(JWT, "verifyRefreshToken").mockImplementation(() => {
      return { userId: 1 };
    });
    jest.spyOn(JWT, "checkIfRefreshTokenExists").mockResolvedValue(false);

    const response = await request.post(`${AUTH_ROUTE_V1}${REVOKE_ACCESS_TOKEN_V1}`).send({
      refreshToken: token,
    });

    expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Invalid refresh token");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "Refresh token was expired.",
    });
  });

  test("Should return OK if the access token is revoked successfully", async () => {
    const request = supertest(server);
    const token = faker.datatype.uuid();
    jest.spyOn(JWT, "verifyRefreshToken").mockImplementation(() => {
      return { userId: 1 };
    });
    jest.spyOn(JWT, "checkIfRefreshTokenExists").mockResolvedValue(true);

    const response = await request.post(`${AUTH_ROUTE_V1}${REVOKE_ACCESS_TOKEN_V1}`).send({
      refreshToken: token,
    });

    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.status).not.toBe(httpStatusCodes.UNAUTHORIZED);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "Access token revoked successfully");
    expect(response.body).toHaveProperty("data", {
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(response.body).toHaveProperty("error", null);
  });
});

describe("POST /api/v1/auth/forgot-password", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("Should return BAD_REQUEST if the request body is invalid", async () => {
    const request = supertest(server);
    let response = await request.post(`${AUTH_ROUTE_V1}${FORGOT_PASSWORD_V1}`).send();
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "Email is required",
    });
  });

  test("Should return invalid email, if email is not valid", async () => {
    const request = supertest(server);
    const email = "test";
    const response = await request.post(`${AUTH_ROUTE_V1}${FORGOT_PASSWORD_V1}`).send({
      email,
    });
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "Invalid email",
    });
  });

  test("Should return NOT_FOUND if the user is not exists", async () => {
    const request = supertest(app);
    const email = faker.internet.email();
    prismaMock.user.findUnique.mockResolvedValue(null);
    const response = await request.post(`${AUTH_ROUTE_V1}${FORGOT_PASSWORD_V1}`).send({
      email,
    });
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "User not found");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "User not found",
    });
  });

  test("Should return OK if evrything is ok", async () => {
    const request = supertest(app);
    const email = faker.internet.email();
    const user = getUser({ email });
    prismaMock.user.findUnique.mockResolvedValue({
      ...user,
    });
    const response = await request.post(`${AUTH_ROUTE_V1}${FORGOT_PASSWORD_V1}`).send({
      email,
    });
    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.status).not.toBe(httpStatusCodes.NOT_FOUND);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "Email sent successfully");
    expect(response.body).toHaveProperty("data", {
      message: "Request is queued for process. Check your mail box..",
    });
    expect(response.body).toHaveProperty("error", null);
  });
});

describe("POST /api/v1/auth/reset-password", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("Should return BAD_REQUEST if the request body is invalid or request params are invalid", async () => {
    const request = supertest(server);
    // Empty request body and params
    let response = await request.post(`${AUTH_ROUTE_V1}${RESET_PASSWORD_V1}`).send();
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "Token is required",
    });

    const token = faker.datatype.uuid();
    // Empty request body and no email in params
    response = await request.post(`${AUTH_ROUTE_V1}${RESET_PASSWORD_V1}?token=${token}`).send();
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "Email is required",
    });

    let email = faker.internet.email();
    // Empty request body
    response = await request
      .post(`${AUTH_ROUTE_V1}${RESET_PASSWORD_V1}?token=${token}&email=${email}`)
      .send();
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: expect.any(String),
    });

    email = "test";
    // Invalid email and password not match minimum length
    response = await request.post(`${AUTH_ROUTE_V1}${RESET_PASSWORD_V1}?token=${token}&email=${email}`).send({
      password: "test",
    });
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: expect.any(String),
    });

    email = "test@gmail.com";
    response = await request.post(`${AUTH_ROUTE_V1}${RESET_PASSWORD_V1}?token=${token}&email=${email}`).send({
      password: "test123",
    });
    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: expect.any(String),
    });
  });

  test("Should return NOT_FOUND if the user is not exists", async () => {
    const request = supertest(app);
    const token = faker.datatype.uuid();
    const email = faker.internet.email();
    const password = faker.internet.password();
    prismaMock.user.findUnique.mockResolvedValue(null);
    const response = await request
      .post(`${AUTH_ROUTE_V1}${RESET_PASSWORD_V1}?token=${token}&email=${email}`)
      .send({
        password,
      });
    expect(response.status).toBe(httpStatusCodes.NOT_FOUND);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "User not found");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "User not found",
    });
  });

  test("Should return UNAUTHORIZED if the token submitted from different ip", async () => {
    const request = supertest(app);
    const email = faker.internet.email();
    const password = faker.internet.password();
    const user = getUser({ email });

    // Generating the fake token that issue when submit for
    // forgot password and sent to email.
    const ip = faker.internet.ip();
    const rid = await bcrypt.hashSync(`${user.id}${ip}`, 10);
    const token = jsonwebtoken.sign({ rid }, "test", { expiresIn: 300 });

    prismaMock.user.findUnique.mockResolvedValue({
      ...user,
    });

    jest.spyOn(JWT, "verifyAccessToken").mockImplementation(() => {
      return jsonwebtoken.verify(token, "test");
    });

    // set ip address to different value
    const response = await request
      .post(`${AUTH_ROUTE_V1}${RESET_PASSWORD_V1}?token=${token}&email=${email}`)
      .set("x-forwarded-for", faker.internet.ip())
      .send({
        password,
      });

    expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Unauthorized");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "Unauthorized",
    });
  });

  test("Should return UNAUTHORIZED if the token was expired", async () => {
    const request = supertest(app);
    const email = faker.internet.email();
    const password = faker.internet.password();
    const user = getUser({ email });

    // Generating the fake token that issue when submit for
    // forgot password and sent to email.
    const ip = faker.internet.ip();
    const rid = await bcrypt.hashSync(`${user.id}${ip}`, 10);
    const token = jsonwebtoken.sign({ rid }, "test", { expiresIn: 0 });

    prismaMock.user.findUnique.mockResolvedValue({
      ...user,
    });

    jest.spyOn(JWT, "verifyAccessToken").mockImplementation(() => {
      return jsonwebtoken.verify(token, "test");
    });

    const response = await request
      .post(`${AUTH_ROUTE_V1}${RESET_PASSWORD_V1}?token=${token}&email=${email}`)
      .send({
        password,
      });
    expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
    expect(response.status).not.toBe(httpStatusCodes.OK);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Unauthorized");
    expect(response.body).toHaveProperty("data", null);
    expect(response.body).toHaveProperty("error", {
      message: "Unauthorized",
    });
  });

  test("Should pass validation if submitted data is valid", async () => {
    const request = supertest(app);
    const email = faker.internet.email();
    const password = faker.internet.password();
    const user = getUser({ email });

    // Generating the fake token that issue when submit for
    // forgot password and sent to email.
    const ip = faker.internet.ip();
    const rid = await bcrypt.hashSync(`${user.id}${ip}`, 10);
    const token = jsonwebtoken.sign({ rid }, "test", { expiresIn: 300 });

    prismaMock.user.findUnique.mockResolvedValue({
      ...user,
    });

    prismaMock.user.update.mockResolvedValue({
      ...user,
    });

    jest.spyOn(JWT, "verifyAccessToken").mockImplementation(() => {
      return jsonwebtoken.verify(token, "test");
    });

    // set ip address to different value
    const response = await request
      .post(`${AUTH_ROUTE_V1}${RESET_PASSWORD_V1}?token=${token}&email=${email}`)
      .set("x-forwarded-for", ip)
      .send({
        password,
      });

    expect(response.status).toBe(httpStatusCodes.OK);
    expect(response.status).not.toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty("message", "Password reset successfully");
    expect(response.body).toHaveProperty("data", {
      message: "Password reset successfully",
    });
    expect(response.body).toHaveProperty("error", null);
  });
});
