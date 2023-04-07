import type { NextFunction, Request, Response } from "express";

const createRequest = (req: Partial<Request> = {}) => {
  return req as Request;
};

const createResponse = (res: Partial<Response> = {}) => {
  const response = res as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
};

const createNext = () => {
  return jest.fn() as NextFunction;
};

export { createRequest, createResponse, createNext };
