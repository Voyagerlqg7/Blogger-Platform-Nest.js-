//dto для боди при создании поста. Сюда могут быть добавлены декораторы swagger
export class CreatePostsInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
