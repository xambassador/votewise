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
  transactionManager: AppContext["repositories"]["transactionManager"];
  aggregator: AppContext["repositories"]["aggregator"];
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

    const { group, member } = await this.ctx.transactionManager.withTransaction(async (tx) => {
      const group = await this.ctx.groupRepository.create(
        {
          name: body.name,
          about: body.description,
          status: "OPEN",
          type: body.type,
          coverImageUrl: body.cover_image_url
        },
        tx
      );
      const member = await this.ctx.groupRepository.groupMember.addMember(group.id, sub, "ADMIN", tx);
      await this.ctx.aggregator.userAggregator.aggregate(
        sub,
        (stats) => ({
          ...stats,
          total_groups: (stats?.total_groups ?? 0) + 1
        }),
        tx
      );
      return { group, member };
    });

    const result = {
      group: { id: group.id, name: group.name, about: group.about, type: group.type },
      member: { id: member.id }
    };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type CreateGroupResponse = ExtractControllerResponse<Controller>;
