import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcrypt';
import { errorResponse, successResponse } from 'src/common/utils/response.util';
import { StatusCodes } from 'src/common/constants/status-codes';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  
  async login(loginUserInfo: LoginDto) {
    const { email, password } = loginUserInfo;
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email,
        },
      });
      if (existingUser) {
        const passwordMatches = await bcrypt.compare(
          password,
          existingUser.password,
        );
        if (!passwordMatches) {
          return errorResponse(StatusCodes.UNAUTHORIZED, "Incorrect Password!");
        }
        return successResponse(StatusCodes.OK, "User authenticated!")
      }
      return errorResponse(StatusCodes.NOT_FOUND, "User not found!")
    } catch (error) {
      return errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error!")
    }
  }

  async register(registerInfo: RegisterDto) {
    const { name, email, password } = registerInfo;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      await this.prismaService.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
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
