import { UpdatePostDomainDto } from '../../../../modules/blogger-platform/posts/domain/Mongo/dto/create-posts.domain.dto';
import { DomainException } from '../../../exceptions/domain-exceptions';

export class Post {
  constructor(
    private readonly id: string,
    private title: string,
    private shortDescription: string,
    private content: string,
    private blogId: string,
    private blogName: string,
    public createdAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  update(dto: UpdatePostDomainDto): void {
    if (
      this.title === dto.title &&
      this.shortDescription === dto.shortDescription &&
      this.content === dto.content &&
      this.blogId === dto.blogId
    ) {
      throw DomainException.badRequest('Nothing to update');
    }
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
  }

  makeDeleted() {
    this.deletedAt = new Date();
  }
}
