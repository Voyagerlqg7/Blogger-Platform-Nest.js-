export class LikesInfoViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;

  static create(data: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  }): LikesInfoViewDto {
    return {
      likesCount: data.likesCount,
      dislikesCount: data.dislikesCount,
      myStatus: data.myStatus,
    };
  }
}
