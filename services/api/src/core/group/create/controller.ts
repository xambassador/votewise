import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZGroupCreate } from "@votewise/schemas/group";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body } = this.ctx.plugins.requestParser.getParser(ZGroupCreate).parseRequest(req, res);
    const locals = getAuthenticateLocals(res);
    const { sub } = locals.payload;

    const isNameTaken = await this.ctx.repositories.group.getByName(body.name);
    this.ctx.assert.unprocessableEntity(!!isNameTaken, "Group name is already taken");

    const { group, member } = await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
      const group = await this.ctx.repositories.group.create(
        {
          name: body.name,
          about: body.description,
          status: "OPEN",
          type: body.type,
          cover_image_url: body.cover_image_url,
          logo_url: body.logo_url
        },
        tx
      );
      const memberPromise = this.ctx.repositories.group.groupMember.addMember(group.id, sub, "ADMIN", tx);
      const userAggregatePromise = this.ctx.repositories.aggregator.userAggregator.aggregate(
        sub,
        (stats) => ({
          ...stats,
          total_groups: (stats?.total_groups ?? 0) + 1
        }),
        tx
      );
      const groupAggregatePromise = this.ctx.repositories.aggregator.groupAggregator.aggregate(
        group.id,
        (data) => ({
          ...data,
          total_members: (data?.total_members ?? 0) + 1
        }),
        tx
      );
      const [member] = await Promise.all([memberPromise, userAggregatePromise, groupAggregatePromise]);
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
