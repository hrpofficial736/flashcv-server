import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ResumeModule } from './modules/resume/resume.module';

@Module({
  imports: [AuthModule, PrismaModule, ResumeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
