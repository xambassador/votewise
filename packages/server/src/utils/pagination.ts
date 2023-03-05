export function getPagination(total: number, limit: number, offset: number) {
  return {
    total,
    limit,
    next: offset + limit,
    isLastPage: total <= offset + limit,
  };
}
