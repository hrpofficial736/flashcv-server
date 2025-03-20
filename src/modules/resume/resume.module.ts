import { Module } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ResumeService, SupabaseService, PrismaService],
  controllers: [ResumeController],
})
export class ResumeModule {}
