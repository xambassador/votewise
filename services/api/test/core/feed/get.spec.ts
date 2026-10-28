import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { Controller } from "@/core/feed/get/controller";

import { buildReq, buildRes, getLocals } from "../../helpers";

const feedId = faker.string.uuid();
const groupId = faker.string.uuid();
const { locals, user } = getLocals();

const mockGroupRepository = { findById: jest.fn(), groupMember: { isMember: jest.fn() } };
const mockFeedRepository = { findById: jest.fn(), isVoted: jest.fn() };

const controller = new Controller({
  assert: new Assertions(),
  repositories: { group: mockGroupRepository, feed: mockFeedRepository }
} as unknown as AppContext);

function setup(opts: { group_id: string | null; groupType?: "PUBLIC" | "PRIVATE"; isMember?: boolean }) {
  mockFeedRepository.findById.mockResolvedValue({
    id: feedId,
    group_id: opts.group_id,
    author: { id: faker.string.uuid() },
    assets: [],
    upvotes: [],
    postAggregates: { votes: 0, comments: 0 }
  });
  mockFeedRepository.isVoted.mockResolvedValue(false);
  mockGroupRepository.findById.mockResolvedValue({ id: groupId, type: opts.groupType ?? "PUBLIC" });
  mockGroupRepository.groupMember.isMember.mockResolvedValue(opts.isMember ?? false);
}

function buildRequest() {
  return { req: buildReq({ params: { id: feedId } }), res: buildRes({ locals } as never) };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Get Feed Controller", () => {
  it("should return a post of a private group if the user is a member", async () => {
    setup({ group_id: groupId, groupType: "PRIVATE", isMember: true });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).toHaveBeenCalledWith(groupId, user.id);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it("should return not found for a post of a private group if the user is not a member", async () => {
    setup({ group_id: groupId, groupType: "PRIVATE", isMember: false });
    const { req, res } = buildRequest();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`Feed with id ${feedId} not found`);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return a post of a public group without checking membership", async () => {
    setup({ group_id: groupId, groupType: "PUBLIC" });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it("should return a post without group checks if the post has no group", async () => {
    setup({ group_id: null });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });
});
