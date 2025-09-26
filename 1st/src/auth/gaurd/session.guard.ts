import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1]; // Bearer token
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    
    // Extract session ID from token
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const sessionId = payload.sessionId;
      
      if (!sessionId) {
        throw new UnauthorizedException('Invalid token');
      }
      
      // Validate session
      const isValid = await this.authService.validateSession(sessionId);
      if (!isValid) {
        throw new UnauthorizedException('Session invalid or expired');
      }
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}