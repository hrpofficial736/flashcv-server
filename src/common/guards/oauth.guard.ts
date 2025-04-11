import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';



@Injectable()
export class OAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const provider = request.headers['x-auth-provider'] as string;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    if (!provider) {
      throw new NotFoundException('Auth provider not specified');
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Invalid auth header format');

    try {
      if (provider === 'google') {
        return await this.handleGoogle(request, token);
      } else if (provider === 'twitter') {
        return await this.handleTwitter(request, token);
      } else {
        throw new UnauthorizedException('Unsupported auth provider');
      }
    } catch (error) {
      throw new UnauthorizedException('OAuth verification failed');
    }
  }

  private async handleGoogle(request: Request, token: string) {
    const tokenInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`,
    );

    const userInfo = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    request.user = { ...userInfo.data, access_token: token };
    return true;
  }

  private async handleTwitter(request: Request, token: string) {
    let accessToken : string;
   

    if (request.method === 'POST') {
      const credentials = `${encodeURIComponent(process.env.TWITTER_CLIENT_ID!)}:${encodeURIComponent(process.env.TWITTER_CLIENT_SECRET!)}`;
      const base64Credentials = Buffer.from(credentials).toString('base64');

      const tokenResponse = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        new URLSearchParams({
          client_id: process.env.TWITTER_CLIENT_ID!,
          code: token,
          grant_type: 'authorization_code',
          redirect_uri: process.env.TWITTER_REDIRECT_URI!,
          code_verifier: request.body.codeVerifier,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${base64Credentials}`,
          },
        },
      );

      accessToken = tokenResponse.data.access_token;
    } else {
      accessToken = token;
    }

    const response = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        'user.fields': 'id,name,username,profile_image_url,confirmed_email',
      },
    });

    request.user = {
      ...response.data.data,
      access_token: accessToken,
    };

    return true;
  }
}
