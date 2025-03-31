import { Body, Controller, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { createReadStream } from 'fs';
import * as getRawBody from 'raw-body';
import { Request } from 'express';
import { AuthGuard } from 'src/common/guards/request.guard';

@Controller('resume')
export class ResumeController {
  constructor(private readonly service: ResumeService) {}
  @Post('/upload/:username')
  @UseGuards(AuthGuard)
  async uploadResume(
    @Req() req: Request,
    @Param('username') username: string,
    @Headers('x-file-name') fileName: string,
    @Headers("resume-title") title: string
  ) {
    const fileBuffer : Buffer = await getRawBody(req, {encoding: null});
    
    return this.service.upload(fileBuffer, fileName, username, title);
  }
}
