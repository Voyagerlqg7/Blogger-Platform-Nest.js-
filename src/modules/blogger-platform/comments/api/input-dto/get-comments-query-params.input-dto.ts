import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { IsOptional, IsString } from 'class-validator';

export class GetCommentsQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsString()
  override sortBy: string = 'createdAt';
}
