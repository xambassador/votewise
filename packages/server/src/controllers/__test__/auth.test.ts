/* eslint-disable prefer-const */

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import http from "http";
import { StatusCodes } from "http-status-codes";
import supertest from "supertest";

import {
  AUTH_ROUTE_V1,
  FORGOT_PASSWORD_V1,
  LOGIN_USER_V1,
  REGISTER_USER_V1,
  REVOKE_ACCESS_TOKEN_V1,
} from "@votewise/lib";

import app from "../..";
import prismaMock from "../../../test/__mock__/prisma";
import { errorResponse, getUser } from "../../__mock__";
import JWT from "../../services/user/jwt";
import {
  ACCESS_TOKEN_REVOKE_MSG,
  INVALID_CREDENTIALS_MSG,
  INVALID_EMAIL_MSG,
  INVALID_REFRESHTOKEN_MSG,
  LOGIN_SUCCESS_MSG,
  REFRESHTOKEN_REQUIRED_MSG,
  USER_ALREADY_EXISTS_MSG,
  USER_CREATED_SUCCESSFULLY_MSG,
  USER_NOT_FOUND_MSG,
  VALIDATION_FAILED_MSG,
} from "../../utils";

jest.mock("@votewise/prisma", () => {
  // eslint-disable-next-line global-require
  const mockPrisma = require("../../../test/__mock__/prisma").default;
  return {
    prisma: mockPrisma,
  };
});
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

describe("Auth controller", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("POST /api/v1/auth/register", () => {
    const url = `${AUTH_ROUTE_V1}${REGISTER_USER_V1}`;

    test("Should return BAD_REQUEST if the request body is invalid", async () => {
      const request = supertest(app);
      const response = await request.post(url).send({
        email: faker.internet.email(),
      });

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toEqual(errorResponse(VALIDATION_FAILED_MSG));
    });

    test("Should return CONFLICT if the user already exists", async () => {
      const request = supertest(app);
      const email = "test@gmail.com";
      const password = "test_password123";
      const user = getUser({ email, password, gender: "MALE" });
      prismaMock.user.findUnique.mockResolvedValue(user);
      const response = await request.post(url).send({
        email,
        password,
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: "test@gmail.com",
        },
      });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(response.status).toBe(StatusCodes.CONFLICT);
      expect(response.body).toEqual(errorResponse(USER_ALREADY_EXISTS_MSG));
    });

    test("Should return CREATED if the user is created successfully and should return accessToken and refreshToken", async () => {
      const email = "test@gmail.com";
      const password = "test_password123";
      const request = supertest(app);
      const user = getUser({ email, password });
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(user);
      const response = await request.post(url).send({
        email,
        password,
      });

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
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toEqual({
        message: USER_CREATED_SUCCESSFULLY_MSG,
        success: true,
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
        error: null,
      });
    });
  });

  describe("PATCH /api/v1/auth/login", () => {
    const url = `${AUTH_ROUTE_V1}${LOGIN_USER_V1}`;

    test("Should return BAD_REQUEST if the request body is invalid", async () => {
      const request = supertest(app);
      const response = await request.patch(url).send({
        email: faker.internet.email(),
      });
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toEqual(errorResponse(VALIDATION_FAILED_MSG));
    });

    test("Should return NOT_FOUND if the user does not exist", async () => {
      const request = supertest(app);
      const username = "test@gmail.com";
      const password = "test_password123";
      prismaMock.user.findUnique.mockResolvedValue(null);
      const response = await request.patch(url).send({
        username,
        password,
      });

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
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toEqual(errorResponse(USER_NOT_FOUND_MSG));
    });

    test("Should return UNAUTHORIZED if the password is incorrect", async () => {
      const request = supertest(app);
      const email = "test@gmail.com";
      const password = "test_password123";
      const user = getUser({ email, password });
      prismaMock.user.findUnique.mockResolvedValue(user);
      const response = await request.patch(url).send({
        username: email,
        password: "wrong_password",
      });

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body).toEqual(errorResponse(INVALID_CREDENTIALS_MSG));
    });

    test("Should return OK if the user is logged in successfully and should return accessToken and refreshToken", async () => {
      const request = supertest(app);
      const email = "test@gmail.com";
      const password = "test_password123";
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = getUser({ email, password: hashedPassword });
      prismaMock.user.findUnique.mockResolvedValue(user);
      const response = await request.patch(url).send({
        username: email,
        password,
      });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual({
        success: true,
        message: LOGIN_SUCCESS_MSG,
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
        error: null,
      });
    });
  });

  describe("PATCH /api/v1/auth/revoke-access-token", () => {
    const url = `${AUTH_ROUTE_V1}${REVOKE_ACCESS_TOKEN_V1}`;
    test("Should return BAD_REQUEST if the request body is invalid", async () => {
      const request = supertest(app);
      const response = await request.patch(url).send({});
      expect(prismaMock.refreshToken.findUnique).not.toHaveBeenCalled();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toEqual(errorResponse(VALIDATION_FAILED_MSG, REFRESHTOKEN_REQUIRED_MSG));
    });

    test("Should return UNAUTHORIZED if token is invalid", async () => {
      const request = supertest(app);
      const token = faker.datatype.uuid(); // fake token
      const response = await request.patch(url).send({
        refreshToken: token,
      });

      expect(prismaMock.refreshToken.findUnique).not.toHaveBeenCalled();
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body).toEqual(errorResponse(INVALID_REFRESHTOKEN_MSG));
    });

    test("Should return Invalid refresh token if it is not exists in database", async () => {
      const request = supertest(app);
      const token = JWT.generateRefreshToken({ userId: 1 });
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);
      const response = await request.patch(url).send({
        refreshToken: token,
      });

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
        where: {
          user_id: 1,
        },
      });
      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
      expect(response.body).toEqual(errorResponse(INVALID_REFRESHTOKEN_MSG, "Refresh token was expired."));
    });

    test("Should return OK if the access token is revoked successfully", async () => {
      const request = supertest(app);
      const token = JWT.generateRefreshToken({ userId: 1 });
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        user_id: 1,
        created_at: new Date(),
        id: 1,
        updated_at: new Date(),
        token,
      });
      const response = await request.patch(url).send({
        refreshToken: token,
      });

      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledWith({
        where: {
          user_id: 1,
        },
      });
      expect(prismaMock.refreshToken.findUnique).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual({
        success: true,
        message: ACCESS_TOKEN_REVOKE_MSG,
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
        error: null,
      });
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    const url = `${AUTH_ROUTE_V1}${FORGOT_PASSWORD_V1}`;
    test("Should return invalid email, if email is not valid", async () => {
      const request = supertest(app);
      const email = "test";
      const response = await request.post(url).send({
        email,
      });
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toEqual(errorResponse(VALIDATION_FAILED_MSG, INVALID_EMAIL_MSG));
    });

    test("Should return NOT_FOUND if the user is not exists", async () => {
      const request = supertest(app);
      const email = faker.internet.email();
      prismaMock.user.findUnique.mockResolvedValue(null);
      const response = await request.post(url).send({
        email,
      });
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
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
      expect(response.body).toEqual(errorResponse(USER_NOT_FOUND_MSG, USER_NOT_FOUND_MSG));
    });

    test("Should return OK if evrything is ok", async () => {
      const request = supertest(app);
      const email = faker.internet.email();
      const user = getUser({ email });
      prismaMock.user.findUnique.mockResolvedValue(user);
      const response = await request
        .post(url)
        .send({
          email,
        })
        .set("x-forwarded-for", faker.internet.ip());
      expect(response.status).toBe(StatusCodes.OK);
    });
  });

  // describe("POST /api/v1/auth/reset-password", () => {
  //   test("Should return BAD_REQUEST if the request body is invalid or request params are invalid", async () => {
  //     const mockRequest = createRequest({
  //       body: {},
  //       query: {}, // missing token and email
  //     });
  //     const mockResponse = createResponse();
  //     await resetPassword(mockRequest, mockResponse);
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  //     expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
  //     expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
  //     expect(mockResponse.status).toHaveBeenCalledTimes(1);
  //     expect(mockResponse.json).toHaveBeenCalledWith({
  //       success: false,
  //       message: "Validation failed",
  //       error: {
  //         message: expect.any(String),
  //       },
  //       data: null,
  //     });
  //     expect(mockResponse.json).toHaveBeenCalledTimes(1);
  //   });

  //   test("Should return BAD_REQUEST if the request params are invalid", async () => {
  //     const mockRequest = createRequest({
  //       body: {
  //         password: "test",
  //       },
  //       query: {
  //         email: "test",
  //         token: "test",
  //       },
  //     });
  //     const mockResponse = createResponse();
  //     await resetPassword(mockRequest, mockResponse);
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  //     expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
  //     expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
  //     expect(mockResponse.status).toHaveBeenCalledTimes(1);
  //     expect(mockResponse.json).toHaveBeenCalledWith({
  //       success: false,
  //       message: "Validation failed",
  //       error: {
  //         message: expect.any(String),
  //       },
  //       data: null,
  //     });
  //     expect(mockResponse.json).toHaveBeenCalledTimes(1);
  //   });

  //   test("Should return NOT_FOUND if the user is not exists", async () => {
  //     const token = faker.datatype.uuid();
  //     const email = faker.internet.email();
  //     const password = faker.internet.password();
  //     const mockRequest = createRequest({
  //       body: {
  //         password,
  //       },
  //       query: {
  //         token,
  //         email,
  //       },
  //     });
  //     const mockResponse = createResponse();
  //     prismaMock.user.findUnique.mockResolvedValue(null);
  //     await resetPassword(mockRequest, mockResponse);
  //     expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
  //       where: {
  //         email,
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
  //       where: {
  //         id: expect.any(Number),
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
  //       where: {
  //         username: email,
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
  //     expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.NOT_FOUND);
  //     expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
  //     expect(mockResponse.status).toHaveBeenCalledTimes(1);
  //     expect(mockResponse.json).toHaveBeenCalledWith({
  //       success: false,
  //       message: "User not found",
  //       error: {
  //         message: "User not found",
  //       },
  //       data: null,
  //     });
  //     expect(mockResponse.json).toHaveBeenCalledTimes(1);
  //   });

  //   test("Should return UNAUTHORIZED if the token submitted from different ip", async () => {
  //     const email = "test@gmail.com";
  //     const password = "test12345";
  //     const user = getUser({ email });
  //     // Generating the fake token that issue when submit for forgot password and sent to email.
  //     const ip = faker.internet.ip();
  //     const rid = await bcrypt.hashSync(`${user.id}${ip}`, 10);
  //     const token = JWT.generateAccessToken({ rid }, { expiresIn: 300 });
  //     const fakeIp = faker.internet.ip();

  //     prismaMock.user.findUnique.mockResolvedValue(user);
  //     const mockRequest = createRequest({
  //       body: {
  //         password,
  //       },
  //       query: {
  //         email,
  //         token,
  //       },
  //       headers: {
  //         "x-forwarded-for": fakeIp, // set ip address to different value
  //       },
  //       ip: fakeIp, // set ip address to different value
  //       header: jest.fn(),
  //     });
  //     const mockResponse = createResponse();
  //     await resetPassword(mockRequest, mockResponse);
  //     expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
  //       where: {
  //         email,
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
  //       where: {
  //         id: expect.any(Number),
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
  //       where: {
  //         username: email,
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
  //     expect(prismaMock.user.update).not.toHaveBeenCalled();
  //     expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
  //     expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
  //     expect(mockResponse.status).toHaveBeenCalledTimes(1);
  //     expect(mockResponse.json).toHaveBeenCalledWith({
  //       success: false,
  //       message: "Unauthorized",
  //       error: {
  //         message: "Unauthorized",
  //       },
  //       data: null,
  //     });
  //     expect(mockResponse.json).toHaveBeenCalledTimes(1);
  //   });

  //   test("Should return UNAUTHORIZED if the token was expired", async () => {
  //     const email = "test@gmail.com";
  //     const password = "test12344";
  //     const user = getUser({ email });
  //     // Generating the fake token that issue when submit for
  //     // forgot password and sent to email.
  //     const ip = faker.internet.ip();
  //     const rid = await bcrypt.hashSync(`${user.id}${ip}`, 10);
  //     const token = JWT.generateAccessToken({ rid }, { expiresIn: 0 });
  //     const mockRequest = createRequest({
  //       body: { password },
  //       query: { email, token },
  //       headers: { "x-forwarded-for": ip },
  //       ip,
  //       header: jest.fn(),
  //     });
  //     const mockResponse = createResponse();
  //     prismaMock.user.findUnique.mockResolvedValue(user);
  //     await resetPassword(mockRequest, mockResponse);
  //     expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
  //       where: {
  //         email,
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
  //       where: {
  //         id: expect.any(Number),
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
  //       where: {
  //         username: email,
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
  //     expect(prismaMock.user.update).not.toHaveBeenCalled();
  //     expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
  //     expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
  //     expect(mockResponse.status).toHaveBeenCalledTimes(1);
  //     expect(mockResponse.json).toHaveBeenCalledWith({
  //       success: false,
  //       message: "Unauthorized",
  //       error: {
  //         message: "Unauthorized",
  //       },
  //       data: null,
  //     });
  //     expect(mockResponse.json).toHaveBeenCalledTimes(1);
  //   });

  //   test("Should pass validation if submitted data is valid and should update the password", async () => {
  //     const email = faker.internet.email();
  //     const password = faker.internet.password();
  //     const user = getUser({ email });
  //     // Generating the fake token that issue when submit for
  //     // forgot password and sent to email.
  //     const ip = faker.internet.ip();
  //     const rid = await bcrypt.hashSync(`${user.id}${ip}`, 10);
  //     const token = JWT.generateAccessToken({ rid }, { expiresIn: 300 });
  //     const mockRequest = createRequest({
  //       body: { password },
  //       query: { email, token },
  //       headers: { "x-forwarded-for": ip },
  //       ip,
  //       header: jest.fn(),
  //     });
  //     const mockResponse = createResponse();

  //     prismaMock.user.findUnique.mockResolvedValue(user);
  //     prismaMock.user.update.mockResolvedValue(user);

  //     await resetPassword(mockRequest, mockResponse);
  //     expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
  //       where: {
  //         email,
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
  //       where: {
  //         id: expect.any(Number),
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith({
  //       where: {
  //         username: email,
  //       },
  //     });
  //     expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
  //     expect(prismaMock.user.update).toHaveBeenCalledWith({
  //       where: {
  //         id: user.id,
  //       },
  //       data: {
  //         password: expect.any(String),
  //       },
  //     });
  //     expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
  //     expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
  //     expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
  //     expect(mockResponse.status).toHaveBeenCalledTimes(1);
  //     expect(mockResponse.json).toHaveBeenCalledWith({
  //       success: true,
  //       message: "Password reset successfully",
  //       error: null,
  //       data: {
  //         message: "Password reset successfully",
  //       },
  //     });
  //     expect(mockResponse.json).toHaveBeenCalledTimes(1);
  //   });
  // });
});
