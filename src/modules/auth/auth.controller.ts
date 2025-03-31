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
    response.cookie('auth_refresh_token', responseFromService, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    response.status(responseFromService.statusCode).json(responseFromService);
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
    response
      .status(responseFromService.statusCode)
      .json({
        message: responseFromService.message,
        data: {...responseFromService.data?.user, password: undefined},
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

  @Post('signIn/:provider')
  @UseGuards(OAuthGuard)
  signInWithProviderController(
    @Req() request: Request,
    @Param() params: { provider: string },
  ) {
    if (request.user !== undefined) {
      return this.authService.signInWithProvider(
        request.user['name'],
        params.provider === 'google'
          ? request.user['email']
          : request.user['confirmed_email'],
        request.user['profile_image_url'] ?? request.user['picture'],
        params.provider.toUpperCase() as AnySocials,
        request.user['access_token'],
      );
    }
  }
}
