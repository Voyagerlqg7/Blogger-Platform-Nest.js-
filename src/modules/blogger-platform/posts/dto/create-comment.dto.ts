import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'content is required' })
  @IsString()
  @Length(20, 300)
  content: string;
}
