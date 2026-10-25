import {
  Controller,
  Get,
  Header,
  Redirect,
  StreamableFile,
} from '@nestjs/common';
import { createWatermarkPreview } from '../wayang/wayang-watermark-preview';
import type { WatermarkPreview } from '../wayang/wayang-watermark-preview';

@Controller('storage')
export class StorageController {
  private previewTask?: Promise<WatermarkPreview>;

  // /storage is not an HTML site; display one actual preview instead.
  @Get()
  @Redirect('/storage/preview', 302)
  openStorage() {}

  // The .webp route also creates a preview when no static preview exists yet.
  @Get(['preview', 'watermark-preview.webp'])
  @Header('Cache-Control', 'no-store')
  async preview(): Promise<StreamableFile> {
    // Coalesce concurrent requests within this server process.
    const task = this.previewTask ??= createWatermarkPreview();
    try {
      const result = await task;
      return new StreamableFile(result.buffer, {
        type: 'image/webp',
        disposition: 'inline; filename="watermark-preview.webp"',
        length: result.buffer.length,
      });
    } finally {
      if (this.previewTask === task) this.previewTask = undefined;
    }
  }
}
