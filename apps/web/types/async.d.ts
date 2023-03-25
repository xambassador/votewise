type AsyncState<T> = {
  status: "idle" | "pending" | "resolved" | "rejected";
  data: T | null;
  error: any | null;
};

type AsyncAction<T> = {
  type: "pending" | "resolved" | "rejected";
  data: T | null;
  error: any | null;
};

export { AsyncState, AsyncAction };
