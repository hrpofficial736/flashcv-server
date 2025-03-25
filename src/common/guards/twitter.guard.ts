import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../services/jwt.service';
import * as jwksClient from 'jwks-rsa';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded: jwt.Jwt = jwt.decode(token, { complete: true })!;
      if (!decoded) {
        throw new UnauthorizedException('No authorization header');
      }
      const provider = request.params.provider;
      if (!provider) throw new NotFoundException('Provider not found!');
      let jwksUri = '';
      if (provider === 'google')
        jwksUri = 'https://www.googleapis.com/oauth2/v3/certs';
      else jwksUri = 'https://api.twitter.com/2/oauth2/jwks';

      const client = jwksClient({ jwksUri });
      const key: string = await new Promise((resolve, reject) => {
        client.getSigningKey(decoded.header.kid, (err, key) => {
          if (err) reject(err);
          resolve(key?.getPublicKey() as string);
        });
      });

      const payload = this.jwtService.verifyToken(token, key);
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Token!');
    }
  }
}
