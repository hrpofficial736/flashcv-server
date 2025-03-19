import { Body, Controller, Post, UseGuards, Req, Param } from '@nestjs/common';
import {Request} from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/common/guards/request.guard';
import { AnySocials } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseGuards(AuthGuard)
  loginController(@Req() request: Request) {
    return this.authService.login(
      request.user !== undefined && request.user['email'],
    );
  }
  @Post('register')
  @UseGuards(AuthGuard)
  registerController(@Req() request: Request, @Body() body: { name: string }) {
    console.log(body);

    return this.authService.register(
      body.name,
      request.user !== undefined && request.user['email'],
    );
  }
  @Post('signIn/:provider')
  @UseGuards(AuthGuard)
  signInWithProviderController (@Req() request: Request, @Param() params: {provider: string}) {
    console.log(params.provider, request.user);
    
    if (request.user !== undefined) {
      return this.authService.signInWithProvider(
      request.user["user_metadata"]["full_name"],
      request.user['email'],
      params.provider.toUpperCase() as AnySocials
    );
  }
  }
}
