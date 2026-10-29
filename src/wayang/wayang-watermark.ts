import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import sharp from 'sharp';
import {
  STORAGE_DIRECTORY,
  WATERMARK_LOGO_PATH,
} from '../storage/storage-paths';

const logger = new Logger('WayangWatermark');

const MAX_INPUT_PIXELS = 40_000_000;
export const WATERMARK_OPACITY = 0.28;

/** Render before publishing: no unwatermarked image is written to storage. */
export async function watermarkWayangImage(
  input: Buffer,
  logoPath = WATERMARK_LOGO_PATH,
): Promise<Buffer> {
  let image: Buffer;
  try {
    const metadata = await sharp(input, {
      limitInputPixels: MAX_INPUT_PIXELS,
    }).metadata();
    // Photos only: do not silently remove animation or pages from an upload.
    if ((metadata.pages ?? 1) > 1) {
      throw new Error('MULTIPAGE_IMAGE');
    }
    image = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate() // Apply EXIF orientation before positioning the watermark.
      .toColourspace('srgb')
      .png({ compressionLevel: 1 })
      .toBuffer();
  } catch {
    throw new BadRequestException(
      'Foto tidak valid atau tidak didukung. Gunakan gambar statis JPG, PNG, WebP, AVIF, GIF, atau TIFF (maksimal 40 megapiksel).',
    );
  }

  try {
    const { width = 1, height = 1 } = await sharp(image).metadata();
    // Design on a fixed canvas, then scale the entire logo + caption together.
    const canvasWidth = 240;
    const canvasHeight = 260;
    const logo = await sharp(await readFile(logoPath))
      .resize(180, 212, { fit: 'inside' })
      .png()
      .toBuffer({ resolveWithObject: true });
    const text = Buffer.from(`
      <svg width="240" height="40" xmlns="http://www.w3.org/2000/svg">
        <text x="120" y="26" text-anchor="middle"
          font-family="DejaVu Sans, Arial, sans-serif" font-size="23" font-weight="bold"
          fill="white" stroke="black" stroke-width="1.5" paint-order="stroke fill"
        >Wayang Sutarwin</text>
      </svg>`);
    const mark = await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: logo.data,
          left: Math.floor((canvasWidth - logo.info.width) / 2),
          top: 212 - logo.info.height,
        },
        { input: text, left: 0, top: 220 },
      ])
      .png()
      .toBuffer();

    const margin = Math.min(
      Math.max(1, Math.round(Math.min(width, height) * 0.025)),
      Math.floor((Math.min(width, height) - 1) / 2),
    );
    const markWidth = Math.max(
      1,
      Math.min(240, Math.round(width * 0.22), width - margin * 2),
    );
    const markHeight = Math.max(
      1,
      Math.min(Math.round(height * 0.25), height - margin * 2),
    );
    const resized = await sharp(mark)
      .resize(markWidth, markHeight, { fit: 'inside' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Scale the existing alpha, preserving transparent pixels in the logo.
    for (let i = 3; i < resized.data.length; i += 4) {
      resized.data[i] = Math.round(resized.data[i] * WATERMARK_OPACITY);
    }
    const overlay = await sharp(resized.data, {
      raw: {
        width: resized.info.width,
        height: resized.info.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    // Lift the entire logo + caption, with extra space below the watermark.
    const bottomMargin = Math.min(
      height - resized.info.height,
      Math.max(margin, Math.round(height * 0.08)),
    );

    return await sharp(image)
      .composite([
        {
          input: overlay,
          left: width - resized.info.width - margin,
          top: height - resized.info.height - bottomMargin,
        },
      ])
      .webp({ quality: 92 })
      .toBuffer();
  } catch (error) {
    logger.error(`Watermark gagal (logo: ${logoPath}): ${String(error)}`);
    // Fail closed rather than publish a photo without its watermark.
    throw new InternalServerErrorException(
      'Watermark gagal diproses. Pastikan public/logo.png tersedia dan valid.',
    );
  }
}

/** Detect actual image contents, not just the client-supplied MIME type. */
export async function storeWayangMedia(
  file: Express.Multer.File,
): Promise<string> {
  let isImage = false;
  try {
    await sharp(file.buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
    isImage = true;
  } catch {
    // Image-declared uploads must not fall through to the video branch.
  }

  const extension = path.extname(file.originalname).toLowerCase();
  const declaredImage =
    file.mimetype.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tif', '.tiff', '.svg', '.bmp', '.heic'].includes(extension);
  let content: Buffer;
  let outputExtension: string;
  if (isImage || declaredImage) {
    content = await watermarkWayangImage(file.buffer);
    outputExtension = '.webp';
  } else {
    // Existing video support remains available; no watermark is applied to video.
    const videoExtensions: Record<string, string> = {
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'video/quicktime': '.mov',
      'video/x-msvideo': '.avi',
    };
    outputExtension = videoExtensions[file.mimetype];
    if (!outputExtension) {
      throw new BadRequestException('Hanya file foto atau video yang didukung.');
    }
    // Reject disguised photos/HTML rather than trusting the MIME header alone.
    const mp4 = file.buffer.subarray(4, 8).toString('ascii') === 'ftyp';
    const webm = file.buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
    const avi =
      file.buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      file.buffer.subarray(8, 12).toString('ascii') === 'AVI ';
    if (
      (['.mp4', '.mov'].includes(outputExtension) && !mp4) ||
      (outputExtension === '.webm' && !webm) ||
      (outputExtension === '.avi' && !avi)
    ) {
      throw new BadRequestException('Isi file video tidak sesuai formatnya.');
    }
    content = file.buffer;
  }

  const filename = `${Date.now()}-${randomUUID()}${outputExtension}`;
  const directory = STORAGE_DIRECTORY;
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), content, { flag: 'wx' });
  return `/storage/${filename}`;
}

export async function deleteStoredWayangMedia(fileUrl: string): Promise<void> {
  // Only remove a single local storage file, never arbitrary client paths.
  if (!/^\/storage\/[^/\\]+$/.test(fileUrl)) return;
  await unlink(path.join(STORAGE_DIRECTORY, path.basename(fileUrl))).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    },
  );
}
