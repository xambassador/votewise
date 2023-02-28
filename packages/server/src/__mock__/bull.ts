/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Queue {
  handler: any;

  done() {}

  on() {}

  count() {
    return 0;
  }

  getDelayedCount() {
    return 0;
  }

  add(data: any) {
    const job = this.createJob(data);

    if (!this.handler) {
      return;
    }

    this.handler(job, this.done);
  }

  process(handler: any) {
    if (this.handler) {
      throw Error("Cannot define a handler more than once per Queue instance");
    }

    this.handler = handler;
  }

  createJob(data: any) {
    return {
      data,
    };
  }
}
