import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
      providers: [
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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  it('/auth/signup (POST)', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    return request.default(app.getHttpServer())
      .post('/auth/signup')
      .send(userData)
      .expect(201);
  });

  it('/auth/login (POST)', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    return request.default(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(201);
  });

  afterEach(async () => {
    await app.close();
  });
});