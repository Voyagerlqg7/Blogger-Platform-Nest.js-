import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

@Schema({ timestamps: true })
export class CommentLike {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  commentId: string;

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

  static createInstance(dto: {
    userId: string;
    commentId: string;
    likeStatus: string;
  }): CommentLikeDocument {
    const commentLike = new this();
    commentLike.commentId = dto.commentId;
    commentLike.userId = dto.userId;
    commentLike.status = dto.likeStatus;

    return commentLike as CommentLikeDocument;
  }

  updateStatus(newStatus: string) {
    this.status = newStatus;
  }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
CommentLikeSchema.loadClass(CommentLike);

CommentLikeSchema.index({ userId: 1, commentId: 1 }, { unique: true });

export type CommentLikeDocument = HydratedDocument<CommentLike>;
export type CommentLikeModelType = Model<CommentLikeDocument> & {
  createInstance(dto: {
    userId: string;
    commentId: string;
    likeStatus: string;
  }): CommentLikeDocument;
};
