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

type Pagination = {
  pagination: {
    total: number;
    limit: number;
    next: number;
    isLastPage: boolean;
  };
};

export type { BaseResponse, BaseErrorResponse, Pagination };
