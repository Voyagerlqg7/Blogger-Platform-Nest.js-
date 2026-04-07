import { Transform} from "class-transformer";
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePostDto {
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
  @IsNotEmpty({ message: 'content is required' })
  @IsString()
  @MaxLength(1000)
  content: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'BlogId is required' })
  @IsString()
  blogId: string;
}
