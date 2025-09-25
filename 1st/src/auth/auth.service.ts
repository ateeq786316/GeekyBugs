import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argnon from 'argon2';


@Injectable()
export class AuthService{
    constructor(private prisma: PrismaService) {}
    async signup(dto: AuthDto){
        const hash = await argnon.hash(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                hash,
                firstName: dto.firstName,
                lastName: dto.lastName,
            },
        });
        // delete user.hash;
        return { user, message: "user created successfully" };
    }
    login(){
        return "user login sucessfully";
    }
    
}