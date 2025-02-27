import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from 'src/common/services/jwt.service';

@Module({
  exports: [JwtService],
  controllers: [AuthController],
  providers: [AuthService, JwtService]
})
export class AuthModule {}
