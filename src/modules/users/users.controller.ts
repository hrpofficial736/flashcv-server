import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { StatusCodes } from 'src/common/constants/status-codes';
import { CompositeGuard } from 'src/common/guards/composite.guard';

@Controller('user')
export class UsersController {
    constructor(private readonly userService : UsersService) {};
    @Get("fetch-data/:username")
    @UseGuards(CompositeGuard)
    async fetchData (@Param("username") username: string, @Res() response : Response) {
        const dataFromService = await this.userService.fetchDataService(username);
        return response.status(StatusCodes.OK).json(dataFromService);
    }
}
