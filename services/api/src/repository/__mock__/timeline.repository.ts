import type { TimelineRepository } from "../timeline.repository";

export const mockTimelineRepository = {
  countByUserId: jest.fn().mockName("countByUserId"),
  createMany: jest.fn().mockName("createMany"),
  findByUserId: jest.fn().mockName("findByUserId")
} as unknown as jest.Mocked<TimelineRepository>;
