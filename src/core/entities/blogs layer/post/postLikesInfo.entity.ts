export class PostLikes {
  constructor(
    private readonly id: string,
    private userId: string,
    private postId: string,
    private login: string,
    private status: string | LikesStatus.NONE,
    private createdAt: Date,
  ) {}
  updateStatus(newStatus: string): void {
    this.status = newStatus;
    this.createdAt = new Date();
  }
}

enum LikesStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}
