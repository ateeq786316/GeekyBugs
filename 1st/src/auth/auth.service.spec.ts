import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            session: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSessionAndToken', () => {
    it('should create a session and return a token', async () => {
      const userId = 1;
      const email = 'test@example.com';
      const sessionId = 'test-session-id';
      
      (prisma['session'].create as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId,
        expiresAt: new Date(),
      });
      
      (jwt.signAsync as jest.Mock).mockResolvedValue('test-token');
      
      const result = await service.createSessionAndToken(userId, email);
      
      expect(result).toEqual({ access_token: 'test-token' });
      expect(prisma['session'].create).toHaveBeenCalledWith({
        data: {
          userId,
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe('logout', () => {
    it('should invalidate a session', async () => {
      const sessionId = 'test-session-id';
      
      await service.logout(sessionId);
      
      expect(prisma['session'].update).toHaveBeenCalledWith({
        where: { id: sessionId },
        data: {
          invalidated: true,
          expiresAt: expect.any(Date),
        },
      });
    });
  });

  describe('validateSession', () => {
    it('should return true for a valid session', async () => {
      const sessionId = 'test-session-id';
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      
      (prisma['session'].findUnique as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId: 1,
        invalidated: false,
        expiresAt: futureDate,
      });
      
      const result = await service.validateSession(sessionId);
      
      expect(result).toBe(true);
    });

    it('should return false for an expired session', async () => {
      const sessionId = 'test-session-id';
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 30);
      
      (prisma['session'].findUnique as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId: 1,
        invalidated: false,
        expiresAt: pastDate,
      });
      
      const result = await service.validateSession(sessionId);
      
      expect(result).toBe(false);
    });

    it('should return false for an invalidated session', async () => {
      const sessionId = 'test-session-id';
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 30);
      
      (prisma['session'].findUnique as jest.Mock).mockResolvedValue({
        id: sessionId,
        userId: 1,
        invalidated: true,
        expiresAt: futureDate,
      });
      
      const result = await service.validateSession(sessionId);
      
      expect(result).toBe(false);
    });

    it('should return false for a non-existent session', async () => {
      const sessionId = 'test-session-id';
      
      (prisma['session'].findUnique as jest.Mock).mockResolvedValue(null);
      
      const result = await service.validateSession(sessionId);
      
      expect(result).toBe(false);
    });
  });
});