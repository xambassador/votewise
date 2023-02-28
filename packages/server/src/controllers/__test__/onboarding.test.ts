import http from "http";
import httpStatusCodes from "http-status-codes";
import supertest from "supertest";

import prismaMock from "../../../test/__mock__/prisma";
import { getUser } from "../../__mock__";
import { ONBOARDING_ROUTE_V1, ONBOARDING_STATUS_V1 } from "../../configs";
import app from "../../index";
import JWT from "../../services/user/jwt";

jest.mock("@votewise/prisma", () => ({ prisma: prismaMock }));

describe("Onboarding API", () => {
  let server: http.Server;

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
      const user = getUser({
        email: "test@gmail.com",
        id: 1,
      });
      prismaMock.user.findUnique.mockResolvedValue(user);
      const response = await request.get(
        `${ONBOARDING_ROUTE_V1}${ONBOARDING_STATUS_V1}`.replace(":userId", "2")
      );

      expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
      expect(response.body).toEqual({
        success: false,
        message: "Unauthorized",
        data: null,
        error: {
          message: "Unauthorized",
        },
      });
    });

    test("Should return UNAUTHORIZED if authenticated userId and params userId not match", async () => {
      const request = supertest(server);
      const user = getUser({
        email: "test@gmail.com",
        id: 1,
      });
      const token = JWT.generateAccessToken({ userId: 1 });
      prismaMock.user.findUnique.mockResolvedValue(user);
      const response = await request
        .get(`${ONBOARDING_ROUTE_V1}${ONBOARDING_STATUS_V1}`.replace(":userId", "2"))
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatusCodes.UNAUTHORIZED);
      expect(response.body).toEqual({
        success: false,
        message: "Unauthorized",
        data: null,
        error: {
          message: "Unauthorized",
        },
      });
    });
  });
});
