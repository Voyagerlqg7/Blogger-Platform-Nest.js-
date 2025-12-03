import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter } from 'mongoose';
import { Blog, BlogDocument } from '../../domain/blogs.entity';
import type { BlogModelType } from '../../domain/blogs.entity';
import { BlogsViewDto } from '../../api/view-dto/blogs.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

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
    const sortBy = allowedSortFields.includes(query.sortBy)
      ? query.sortBy
      : 'createdAt';

    const blogs = await this.blogModel
      .find(filter)
      .sort({ [sortBy]: query.sortDirection })
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
}
