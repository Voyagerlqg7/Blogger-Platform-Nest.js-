import { Controller, Get, Query } from '@nestjs/common';

@Controller('comments')
export class CommentsController {
  @Get()
  async getAllComments(@Query() query: any) {}
}
