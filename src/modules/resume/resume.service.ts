import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { errorResponse, successResponse } from 'src/common/utils/response.util';
import { StatusCodes } from 'src/common/constants/status-codes';

@Injectable()
export class ResumeService {
    constructor(private prismaService : PrismaService, private supabaseService: SupabaseService) {};
    async upload (fileBuffer: Buffer, fileName: string, username: string, title: string) {
        try {
            const url = await this.supabaseService.uploadFile(
              fileBuffer,
              fileName,
              username,
            );
            if (!url) return errorResponse(StatusCodes.NOT_FOUND, "Url not found!");
            const user = await this.prismaService.user.findUnique({
              where: {
                username,
              },
              select: {
                resumes: true,
                resumeCount: true
              }
            });
            if (!user)
              return errorResponse(StatusCodes.NOT_FOUND, 'User not found!');
            const updatedResumes = Array.isArray(user.resumes)
              ? [...user.resumes, { title: title, url: url }]
              : [{ title: title, url: url }];
           const updatedUser = await this.prismaService.user.update({
                where: {
                    username
                },
                data: {
                    resumes: updatedResumes,
                    resumeCount: updatedResumes.length
                }
            });
            return successResponse(StatusCodes.CREATED, "Resume uploaded by : " + username, updatedUser);
        } catch (error) {
            return errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error);
        }
         
    }
}
