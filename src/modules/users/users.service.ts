import { Get, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { errorResponse, successResponse } from 'src/common/utils/response.util';
import { StatusCodes } from 'src/common/constants/status-codes';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService : PrismaService) {};
    async fetchDataService (username: string) {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {username}
            })
            if (!user) return errorResponse(StatusCodes.NOT_FOUND, 'User not found!');
            return successResponse(StatusCodes.OK, "Fetched data successfully!", user);
        } catch (error) {
            return errorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error!");
        }
    }
}
