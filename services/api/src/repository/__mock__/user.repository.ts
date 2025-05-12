import type { UserRepository } from "../user.repository";

export const mockUserRepository = {
  create: jest.fn().mockName("userRepository.create"),
  find: jest.fn().mockName("userRepository.find"),
  findOne: jest.fn().mockName("userRepository.findOne"),
  findById: jest.fn().mockName("userRepository.findById"),
  findByEmail: jest.fn().mockName("userRepository.findByEmail"),
  update: jest.fn().mockName("userRepository.update"),
  delete: jest.fn().mockName("userRepository.delete"),
  findByUsername: jest.fn().mockName("userRepository.findByUsername"),
  findManyByIds: jest.fn().mockName("userRepository.findManyByIds")
} as unknown as jest.Mocked<UserRepository>;
