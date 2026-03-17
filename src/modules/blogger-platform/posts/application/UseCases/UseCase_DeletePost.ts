import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../infrastructure/posts.repository';

@Injectable()
export class UseCase_DeletePost {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(id: string): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}