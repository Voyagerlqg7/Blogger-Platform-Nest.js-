export class CreatePostsDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
}

export class UpdatePostDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
