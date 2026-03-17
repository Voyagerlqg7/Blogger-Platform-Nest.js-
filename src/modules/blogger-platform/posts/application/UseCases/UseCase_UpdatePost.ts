import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

@Injectable()
export class UseCase_UpdatePost {
  constructor(private readonly postRepository: PostsRepository) {}

  async execute(id: string, dto: UpdatePostDto): Promise<void> {
    const post = await this.postRepository.findOrNotFoundFail(id);
    post.update(dto);
    await this.postRepository.save(post);
  }
}
