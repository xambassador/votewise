import type { EventData, Events } from "@votewise/types";

import { EventEmitter } from "eventemitter3";

export class EventBus {
  private static _instance: EventBus;
  private static emitter: EventEmitter<Events>;

  constructor() {}

  static create(): EventBus {
    if (!EventBus._instance) {
      EventBus._instance = new EventBus();
      EventBus.emitter = new EventEmitter<Events>();
    }
    return EventBus._instance;
  }

  public get eventBus() {
    if (!EventBus._instance) {
      throw new Error("EventBus not initialized. Call EventBus.create() first.");
    }
    return EventBus._instance;
  }

  private get emitter() {
    if (!EventBus.emitter) {
      throw new Error("EventBus emitter not initialized. Call EventBus.create() first.");
    }
    return EventBus.emitter;
  }

  public on<T extends keyof Events>(event: T, listener: (data: EventData<T>) => void): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.emitter.on(event, listener);
  }

  public off<T extends keyof Events>(event: T, listener: (data: EventData<T>) => void): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.emitter.off(event, listener);
  }

  public emit<T extends keyof Events>(event: T, data: EventData<T>): boolean {
    return this.emitter.emit(event, data);
  }
}
