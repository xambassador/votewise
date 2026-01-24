/**
 * Tasks queue: Used to process tasks like sending emails, etc.
 */
export const tasksQueueName = "tasks";

export const tasksQueueDefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000
  }
};
