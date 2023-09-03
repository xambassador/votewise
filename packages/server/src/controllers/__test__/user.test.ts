import http from "http";
import { StatusCodes } from "http-status-codes";
import supertest from "supertest";

import { CHECK_USERNAME_AVAILABILITY_V1, USER_ROUTE_V1 } from "@votewise/lib/routes";

import app from "../../../test/express-app";
import prismaMock from "../../../test/__mock__/prisma";
import ErrorResponse from "../../classes/ErrorResponse";
import { USERNAME_ALREADY_TAKEN_MSG, USERNAME_REQUIRED_MSG, VALIDATION_FAILED_MSG } from "../../utils";
import { getUser } from "../../__mock__";

jest.mock("@votewise/prisma", () => {
  // eslint-disable-next-line global-require
  const mockPrisma = require("../../../test/__mock__/prisma").default;
  return {
    prisma: mockPrisma,
  };
});

const { BAD_REQUEST, OK } = StatusCodes;

describe("User controller", () => {
  let server: http.Server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  const url = `${USER_ROUTE_V1}${CHECK_USERNAME_AVAILABILITY_V1}`;

  test("Should return BAD_REQUEST if username is not provided", async () => {
    const request = supertest(server);
    const response = await request.get(url).query({ username: "" });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(response.status).toBe(BAD_REQUEST);
    expect(response.body).toEqual(
      new ErrorResponse(USERNAME_REQUIRED_MSG, VALIDATION_FAILED_MSG, BAD_REQUEST)
    );
  });

  test("Should return BAD_REQUEST if username is already taken", async () => {
    const request = supertest(server);
    const user = getUser({
      username: "test",
    });
    prismaMock.user.findUnique.mockResolvedValue(user);
    const response = await request.get(url).query({ username: "test" });
    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(prismaMock.user.findUnique).toBeCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: "test",
      },
    });
    expect(response.status).toBe(BAD_REQUEST);
    expect(response.body).toEqual(
      new ErrorResponse(USERNAME_ALREADY_TAKEN_MSG, USERNAME_ALREADY_TAKEN_MSG, BAD_REQUEST)
    );
  });

  test("Should return OK if username is available", async () => {
    const request = supertest(server);
    prismaMock.user.findUnique.mockResolvedValue(null);
    const response = await request.get(url).query({ username: "test" });
    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(prismaMock.user.findUnique).toBeCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: "test",
      },
    });
    expect(response.status).toBe(OK);
    expect(response.body).toEqual({
      data: {
        message: `Username test is available`,
      },
      message: "Username is available",
    });
  });
});
