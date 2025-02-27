import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import {Request} from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/common/guards/request.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UseGuards(AuthGuard)
  loginController(@Req() request: Request) {
    return this.authService.login(request.user !== undefined && request.user["email"]);
  }
  @Post('register')
  @UseGuards(AuthGuard)
  registerController(@Req() request: Request, @Body() body: {name: string}) {
    console.log(body);
    
    return this.authService.register(
      body.name,
      request.user !== undefined && request.user['email'],
    );
  }
}
