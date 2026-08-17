import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { join } from 'path';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);


  app.use(cookieParser());

  app.useStaticAssets(join(process.cwd(), 'storage'), {
    prefix: '/storage',
  });

  const frontendUrl =
    configService.get<string>('FRONTEND_URL')?.split(',') ?? [];

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error(error);
});
