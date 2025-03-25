import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
    constructor(private readonly userService : UsersService) {};
    @Get("fetch-data/:username")
    fetchData (@Param("username") username: string) {
        return this.userService.fetchDataService(username);
    }
}
