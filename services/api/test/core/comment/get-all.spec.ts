import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { Controller } from "@/core/comment/get-all/controller";

import { buildReq, buildRes, getLocals } from "../../helpers";

const feedId = faker.string.uuid();
const groupId = faker.string.uuid();
const { locals, user } = getLocals();

const mockGroupRepository = { findById: jest.fn(), groupMember: { isMember: jest.fn() } };
const mockFeedRepository = { findById: jest.fn() };
const mockCommentRepository = { count: jest.fn(), findByFeedId: jest.fn() };

const controller = new Controller({
  assert: new Assertions(),
  repositories: { group: mockGroupRepository, feed: mockFeedRepository, comment: mockCommentRepository }
} as unknown as AppContext);

function setup(opts: { group_id: string | null; groupType?: "PUBLIC" | "PRIVATE"; isMember?: boolean }) {
  mockFeedRepository.findById.mockResolvedValue({ id: feedId, group_id: opts.group_id });
  mockCommentRepository.count.mockResolvedValue(0);
  mockCommentRepository.findByFeedId.mockResolvedValue([]);
  mockGroupRepository.findById.mockResolvedValue({ id: groupId, type: opts.groupType ?? "PUBLIC" });
  mockGroupRepository.groupMember.isMember.mockResolvedValue(opts.isMember ?? false);
}

function buildRequest() {
  return { req: buildReq({ params: { feedId } }), res: buildRes({ locals } as never) };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Get Comments Controller", () => {
  it("should return comments of a private group post if the user is a member", async () => {
    setup({ group_id: groupId, groupType: "PRIVATE", isMember: true });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).toHaveBeenCalledWith(groupId, user.id);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it("should return not found for a private group post if the user is not a member", async () => {
    setup({ group_id: groupId, groupType: "PRIVATE", isMember: false });
    const { req, res } = buildRequest();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`Feed with ID ${feedId} not found`);
    expect(mockCommentRepository.findByFeedId).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return not found if the feed does not exist", async () => {
    setup({ group_id: null });
    mockFeedRepository.findById.mockResolvedValue(null);
    const { req, res } = buildRequest();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`Feed with ID ${feedId} not found`);
    expect(mockCommentRepository.findByFeedId).not.toHaveBeenCalled();
  });

  it("should return comments of a public group post without checking membership", async () => {
    setup({ group_id: groupId, groupType: "PUBLIC" });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it("should return comments without group checks if the post has no group", async () => {
    setup({ group_id: null });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });
});
