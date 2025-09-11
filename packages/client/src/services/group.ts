import type {
  CreateGroupResponse,
  GetAllGroupsResponse,
  GetGroupResponse,
  GetMyGroupsResponse,
  JoinGroupResponse,
  KickMemberResponse,
  LeaveGroupResponse,
  SendGroupInviteResponse
} from "@votewise/api";
import type { TGroupCreate } from "@votewise/schemas/group";
import type { TPagination } from "@votewise/schemas/pagination";
import type { Client } from "../client";
import type { Client as ServerClient } from "../server";

import { groups } from "@votewise/constant/routes";

import { qs } from "./qs";

type GroupOptions = {
  client: Client | ServerClient;
};

export class Group {
  private readonly client: Client | ServerClient;

  constructor(opts: GroupOptions) {
    this.client = opts.client;
  }

  public async getAll(query?: TPagination) {
    const path = groups.runtime.all("");
    const response = await this.client.get<GetAllGroupsResponse>(qs(path, query));
    return response;
  }

  public async getMyGroups(query?: TPagination) {
    const path = groups.runtime.myGroups("");
    const response = await this.client.get<GetMyGroupsResponse>(qs(path, query));
    return response;
  }

  public async get(id: string) {
    const path = groups.runtime.get("", id);
    const response = await this.client.get<GetGroupResponse>(path);
    return response;
  }

  public async create(data: TGroupCreate) {
    const path = groups.runtime.create("");
    const response = await this.client.post<CreateGroupResponse, TGroupCreate>(path, data);
    return response;
  }

  public async join(id: string) {
    const path = groups.runtime.join("", id);
    const response = await this.client.post<JoinGroupResponse, object>(path, {});
    return response;
  }

  public async leave(id: string) {
    const path = groups.runtime.leave("", id);
    const response = await this.client.delete<LeaveGroupResponse>(path);
    return response;
  }

  public async invite(id: string, username: string) {
    const path = groups.runtime.invite("", id, username);
    const response = await this.client.post<SendGroupInviteResponse, object>(path, {});
    return response;
  }

  public async kick(id: string, username: string) {
    const path = groups.runtime.kick("", id, username);
    const response = await this.client.delete<KickMemberResponse>(path);
    return response;
  }
}

export type {
  GetAllGroupsResponse,
  GetMyGroupsResponse,
  CreateGroupResponse,
  GetGroupResponse,
  JoinGroupResponse,
  KickMemberResponse,
  LeaveGroupResponse,
  SendGroupInviteResponse
};
