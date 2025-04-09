import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from 'src/common/services/jwt.service';
import { CompositeGuard } from 'src/common/guards/composite.guard';
import { AuthGuard } from 'src/common/guards/request.guard';
import { OAuthGuard } from 'src/common/guards/oauth.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtService, CompositeGuard, AuthGuard, OAuthGuard]
})
export class UsersModule {}
