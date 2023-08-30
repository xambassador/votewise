import { AxiosError } from "axios";

export const getError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const status = error?.response?.status || 500;
    const data = error?.response?.data || {
      message: "Something went wrong",
      error: {
        message: error.message,
      },
      data: null,
      success: false,
    };

    return { status, data };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      data: {
        message: error.message,
        error: {
          message: error.message,
        },
        data: null,
        success: false,
      },
    };
  }

  return {
    status: 500,
    error: {
      message: "Something went wrong",
    },
    success: false,
    data: null,
  };
};
