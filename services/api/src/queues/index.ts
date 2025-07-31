import type { TasksQueue } from "./task";
import type { UploadQueue } from "./upload";

export * from "./task";
export * from "./upload";

declare global {
  interface Queue {
    tasksQueue: TasksQueue;
    uploadQueue: UploadQueue;
  }
}
