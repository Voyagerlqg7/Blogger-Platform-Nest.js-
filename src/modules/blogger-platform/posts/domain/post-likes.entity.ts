import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { RatePostDomainDto } from './dto/rate-post.domain.dto';

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

@Schema({ timestamps: true })
export class PostLikes {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  postId: string;
  @Prop({ type: String, required: true })
  login: string;
  @Prop({
    type: String,
    required: true,
    enum: LikeStatus,
    default: LikeStatus.NONE,
  })
  status: string;
  @Prop({ type: Date })
  createdAt: Date;
  @Prop({ type: Date })
  updatedAt: Date;

  static createInstance(dto: RatePostDomainDto): PostLikeDocument {
    const postLike = new this();
    postLike.postId = dto.postId;
    postLike.userId = dto.userId;
    postLike.status = dto.likeStatus;
    postLike.login = dto.login;

    return postLike as PostLikeDocument;
  }

  updateStatus(newStatus: string) {
    this.status = newStatus;
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLikes);
PostLikeSchema.loadClass(PostLikes);
PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export type PostLikeDocument = HydratedDocument<PostLikes>;
export type PostLikeModelType = Model<PostLikeDocument> & {
  createInstance(dto: RatePostDomainDto): PostLikeDocument;
};
