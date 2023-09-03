import type { NextFunction } from "express";
import httpSatatusCodes from "http-status-codes";

import ErrorResponse from "../../classes/ErrorResponse";
import { ONBOARDING_ERROR_CODE } from "../../utils/constants";
import { createRequest, createResponse, getUser } from "../../__mock__";
import onboardedMiddleware from "../onboarded";

const { BAD_REQUEST } = httpSatatusCodes;

const message = "User is not onboarded";
const notOnboardeResponse = new ErrorResponse(message, message, ONBOARDING_ERROR_CODE);

describe("Onboarded middleware", () => {
  test("Should return BAD_REQUEST if user is not onboarded.", async () => {
    const user = getUser({
      onboarded: false,
    });
    const mockRequest = createRequest({
      session: {
        user,
      },
    });
    const mockResponse = createResponse();
    const nextFunction: NextFunction = jest.fn();
    await onboardedMiddleware(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).toBeCalledWith(BAD_REQUEST);
    expect(mockResponse.status).toBeCalledTimes(1);
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.json).toBeCalledWith(notOnboardeResponse);
  });

  test("Should call next function if user is onboarded", async () => {
    const user = getUser({
      onboarded: true,
    });
    const mockRequest = createRequest({
      session: {
        user,
      },
    });
    const mockResponse = createResponse();
    const nextFunction: NextFunction = jest.fn();
    await onboardedMiddleware(mockRequest, mockResponse, nextFunction);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).not.toHaveBeenCalled();
  });
});
