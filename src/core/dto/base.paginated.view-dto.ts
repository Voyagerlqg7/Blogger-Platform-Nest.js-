export class PaginatedViewDto<T> {
  items: T;
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
    const dto = new PaginatedViewDto<T>();
    dto.pagesCount = data.pagesCount;
    dto.page = data.page;
    dto.pageSize = data.size;
    dto.totalCount = data.totalCount;
    dto.items = data.items;
    return dto;
  }
}
