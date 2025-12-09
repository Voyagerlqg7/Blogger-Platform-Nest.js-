import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { RatePostDomainDto } from './dto/rate-post.domain.dto';

@Schema({ timestamps: true })
export class PostLikesSchema {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  postId: string;
  @Prop({ type: String, required: true })
  login: string;
  @Prop({ type: String, required: true })
  status: string;

  createdAt: Date;

  static createInstance(dto: RatePostDomainDto): PostLikeDocument {
    const PostLike = new this();
    PostLike.postId = dto.postId;
    PostLike.userId = dto.userId;
    PostLike.status = dto.likeStatus;
    PostLike.login = dto.login;

    return PostLike as PostLikeDocument;
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLikesSchema);
PostLikeSchema.loadClass(PostLikesSchema);
export type PostLikeDocument = HydratedDocument<PostLikesSchema>;
export type PostLikeModelType = Model<PostLikeDocument> &
  typeof PostLikesSchema;
