import type { SessionRepository } from "../session.repository";

export const mockSessionRepository = {
  create: jest.fn().mockName("sessionRepository.create"),
  delete: jest.fn().mockName("sessionRepository.delete"),
  findByToken: jest.fn().mockName("sessionRepository.findByToken"),
  update: jest.fn().mockName("sessionRepository.update"),
  find: jest.fn().mockName("sessionRepository.find")
} as unknown as jest.Mocked<SessionRepository>;
