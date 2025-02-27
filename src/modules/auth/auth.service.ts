import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { errorResponse, successResponse } from 'src/common/utils/response.util';
import { StatusCodes } from 'src/common/constants/status-codes';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async login (email: string) {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        return successResponse(StatusCodes.OK, "User authenticated!")
      }
      return errorResponse(StatusCodes.NOT_FOUND, "User not found!")
    } catch (error) {
      return errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error!")
    }
  }

  async register(name: string, email: string) {
    try {
      await this.prismaService.user.create({
        data: {
          name,
          email,
        },
      });
      return successResponse(StatusCodes.CREATED, "User created succesfully!")
    } catch (error) {
      return errorResponse(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Internal Server Error!',
      );
    }
  }
}
