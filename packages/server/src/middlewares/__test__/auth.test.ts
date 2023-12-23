import type { NextFunction, Request, Response } from "express";
import httpSatatusCodes from "http-status-codes";

import prismaMock from "../../../test/__mock__/prisma";
import ErrorResponse from "../../classes/ErrorResponse";
import JWTService from "../../services/user/jwt";
import { getUser } from "../../__mock__";
import authorizationMiddleware from "../auth";

jest.mock("@votewise/prisma", () => ({ prisma: prismaMock }));

const { UNAUTHORIZED } = httpSatatusCodes;

const unauthorizedResponse = new ErrorResponse(
  "Unauthorized",
  "You are not authorized to access this resource",
  UNAUTHORIZED
);

describe("Authorization middleware", () => {
  test("Should return UNAUTHORIZED if no headers are available.", async () => {
    const mockRequest: Partial<Request> = {};
    const mockResponse: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const nextFunction: NextFunction = jest.fn();
    await authorizationMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toBeCalledWith(UNAUTHORIZED);
    expect(mockResponse.status).toBeCalledTimes(1);
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.json).toBeCalledWith(unauthorizedResponse);
  });

  test("Should return UNAUTHORIZED if token is not available.", async () => {
    const mockRequest: Partial<Request> = {
      headers: {},
    };
    const mockResponse: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const nextFunction: NextFunction = jest.fn();
    await authorizationMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toBeCalledWith(UNAUTHORIZED);
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toBeCalledTimes(1);
    expect(mockResponse.json).toBeCalledWith(unauthorizedResponse);
  });

  test("Should return UNAUTHORIZED if token is not valid.", async () => {
    const mockRequest: Partial<Request> = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    };
    const mockResponse: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const nextFunction: NextFunction = jest.fn();
    await authorizationMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toBeCalledWith(UNAUTHORIZED);
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toBeCalledTimes(1);
    expect(mockResponse.json).toBeCalledWith(unauthorizedResponse);
  });

  test("Should return UNAUTHORIZED if user is not found", async () => {
    const token = JWTService.generateAccessToken({ userId: 1, onboarded: false });
    const mockRequest: Partial<Request> = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    prismaMock.user.findUnique.mockResolvedValue(null);
    const mockResponse: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const nextFunction: NextFunction = jest.fn();
    await authorizationMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).toBeCalledWith(UNAUTHORIZED);
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toBeCalledTimes(1);
    expect(mockResponse.json).toBeCalledWith(unauthorizedResponse);
  });

  test("Should call next function if token is valid and user is present in database", async () => {
    const token = JWTService.generateAccessToken({ userId: 1, onboarded: false });
    const mockRequest: Partial<Request> = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    prismaMock.user.findUnique.mockResolvedValue({
      ...getUser({ id: 1 }),
    });
    const mockResponse: Partial<Response> = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    const nextFunction: NextFunction = jest.fn();
    await authorizationMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
