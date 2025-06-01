import type { PostTopicRepository } from "../post-topic.repository";

export const mockPostTopicRepository = {
  create: jest.fn().mockName("create"),
  createMany: jest.fn().mockName("createMany"),
  getInterestedFeedIds: jest.fn().mockName("getInterestedFeedIds")
} as unknown as jest.Mocked<PostTopicRepository>;
