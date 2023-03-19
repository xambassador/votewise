import httpStatusCodes from "http-status-codes";

import prismaMock from "../../../test/__mock__/prisma";
import { createRequest, createResponse, getUser } from "../../__mock__";
import { onboardUser, onboardingStatus } from "../onboarding";

jest.mock("@votewise/prisma", () => ({ prisma: prismaMock }));

const onboaringPayload = {
  username: "test",
  name: "test",
  about: "some great intro of test user.",
  location: "Earth",
  profile_image: "https://someimage.com",
  cover_image: "https://someimage.com",
};

const unauthorizedError = {
  success: false,
  message: "Unauthorized",
  data: null,
  error: {
    message: "Unauthorized",
  },
};

const user = getUser({
  email: "test@gmail.com",
  id: 1,
});

describe("Onboarding API", () => {
  describe("GET /api/v1/onboarding/:userId/status", () => {
    test("Should return UNAUTHORIZED if authenticated userId and params userId not match", async () => {
      const mockRequest = createRequest({
        params: {
          userId: "2",
        },
        session: {
          user,
        },
      });
      const mockResponse = createResponse();
      await onboardingStatus(mockRequest, mockResponse);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(unauthorizedError);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    test("Should return OK if request made by same user", async () => {
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
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).not.toHaveBeenCalledWith(unauthorizedError);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
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

  describe("PUT /api/v1/onboarding/:userId", () => {
    test("Should return UNAUTHORIZED if authenticated userId and params userId not match", async () => {
      const mockRequest = createRequest({
        params: {
          userId: "2",
        },
        session: {
          user,
        },
        body: {
          ...onboaringPayload,
        },
      });
      const mockResponse = createResponse();
      await onboardUser(mockRequest, mockResponse);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.UNAUTHORIZED);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith(unauthorizedError);
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });

    test("Should return BAD_REQUEST if users is already onboarded", async () => {
      const mockRequest = createRequest({
        params: {
          userId: "1",
        },
        session: {
          user: {
            ...user,
            onboarded: true,
          },
        },
        body: {
          ...onboaringPayload,
        },
      });
      const mockResponse = createResponse();
      await onboardUser(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "User already onboarded",
        data: null,
        error: {
          message: "User already onboarded",
        },
      });
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    test("Should return BAD_REQUEST if payload is invalid", async () => {
      const mockRequest = createRequest({
        params: {
          userId: "1",
        },
        session: {
          user: {
            ...user,
            onboarded: false,
          },
        },
        body: {},
      });
      const mockResponse = createResponse();
      await onboardUser(mockRequest, mockResponse);
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
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

    test("Should return BAD_REQUEST if username is already taken", async () => {
      const mockRequest = createRequest({
        params: {
          userId: "1",
        },
        session: {
          user: {
            ...user,
            onboarded: false,
          },
        },
        body: {
          ...onboaringPayload,
        },
      });
      const mockResponse = createResponse();
      prismaMock.user.findUnique.mockResolvedValue(user); // username is taken
      await onboardUser(mockRequest, mockResponse);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          username: onboaringPayload.username,
        },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Username already taken",
        data: null,
        error: {
          message: "Username already taken",
        },
      });
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    test("Should return OK if payload is valid and user is valid", async () => {
      const mockRequest = createRequest({
        params: {
          userId: "1",
        },
        session: {
          user: {
            ...user,
            onboarded: false,
          },
        },
        body: {
          ...onboaringPayload,
        },
      });
      const mockResponse = createResponse();
      prismaMock.user.findUnique.mockResolvedValue(null); // username is not taken
      prismaMock.user.update.mockResolvedValue({
        ...user,
        ...onboaringPayload,
        onboarded: true,
      });
      await onboardUser(mockRequest, mockResponse);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          username: onboaringPayload.username,
        },
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: {
          id: user.id,
        },
        data: {
          ...onboaringPayload,
          onboarded: true,
        },
        select: {
          id: true,
          username: true,
          name: true,
          profile_image: true,
          cover_image: true,
          location: true,
          gender: true,
          twitter: true,
          email: true,
          facebook: true,
          about: true,
          onboarded: true,
          last_login: true,
          is_email_verify: true,
          updated_at: true,
        },
      });
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(httpStatusCodes.OK);
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalledWith(httpStatusCodes.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "User onboarded successfully",
        data: expect.any(Object),
        error: null,
      });
      expect(mockResponse.json).toHaveBeenCalledTimes(1);
    });
  });
});
