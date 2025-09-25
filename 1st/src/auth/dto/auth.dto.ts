// src/auth/dto/auth.dto.ts
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthDto {
  firstName?: string;
  lastName?: string;
  
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
  
  // Note: These fields are optional and do not have validators
  
}