import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  @MaxLength(15)
  name: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'Description is required' })
  @IsString()
  @MaxLength(500)
  description: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'WebsiteUrl is required' })
  @IsString()
  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
