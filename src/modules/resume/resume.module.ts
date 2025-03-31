import { Module } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from 'src/common/guards/request.guard';
import { JwtService } from 'src/common/services/jwt.service';

@Module({
  providers: [ResumeService, SupabaseService, PrismaService, JwtService],
  controllers: [ResumeController],
})
export class ResumeModule {}
