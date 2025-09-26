import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config"; 
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private config: ConfigService, 
        private prisma: PrismaService
    ) {
        const secret = config.get('JWT_SECRET');
        if (!secret) {
            throw new UnauthorizedException('JWT_SECRET is not configured.');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }
    
    async validate(payload: { sub: number; email: string; sessionId: string }) {
        // Validate session
        if (!payload.sessionId) {
            throw new UnauthorizedException('Invalid token');
        }
        const session = await this.prisma['session'].findUnique({
            where: { id: payload.sessionId },
        });
        
        if (!session) {
            throw new UnauthorizedException('Session not found');
        }
        
        if (session.invalidated) {
            throw new UnauthorizedException('Session has been invalidated');
        }
        
        if (session.expiresAt < new Date()) {
            throw new UnauthorizedException('Session has expired');
        }
        
        return { 
            userId: payload.sub, 
            email: payload.email,
            sessionId: payload.sessionId
        };
    }
}