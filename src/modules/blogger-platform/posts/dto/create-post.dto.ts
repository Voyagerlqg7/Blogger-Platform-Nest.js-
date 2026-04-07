import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @MaxLength(30)
  title: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'shortDescription is required' })
  @IsString()
  @MaxLength(100)
  shortDescription: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'content is required' })
  @IsString()
  @MaxLength(1000)
  content: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'blogId is required' })
  @IsString()
  blogId: string;
}
