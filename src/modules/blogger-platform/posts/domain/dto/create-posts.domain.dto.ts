export class CreatePostsDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  likesCount: number;
  dislikesCount: number;
}

export class UpdatePostDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
