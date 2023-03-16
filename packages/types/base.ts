type BaseResponse = {
  success: true;
  message: string;
  error: null;
};

type BaseErrorResponse = {
  success: false;
  message: string;
  data: null;
};

export type { BaseResponse, BaseErrorResponse };
