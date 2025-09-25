// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true, // Add this line
  }));
  await app.listen(process.env.PORT ?? 3333);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3333}`);
}
bootstrap();