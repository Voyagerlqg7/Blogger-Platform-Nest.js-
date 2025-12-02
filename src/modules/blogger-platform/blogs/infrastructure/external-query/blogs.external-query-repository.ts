import type { BlogModelType } from '../../domain/blogs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogExternalDto } from './external-dto/blog.external-dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel('Blog') private readonly blogModel: BlogModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogExternalDto> {
    const blog = await this.blogModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return BlogExternalDto.mapToView(blog);
  }
}
