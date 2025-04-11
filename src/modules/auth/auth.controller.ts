import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Param,
  Res,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AnySocials } from '@prisma/client';
import { OAuthGuard } from 'src/common/guards/oauth.guard';
import { JwtService } from 'src/common/services/jwt.service';
import { StatusCodes } from 'src/common/constants/status-codes';
import { CompositeGuard } from 'src/common/guards/composite.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}
  @Post('login')
  async loginController(
    @Body() body: { email: string; password: string },
    @Res() response: Response,
  ) {
    
    const responseFromService = await this.authService.login(
      body.email,
      body.password,
    );
    response.cookie(
      'auth_refresh_token',
      responseFromService.data?.refreshToken,
      {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
    );

    response.status(responseFromService.statusCode).json({
      message: responseFromService.message,
      data: {
        ...responseFromService.data?.existingUser,
        accessToken: responseFromService.data?.accessToken,
        password: undefined,
      },
    });
  }
  @Post('register')
  async registerController(
    @Body() body: { name: string; email: string; password: string },
    @Res() response: Response,
  ) {
    const responseFromService = await this.authService.register(
      body.name,
      body.email,
      body.password,
    );

    response.cookie(
      'auth_refresh_token',
      responseFromService.data?.refreshToken,
      {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
    );
    response.status(responseFromService.statusCode).json({
      message: responseFromService.message,
      data: {
        ...responseFromService.data?.user,
        accessToken: responseFromService.data?.accessToken,
        password: undefined,
      },
    });
  }
  @Get('refresh-access-token')
  refreshAccessTokenController(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const refreshToken = request.cookies.auth_refresh_token;

    const newAccessToken = this.jwtService.refreshAccessToken(refreshToken);
    response.status(StatusCodes.CREATED).json({
      accessToken: newAccessToken,
    });
  }

  @Post('signIn')
  @UseGuards(OAuthGuard)
  async signInWithProviderController(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    if (request.user !== undefined) {
      const provider : string = request.headers['x-auth-provider'] as string;
      
      const responseFromService = await this.authService.signInWithProvider(
        request.user['name'],
        provider === 'google'
          ? request.user['email']
          : request.user['confirmed_email'],
        request.user['profile_image_url'] ?? request.user['picture'],
        provider.toUpperCase() as AnySocials,
      );
      response.status(responseFromService.statusCode).json({
        message: 'User authenticated successfully!',
        data: {...responseFromService.data, accessToken: request.user['access_token']},
      });
    }
  }
}
