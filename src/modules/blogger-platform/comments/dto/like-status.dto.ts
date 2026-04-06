import { IsEnum } from 'class-validator';
import { LikeStatus } from '../domain/Schema/commentatorLikeInfo.schema';

export class LikeStatusDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}