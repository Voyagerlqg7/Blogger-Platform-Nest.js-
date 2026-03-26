import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  CreatePostsDomainDto,
  UpdatePostDomainDto,
} from './dto/create-posts.domain.dto';

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ default: null })
  createdAt: Date;

  @Prop({ default: null })
  deletedAt: Date | null;

  static createInstance(
    this: PostModelType,
    dto: CreatePostsDomainDto,
  ): PostDocument {
    return new this({
      ...dto,
      createdAt: new Date(),
    }) as PostDocument;
  }

  makeDeleted(): void {
    this.deletedAt = new Date();
  }

  update(dto: UpdatePostDomainDto): void {
    const hasChanges = Object.entries(dto).some(
      ([key, value]) => this[key] !== value,
    );

    if (!hasChanges) {
      throw new Error('Nothing to update POST');
    }

    Object.assign(this, dto);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & {
  createInstance(dto: CreatePostsDomainDto): PostDocument;
};
