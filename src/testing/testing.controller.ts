import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BlogDocument } from '../modules/blogger-platform/blogs/domain/blogs.entity';
import { PostDocument } from '../modules/blogger-platform/posts/domain/posts.entity';
import { UserDocument } from '../modules/user-accounts/domain/user.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel('Blog') private readonly blogModel: Model<BlogDocument>,
    @InjectModel('Post') private readonly postModel: Model<PostDocument>,
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.userModel.deleteMany({});
  }
}
