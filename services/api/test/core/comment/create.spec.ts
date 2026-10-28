import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { Controller } from "@/core/comment/create/controller";
import { requestParserPluginFactory } from "@/plugins/request-parser";

import { buildReq, buildRes, getLocals } from "../../helpers";

const feedId = faker.string.uuid();
const groupId = faker.string.uuid();
const { locals, user } = getLocals();
const tx = Symbol("tx");

const mockGroupRepository = { findById: jest.fn(), groupMember: { isMember: jest.fn() } };
const mockFeedRepository = { findById: jest.fn() };
const mockCommentRepository = { findById: jest.fn(), create: jest.fn() };
const mockAggregate = jest.fn();
const mockTransactionManager = {
  withDataLayerTransaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) => cb(tx))
};

const controller = new Controller({
  plugins: { requestParser: requestParserPluginFactory() },
  assert: new Assertions(),
  repositories: {
    group: mockGroupRepository,
    feed: mockFeedRepository,
    comment: mockCommentRepository,
    aggregator: { postAggregator: { aggregate: mockAggregate }, userAggregator: { aggregate: mockAggregate } },
    transactionManager: mockTransactionManager
  }
} as unknown as AppContext);

function setup(opts: { group_id: string | null; groupType?: "PUBLIC" | "PRIVATE"; isMember?: boolean }) {
  mockFeedRepository.findById.mockResolvedValue({ id: feedId, group_id: opts.group_id });
  mockCommentRepository.create.mockResolvedValue({ id: faker.string.uuid() });
  mockAggregate.mockResolvedValue({});
  mockGroupRepository.findById.mockResolvedValue({ id: groupId, type: opts.groupType ?? "PUBLIC" });
  mockGroupRepository.groupMember.isMember.mockResolvedValue(opts.isMember ?? false);
}

function buildRequest() {
  const req = buildReq({ params: { feedId }, body: { text: "Nice post" } });
  return { req, res: buildRes({ locals } as never) };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Create Comment Controller", () => {
  it("should comment on a post of a private group if the user is a member", async () => {
    setup({ group_id: groupId, groupType: "PRIVATE", isMember: true });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).toHaveBeenCalledWith(groupId, user.id);
    expect(mockCommentRepository.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  it("should not comment on a post of a private group if the user is not a member", async () => {
    setup({ group_id: groupId, groupType: "PRIVATE", isMember: false });
    const { req, res } = buildRequest();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`Feed with ID ${feedId} not found`);
    expect(mockCommentRepository.create).not.toHaveBeenCalled();
    expect(mockTransactionManager.withDataLayerTransaction).not.toHaveBeenCalled();
  });

  it("should comment on a post of a public group without checking membership", async () => {
    setup({ group_id: groupId, groupType: "PUBLIC" });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  it("should comment on a post without group checks if the post has no group", async () => {
    setup({ group_id: null });
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });
});
