import httpStatusCodes from "http-status-codes";

import prismaMock from "../../../test/__mock__/prisma";
import { createRequest, createResponse, getUser } from "../../__mock__";
import { checkUsernameAvailability } from "../user";

jest.mock("@votewise/prisma", () => ({ prisma: prismaMock }));

const { BAD_REQUEST, OK } = httpStatusCodes;

describe("User controller", () => {
  test("Should return BAD_REQUEST if username is not provided", async () => {
    const mockRequest = createRequest({
      query: {
        username: "",
      },
    });
    const mockResponse = createResponse();
    await checkUsernameAvailability(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(mockResponse.status).toBeCalledWith(BAD_REQUEST);
    expect(mockResponse.status).not.toBeCalledWith(OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: "Validation failed",
      error: {
        message: "Username is required",
      },
    });
  });

  test("Should return BAD_REQUEST if username is already taken", async () => {
    const user = getUser({
      username: "test",
    });
    const mockRequest = createRequest({
      query: {
        username: "test",
      },
    });
    const mockResponse = createResponse();
    prismaMock.user.findUnique.mockResolvedValue(user);
    await checkUsernameAvailability(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(prismaMock.user.findUnique).toBeCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: "test",
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(BAD_REQUEST);
    expect(mockResponse.status).not.toHaveBeenCalledWith(OK);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      data: null,
      message: "Username is already taken",
      error: {
        message: "Username is already taken",
      },
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });

  test("Should return OK if username is available", async () => {
    const mockRequest = createRequest({
      query: {
        username: "test",
      },
    });
    const mockResponse = createResponse();
    prismaMock.user.findUnique.mockResolvedValue(null);
    await checkUsernameAvailability(mockRequest, mockResponse);
    expect(prismaMock.user.findUnique).toHaveBeenCalled();
    expect(prismaMock.user.findUnique).toBeCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: {
        username: "test",
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(OK);
    expect(mockResponse.status).not.toHaveBeenCalledWith(BAD_REQUEST);
    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: {
        username: "test",
        message: `Username test is available`,
      },
      message: "Username is available",
      error: null,
    });
    expect(mockResponse.json).toHaveBeenCalledTimes(1);
  });
});
