import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from 'src/common/services/jwt.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtService]
})
export class UsersModule {}
