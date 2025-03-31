import { Get, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatusCodes } from 'src/common/constants/status-codes';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService : PrismaService) {};
    async fetchDataService (username: string) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {username},
            })
            if (!user) return {
              statusCode: StatusCodes.NOT_FOUND,
              message: 'User not found!',
            };

            return {
              statusCode: StatusCodes.OK,
              message: 'Fetched data successfully!',
              data: { ...user },
            };
        } catch (error) {
            return {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error!',
        };
        }
    }
}
