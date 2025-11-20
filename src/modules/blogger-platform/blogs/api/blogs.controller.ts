import { Controller, Get, Put, Post, Delete, Param, HttpCode, HttpStatus, Query, Body } from '@nestjs/common';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { CreatePostForBlogDto } from '../dto/create-post-for-blog.dto';

@Controller('blogs')
export class BlogsController {
    @Get()
    @Query() query: any
    async getAllBlogs(@Query() query: any) {}
    @Get(':id')
    async getBlog(@Param('id') blogId: string){}
    @Get('posts')
    async getAllPostsFromBlog(@Param('id') blogId: string){}
    @Post('posts')
    async createPostsForSpecificBlog(@Param('id') blogId: string, @Body() createPostForSpecificBlogDto: CreatePostForBlogDto){}
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteBlog(@Param('id') blogId: string){}
    @Put(':id')
    async updateBlog(@Param('id') blogId: string){}
    @Post()
    async createBlog(@Body() createBlogDto: CreateBlogDto){}
}