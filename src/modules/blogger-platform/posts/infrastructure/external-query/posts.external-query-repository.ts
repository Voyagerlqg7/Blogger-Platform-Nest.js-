import type { PostModelType } from '../../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PostExternalDto } from './external-dto/post.external-dto';

@Injectable()
export class PostsExternalQueryRepository {
  constructor(@InjectModel('Post') private readonly postModel: PostModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostExternalDto> {
    const post = await this.postModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!post) {
      throw new NotFoundException('Post Not Found');
    }
    return PostExternalDto.mapToView(post);
  }
}
