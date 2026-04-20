import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';
import { Blog, BlogDocument } from '../../domain/Mongo/blogs.mongo.entity';
import type { BlogModelType } from '../../domain/Mongo/blogs.mongo.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsViewDto } from '../../../posts/api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../../posts/api/input-dto/get-posts-query-params.input-dto';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import type {
  PostModelType,
  PostDocument,
} from '../../../posts/domain/Mongo/posts.mongo.entity';
import { Post } from '../../../posts/domain/Mongo/posts.mongo.entity';
import { LikesQueryRepository } from '../../../posts/infrastructure/query/likes.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    @InjectModel(Post.name) private postModel: PostModelType,
    private readonly likesQueryRepository: LikesQueryRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.blogModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!blog) {
      throw DomainException.notFound('Blog');
    }
    return blog;
  }

  async findWithPagination(
    filter: QueryFilter<BlogDocument>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<BlogDocument[]> {
    return this.blogModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(filter: QueryFilter<BlogDocument>): Promise<number> {
    return this.blogModel.countDocuments(filter);
  }

  async getAllPostsFromSpecialBlog(
    blogId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
    // Проверяем существование блога
    await this.getByIdOrNotFoundFail(blogId);

    const filter: QueryFilter<PostDocument> = {
      blogId: blogId,
      deletedAt: null,
    };

    const allowedSortFields = ['title', 'createdAt'];
    const sortBy =
      query.sortBy && allowedSortFields.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';
    const sortDirection = query.sortDirection || SortDirection.Desc;

    // Параллельно получаем посты и общее количество
    const [posts, totalCount] = await Promise.all([
      this.postModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(query.calculateSkip())
        .limit(query.pageSize)
        .lean(),
      this.postModel.countDocuments(filter),
    ]);

    // Параллельно получаем информацию о лайках для всех постов
    const items = await Promise.all(
      posts.map(async (post) => {
        const extendedLikesInfo =
          await this.likesQueryRepository.getExtendedLikesInfo(
            post._id.toString(),
            userId,
          );
        return PostsViewDto.mapToView(post, extendedLikesInfo);
      }),
    );

    return PaginatedViewDto.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }
}
