import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UseCase_DeleteBlog {
  constructor(private readonly blogRepository: BlogsRepository) {}

  async execute(id: string): Promise<void> {
    const blog = await this.blogRepository.findOrNotFoundFail(id);
    blog.makeDeleted();
    await this.blogRepository.saveBlog(blog);
  }
}
