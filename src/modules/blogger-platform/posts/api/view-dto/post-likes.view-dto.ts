export class NewestLikeViewDto {
  addedAt: string;
  userId: string;
  login: string;
}

export class ExtendedLikesInfoView {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: NewestLikeViewDto[];

  static create(data: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: {
      addedAt: Date;
      userId: string;
      login: string;
    }[];
  }): ExtendedLikesInfoView {
    return {
      likesCount: data.likesCount,
      dislikesCount: data.dislikesCount,
      myStatus: data.myStatus,
      newestLikes: data.newestLikes.map((like) => ({
        addedAt: like.addedAt.toISOString(),
        userId: like.userId,
        login: like.login,
      })),
    };
  }
}
