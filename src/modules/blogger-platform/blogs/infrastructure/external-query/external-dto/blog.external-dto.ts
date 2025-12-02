import { BlogDocument } from '../../../domain/blogs.entity';

export class BlogExternalDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;

  static mapToView(blog: BlogDocument): BlogExternalDto {
    const dto = new BlogExternalDto();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.isMembership = blog.isMembership;
    return dto;
  }
}
