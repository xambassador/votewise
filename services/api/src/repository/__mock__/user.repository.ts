import type { UserRepository } from "../user.repository";

export const mockUserRepository = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
} as unknown as jest.Mocked<UserRepository>;
