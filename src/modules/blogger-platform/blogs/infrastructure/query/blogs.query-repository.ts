import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';
import { Blog, BlogDocument } from '../../domain/blogs.entity';
import type { BlogModelType } from '../../domain/blogs.entity';
import { BlogsViewDto } from '../../api/view-dto/blogs.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { PostsViewDto } from '../../../posts/api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../../posts/api/input-dto/get-posts-query-params.input-dto';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import type {
  PostModelType,
  PostDocument,
} from '../../../posts/domain/posts.entity';
import { Post } from '../../../posts/domain/posts.entity';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    @InjectModel(Post.name) private postModel: PostModelType,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogsViewDto> {
    const blog = await this.blogModel.findOne({
      _id: id,
      deletedAt: null,
    } as QueryFilter<BlogDocument>);

    if (!blog) throw new NotFoundException('Blog not found');

    return BlogsViewDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    const filter: QueryFilter<BlogDocument> = {
      deletedAt: null,
    };

    if (query.searchNameTerm) {
      filter.$or = [{ name: { $regex: query.searchNameTerm, $options: 'i' } }];
    }

    const allowedSortFields = ['name', 'createdAt', 'websiteUrl'];
    const sortBy =
      query.sortBy && allowedSortFields.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';

    const sortDirection = query.sortDirection || SortDirection.Desc;

    const blogs = await this.blogModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.blogModel.countDocuments(filter);

    const items = blogs.map((blog) => BlogsViewDto.mapToView(blog));

    return PaginatedViewDto.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  async getAllPostsFromSpecialBlog(
    blogId: string,
    userId: string,
    query: GetPostsQueryParams,
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
          await this.postsQueryRepository.getExtendedLikesInfo(
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
