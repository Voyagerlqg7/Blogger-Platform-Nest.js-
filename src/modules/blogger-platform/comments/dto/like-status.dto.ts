import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatus } from '../domain/Mongo/Schema/commentatorLikeInfo.schema';
import { Transform } from 'class-transformer';

export class LikeStatusDto {
  @IsEnum(LikeStatus)
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'LikeStatus is required' })
  likeStatus: LikeStatus;
}
