import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { Controller } from "@/core/feed/vote/controller";

import { buildReq, buildRes, getLocals } from "../../helpers";

const feedId = faker.string.uuid();
const groupId = faker.string.uuid();
const { locals, user } = getLocals();
const tx = Symbol("tx");

const mockGroupRepository = { findById: jest.fn(), groupMember: { isMember: jest.fn() } };
const mockFeedRepository = { findById: jest.fn(), isVoted: jest.fn(), vote: jest.fn() };
const mockUserRepository = { getRemainingVotes: jest.fn(), update: jest.fn() };
const mockAggregate = jest.fn();
const mockTransactionManager = {
  withDataLayerTransaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) => cb(tx))
};

const controller = new Controller({
  assert: new Assertions(),
  repositories: {
    group: mockGroupRepository,
    feed: mockFeedRepository,
    user: mockUserRepository,
    aggregator: { postAggregator: { aggregate: mockAggregate }, userAggregator: { aggregate: mockAggregate } },
    transactionManager: mockTransactionManager
  }
} as unknown as AppContext);

function setup(opts: { group_id: string | null; groupType?: "PUBLIC" | "PRIVATE"; isMember?: boolean }) {
  mockFeedRepository.findById.mockResolvedValue({ id: feedId, group_id: opts.group_id });
  mockFeedRepository.isVoted.mockResolvedValue(false);
  mockFeedRepository.vote.mockResolvedValue(undefined);
  mockUserRepository.getRemainingVotes.mockResolvedValue(5);
  mockUserRepository.update.mockResolvedValue(undefined);
  mockAggregate.mockResolvedValue({});
  mockGroupRepository.findById.mockResolvedValue({ id: groupId, type: opts.groupType ?? "PUBLIC" });
  mockGroupRepository.groupMember.isMember.mockResolvedValue(opts.isMember ?? false);
}

function buildRequest() {
  return { req: buildReq({ params: { id: feedId } }), res: buildRes({ locals } as never) };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Vote Feed Controller", () => {
  it("should vote on a post of a private group if the user is a member", async () => {
    setup({ group_id: groupId, groupType: "PRIVATE", isMember: true });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).toHaveBeenCalledWith(groupId, user.id);
    expect(mockFeedRepository.vote).toHaveBeenCalledWith(user.id, feedId, tx);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it("should not vote on a post of a private group if the user is not a member", async () => {
    setup({ group_id: groupId, groupType: "PRIVATE", isMember: false });
    const { req, res } = buildRequest();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`Feed with id ${feedId} not found`);
    expect(mockFeedRepository.vote).not.toHaveBeenCalled();
    expect(mockTransactionManager.withDataLayerTransaction).not.toHaveBeenCalled();
  });

  it("should vote on a post of a public group without checking membership", async () => {
    setup({ group_id: groupId, groupType: "PUBLIC" });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it("should vote on a post without group checks if the post has no group", async () => {
    setup({ group_id: null });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });
});
