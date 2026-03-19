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
  @Prop({ type: Date })
  createdAt: Date;
  @Prop({ type: Date })
  updatedAt: Date;
  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  static createInstance(
    this: PostModelType,
    dto: CreatePostsDomainDto,
  ): PostDocument {
    const post = new this({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: dto.blogName,
    });
    return post as PostDocument;
  }

  makeDeleted() {
    this.deletedAt = new Date();
  }

  update(dto: UpdatePostDomainDto) {
    if (
      dto.title === this.title &&
      dto.shortDescription === this.shortDescription &&
      dto.content === this.content &&
      dto.blogId === this.blogId
    ) {
      throw new Error('Nothing to update POST');
    }
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & {
  createInstance(dto: CreatePostsDomainDto): PostDocument;
};
