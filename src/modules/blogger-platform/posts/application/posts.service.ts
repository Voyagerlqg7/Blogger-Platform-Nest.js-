import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostsViewDto } from '../api/view-dto/posts.view-dto';
import { UseCase_CreatePost } from './UseCases/UseCase_CreatePost';
import { UseCase_UpdatePost } from './UseCases/UseCase_UpdatePost';
import { UseCase_DeletePost } from './UseCases/UseCase_DeletePost';

@Injectable()
export class PostService {
  constructor(
    private readonly createPostUseCase: UseCase_CreatePost,
    private readonly updatePostUseCase: UseCase_UpdatePost,
    private readonly deletePostUseCase: UseCase_DeletePost,
  ) {}

  async createPost(dto: CreatePostDto): Promise<PostsViewDto> {
    return await this.createPostUseCase.execute(dto);
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<void> {
    await this.updatePostUseCase.execute(id, dto);
  }

  async deletePost(id: string): Promise<void> {
    await this.deletePostUseCase.execute(id);
  }
}
