import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostForBlogDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(30)
  title: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Short description is required' })
  @IsString()
  @MaxLength(100)
  shortDescription: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Content is required' })
  @IsString()
  @MaxLength(1000)
  content: string;
}
