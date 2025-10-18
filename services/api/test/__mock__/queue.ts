import type { TasksQueue } from "@/queues/task";
import type { UploadQueue } from "@/queues/upload";

export const mockTaskQueue = {
  init: jest.fn(),
  initWorker: jest.fn(),
  add: jest.fn().mockName("taskQueue.add")
} as unknown as jest.Mocked<TasksQueue>;

export const mockUploadQueue = {
  add: jest.fn().mockName("add"),
  init: jest.fn().mockName("init")
} as unknown as jest.Mocked<UploadQueue>;
