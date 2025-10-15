import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

type ControllerOptions = {
  assert: AppContext["assert"];
  bucketService: AppContext["services"]["bucket"];
  searchRepository: AppContext["repositories"]["search"];
};

const ZQuery = z.object({ q: z.string().optional() });

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const validate = ZQuery.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const body = validate.data!;
    const q = body.q || "";

    if (q.length < 3) {
      return res.status(StatusCodes.OK).json({ results: { users: [], groups: [] } });
    }

    const [_users, _groups] = await Promise.all([
      this.ctx.searchRepository.searchUsers(q),
      this.ctx.searchRepository.searchGroups(q)
    ]);

    const users = _users.map((user) => ({
      id: user.id,
      user_name: user.user_name,
      first_name: user.first_name,
      last_name: user.last_name,
      about: user.about,
      avatar: this.ctx.bucketService.generatePublicUrl(user.avatar_url ?? "", "avatar"),
      created_at: user.created_at,
      updated_at: user.updated_at
    }));

    const groups = _groups.map((group) => ({
      id: group.id,
      name: group.name,
      about: group.about,
      type: group.type,
      status: group.status,
      logo_url: group.logo_url,
      created_at: group.created_at,
      updated_at: group.updated_at
    }));

    const result = { results: { users, groups } };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type SearchResponse = ExtractControllerResponse<Controller>;
