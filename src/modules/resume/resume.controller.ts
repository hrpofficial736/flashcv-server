import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
    constructor(private readonly service: ResumeService) {};
    @Post("/upload/:username")
    uploadResume (@Body() body: {
        fileBuffer: Buffer;
        fileName: string;
    }, @Param("username") username: string) {
        return this.service.upload(body.fileBuffer, body.fileName, username);
    }
}
