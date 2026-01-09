import { InjectModel } from '@nestjs/mongoose';
import { PostsViewDto } from '../../api/view-dto/posts.view-dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryFilter } from 'mongoose';
import { Post, PostDocument } from '../../domain/posts.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import type { PostModelType } from '../../domain/posts.entity';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: PostModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<PostsViewDto> {
    const post = await this.postModel.findOne({
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

    const allowedSortFields = ['title', 'createdAt', 'blogName'];
    const sortBy =
      query.sortBy && allowedSortFields.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';

    const sortDirection = query.sortDirection || SortDirection.Desc;

    const post = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.postModel.countDocuments(filter);
    const items = post.map((post) => PostsViewDto.mapToView(post));
    return PaginatedViewDto.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }
}
