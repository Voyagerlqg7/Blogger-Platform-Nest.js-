//Blogs use cases
import { UseCase_CreateBlog } from './blogs/application/UseCases/UseCase_CreateBlog';
import { UseCase_CreatePostForBlog } from './blogs/application/UseCases/UseCase_CreatePostForBlog';
import { UseCase_DeleteBlog } from './blogs/application/UseCases/UseCase_DeleteBlog';
import { UseCase_UpdateBlog } from './blogs/application/UseCases/UseCase_UpdateBlog';
import { GetBlogByIdHandler } from './blogs/infrastructure/query/UseCases/UseCase_GetBlogById';
import { GetAllBlogsHandler } from './blogs/infrastructure/query/UseCases/UseCase_GetAllBlogs';
//Posts
import { UseCase_CreatePost } from './posts/application/UseCases/UseCase_CreatePost';
import { UseCase_DeletePost } from './posts/application/UseCases/UseCase_DeletePost';
import { UseCase_UpdatePost } from './posts/application/UseCases/UseCase_UpdatePost';
import { UseCase_UpdatePostLikeStatus } from './posts/application/UseCases/UseCase_RatePost';
import { UseCase_CreateCommentForPost } from './posts/application/UseCases/UseCase_CreateCommentForPost';
import { GetAllPostsHandler } from './posts/infrastructure/query/UseCase/UseCase_GetAllPosts';
import { GetPostByIdHandler } from './posts/infrastructure/query/UseCase/UseCase_GetPostById';

//Comments
import { UseCase_DeleteComment } from './comments/application/UseCases/UseCase_DeleteComment';
import { UseCase_UpdateCommentLikeStatus } from './comments/application/UseCases/UseCase_RateComment';
import { UseCase_UpdateComment } from './comments/application/UseCases/UseCase_UpdateComment';
import { GetAllCommentsHandler } from './comments/infrastructure/query/UseCases/UseCase_GetAllComments';
import { GetCommentHandler } from './comments/infrastructure/query/UseCases/UseCase_GetCommentById';

export const bloggerPlatformUseCases = [
  //Blogs
  UseCase_CreateBlog,
  UseCase_CreatePostForBlog,
  UseCase_DeleteBlog,
  UseCase_UpdateBlog,
  GetBlogByIdHandler,
  GetAllBlogsHandler,

  //Posts
  UseCase_CreatePost,
  UseCase_DeletePost,
  UseCase_UpdatePost,
  UseCase_UpdatePostLikeStatus,
  UseCase_CreateCommentForPost,
  GetAllPostsHandler,
  GetPostByIdHandler,

  //Comments
  UseCase_DeleteComment,
  UseCase_UpdateCommentLikeStatus,
  UseCase_UpdateComment,
  GetAllCommentsHandler,
  GetCommentHandler,
];
