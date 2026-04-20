import { CommentatorInfoEntity } from './commentatorInfo.entity';
import { DomainException } from '../../../exceptions/domain-exceptions';

export class Comment {
  constructor(
    private readonly id: string,
    private content: string,
    private postId: string,
    private commentatorInfo: CommentatorInfoEntity,
    public createdAt: Date,
    public deletedAt: Date | null = null,
  ) {}

  update(content: string): void {
    if (this.content === content) {
      throw DomainException.badRequest('Nothing to update');
    }
    this.content = content;
  }

  makeDeleted() {
    this.deletedAt = new Date();
  }
}
