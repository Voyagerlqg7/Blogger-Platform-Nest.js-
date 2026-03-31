import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Blog,
  BlogDocument,
} from '../modules/blogger-platform/blogs/domain/blogs.entity';
import {
  Post,
  PostDocument,
} from '../modules/blogger-platform/posts/domain/posts.entity';
import {
  User,
  UserDocument,
} from '../modules/user-accounts/domain/user.entity';
import {
  Comment,
  CommentDocument,
} from '../modules/blogger-platform/comments/domain/comment.entity';
import {
  PostLikes,
  PostLikeDocument,
} from '../modules/blogger-platform/posts/domain/post-likes.entity';
import {
  CommentLike,
  CommentLikeDocument,
} from '../modules/blogger-platform/comments/domain/Schema/commentatorLikeInfo.schema';
import {
  Token,
  TokenDocument,
} from '../modules/user-accounts/domain/token.entity';
import {
  Session,
  SessionDocument,
} from '../modules/user-accounts/domain/session.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(PostLikes.name)
    private readonly postLikeModel: Model<PostLikeDocument>,
    @InjectModel(CommentLike.name)
    private readonly commentLikeModel: Model<CommentLikeDocument>,
    @InjectModel(Token.name) private readonly tokenModel: Model<TokenDocument>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.postLikeModel.deleteMany({});
    await this.commentLikeModel.deleteMany({});
    await this.tokenModel.deleteMany({});
    await this.sessionModel.deleteMany({});
  }
}
