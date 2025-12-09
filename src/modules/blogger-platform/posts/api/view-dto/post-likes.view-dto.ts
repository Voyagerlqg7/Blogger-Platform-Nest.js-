export type NewestLikeView = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfoView = {
  likesCount: number;
  dislikesCount: number;
  myStatus: 'None' | 'Like' | 'Dislike';
  newestLikes: NewestLikeView[];
};
