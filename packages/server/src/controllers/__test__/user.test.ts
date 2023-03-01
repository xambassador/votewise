import http from "http";
import httpStatusCodes from "http-status-codes";
import supertest from "supertest";

import prismaMock from "../../../test/__mock__/prisma";
import { getUser } from "../../__mock__";
import { CHECK_USERNAME_AVAILABILITY_V1, USER_ROUTE_V1 } from "../../configs";
import app from "../../index";

jest.mock("@votewise/prisma", () => ({ prisma: prismaMock }));

const { BAD_REQUEST, OK } = httpStatusCodes;

describe("User controller", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("Should return BAD_REQUEST if username is not provided", async () => {
    const request = supertest(server);
    const user = getUser({ username: "test" });
    prismaMock.user.findUnique.mockResolvedValue(user);
    const response = await request.get(`${USER_ROUTE_V1}${CHECK_USERNAME_AVAILABILITY_V1}`);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(response.status).toBe(BAD_REQUEST);
    expect(response.body).toEqual({
      message: "Validation failed",
      data: null,
      error: {
        message: "Username is required",
      },
      success: false,
    });
  });

  test("Should return BAD_REQUEST if username is already taken", async () => {
    const request = supertest(server);
    const user = getUser({
      username: "test",
    });
    prismaMock.user.findUnique.mockResolvedValue(user);
    const response = await request.get(`${USER_ROUTE_V1}${CHECK_USERNAME_AVAILABILITY_V1}?username=test`);
    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(prismaMock.user.findUnique).toBeCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: "test",
      },
    });
    expect(response.status).toBe(BAD_REQUEST);
    expect(response.status).not.toBe(OK);
    expect(response.body).toEqual({
      message: "Username is already taken",
      data: null,
      error: {
        message: "Username is already taken",
      },
      success: false,
    });
  });

  test("Should return OK if username is available", async () => {
    const request = supertest(server);
    prismaMock.user.findUnique.mockResolvedValue(null);
    const response = await request.get(`${USER_ROUTE_V1}${CHECK_USERNAME_AVAILABILITY_V1}?username=test`);
    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(prismaMock.user.findUnique).toBeCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: "test",
      },
    });
    expect(response.status).toBe(OK);
    expect(response.status).not.toBe(BAD_REQUEST);
    expect(response.body).toEqual({
      message: "Username is available",
      data: {
        username: "test",
        message: "Username test is available",
      },
      error: null,
      success: true,
    });
  });
});
