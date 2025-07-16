type Options = {
  page: number;
  limit: number;
  total: number;
};

export class PaginationBuilder {
  private readonly page: number;
  private readonly limit: number;
  private readonly total: number;

  constructor(opts: Options) {
    this.page = opts.page;
    this.limit = opts.limit;
    this.total = opts.total;
  }

  public build() {
    const totalPage = Math.ceil(this.total / this.limit);
    const hasNextPage = this.page < totalPage;
    const hasPreviousPage = this.page > 1;
    const nextPage = hasNextPage ? this.page + 1 : null;
    const previousPage = hasPreviousPage ? this.page - 1 : null;
    return {
      pagination: {
        total_page: totalPage,
        has_next_page: hasNextPage,
        has_previous_page: hasPreviousPage,
        next_page: nextPage,
        current_page: this.page,
        previous_page: previousPage,
        limit: this.limit,
        total: this.total
      }
    };
  }
}
