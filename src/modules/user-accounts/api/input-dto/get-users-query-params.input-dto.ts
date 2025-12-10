//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами
import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { IsOptional, IsString } from 'class-validator';

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetUsersQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsString()
  override sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  searchLoginTerm: string | null = null;

  @IsOptional()
  @IsString()
  searchEmailTerm: string | null = null;
}
