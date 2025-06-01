import type { UploadQueue } from "../upload";

export const mockUploadQueue = {
  add: jest.fn().mockName("add"),
  init: jest.fn().mockName("init")
} as unknown as jest.Mocked<UploadQueue>;
