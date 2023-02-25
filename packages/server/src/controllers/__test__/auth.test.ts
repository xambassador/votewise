/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faker } from "@faker-js/faker";
import http from "http";
import httpStatusCodes from "http-status-codes";
import supertest from "supertest";

import { AUTH_ROUTE_V1, REGISTER_USER_V1 } from "../../configs";
import app from "../../index";

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
});
