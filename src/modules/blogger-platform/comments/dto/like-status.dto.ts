import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class LikeStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['None', 'Like', 'Dislike'], {
    message:
      'likeStatus must be one of the following values: None, Like, Dislike',
  })
  likeStatus: string;
}
