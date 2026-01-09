export abstract class PaginatedViewDto<T> {
  abstract items: T;
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;

  public static mapToView<T>(data: {
    pagesCount: number;
    page: number;
    size: number;
    totalCount: number;
    items: T;
  }): PaginatedViewDto<T> {
    return {
      pagesCount: data.pagesCount,
      page: data.page,
      pageSize: data.size,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
