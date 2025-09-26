import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import type { Request, Response } from 'express';
import { AuthGuard } from "@nestjs/passport";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Post('login')  
    async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
        const { access_token } = await this.authService.login(dto);
        
        // Set httpOnly cookie with token
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
            sameSite: 'strict',
        });
        
        return { access_token };
    }
    
    @Post('signup') 
    async signup(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.signup(dto);
        
        // Set httpOnly cookie with token
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000, // 15 minutes
            sameSite: 'strict',
        });
        
        return result;
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        // Extract session ID from the authenticated user
        const user = req.user as { userId: number; email: string; sessionId: string };
        
        // Call the AuthService to invalidate the session
        if (user && user.sessionId) {
            await this.authService.logout(user.sessionId);
        }
        
        // Clear the cookie
        res.clearCookie('access_token');
        
        return { message: 'Logged out successfully' };
    }
}