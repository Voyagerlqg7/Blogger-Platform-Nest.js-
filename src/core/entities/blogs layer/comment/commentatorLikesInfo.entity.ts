export class CommentLikes {
  constructor(
    private readonly id: string,
    private userId: string,
    private commentId: string,
    private status: string | LikesStatus.NONE,
    public createdAt: Date,
  ) {}

  update(newStatus: string): void {
    this.status = newStatus;
    this.createdAt = new Date();
  }
}

enum LikesStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}
