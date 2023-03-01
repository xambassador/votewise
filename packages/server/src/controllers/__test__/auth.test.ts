/* eslint-disable prefer-const */

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import httpStatusCodes from "http-status-codes";

import prismaMock from "../../../test/__mock__/prisma";
import { createRequest, createResponse, getUser } from "../../__mock__";
import JWT from "../../services/user/jwt";
import { forgotPassword, login, refreshAccessToken, register, resetPassword } from "../auth";

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

describe("POST /api/v1/auth/register", () => {
  test("Should return BAD_REQUEST if the request body is empty", async () => {
    const mockRequest = createRequest({
      body: {},
    });
    const mockResponse = createResponse();
    await register(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.CREATED);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: "Validation failed",
      error: {
        message: expect.any(String),
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return BAD_REQUEST if the request body is invalid", async () => {
    const mockRequest = createRequest({
      body: {
        email: faker.internet.email(),
      },
    });
    const mockResponse = createResponse();
    await register(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.CREATED);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      data: null,
      error: {
        message: expect.any(String),
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return CONFLICT if the user already exists", async () => {
    const mockRequest = createRequest({
      body: {
        email: "test@gmail.com",
        password: "test_password123",
      },
    });
    const mockResponse = createResponse();
    const user = getUser({ email: "test@gmail.com", password: "test_password123", gender: "MALE" });
    prismaMock.user.findUnique.mockResolvedValue(user);
    await register(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: "test@gmail.com",
      },
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.CONFLICT);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.CREATED);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: "User already exists",
      error: {
        message: "User already exists",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return CREATED if the user is created successfully and should return accessToken and refreshToken", async () => {
    const email = "test@gmail.com";
    const password = "test_password123";
    const mockRequest = createRequest({
      body: {
        email,
        password,
      },
    });
    const mockResponse = createResponse();
    const user = getUser({ email, password });
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(user);
    await register(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    });
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email,
        password: expect.any(String),
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.CREATED);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.CONFLICT);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "User created successfully",
      success: true,
      data: {
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      },
      error: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/v1/auth/login", () => {
  test("Should return BAD_REQUEST if the request body is empty", async () => {
    const mockRequest = createRequest({
      body: {},
    });
    const mockResponse = createResponse();
    await login(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      data: null,
      error: {
        message: expect.any(String),
      },
    });
  });

  test("Should return BAD_REQUEST if the request body is invalid", async () => {
    const mockRequest = createRequest({
      body: {
        username: "test@gmail.com",
      },
    });
    const mockResponse = createResponse();
    await login(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      data: null,
      error: {
        message: expect.any(String),
      },
    });
  });

  test("Should return NOT_FOUND if the user does not exist", async () => {
    const mockRequest = createRequest({
      body: {
        username: "test@gmail.com",
        password: "test_password123",
      },
    });
    const mockResponse = createResponse();
    prismaMock.user.findUnique.mockResolvedValue(null);
    await login(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: "test@gmail.com",
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        username: "test@gmail.com",
      },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
      data: null,
      error: {
        message: "User not found",
      },
    });
    expect(mockResponse.json).toBeCalledTimes(1);
  });

  test("Should return UNAUTHORIZED if the password is incorrect", async () => {
    const email = "test@gmail.com";
    const password = "test_password123";
    const mockRequet = createRequest({
      body: {
        username: email,
        password,
      },
    });
    const mockResponse = createResponse();
    const user = getUser({ email, password });
    prismaMock.user.findUnique.mockResolvedValue(user);
    await login(mockRequet, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        username: email,
      },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid credentials",
      error: {
        message: "Invalid credentials",
      },
      data: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return OK if the user is logged in successfully and should return accessToken and refreshToken", async () => {
    const email = "test@gmail.com";
    const password = "test_password123";
    const mockRequest = createRequest({
      body: {
        username: email,
        password,
      },
    });
    const mockResponse = createResponse();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = getUser({ email, password: hashedPassword });
    prismaMock.user.findUnique.mockResolvedValue(user);
    await login(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        username: email,
      },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Login successful",
      data: {
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      },
      error: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/v1/auth/revoke-access-token", () => {
  test("Should return BAD_REQUEST if the request body is invalid", async () => {
    const mockRequest = createRequest({
      body: {},
    });
    const mockResponse = createResponse();
    await refreshAccessToken(mockRequest, mockResponse);
    expect(prismaMock.refreshToken.findUnique).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      data: null,
      error: {
        message: "Refresh token is required",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return UNAUTHORIZED if token is invalid", async () => {
    const token = faker.datatype.uuid(); // fake token
    const mockRequest = createRequest({
      body: {
        refreshToken: token,
      },
    });
    const mockResponse = createResponse();
    await refreshAccessToken(mockRequest, mockResponse);
    expect(prismaMock.refreshToken.findUnique).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid refresh token",
      data: null,
      error: {
        message: "Invalid refresh token",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return Invalid refresh token if it is not exists in database", async () => {
    const token = JWT.generateRefreshToken({ userId: 1 });
    const mockRequest = createRequest({
      body: {
        refreshToken: token,
      },
    });
    const mockResponse = createResponse();
    prismaMock.refreshToken.findUnique.mockResolvedValue(null);
    await refreshAccessToken(mockRequest, mockResponse);
    expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
      where: {
        user_id: 1,
      },
    });
    expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid refresh token",
      data: null,
      error: {
        message: "Refresh token was expired.",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return OK if the access token is revoked successfully", async () => {
    const token = JWT.generateRefreshToken({ userId: 1 });
    const mockRequest = createRequest({
      body: {
        refreshToken: token,
      },
    });
    const mockResponse = createResponse();
    prismaMock.refreshToken.findUnique.mockResolvedValue({
      user_id: 1,
      created_at: new Date(),
      id: 1,
      updated_at: new Date(),
      token,
    });
    await refreshAccessToken(mockRequest, mockResponse);
    expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
      where: {
        user_id: 1,
      },
    });
    expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Access token revoked successfully",
      data: {
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      },
      error: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/v1/auth/forgot-password", () => {
  test("Should return BAD_REQUEST if the request body is invalid", async () => {
    const mockRequest = createRequest({
      body: {},
    });
    const mockResponse = createResponse();
    await forgotPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      data: null,
      error: {
        message: "Email is required",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return invalid email, if email is not valid", async () => {
    const email = "test";
    const mockRequest = createRequest({
      body: {
        email,
      },
    });
    const mockResponse = createResponse();
    await forgotPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      data: null,
      error: {
        message: "Invalid email",
      },
    });
    expect(mockResponse.json).toHaveReturnedTimes(1);
  });

  test("Should return NOT_FOUND if the user is not exists", async () => {
    const email = faker.internet.email();
    const mockRequest = createRequest({
      body: {
        email,
      },
    });
    const mockResponse = createResponse();
    prismaMock.user.findUnique.mockResolvedValue(null);
    await forgotPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        id: expect.any(Number),
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        username: email,
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
      data: null,
      error: {
        message: "User not found",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return OK if evrything is ok", async () => {
    const email = faker.internet.email();
    const user = getUser({ email });
    const mockRequest = createRequest({
      body: {
        email,
      },
      ip: faker.internet.ip(),
      header: jest.fn(),
    });
    const mockResponse = createResponse();
    prismaMock.user.findUnique.mockResolvedValue(user);
    await forgotPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        id: expect.any(Number),
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        username: email,
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Email sent successfully",
      error: null,
      data: {
        message: "Request is queued for process. Check your mail box..",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/v1/auth/reset-password", () => {
  test("Should return BAD_REQUEST if the request body is invalid or request params are invalid", async () => {
    const mockRequest = createRequest({
      body: {},
      query: {}, // missing token and email
    });
    const mockResponse = createResponse();
    await resetPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      error: {
        message: expect.any(String),
      },
      data: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return BAD_REQUEST if the request params are invalid", async () => {
    const mockRequest = createRequest({
      body: {
        password: "test",
      },
      query: {
        email: "test",
        token: "test",
      },
    });
    const mockResponse = createResponse();
    await resetPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      error: {
        message: expect.any(String),
      },
      data: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return NOT_FOUND if the user is not exists", async () => {
    const token = faker.datatype.uuid();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const mockRequest = createRequest({
      body: {
        password,
      },
      query: {
        token,
        email,
      },
    });
    const mockResponse = createResponse();
    prismaMock.user.findUnique.mockResolvedValue(null);
    await resetPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        id: expect.any(Number),
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        username: email,
      },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "User not found",
      error: {
        message: "User not found",
      },
      data: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return UNAUTHORIZED if the token submitted from different ip", async () => {
    const email = "test@gmail.com";
    const password = "test12345";
    const user = getUser({ email });
    // Generating the fake token that issue when submit for forgot password and sent to email.
    const ip = faker.internet.ip();
    const rid = await bcrypt.hashSync(`${user.id}${ip}`, 10);
    const token = JWT.generateAccessToken({ rid }, { expiresIn: 300 });
    const fakeIp = faker.internet.ip();

    prismaMock.user.findUnique.mockResolvedValue(user);
    const mockRequest = createRequest({
      body: {
        password,
      },
      query: {
        email,
        token,
      },
      headers: {
        "x-forwarded-for": fakeIp, // set ip address to different value
      },
      ip: fakeIp, // set ip address to different value
      header: jest.fn(),
    });
    const mockResponse = createResponse();
    await resetPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        id: expect.any(Number),
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        username: email,
      },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
      error: {
        message: "Unauthorized",
      },
      data: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return UNAUTHORIZED if the token was expired", async () => {
    const email = "test@gmail.com";
    const password = "test12344";
    const user = getUser({ email });
    // Generating the fake token that issue when submit for
    // forgot password and sent to email.
    const ip = faker.internet.ip();
    const rid = await bcrypt.hashSync(`${user.id}${ip}`, 10);
    const token = JWT.generateAccessToken({ rid }, { expiresIn: 0 });
    const mockRequest = createRequest({
      body: { password },
      query: { email, token },
      headers: { "x-forwarded-for": ip },
      ip,
      header: jest.fn(),
    });
    const mockResponse = createResponse();
    prismaMock.user.findUnique.mockResolvedValue(user);
    await resetPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        id: expect.any(Number),
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        username: email,
      },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized",
      error: {
        message: "Unauthorized",
      },
      data: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should pass validation if submitted data is valid and should update the password", async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();
    const user = getUser({ email });
    // Generating the fake token that issue when submit for
    // forgot password and sent to email.
    const ip = faker.internet.ip();
    const rid = await bcrypt.hashSync(`${user.id}${ip}`, 10);
    const token = JWT.generateAccessToken({ rid }, { expiresIn: 300 });
    const mockRequest = createRequest({
      body: { password },
      query: { email, token },
      headers: { "x-forwarded-for": ip },
      ip,
      header: jest.fn(),
    });
    const mockResponse = createResponse();

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue(user);

    await resetPassword(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        id: expect.any(Number),
      },
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
      where: {
        username: email,
      },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: {
        id: user.id,
      },
      data: {
        password: expect.any(String),
      },
    });
    expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
    expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Password reset successfully",
      error: null,
      data: {
        message: "Password reset successfully",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});
