import { IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

export class GetBlogsQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsString()
  searchNameTerm?: string;
  @IsOptional()
  @IsString()
  override sortBy: string = 'createdAt';
}
