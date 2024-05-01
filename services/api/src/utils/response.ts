type Pagination = {
  total: number;
  limit: number;
  offset: number;
  next: number | null;
  is_last_page?: boolean;
};

type Meta = {
  pagination?: Pagination;
};

export class Response {
  public data: unknown;
  public meta?: Meta;

  public constructor(data: unknown, meta?: Meta) {
    this.data = data;
    if (meta && meta.pagination) {
      this.meta = { ...meta, pagination: this.calculatePagination(meta.pagination) };
      return;
    }
    this.meta = meta;
  }

  private calculatePagination(pagination: Pagination) {
    const { total, limit, offset } = pagination;
    const next = offset + limit;
    const is_last_page = next >= total;
    return { ...pagination, next, is_last_page };
  }
}

export class ErrorResponse {
  public data: null;
  public error: {
    status: number;
    message: string;
    name: string;
    code?: number;
  };

  public constructor(status: number, message: string, name: string, code?: number) {
    this.data = null;
    this.error = {
      status,
      message,
      name,
      code,
    };
  }
}
