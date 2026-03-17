import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Injectable } from '@nestjs/common';
import { UpdateBlogDto } from '../../dto/update-blog.dto';

@Injectable()
export class UseCase_UpdateBlog {
  constructor(private readonly blogRepository: BlogsRepository) {}

  async execute(id: string, dto: UpdateBlogDto): Promise<void> {
    const blog = await this.blogRepository.findOrNotFoundFail(id);
    blog.update(dto);
    await this.blogRepository.saveBlog(blog);
  }
}
