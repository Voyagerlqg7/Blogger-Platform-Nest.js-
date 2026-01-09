import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export class BaseQueryParams {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection: SortDirection = SortDirection.Desc;

  @IsOptional()
  sortBy: string = 'createdAt';

  calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
