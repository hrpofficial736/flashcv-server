import { Injectable, Res } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusCodes } from 'src/common/constants/status-codes';
import { AnySocials } from '@prisma/client';
import { JwtService } from 'src/common/services/jwt.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { ResponseInterface } from 'src/common/interfaces/response.interface';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(email: string, password: string): Promise<ResponseInterface> {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        const samePassword = await bcrypt.compare(
          password,
          existingUser.password!,
        );
        if (samePassword) {
          const signedAccessToken = this.jwtService.signAccessToken(
            existingUser.username,
          );
          const signedRefreshToken = this.jwtService.signRefreshToken(
            existingUser.username,
          );

          return {
            statusCode: StatusCodes.OK,
            message: 'User authenticated successfully!',
            data: { ...existingUser, signedAccessToken, signedRefreshToken },
          };
        }
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'Wrong Password!',
        };
      }
      return {
        statusCode: StatusCodes.NOT_FOUND,
        message: 'User not found!',
      };
    } catch (error) {
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!',
      };
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
  ) {
    try {

      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          message: 'User already exists!',
          data: { ...existingUser },
        };
      }
      const username = email.split('@')[0];
      const hashedPassword = await bcrypt.hash(password, 7);
      const user = await this.prismaService.user.create({
        data: {
          name,
          email,
          username,
          password: hashedPassword,
        },
      });
      const signedAccessToken = this.jwtService.signAccessToken(username);
      const signedRefreshToken = this.jwtService.signRefreshToken(username);

     
      return {
        statusCode: StatusCodes.CREATED,
        message: 'User created successfully!',
        data: { user, accessToken: signedAccessToken, refreshToken: signedRefreshToken },
      };
    } catch (error) {
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!',
      };
    }
  }
  async signInWithProvider(
    name: string,
    email: string,
    imageUrl: string,
    provider: AnySocials,
    token: string,
  ) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        const updatedUser = await this.prismaService.user.update({
          where: { username: existingUser.username },
          data: {
            imageUrl,
          },
        });
        return {
          statusCode: StatusCodes.OK,
          message: 'User authenticated successfully!',
          data: { ...updatedUser },
        };
      }
      const username = email.split('@')[0];
      const user = await this.prismaService.user.create({
        data: {
          name,
          email,
          username,
          anySocials: provider,
          imageUrl: imageUrl,
        },
      });
      return {
        statusCode: StatusCodes.OK,
        message: 'User authenticated successfully!',
        data: {
          name: name,
          email: email,
          username: username,
          resumeCount: user.resumeCount,
          imageUrl: imageUrl,
          accessToken: token,
        },
      };
    } catch (error) {
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Internal server error!',
      };
    }
  }
}
