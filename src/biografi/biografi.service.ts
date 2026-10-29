import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { DatabaseService } from '../database/database.service';
import { STORAGE_DIRECTORY } from '../storage/storage-paths';
import {
  createBiografiSchema,
  parseBiografi,
  updateBiografiSchema,
  validateJamBuka,
} from './biografi.dto';

@Injectable()
export class BiografiService {
  private readonly logger = new Logger(BiografiService.name);

  constructor(private readonly db: DatabaseService) {}

  async findOne() {
    const data = await this.db.biografi.findUnique({ where: { id: 1 } });
    if (!data) throw new NotFoundException('Biografi tidak ditemukan.');
    return data;
  }

  async create(body: unknown, file?: Express.Multer.File) {
    const existing = await this.db.biografi.findUnique({ where: { id: 1 } });
    if (existing) {
      throw new ConflictException('Biografi sudah ada. Gunakan PATCH /biografi untuk memperbarui.');
    }
    const dto = parseBiografi(createBiografiSchema, body);
    validateJamBuka(dto.jamBuka, dto.jamTutup);
    if (!file) throw new BadRequestException('Foto profil wajib diunggah.');

    const fotoProfil = await this.savePhoto(file);
    try {
      return await this.db.biografi.create({ data: { id: 1, ...dto, fotoProfil } });
    } catch (error) {
      await this.removePhoto(fotoProfil);
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Biografi sudah ada. Gunakan PATCH /biografi untuk memperbarui.');
      }
      throw error;
    }
  }

  async update(body: unknown, file?: Express.Multer.File) {
    const dto = parseBiografi(updateBiografiSchema, body);
    if (!file && Object.keys(dto).length === 0) {
      throw new BadRequestException('Minimal satu field atau foto harus diubah.');
    }
    const existing = await this.findOne();
    validateJamBuka(dto.jamBuka ?? existing.jamBuka, dto.jamTutup ?? existing.jamTutup);

    const fotoProfil = file ? await this.savePhoto(file) : undefined;
    let updated: Awaited<ReturnType<typeof this.findOne>>;
    try {
      updated = await this.db.biografi.update({
        where: { id: 1 },
        data: { ...dto, ...(fotoProfil ? { fotoProfil } : {}) },
      });
    } catch (error) {
      if (fotoProfil) await this.removePhoto(fotoProfil);
      this.rethrowMutationError(error);
    }
    // Hapus foto lama hanya setelah perubahan database berhasil.
    if (fotoProfil) await this.removePhoto(existing.fotoProfil);
    return updated;
  }

  async remove() {
    // Gunakan baris yang benar-benar dihapus untuk menentukan foto yang dibersihkan.
    try {
      const deleted = await this.db.biografi.delete({ where: { id: 1 } });
      await this.removePhoto(deleted.fotoProfil);
    } catch (error) {
      this.rethrowMutationError(error);
    }
  }

  private rethrowMutationError(error: unknown): never {
    if (
      typeof error === 'object' && error !== null &&
      'code' in error && error.code === 'P2025'
    ) {
      throw new NotFoundException('Biografi tidak ditemukan.');
    }
    throw error;
  }

  private async savePhoto(file: Express.Multer.File) {
    if (!file.buffer?.length || file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Foto maksimal 5 MB dan tidak boleh kosong.');
    }

    let buffer: Buffer;
    try {
      // Decode isi file; jangan hanya mempercayai ekstensi atau MIME dari klien.
      const image = sharp(file.buffer, { limitInputPixels: 25000000 });
      const metadata = await image.metadata();
      if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
        throw new Error('Unsupported image format');
      }
      buffer = await image
        .rotate()
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw new BadRequestException('Foto harus berupa gambar JPEG, PNG, atau WebP yang valid.');
    }

    const filename = `biografi-${randomUUID()}.webp`;
    await mkdir(STORAGE_DIRECTORY, { recursive: true });
    await writeFile(join(STORAGE_DIRECTORY, filename), buffer);
    return `/storage/${filename}`;
  }

  private async removePhoto(fileUrl: string) {
    // Hanya hapus file yang memang dikelola fitur ini, bukan path arbitrer.
    const filename = fileUrl.replace(/^\/storage\//, '');
    if (!/^biografi-[a-f0-9-]+\.webp$/.test(filename)) return;
    try {
      await unlink(join(STORAGE_DIRECTORY, filename));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Gagal membersihkan foto ${filename}: ${String(error)}`);
      }
    }
  }
}
