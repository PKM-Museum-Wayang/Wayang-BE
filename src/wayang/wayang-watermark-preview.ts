import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import sharp from 'sharp';
import {
  PROJECT_ROOT,
  STORAGE_DIRECTORY,
  WATERMARK_LOGO_PATH,
} from '../storage/storage-paths';
import { watermarkWayangImage } from './wayang-watermark';

export interface WatermarkPreview {
  source: string;
  output: string;
  buffer: Buffer;
  fileUrl: string;
}

export async function createWatermarkPreview(options: {
  source?: string;
  storageDirectory?: string;
  logoPath?: string;
} = {}): Promise<WatermarkPreview> {
  const storage = path.resolve(options.storageDirectory ?? STORAGE_DIRECTORY);
  const output = path.join(storage, 'watermark-preview.webp');
  await mkdir(storage, { recursive: true });
  const entries = await readdir(storage, { withFileTypes: true });
  const candidates = options.source
    ? [path.resolve(PROJECT_ROOT, options.source)]
    : entries
        .filter((entry) =>
          entry.isFile() &&
          !entry.name.startsWith('watermark-preview') &&
          /\.(jpe?g|png|webp|avif|gif|tiff?)$/i.test(entry.name),
        )
        // Prefer older JPG/PNG originals over new WebP uploads.
        .sort((a, b) =>
          Number(a.name.endsWith('.webp')) - Number(b.name.endsWith('.webp')) ||
          a.name.localeCompare(b.name),
        )
        .map((entry) => path.join(storage, entry.name));

  for (const source of candidates) {
    if (path.dirname(source) !== storage || path.basename(source).startsWith('watermark-preview')) {
      if (options.source) {
        throw new BadRequestException('Pilih foto sumber di dalam storage, bukan file preview.');
      }
      continue;
    }
    let input: Buffer;
    try {
      input = await readFile(source);
      const metadata = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
      if ((metadata.pages ?? 1) > 1) throw new Error('MULTIPAGE_IMAGE');
    } catch {
      if (options.source) throw new BadRequestException('Foto sumber tidak ada, rusak, atau bukan gambar statis yang didukung.');
      continue;
    }

    const buffer = await watermarkWayangImage(input, options.logoPath ?? WATERMARK_LOGO_PATH);
    // Atomic publication: concurrent static requests cannot see half a file.
    const temporary = path.join(storage, `watermark-preview-${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, buffer, { flag: 'wx' });
      await rename(temporary, output);
    } finally {
      await unlink(temporary).catch(() => undefined);
    }
    return { source, output, buffer, fileUrl: '/storage/watermark-preview.webp' };
  }

  throw new NotFoundException(
    'Belum ada foto statis yang bisa dipakai sebagai preview di storage. Upload foto wayang terlebih dahulu, lalu buka /storage/preview kembali.',
  );
}
