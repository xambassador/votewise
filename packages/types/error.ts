import type { BaseErrorResponse } from "./base";

type ErrorResponse = {
  error: {
    message: string;
  };
} & BaseErrorResponse;

export type { ErrorResponse };
