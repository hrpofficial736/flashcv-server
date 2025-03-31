import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly accessTokenSecret: jwt.Secret =
    process.env.CUSTOM_AUTH_ACCESS_SECRET ?? '';
  private readonly refreshTokenSecret: jwt.Secret =
    process.env.CUSTOM_AUTH_REFRESH_SECRET ?? '';

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        this.accessTokenSecret,
      ) as jwt.JwtPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  signAccessToken(username: string) {
    try {
      const token = jwt.sign({ username }, this.accessTokenSecret, {
        expiresIn: 60 * 60 * 1000,
      });
      if (!token) throw new Error('Failed to generate access token!');
      return token;
    } catch (error) {
      return error;
    }
  }

  signRefreshToken(username: string) {
    try {
      const token = jwt.sign({ username }, this.refreshTokenSecret, {
        expiresIn: 7 * 24 * 60 * 60 * 1000,
      });
      if (!token) throw new Error('Failed to generate refresh token!');
      return token;
    } catch (error) {
      return error;
    }
  }

  refreshAccessToken(refreshToken: string) {
    try {
      const decoded : jwt.JwtPayload | string = jwt.verify(refreshToken, this.refreshTokenSecret);
      if (typeof decoded === 'string') {
        throw new Error('Invalid refresh token payload');
      }
      const { username } = decoded;
      return this.signAccessToken(username);
    } catch (error) {
      return error;
    }
  }
}
