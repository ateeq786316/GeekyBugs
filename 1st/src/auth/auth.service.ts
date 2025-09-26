import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService{
    constructor(
        private prisma: PrismaService, 
        private jwt: JwtService, 
        private config: ConfigService   
    ) {}
    
    async signup(dto: AuthDto){
        const hash = await argon.hash(dto.password);

        try{
        const user = await this.prisma.user.create({
                    data: {
                        email: dto.email,
                        hash,
                        firstName: dto.firstName,
                        lastName: dto.lastName,
                    },
                });
                console.log('User created successfully', user);
                // Create session and token
                return await this.createSessionAndToken(user.id, user.email);
                
        }catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Credentials taken');
                }
        }
        throw error;
    }
    }
    
    async login(dto: AuthDto){
        const user = await this.prisma.user.findUnique({
            where: {
                email:dto.email,
            },
        });
        if(!user) throw new ForbiddenException('User doesnt exists');
        const isPasswordValid = await argon.verify(user.hash, dto.password);
        if(!isPasswordValid) throw new ForbiddenException('Credentials incorrect');

        console.log('User logged in successfully', user);
        return this.createSessionAndToken(user.id, user.email);
    }

    async createSessionAndToken(userId: number, email: string): Promise<{access_token: string}>
    {
        // Create session record
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry
        
        const session = await this.prisma['session'].create({
            data: {
                userId: userId,
                expiresAt: expiresAt,
            },
        });
        console.log('Session created successfully', session);
        // Create JWT token with session ID
        const payload = {
            sub: userId,
            email,
            sessionId: session.id,
        };
        
        const secret = this.config.get('JWT_SECRET');
        if (!secret) {
            throw new ForbiddenException('JWT_SECRET is not configured.');
        }
        
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        });
        console.log('Token created successfully', token);
        return {
            access_token: token,
        };
    }

    async logout(sessionId: string) {
        await this.prisma['session'].update({
            where: { id: sessionId },
            data: { 
                invalidated: true,
                expiresAt: new Date(), // Set expiry to now
            },
        });
        console.log('Session invalidated successfully', sessionId);     
    }

    async validateSession(sessionId: string): Promise<boolean> {
        try {
            const session = await this.prisma['session'].findUnique({
                where: { id: sessionId },
            });
            
            // Check if session exists
            if (!session) {
                return false;
            }
            
            // Check if session is invalidated
            if (session.invalidated) {
                return false;
            }
            
            // Check if session is expired
            if (session.expiresAt < new Date()) {
                return false;
            }
            console.log('Session validated successfully', session);
            
            return true;
        } catch (error) {
            return false;
        }
    }
}