import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { WayangDto } from './wayang,.dto';
import { MediaWayangDto } from './mediawayang.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WayangService {
  constructor(private readonly database: DatabaseService) {}

  async create(body: WayangDto) {
    return this.database.wayang.create({
      data: {
        noWayang: body.noWayang,
        nama: body.nama,
        daerah: body.daerah,
        deskripsi: body.deskripsi,
        cerita: body.cerita,
        kondisi: body.kondisi,

        golongan: {
          connect: { id: body.golonganId },
        },

        penyimpanan: {
          connect: { id: body.penyimpananId },
        },
      },
      include: {
        media: true,
        golongan: true,
        penyimpanan: true,
      },
    });
  }

  async addMedia(
    wayangId: number,
    body: MediaWayangDto,
    file: Express.Multer.File,
  ) {
    const fileUrl = `/storage/${file.filename}`;

    return this.database.mediaWayang.create({
      data: {
        judul: body.judul,
        jenisMedia: body.jenisMedia,
        keterangan: body.keterangan,
        fileUrl,
        wayangId,
      },
    });
  }

  async findAll() {
    return this.database.wayang.findMany({
      include: {
        media: true,
        golongan: true,
        penyimpanan: true,
      },
    });
  }

  async findOne(id: number) {
    return this.database.wayang.findUnique({
      where: { id },
      include: {
        media: true,
        golongan: true,
        penyimpanan: true,
      },
    });
  }

  async remove(id: number) {
    await this.database.wayang.delete({
      where: { id },
    });

    return {
      message: 'Wayang berhasil dihapus',
    };
  }

  async update(id: number, body: WayangDto) {
    return this.database.wayang.update({
      where: { id },
      data: {
        noWayang: body.noWayang,
        nama: body.nama,
        daerah: body.daerah,
        deskripsi: body.deskripsi,
        cerita: body.cerita,
        kondisi: body.kondisi,

        golonganId: body.golonganId,
        penyimpananId: body.penyimpananId,
      },
      include: {
        media: true,
        golongan: true,
        penyimpanan: true,
      },
    });
  }
  async updateMedia(
    mediaId: number,
    body: MediaWayangDto,
    file?: Express.Multer.File,
  ) {
    return this.database.mediaWayang.update({
      where: { id: mediaId },
      data: {
        judul: body.judul,
        jenisMedia: body.jenisMedia,
        keterangan: body.keterangan,
        ...(file && {
          fileUrl: `/storage/${file.filename}`,
        }),
      },
    });
  }

  async removeMedia(mediaId: number) {
    const media = await this.database.mediaWayang.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return {
        message: 'Media tidak ditemukan',
      };
    }

    if (media.fileUrl) {
      const filePath = path.join(process.cwd(), media.fileUrl);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.database.mediaWayang.delete({
      where: { id: mediaId },
    });

    return {
      message: 'Media berhasil dihapus',
    };
  }
}
