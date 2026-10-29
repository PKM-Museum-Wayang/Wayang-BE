import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import request from 'supertest';
import sharp from 'sharp';
import { configureStorage } from './configure-storage';
import { StorageController } from './storage.controller';
import { createWatermarkPreview } from '../wayang/wayang-watermark-preview';

jest.mock('../wayang/wayang-watermark-preview', () => ({
  createWatermarkPreview: jest.fn(),
}));

describe('Static storage and preview routes', () => {
  let app: NestExpressApplication;
  let directory: string;
  let image: Buffer;

  beforeAll(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'wayang-static-'));
    image = await sharp({
      create: { width: 40, height: 40, channels: 3, background: '#888888' },
    }).webp().toBuffer();
    await writeFile(path.join(directory, 'photo.webp'), image);
    const module = await Test.createTestingModule({
      controllers: [StorageController],
    }).compile();
    app = module.createNestApplication<NestExpressApplication>();
    await configureStorage(app, directory);
    await app.init();
  });

  beforeEach(() => {
    jest.mocked(createWatermarkPreview).mockReset().mockResolvedValue({
      source: path.join(directory, 'photo.webp'),
      output: path.join(directory, 'watermark-preview.webp'),
      buffer: image,
      fileUrl: '/storage/watermark-preview.webp',
    });
  });

  afterAll(async () => {
    await app?.close();
    await rm(directory, { recursive: true, force: true });
  });

  it.each(['/storage', '/storage/'])(
    '%s redirects to a real preview, never storage/index.html',
    async (url) => {
      await request(app.getHttpServer())
        .get(url)
        .expect(302)
        .expect('Location', '/storage/preview');
    },
  );

  it('serves an existing file directly', async () => {
    await request(app.getHttpServer())
      .get('/storage/photo.webp')
      .expect(200)
      .expect('Content-Type', /image\/webp/);
    expect(createWatermarkPreview).not.toHaveBeenCalled();
  });

  it.each(['/storage/preview', '/storage/watermark-preview.webp'])(
    '%s generates and displays a missing preview',
    async (url) => {
      await request(app.getHttpServer())
        .get(url)
        .expect(200)
        .expect('Content-Type', /image\/webp/)
        .expect('Cache-Control', 'no-store');
      expect(createWatermarkPreview).toHaveBeenCalledTimes(1);
    },
  );

  it('a missing photo returns a clean 404, not an index.html filesystem error', async () => {
    const response = await request(app.getHttpServer())
      .get('/storage/missing.webp')
      .expect(404);
    expect(JSON.stringify(response.body)).not.toMatch(/index\.html|ENOENT/);
  });
});
