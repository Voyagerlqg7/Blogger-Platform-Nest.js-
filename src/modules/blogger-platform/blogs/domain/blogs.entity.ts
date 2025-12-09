import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  CreateBlogDomainDto,
  UpdateBlogDomainDto,
} from './dto/create-blog.domain.dto';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  websiteUrl: string;
  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;
    return blog as BlogDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateBlogDomainDto) {
    if (
      dto.name === this.name &&
      dto.description === this.description &&
      dto.websiteUrl === this.websiteUrl
    ) {
      throw new Error('Nothing to update BLOGS');
    }

    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

/* Factory method
BlogSchema.statics.createInstance = function(dto: CreateBlogDomainDto): BlogDocument {
  return new this({
    name: dto.name,
    description: dto.description,
    websiteUrl: dto.websiteUrl,
    isMembership: false,
  });
};*/

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & typeof Blog;
