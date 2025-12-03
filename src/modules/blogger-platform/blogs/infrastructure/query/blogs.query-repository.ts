import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../domain/blogs.entity';
import type { BlogModelType } from '../../domain/blogs.entity';
import { BlogsViewDto } from '../../api/view-dto/blogs.view-dto';
import { QueryFilter } from 'mongoose';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel('Blog') private blogModel: BlogModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogsViewDto> {
    const blog = await this.blogModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    return BlogsViewDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogsViewDto[]>> {
    const filter: QueryFilter<Blog> = {
      deleteAt: null,
    };
    if (query.searchNameTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchNameTerm, $options: 'i' },
      });
    }

    const blogs = await this.blogModel
      .find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.blogModel.countDocuments(filter);
    const items = blogs.map(BlogsViewDto.mapToView);
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
