import type { UserInterestRepository } from "../user-interest.repository";

export const mockUserInterestRepository = {
  create: jest.fn().mockName("create"),
  delete: jest.fn().mockName("delete"),
  findByUserId: jest.fn().mockName("findByUserId")
} as unknown as jest.Mocked<UserInterestRepository>;
