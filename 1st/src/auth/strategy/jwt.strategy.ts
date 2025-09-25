import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config"; 
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt,Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt',) {
    constructor(private config: ConfigService, private prisma: PrismaService) {
        const secret = config.get('JWT_SECRET');
        if (!secret) {
            throw new UnauthorizedException('JWT_SECRET is not configured.');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
        console.log("super section woorking")
    }
    
    async validate(payload: { sub: number; email: string }) {
        console.log("this is payload testing");
        return payload;
    }
}
