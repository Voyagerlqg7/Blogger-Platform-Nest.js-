import { UpdateBlogDomainDto } from '../../../../modules/blogger-platform/blogs/domain/Mongo/dto/create-blog.domain.dto';
import { DomainException } from '../../../exceptions/domain-exceptions';

export class Blog {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: Date,
    public isMembership: boolean,
    public deletedAt: Date | null = null,
  ) {}

  update(dto: UpdateBlogDomainDto): void {
    if (
      this.name === dto.name &&
      this.description === dto.description &&
      this.websiteUrl === dto.websiteUrl
    ) {
      throw DomainException.badRequest('Nothing to update');
    }

    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  makeDeleted(): void {
    this.deletedAt = new Date();
  }
}
