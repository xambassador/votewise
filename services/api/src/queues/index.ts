import { TasksQueue } from "./task";
import { UploadCompletedEventQueue, UploadQueue } from "./upload";

export function createQueues(ctx: { env: Environment }) {
  const { env } = ctx;
  const tasksQueue = new TasksQueue({ env });
  const uploadQueue = new UploadQueue({ env });
  const uploadCompletedEventQueue = new UploadCompletedEventQueue({ env });
  return { tasksQueue, uploadQueue, uploadCompletedEventQueue };
}

declare global {
  interface Queue {
    tasksQueue: TasksQueue;
    uploadQueue: UploadQueue;
  }
}
