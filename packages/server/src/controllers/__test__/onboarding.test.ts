import http from "http";
import { StatusCodes } from "http-status-codes";
import supertest from "supertest";

import { ONBOARDING_ROUTE_V1, ONBOARDING_UPDATE_V1 } from "@votewise/lib";

import app from "../..";
import prismaMock from "../../../test/__mock__/prisma";
import { createRequest, createResponse, getUser } from "../../__mock__";
import OnboardingService from "../../services/onboarding";
import JWT from "../../services/user/jwt";
import {
  USERNAME_ALREADY_TAKEN_MSG,
  USERNAME_ALREADY_TAKEN_RESPONSE,
  USER_ALREADY_ONBOARDED_RESPONSE,
  USER_ONBOARDED_SUCCESSFULLY_MSG,
  VALIDATION_FAILED_MSG,
} from "../../utils";
import { onboardingStatus } from "../onboarding";

// https://stackoverflow.com/questions/65554910/jest-referenceerror-cannot-access-before-initialization
jest.mock("@votewise/prisma", () => {
  // eslint-disable-next-line global-require
  const mockPrisma = require("../../../test/__mock__/prisma").default;
  return {
    prisma: mockPrisma,
  };
});

jest.spyOn(OnboardingService, "onboardUser").mockImplementation((payload, userId) => {
  return Promise.resolve({
    ...getUser({
      id: userId,
      ...payload,
    }),
  });
});

const getOnboardingUpdateUrl = (userId: string) => {
  return `${ONBOARDING_ROUTE_V1}${ONBOARDING_UPDATE_V1}`.replace(":userId", userId);
};

const onboaringPayload = {
  username: "test",
  name: "test",
  about: "some great intro of test user.",
  location: "Earth",
  profile_image: "https://someimage.com",
  cover_image: "https://someimage.com",
};

const user = getUser({
  email: "test@gmail.com",
  id: 1,
});

describe("Onboarding API", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("GET /api/v1/onboarding", () => {
    test("Should return OK if request is valid", async () => {
      const mockRequest = createRequest({
        params: {
          userId: "1",
        },
        session: {
          user,
        },
      });
      const mockResponse = createResponse();
      await onboardingStatus(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Details fetched successfully",
        data: {
          onboarded: user.onboarded,
        },
        error: null,
      });
    });
  });

  describe("PATCH /api/v1/onboarding", () => {
    test("Should return BAD_REQUEST if users is already onboarded", async () => {
      const request = supertest(server);
      const url = getOnboardingUpdateUrl("1");
      const token = JWT.generateAccessToken({ userId: 1 });
      prismaMock.user.findUnique.mockResolvedValue(getUser({ id: 1, onboarded: true }));
      const response = await request
        .patch(url)
        .send(onboaringPayload)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toEqual(USER_ALREADY_ONBOARDED_RESPONSE);
      expect(OnboardingService.onboardUser).not.toHaveBeenCalled();
    });

    test("Should return BAD_REQUEST if payload is invalid", async () => {
      const request = supertest(server);
      const url = getOnboardingUpdateUrl("1");
      const token = JWT.generateAccessToken({ userId: 1 });
      prismaMock.user.findUnique.mockResolvedValue(getUser({ id: 1, onboarded: false }));
      const response = await request.patch(url).send().set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toEqual({
        message: VALIDATION_FAILED_MSG,
        data: null,
        error: {
          message: expect.any(String),
        },
        success: false,
      });
      expect(OnboardingService.onboardUser).not.toHaveBeenCalled();
    });

    test("Should return BAD_REQUEST if username is already taken", async () => {
      const request = supertest(server);
      const url = getOnboardingUpdateUrl("1");
      const token = JWT.generateAccessToken({ userId: 1 });
      prismaMock.user.findUnique.mockResolvedValue(getUser({ id: 1, onboarded: false }));
      jest.spyOn(OnboardingService, "onboardUser").mockImplementation(() => {
        throw new Error(USERNAME_ALREADY_TAKEN_MSG);
      });
      const response = await request
        .patch(url)
        .send(onboaringPayload)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body).toEqual(USERNAME_ALREADY_TAKEN_RESPONSE);
      expect(OnboardingService.onboardUser).toHaveBeenCalledTimes(1);
      expect(OnboardingService.onboardUser).toHaveBeenCalledWith(onboaringPayload, 1);
    });

    test("Should return OK if payload is valid and user is valid", async () => {
      const request = supertest(server);
      const url = getOnboardingUpdateUrl("1");
      const token = JWT.generateAccessToken({ userId: 1 });
      prismaMock.user.findUnique.mockResolvedValue(getUser({ id: 1, onboarded: false }));
      jest.spyOn(OnboardingService, "onboardUser").mockResolvedValue(getUser({ id: 1, onboarded: true }));
      const response = await request
        .patch(url)
        .send(onboaringPayload)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual({
        message: USER_ONBOARDED_SUCCESSFULLY_MSG,
        data: {
          user: expect.any(Object),
        },
        error: null,
        success: true,
      });
      expect(OnboardingService.onboardUser).toHaveBeenCalledTimes(1);
      expect(OnboardingService.onboardUser).toHaveBeenCalledWith(onboaringPayload, 1);
    });
  });
});
