import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import sharp from 'sharp';
import { watermarkWayangImage, WATERMARK_OPACITY } from './wayang-watermark';

describe('Watermark foto wayang', () => {
  let directory: string;
  let logoPath: string;

  beforeAll(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'wayang-watermark-'));
    logoPath = path.join(directory, 'logo.png');
    const logo = await sharp({
      create: {
        width: 80,
        height: 120,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    }).png().toBuffer();
    await writeFile(logoPath, logo);
  });

  afterAll(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('menghasilkan WebP dengan dimensi sama dan watermark di kanan bawah', async () => {
    const input = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: '#ffffff',
      },
    }).png().toBuffer();
    const output = await watermarkWayangImage(input, logoPath);
    const metadata = await sharp(output).metadata();
    expect(metadata).toMatchObject({ format: 'webp', width: 800, height: 600 });

    const corner = await sharp(output)
      .extract({ left: 680, top: 460, width: 20, height: 20 })
      .stats();
    expect(corner.channels[1].mean).toBeLessThan(240);
    expect(corner.channels[1].mean).toBeGreaterThan(170);
    const center = await sharp(output)
      .extract({ left: 390, top: 260, width: 20, height: 20 })
      .stats();
    expect(center.channels[1].mean).toBeGreaterThan(250);
    expect(WATERMARK_OPACITY).toBe(0.28);
  });

  it.each([[1, 1], [10, 5], [60, 500], [500, 60]])(
    'watermark tetap muat pada foto %sx%s',
    async (width, height) => {
      const input = await sharp({
        create: { width, height, channels: 3, background: '#888888' },
      }).png().toBuffer();
      const output = await watermarkWayangImage(input, logoPath);
      expect(await sharp(output).metadata()).toMatchObject({ width, height });
    },
  );

  it('menerapkan orientasi EXIF sebelum menentukan posisi watermark', async () => {
    const input = await sharp({
      create: { width: 120, height: 80, channels: 3, background: '#ffffff' },
    }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
    const output = await watermarkWayangImage(input, logoPath);
    expect(await sharp(output).metadata()).toMatchObject({ width: 80, height: 120 });
  });

  it('menolak file rusak dan tidak menerbitkan foto tanpa logo', async () => {
    await expect(watermarkWayangImage(Buffer.from('not an image'), logoPath))
      .rejects.toMatchObject({ status: 400 });
    const input = await sharp({
      create: { width: 100, height: 100, channels: 3, background: '#ffffff' },
    }).png().toBuffer();
    await expect(watermarkWayangImage(input, path.join(directory, 'missing.png')))
      .rejects.toMatchObject({ status: 500 });
  });
});
