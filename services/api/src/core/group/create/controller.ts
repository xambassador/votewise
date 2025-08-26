import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZGroupCreate } from "@votewise/schemas/group";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  requestParser: AppContext["plugins"]["requestParser"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body } = this.ctx.requestParser.getParser(ZGroupCreate).parseRequest(req, res);
    const locals = getAuthenticateLocals(res);
    const { sub } = locals.payload;

    const isNameTaken = await this.ctx.groupRepository.getByName(body.name);
    this.ctx.assert.unprocessableEntity(!!isNameTaken, "Group name is already taken");

    const group = await this.ctx.groupRepository.create({
      name: body.name,
      about: body.description,
      status: "OPEN",
      type: body.type,
      coverImageUrl: body.cover_image_url
    });
    const member = await this.ctx.groupRepository.groupMember.addMember(group.id, sub, "ADMIN");
    const result = {
      group: { id: group.id, name: group.name, about: group.about, type: group.type },
      member: { id: member.id }
    };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type CreateGroupResponse = ExtractControllerResponse<Controller>;
