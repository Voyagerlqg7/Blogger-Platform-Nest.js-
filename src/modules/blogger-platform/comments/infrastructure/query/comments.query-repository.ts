import { InjectModel } from '@nestjs/mongoose';
import { CommentsViewDto } from '../../api/view-dto/comments.view-dto';
import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument } from '../../domain/comment.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import type { CommentModelType } from '../../domain/comment.entity';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
  ) {}

  async getByIdOrNotFoundFail(
    id: string,
    userId?: string,
  ): Promise<CommentsViewDto> {
    const comment = await this.commentModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!comment) {
      throw DomainException.notFound('comment');
    }

    //TODO: likes info as in posts query repository

    return CommentsViewDto.mapToView(comment);
  }

  async getAll(
    query: GetCommentsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentsViewDto[]>> {
    const filter = {
      deletedAt: null,
    };
    const sortDirection = query.sortDirection === SortDirection.Asc ? 1 : -1;

    const sortBy: string = query.sortBy || 'createdAt';
    const sortOptions: any = {};
    sortOptions[sortBy] = sortDirection;

    const comments = await this.commentModel
      .find(filter)
      .sort(sortOptions)
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.commentModel.countDocuments();
    //TODO: send items (comments) in controller as in posts query repository
    ///code

    return PaginatedViewDto.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }
}
