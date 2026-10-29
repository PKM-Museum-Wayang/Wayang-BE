import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureStorage } from './storage/configure-storage';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  app.use(cookieParser());

  const frontendUrl =
    configService.get<string>('FRONTEND_URL')?.split(',') ?? [];

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await configureStorage(app);

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port, '127.0.0.1');
}

bootstrap().catch((error) => {
  console.error(error);
});
