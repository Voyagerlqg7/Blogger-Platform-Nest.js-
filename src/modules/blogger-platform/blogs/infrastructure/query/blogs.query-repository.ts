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

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: BlogModelType,
    @InjectModel(Post.name) private postModel: PostModelType, // <-- Добавить декоратор
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
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getAllPostsFromSpecialBlog(
    blogId: string,
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostsViewDto[]>> {
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
    const post = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.postModel.countDocuments(filter);
    const items = post.map((post) => PostsViewDto.mapToView(post));
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
