/**
 * Upload queue: Used to upload files to minio
 */
export const uploadQueueName = "upload";

export const uploadQueueDefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000
  }
};

/**
 * Upload completed event bus: Used to notify api service when a file is uploaded to minio
 */
export const uploadCompletedEventQueueName = "upload-completed-event";

export const uploadCompletedEventQueueDefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 1000
  }
};

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
