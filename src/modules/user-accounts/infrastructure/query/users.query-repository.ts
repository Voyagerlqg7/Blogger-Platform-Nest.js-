import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { UserViewDto } from '../../api/view-dto/users.view-dto';

import { Injectable, NotFoundException } from '@nestjs/common';

import { QueryFilter } from 'mongoose';

import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { SortDirection } from '../../../../core/dto/base.query-params.input-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: UserModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.userModel.findOne({
      _id: id,
      deleteAt: null,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: QueryFilter<UserDocument> = { deletedAt: null };

    if (query.searchLoginTerm || query.searchEmailTerm) {
      filter.$or = [];

      if (query.searchLoginTerm) {
        filter.$or.push({
          login: { $regex: query.searchLoginTerm, $options: 'i' },
        });
      }

      if (query.searchEmailTerm) {
        filter.$or.push({
          email: { $regex: query.searchEmailTerm, $options: 'i' },
        });
      }
    }

    const allowedSortFields = ['login', 'email', 'createdAt'];
    const sortBy =
      query.sortBy && allowedSortFields.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';

    const sortDirection = query.sortDirection || SortDirection.Desc;

    const users = await this.userModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.userModel.countDocuments(filter);
    const items = users.map((user) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
