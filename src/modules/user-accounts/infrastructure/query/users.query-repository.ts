import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { SortDirection } from '../../../../core/dto/base.query-params.input-dto';

import { Injectable } from '@nestjs/common';

import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';

type FilterQuery<T> = {
  [P in keyof T]?: any;
} & {
  $or?: any[];
  deletedAt?: any;
};

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: UserModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.userModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!user) {
      throw DomainException.notFound('User');
    }
    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: FilterQuery<User> = { deletedAt: null };
    const orFilters: any[] = [];

    if (query.searchLoginTerm) {
      orFilters.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      orFilters.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    if (orFilters.length > 0) {
      filter.$or = orFilters;
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
      .limit(query.pageSize);

    const totalCount = await this.userModel.countDocuments(filter);
    const items = users.map((user) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      pagesCount: Math.ceil(totalCount / query.pageSize),
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }
}
