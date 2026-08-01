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
    if (!body.golonganId || !body.penyimpananId) {
      throw new Error('golonganId dan penyimpananId wajib diisi');
    }

    const golongan = await this.database.golongan.findUnique({
      where: { id: body.golonganId },
    });

    if (!golongan) {
      throw new Error('Golongan tidak ditemukan');
    }

    const countInKotak = await this.database.wayang.count({
      where: {
        golonganId: body.golonganId,
        penyimpananId: body.penyimpananId,
      },
    });

    const urutanDalamKotak = countInKotak + 1;

    const countGolongan = await this.database.wayang.count({
      where: {
        golonganId: body.golonganId,
      },
    });

    const urutanGolongan = String(countGolongan + 1).padStart(2, '0');

    const kodeMap: Record<string, string> = {
      SIMPINGAN_KIRI: 'KI',
      SIMPINGAN_KANAN: 'KA',
      DUDHAHAN: 'DU',
    };

    const kodeGolongan = kodeMap[golongan.tipeGolongan];

    if (!kodeGolongan) {
      throw new Error('Tipe golongan tidak valid');
    }

    const noWayang = `${urutanGolongan}-${kodeGolongan}-${body.penyimpananId}-${urutanDalamKotak}`;

    return this.database.wayang.create({
      data: {
        noWayang,

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
        namaFile: body.namaFile,
        jenis: body.jenis,
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
        // noWayang: body.noWayang,
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
        namaFile: body.namaFile,
        jenis: body.jenis,
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
