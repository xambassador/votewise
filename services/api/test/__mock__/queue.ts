import type { TasksQueue } from "@/queues/task";

export const mockTaskQueue = {
  init: jest.fn(),
  initWorker: jest.fn(),
  add: jest.fn().mockName("taskQueue.add")
} as unknown as jest.Mocked<TasksQueue>;
