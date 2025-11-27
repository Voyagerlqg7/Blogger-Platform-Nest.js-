import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogService {
  async createBlog() {}

  async getAllBlogs() {}

  async getBlogById(blogId: string) {}

  async getAllPostsFromSpecialBlog() {}

  async createPostForSpecialBlog() {}

  async deleteBlog() {}

  async updateBlog() {}
}
