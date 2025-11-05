import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { ZGroupUpdate } from "@votewise/schemas/group";

import { getAuthenticateLocals } from "@/utils/locals";

const ZParams = z.object({ groupId: z.string() });
const memberNotInGroupMessage = `Invalid request, you are not a member of this group`;
const permissionError = "You are not allowed to kick members from this group";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body } = this.ctx.plugins.requestParser.getParser(ZGroupUpdate).parseRequest(req, res);
    const validate = ZParams.safeParse(req.params);
    this.ctx.assert.badRequest(!validate.success, "Invalid request");
    const params = validate.data!;
    const locals = getAuthenticateLocals(res);
    const { sub } = locals.payload;

    const groupId = params.groupId;
    const _group = await this.ctx.repositories.group.findById(groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${groupId} not exist`);

    const _role = await this.ctx.repositories.group.groupMember.whatIsMyRole(groupId, sub);
    const role = _role!;

    const canUpdate = !(role.role === "MEMBER");
    this.ctx.assert.unprocessableEntity(!_role, memberNotInGroupMessage);
    this.ctx.assert.forbidden(!canUpdate, permissionError);

    const group = _group!;
    if (group.name !== body.name) {
      const isNameTaken = await this.ctx.repositories.group.getByName(body.name);
      this.ctx.assert.unprocessableEntity(!!isNameTaken, "Group name is already taken");
    }

    await this.ctx.repositories.group.update(params.groupId, {
      name: body.name,
      about: body.description,
      status: body.status || "OPEN",
      type: body.type,
      ...(body.cover_image_url ? { cover_image_url: body.cover_image_url } : {}),
      ...(body.logo_url ? { logo_url: body.logo_url } : {})
    });

    const result = {
      ...body
    };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type UpdateGroupResponse = ExtractControllerResponse<Controller>;
