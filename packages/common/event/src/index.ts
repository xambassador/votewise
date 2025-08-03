import type { EventData, EventNames } from "@votewise/types";

export class EventBuilder<T extends EventNames> {
  private readonly eventName: T;
  private _data: EventData<T> | undefined;

  constructor(opts: T) {
    this.eventName = opts;
  }

  public setData(data: Omit<EventData<T>, "event">): this {
    this._data = { ...data, event: this.eventName } as EventData<T>;
    return this;
  }

  public serialize(filters?: (keyof EventData<T>)[]): string {
    if (!this._data) {
      throw new Error("Data must be set before serialization");
    }
    if (filters) {
      const data = { ...this._data };
      filters.forEach((key) => {
        delete data[key];
      });
      return JSON.stringify(data);
    }
    return JSON.stringify(this._data);
  }

  get data(): EventData<T> {
    if (!this._data) {
      throw new Error("Data is not set");
    }
    return this._data;
  }

  get name(): T {
    return this.eventName;
  }
}
