import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { errorResponse } from 'src/common/utils/response.util';
import { StatusCodes } from 'src/common/constants/status-codes';

@Injectable()
export class ResumeService {
    constructor(private prismaService : PrismaService, private supabaseService: SupabaseService) {};
    async upload (fileBuffer: Buffer, fileName: string, username: string) {
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
                resumes: true
              }
            });
            if (!user)
              return errorResponse(StatusCodes.NOT_FOUND, 'User not found!');
            await this.prismaService.user.update({
                where: {
                    username
                },
                data: {
                    resumes: {set: [...user.resumes, url!]}
                }
            })
        } catch (error) {
            return errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, error);
        }
         
    }
}
