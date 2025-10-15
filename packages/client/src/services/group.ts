import type {
  AcceptGroupJoinRequestResponse,
  CreateGroupResponse,
  GetAllGroupsResponse,
  GetGroupJoinRequestsResponse,
  GetGroupMembersResponse,
  GetGroupResponse,
  GetMyGroupsResponse,
  JoinGroupResponse,
  KickMemberResponse,
  LeaveGroupResponse,
  RejectGroupJoinRequestResponse,
  SendGroupInviteResponse
} from "@votewise/api";
import type { TGroupCreate } from "@votewise/schemas/group";
import type { TPagination } from "@votewise/schemas/pagination";
import type { BaseOptions, TClient } from "../utils";

import { groups } from "@votewise/constant/routes";

import { qs } from "./qs";

export class Group {
  private readonly client: TClient;

  constructor(opts: BaseOptions) {
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

  public async getMembers(id: string) {
    const path = groups.runtime.members("", id);
    const response = await this.client.get<GetGroupMembersResponse>(path);
    return response;
  }

  public async getJoinRequests() {
    const path = groups.runtime.joinRequests("");
    const response = await this.client.get<GetGroupJoinRequestsResponse>(path);
    return response;
  }

  public async acceptJoinRequest(id: string, query?: { notification_id?: string }) {
    const path = groups.runtime.acceptJoinRequest("", id);
    const response = await this.client.post<AcceptGroupJoinRequestResponse, object>(qs(path, query), {});
    return response;
  }

  public async rejectJoinRequest(id: string, query?: { notification_id?: string }) {
    const path = groups.runtime.declineJoinRequest("", id);
    const response = await this.client.delete<RejectGroupJoinRequestResponse>(qs(path, query));
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
  SendGroupInviteResponse,
  GetGroupJoinRequestsResponse,
  AcceptGroupJoinRequestResponse,
  RejectGroupJoinRequestResponse
};
