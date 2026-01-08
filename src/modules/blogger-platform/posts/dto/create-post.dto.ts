import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
  @IsString()
  @IsNotEmpty()
  blogId: string;
}
