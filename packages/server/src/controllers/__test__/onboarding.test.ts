import http from "http";
import httpStatusCodes from "http-status-codes";
import supertest from "supertest";

import prismaMock from "../../../test/__mock__/prisma";
import { getUser } from "../../__mock__";
import { ONBOARDING_ROUTE_V1, ONBOARDING_STATUS_V1, ONBOARDING_UPDATE_V1 } from "../../configs";
import app from "../../index";
import JWT from "../../services/user/jwt";

jest.mock("@votewise/prisma", () => ({ prisma: prismaMock }));

const getOnboardingStatusUrl = (userId: string) => {
  return `${ONBOARDING_ROUTE_V1}${ONBOARDING_STATUS_V1}`.replace(":userId", userId);
};

const getOnboardingUpdateUrl = (userId: string) => {
  return `${ONBOARDING_ROUTE_V1}${ONBOARDING_UPDATE_V1}`.replace(":userId", userId);
};

const token = JWT.generateAccessToken({ userId: 1 });
describe("Onboarding API", () => {
  let server: http.Server;

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

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("GET /api/v1/onboarding/:userId/status", () => {
    test("Should return UNAUTHORIZED by middleware to insure onboarding controller is behind the authorization middleware", async () => {
      const request = supertest(server);
      const url = getOnboardingStatusUrl("2");
      prismaMock.user.findUnique.mockResolvedValue(user);
      const response = await request.get(url);

      expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
      expect(response.body).toEqual(unauthorizedError);
    });

    test("Should return UNAUTHORIZED if authenticated userId and params userId not match", async () => {
      const request = supertest(server);
      const url = getOnboardingStatusUrl("2");
      prismaMock.user.findUnique.mockResolvedValue(user);
      const response = await request.get(url).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
      expect(response.body).toEqual(unauthorizedError);
    });
  });

  describe("PUT /api/v1/onboarding/:userId", () => {
    /*
     request should contain userId in params.
     request should authenticated.
     request should contain valid payload.
     user should not be onboarded alrady.
     no other user can onboard other user.
     if username in payload is already taken by other user, return error.
    */

    test("Should return UNAUTHORIZED by middleware to insure onboarding controller is behind the authorization middleware", async () => {
      const request = supertest(server);
      const url = getOnboardingUpdateUrl("1");
      prismaMock.user.findUnique.mockResolvedValue(user);
      prismaMock.user.update.mockResolvedValue(user);

      const response = await request.put(url).send(onboaringPayload);

      expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
      expect(response.body).toEqual(unauthorizedError);
    });

    test("Should return UNAUTHORIZED if authenticated userId and params userId not match", async () => {
      const request = supertest(server);
      const url = getOnboardingUpdateUrl("2");
      prismaMock.user.findUnique.mockResolvedValue(getUser({ id: 1 }));
      prismaMock.user.update.mockResolvedValue({
        ...user,
        ...onboaringPayload,
        onboarded: true,
      });
      const response = await request.put(url).send(onboaringPayload).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
      expect(response.body).toEqual(unauthorizedError);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });
});
