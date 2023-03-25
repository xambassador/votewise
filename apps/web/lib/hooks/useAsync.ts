import type { AsyncAction, AsyncState } from "types/async";

import React from "react";

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

/**
 * @description A hook to prevent state updates after unmounting
 * @param dispatch React dispatch function
 * @returns
 */
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

/**
 * @description A hook to handle async state
 * @param initialState The initial state of the async state
 * @returns
 */
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
