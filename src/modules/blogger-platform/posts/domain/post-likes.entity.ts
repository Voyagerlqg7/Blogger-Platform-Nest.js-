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
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true, enum: LikeStatus, default: LikeStatus.NONE })
  status: string;
  @Prop({ default: null })
  createdAt: Date;

  static createInstance(dto: RatePostDomainDto): PostLikeDocument {
    const instance = new this();
    instance.userId = dto.userId;
    instance.postId = dto.postId;
    instance.status = dto.likeStatus;
    instance.login = dto.login;
    return instance as PostLikeDocument;
  }

  updateStatus(newStatus: string): void {
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
