// src/auth/dto/auth.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
  
  // Note: These fields are optional and do not have validators
  @IsString()
  @IsOptional()
  firstName: string;
  @IsString()
  @IsOptional()
  lastName: string;
}