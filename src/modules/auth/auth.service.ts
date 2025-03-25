import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { errorResponse, successResponse } from 'src/common/utils/response.util';
import { StatusCodes } from 'src/common/constants/status-codes';
import { AnySocials } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async login(email: string) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        return successResponse(
          StatusCodes.OK,
          'User authenticated!',
          existingUser,
        );
      }
      return errorResponse(StatusCodes.NOT_FOUND, 'User not found!');
    } catch (error) {
      return errorResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Internal Server Error!',
      );
    }
  }

  async register(name: string, email: string) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        return successResponse(
          StatusCodes.BAD_REQUEST,
          'User already exists!',
          {
            name: existingUser.name,
            email: existingUser.email,
            username: existingUser.username,
          },
        );
      }
      const username = email.split('@')[0];
      await this.prismaService.user.create({
        data: {
          name,
          email,
          username,
        },
      });
      return successResponse(StatusCodes.CREATED, 'User created succesfully!', {
        name: name,
        email: email,
        username: username,
      });
    } catch (error) {
      return errorResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Internal Server Error!',
      );
    }
  }
  async signInWithProvider(name: string, email: string, provider: AnySocials) {
    try {
      console.log(name, email);
      
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        return successResponse(
          StatusCodes.OK,
          'User authenticated!',
          existingUser,
        );
      }
      const username = email.split('@')[0];
      const user = await this.prismaService.user.create({
        data: {
          name,
          email,
          username,
          anySocials: provider,
        },
      });
      return successResponse(StatusCodes.CREATED, 'User created succesfully!', {
        name: name,
        email: email,
        username: username,
        resumeCount: user.resumeCount,
      });
    } catch (error) {
      return errorResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Internal Server Error!',
      );
    }
  }
}
