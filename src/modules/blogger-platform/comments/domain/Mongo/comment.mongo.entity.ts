import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CreateCommentDomainDto } from './dto/CreateCommentDomainDto';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './Schema/commentatorInfo.schema';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  static createInstance(
    this: CommentModelType,
    dto: CreateCommentDomainDto,
  ): CommentDocument {
    const comment = new this({
      content: dto.content,
      postId: dto.postId,
    });
    comment.commentatorInfo = {
      userId: dto.userId,
      userLogin: dto.userLogin,
    };

    return comment;
  }

  makeDeleted() {
    this.deletedAt = new Date();
  }

  updateComment(dto: UpdateCommentDto) {
    this.content = dto.content;
    this.updatedAt = new Date();
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & {
  createInstance(dto: CreateCommentDomainDto): CommentDocument;
};
