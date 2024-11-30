import type { FactorRepository } from "../factor.repository";

export const mockFactorRepository = {
  create: jest.fn().mockName("factorRepository.create"),
  verifyFactor: jest.fn().mockName("factorRepository.verifyFactor"),
  findByUserIdAndType: jest.fn().mockName("factorRepository.findByUserIdAndType"),
  findByUserId: jest.fn().mockName("factorRepository.findByUserId").mockResolvedValue([]),
  findById: jest.fn().mockName("factorRepository.findById")
} as unknown as jest.Mocked<FactorRepository>;
