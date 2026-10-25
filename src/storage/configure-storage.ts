import type { NestExpressApplication } from '@nestjs/platform-express';
import { mkdir } from 'node:fs/promises';
import { STORAGE_DIRECTORY } from './storage-paths';

export async function configureStorage(
  app: NestExpressApplication,
  directory = STORAGE_DIRECTORY,
) {
  await mkdir(directory, { recursive: true });
  app.useStaticAssets(directory, {
    prefix: '/storage',
    index: false,
    redirect: false,
    fallthrough: true,
    dotfiles: 'deny',
    maxAge: 0,
    etag: true,
  });
}
