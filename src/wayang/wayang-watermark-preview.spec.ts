import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import sharp from 'sharp';
import { createWatermarkPreview } from './wayang-watermark-preview';

describe('Create a real watermark preview', () => {
  let directory: string;
  let logoPath: string;
  let source: string;
  let original: Buffer;

  beforeEach(async () => {
    directory = await mkdtemp(path.join(tmpdir(), 'wayang-preview-'));
    // Do not place the logo among candidate source images.
    logoPath = path.join(directory, 'logo.dat');
    await writeFile(logoPath, await sharp({
      create: { width: 80, height: 120, channels: 3, background: '#e00000' },
    }).png().toBuffer());
    original = await sharp({
      create: { width: 800, height: 600, channels: 3, background: '#ffffff' },
    }).png().toBuffer();
    source = path.join(directory, 'wayang.png');
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('writes one actual WebP preview without changing the original', async () => {
    await writeFile(source, original);
    const result = await createWatermarkPreview({ storageDirectory: directory, logoPath });
    expect(result.source).toBe(source);
    expect(result.fileUrl).toBe('/storage/watermark-preview.webp');
    expect(await readFile(source)).toEqual(original);
    expect(await readFile(result.output)).toEqual(result.buffer);
    expect(await sharp(result.buffer).metadata()).toMatchObject({
      format: 'webp', width: 800, height: 600,
    });
    const corner = await sharp(result.buffer)
      .extract({ left: 680, top: 460, width: 20, height: 20 }).stats();
    expect(corner.channels[1].mean).toBeLessThan(240);
    expect(corner.channels[1].mean).toBeGreaterThan(170);

    // Regeneration must choose the original, never the previous preview.
    const second = await createWatermarkPreview({ storageDirectory: directory, logoPath });
    expect(second.source).toBe(source);
    expect(second.buffer).toEqual(result.buffer);
  });

  it('returns an actionable 404 if no source photo exists', async () => {
    await expect(createWatermarkPreview({ storageDirectory: directory, logoPath }))
      .rejects.toMatchObject({ status: 404 });
  });

  it('skips corrupt image files instead of using them as preview', async () => {
    await writeFile(path.join(directory, 'a-corrupt.jpg'), 'not an image');
    await writeFile(source, original);
    const result = await createWatermarkPreview({ storageDirectory: directory, logoPath });
    expect(result.source).toBe(source);
  });
});
