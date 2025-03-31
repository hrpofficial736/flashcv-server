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

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const provider = request.params.provider;

      if (!provider) throw new NotFoundException('Provider not found!');
      if (provider === 'google') {
        const response = await axios.get(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`,
        );
        if (!response.data)
          throw new UnauthorizedException(
            'Failed to Verify Google Access Token',
          );

        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!userInfoResponse.data)
          throw new UnauthorizedException('Failed to fetch google user info!');
        
        request.user = {...userInfoResponse.data, access_token: token};
        return true;
      }
      console.log(request.body.codeVerifier);

       const credentials = `${encodeURIComponent(process.env.TWITTER_CLIENT_ID!)}:${encodeURIComponent(process.env.TWITTER_CLIENT_SECRET!)}`;
       const base64Credentials = Buffer.from(credentials).toString('base64');
      
      const accessTokenFromTwitter = await axios.post(
        'https://api.x.com/2/oauth2/token',
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
            "Authorization": `Basic ${base64Credentials}`,
          },
        },
      );
      

      const response = await axios.get('https://api.twitter.com/2/users/me', {
        headers: {
          Authorization: `Bearer ${accessTokenFromTwitter.data.access_token}`,
        },
        params: {
          'user.fields': 'id,name,username,profile_image_url,confirmed_email',
        },
      });

      request.user = {...response.data.data, access_token: accessTokenFromTwitter.data.access_token};
      return true;
    } catch (error) {
      
      throw new UnauthorizedException('Invalid Token!');
    }
  }
}
