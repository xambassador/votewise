import React from "react";

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

const getAsyncReducer =
  <T>() =>
  (state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> => {
    switch (action.type) {
      case "pending": {
        return { status: "pending", data: null, error: null };
      }
      case "resolved": {
        return { status: "resolved", data: action.data, error: null };
      }
      case "rejected": {
        return { status: "rejected", data: null, error: action.error };
      }
      default: {
        throw new Error(`Unhandled action type: ${action.type}`);
      }
    }
  };

function useSafeDispatch<T>(dispatch: React.Dispatch<AsyncAction<T>>) {
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return React.useCallback(
    (...args: any) => {
      if (mountedRef.current) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dispatch(...args);
      }
    },
    [dispatch]
  );
}

export function useAsync<T>(initialState: AsyncState<T>) {
  const asyncReducer = getAsyncReducer<T>();
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, initialState);

  const dispatch = useSafeDispatch(unsafeDispatch);

  const run = React.useCallback(
    (promise: Promise<T>, onSuccess?: (data: T) => void, onError?: (error: any) => void) => {
      dispatch({ type: "pending", data: null, error: null });
      promise
        .then((data: T) => {
          dispatch({ type: "resolved", data, error: null });
          onSuccess?.(data);
        })
        .catch((error: any) => {
          dispatch({ type: "rejected", data: null, error });
          onError?.(error);
        });
    },
    [dispatch]
  );

  return { ...state, run };
}
