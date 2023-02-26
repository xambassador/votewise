/* eslint-disable @typescript-eslint/ban-ts-comment */
import { faker } from "@faker-js/faker";
import http from "http";
import httpStatusCodes from "http-status-codes";
import supertest from "supertest";

import prismaMock from "../../../test/__mock__/prisma";
import { AUTH_ROUTE_V1, REGISTER_USER_V1 } from "../../configs";
import app from "../../index";

// Tell Jest to mock the prisma module
jest.mock("@votewise/prisma", () => ({ prisma: prismaMock }));

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
    const newUser = {
      id: 1,
      name: faker.name.firstName(),
      email,
      password,
      username: faker.internet.userName(),
      about: faker.lorem.paragraph(),
      twitter: "",
      facebook: "",
      instagram: "",
      profile_image: "",
      cover_image: "",
      created_at: new Date(),
      updated_at: new Date(),
      location: "",
      onboarded: false,
    };

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
    const newUser = {
      id: 1,
      name: faker.name.firstName(),
      email,
      password,
      username: faker.internet.userName(),
      about: faker.lorem.paragraph(),
      twitter: "",
      facebook: "",
      instagram: "",
      profile_image: "",
      cover_image: "",
      created_at: new Date(),
      updated_at: new Date(),
      location: "",
      onboarded: false,
      gender: null,
    };

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
