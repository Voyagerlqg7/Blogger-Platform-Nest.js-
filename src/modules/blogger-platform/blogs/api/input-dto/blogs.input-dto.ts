//dto для боди при создании блога. Сюда могут быть добавлены декораторы swagger
export class CreateBlogInputDto {
  name: string;
  description: string;
  websiteUrl: string;
}
