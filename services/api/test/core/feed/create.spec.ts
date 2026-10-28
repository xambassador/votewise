import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { Controller } from "@/core/feed/create/controller";
import { requestParserPluginFactory } from "@/plugins/request-parser";

import { buildReq, buildRes, getLocals } from "../../helpers";

const groupId = faker.string.uuid();
const topicId = faker.string.uuid();
const { locals, user } = getLocals();
const tx = Symbol("tx");

const mockGroupRepository = { findById: jest.fn(), groupMember: { isMember: jest.fn() } };
const mockFeedRepository = { create: jest.fn() };
const mockTopicRepository = { findById: jest.fn() };
const mockPostTopicRepository = { createMany: jest.fn() };
const mockFeedAssetRepository = { createMany: jest.fn() };
const mockFollowRepository = { findByFollowingId: jest.fn() };
const mockTimelineRepository = { createMany: jest.fn() };
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
    topic: mockTopicRepository,
    postTopic: mockPostTopicRepository,
    feedAsset: mockFeedAssetRepository,
    follow: mockFollowRepository,
    timeline: mockTimelineRepository,
    aggregator: { postAggregator: { aggregate: mockAggregate }, userAggregator: { aggregate: mockAggregate } },
    transactionManager: mockTransactionManager
  }
} as unknown as AppContext);

function setup(groupType: "PUBLIC" | "PRIVATE" = "PUBLIC", isMember = true) {
  mockGroupRepository.findById.mockResolvedValue({ id: groupId, type: groupType });
  mockGroupRepository.groupMember.isMember.mockResolvedValue(isMember);
  mockTopicRepository.findById.mockResolvedValue({ id: topicId });
  mockFeedRepository.create.mockResolvedValue({ id: faker.string.uuid(), created_at: new Date() });
  mockPostTopicRepository.createMany.mockResolvedValue([]);
  mockAggregate.mockResolvedValue({});
  mockFollowRepository.findByFollowingId.mockResolvedValue([]);
  mockTimelineRepository.createMany.mockResolvedValue([]);
}

function buildRequest(group_id?: string) {
  const req = buildReq({ body: { title: "Title", content: "Content", topics: [topicId], group_id } });
  const res = buildRes({ locals } as never);
  return { req, res };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Create Feed Controller", () => {
  it("should create a post in a private group if the user is a member", async () => {
    setup("PRIVATE", true);
    const { req, res } = buildRequest(groupId);
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).toHaveBeenCalledWith(groupId, user.id);
    expect(mockFeedRepository.create).toHaveBeenCalledWith(expect.objectContaining({ groupId }), tx);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  it("should not create a post in a private group if the user is not a member", async () => {
    setup("PRIVATE", false);
    const { req, res } = buildRequest(groupId);
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("You are not a member of this group");
    expect(mockFeedRepository.create).not.toHaveBeenCalled();
    expect(mockTransactionManager.withDataLayerTransaction).not.toHaveBeenCalled();
  });

  it("should throw not found if the group does not exist", async () => {
    setup();
    mockGroupRepository.findById.mockResolvedValue(null);
    const { req, res } = buildRequest(groupId);
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe(`Group with id ${groupId} not found`);
    expect(mockFeedRepository.create).not.toHaveBeenCalled();
  });

  it("should create a post in a public group without checking membership", async () => {
    setup("PUBLIC", false);
    const { req, res } = buildRequest(groupId);
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.isMember).not.toHaveBeenCalled();
    expect(mockFeedRepository.create).toHaveBeenCalledWith(expect.objectContaining({ groupId }), tx);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });

  it("should create a post without group checks if there is no group_id", async () => {
    setup();
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.findById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
  });
});
