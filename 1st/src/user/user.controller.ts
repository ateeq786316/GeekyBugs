import { Controller, Get, Req , UseGuards  } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import type { Request } from 'express';

@Controller('users')
export class UserController {
    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getme(@Req() req: Request){
        return req.user;
    }
}
