import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  CreatePostsDomainDto,
  UpdatePostDomainDto,
} from './dto/create-posts.domain.dto';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  shortDescription: string;
  @Prop({ type: String, required: true })
  content: string;
  @Prop({ type: String, required: true })
  blogId: string;
  @Prop({ type: String, required: true })
  blogName: string;
  @Prop({ type: Number, required: true })
  likesCount: number;
  @Prop({ type: Number, required: true })
  dislikesCount: number;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  static createInstance(
    this: PostModelType,
    dto: CreatePostsDomainDto,
  ): PostDocument {
    return new this({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: dto.blogName,
      likesCount: dto.likesCount,
      dislikesCount: dto.dislikesCount,
    });
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdatePostDomainDto) {
    if (
      dto.blogId == this.blogId &&
      dto.content == this.content &&
      dto.shortDescription == this.shortDescription &&
      dto.title == this.title
    ) {
      throw new Error('Nothing to update POST');
    }
    this.blogId = dto.blogId;
    this.content = dto.content;
    this.shortDescription = dto.shortDescription;
    this.title = dto.title;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
