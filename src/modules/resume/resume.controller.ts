import { Body, Controller, Headers, Param, Post, Req } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { createReadStream } from 'fs';
import * as getRawBody from 'raw-body';
import { Request } from 'express';

@Controller('resume')
export class ResumeController {
  constructor(private readonly service: ResumeService) {}
  @Post('/upload/:username')
  async uploadResume(
    @Req() req: Request,
    @Param('username') username: string,
    @Headers('x-file-name') fileName: string,
  ) {
    const fileBuffer : Buffer = await getRawBody(req, {encoding: null});
    console.log(
      'Received binary data for:',
      fileName,
      'Size:',
      fileBuffer.length,
    );
    return this.service.upload(fileBuffer, fileName, username);
  }
}
