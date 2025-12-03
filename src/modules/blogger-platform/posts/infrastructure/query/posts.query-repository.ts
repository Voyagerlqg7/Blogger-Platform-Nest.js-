import { InjectModel } from '@nestjs/mongoose';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryFilter } from 'mongoose';
import { PostDocument } from '../../domain/posts.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import type { PostModelType } from '../../domain/posts.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel('Post') private PostModel: PostModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostsViewDto> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return PostsViewDto.mapToView(post);
  }

  async getAll(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    const filter: QueryFilter<PostDocument> = {
      deletedAt: null,
    };

    const post = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.PostModel.countDocuments(filter);
    const items = post.map((post) => PostsViewDto.mapToView(post));
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
