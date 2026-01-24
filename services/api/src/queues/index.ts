import { TasksQueue } from "./task";

export function createQueues(ctx: { env: Environment }) {
  const { env } = ctx;
  const tasksQueue = new TasksQueue({ env });
  return { tasksQueue };
}

declare global {
  interface Queue {
    tasksQueue: TasksQueue;
  }
}
