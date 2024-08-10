import type { Service } from "../service";

import { InvalidInputError } from "@votewise/lib/errors";

import { buildReq, buildRes } from "../../../../../test/generate";
import { Controller } from "../controller";

const service = {
  execute: jest.fn()
} as unknown as jest.Mocked<Service>;
const controller = new Controller({ service });

describe("User signup controller", () => {
  it("Should throw an error if the body is invalid", async () => {
    const body = {};
    const req = buildReq({ body });
    const res = buildRes();
    await expect(controller.handle(req, res)).rejects.toThrow();
    await expect(controller.handle(req, res)).rejects.toBeInstanceOf(InvalidInputError);
    expect(service.execute).not.toHaveBeenCalled();
  });

  it("Should call the service with the correct arguments", async () => {
    const body = {
      email: "test@gmail.com",
      password: "password",
      username: "test",
      first_name: "test",
      last_name: "test"
    };
    const req = buildReq({ body });
    const res = buildRes();

    jest.spyOn(service, "execute");
    await controller.handle(req, res);
    expect(service.execute).toHaveBeenCalledWith(body);
  });
});
