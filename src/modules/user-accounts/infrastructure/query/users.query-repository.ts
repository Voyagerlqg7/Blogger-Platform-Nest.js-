import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../domain/user.entity';
import type { UserModelType } from '../../domain/user.entity';
import { UserViewDto } from '../../api/view-dto/users.view-dto';

import { Injectable, NotFoundException } from '@nestjs/common';

import { FilterQuery } from 'mongoose';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({
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
    const filter: FilterQuery<User> = {
      deletedAt: null,
    };
    if (query.searchLohinTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLohinTerm, $options: 'i' },
      });
    }

    const users = await this.UserModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);
    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
