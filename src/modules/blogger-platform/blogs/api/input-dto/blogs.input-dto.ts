import { IsString, IsNotEmpty, IsUrl, MaxLength } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  websiteUrl: string;
}
