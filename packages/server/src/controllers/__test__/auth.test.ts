/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faker } from "@faker-js/faker";
import httpStatusCodes from "http-status-codes";
import supertest from "supertest";

import { prismaMock } from "../../../test/prisma";
import { AUTH_ROUTE_V1, REGISTER_USER_V1 } from "../../configs";
import { httpServer as app } from "../../index";

const request = supertest(app);

afterAll(async () => {
  await prismaMock.$disconnect();
});

describe("POST /api/v1/auth/register", () => {
  test("Should return BAD_REQUEST if the request body is invalid", async () => {
    const response = await request.post(`${AUTH_ROUTE_V1}${REGISTER_USER_V1}`).send({
      email: faker.internet.email(),
    });

    expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
    expect(response.status).not.toBe(httpStatusCodes.CREATED);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("message", "Validation failed");
    expect(response.body).toHaveProperty("data", null);
  });
});
