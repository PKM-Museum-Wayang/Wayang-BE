import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { WayangDto } from './wayang,.dto';
import { MediaWayangDto } from './mediawayang.dto';
import { WayangQueryDto } from './wayangquery.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WayangService {
  constructor(private readonly database: DatabaseService) {}

  async create(body: WayangDto) {
    if (!body.golonganId || !body.penyimpananId) {
      throw new Error('INVALID_REQUEST');
    }

    const golongan = await this.database.golongan.findUnique({
      where: {
        id: body.golonganId,
      },
    });

    if (!golongan) {
      throw new Error('GOLONGAN_NOT_FOUND');
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
      throw new Error('INVALID_GOLONGAN_TYPE');
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
          connect: {
            id: body.golonganId,
          },
        },

        penyimpanan: {
          connect: {
            id: body.penyimpananId,
          },
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
    const wayang = await this.database.wayang.findUnique({
      where: {
        id: wayangId,
      },
    });

    if (!wayang) {
      throw new Error('WAYANG_NOT_FOUND');
    }

    if (!file) {
      throw new Error('FILE_REQUIRED');
    }

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

  async findAll(query: WayangQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.search && {
        nama: {
          contains: query.search,
        },
      }),

      ...(query.golonganId && {
        golonganId: Number(query.golonganId),
      }),

      ...(query.penyimpananId && {
        penyimpananId: Number(query.penyimpananId),
      }),
    };

    const orderBy =
      query.sortBy && query.order
        ? {
            [query.sortBy]: query.order,
          }
        : {
            id: 'asc' as const,
          };

    const total = await this.database.wayang.count({
      where,
    });

    const data = await this.database.wayang.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        noWayang: true,
        nama: true,
        daerah: true,
        kondisi: true,
        golonganId: true,
        penyimpananId: true,
        media: {
          select: {
            id: true,
            namaFile: true,
            jenis: true,
            fileUrl: true,
            keterangan: true,
          },
        },
      },
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const wayang = await this.database.wayang.findUnique({
      where: {
        id,
      },
      include: {
        media: true,
        golongan: true,
        penyimpanan: true,
      },
    });

    if (!wayang) {
      throw new Error('WAYANG_NOT_FOUND');
    }

    return wayang;
  }

  async remove(id: number) {
    const wayang = await this.database.wayang.findUnique({
      where: {
        id,
      },
    });

    if (!wayang) {
      throw new Error('WAYANG_NOT_FOUND');
    }

    await this.database.wayang.delete({
      where: {
        id,
      },
    });
  }

  async update(id: number, body: WayangDto) {
    const wayang = await this.database.wayang.findUnique({
      where: {
        id,
      },
    });

    if (!wayang) {
      throw new Error('WAYANG_NOT_FOUND');
    }

    const golongan = await this.database.golongan.findUnique({
      where: {
        id: body.golonganId,
      },
    });

    if (!golongan) {
      throw new Error('GOLONGAN_NOT_FOUND');
    }

    const penyimpanan = await this.database.penyimpanan.findUnique({
      where: {
        id: body.penyimpananId,
      },
    });

    if (!penyimpanan) {
      throw new Error('PENYIMPANAN_NOT_FOUND');
    }

    return this.database.wayang.update({
      where: {
        id,
      },
      data: {
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
    const media = await this.database.mediaWayang.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      throw new Error('MEDIA_NOT_FOUND');
    }

    return this.database.mediaWayang.update({
      where: {
        id: mediaId,
      },
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
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      throw new Error('MEDIA_NOT_FOUND');
    }

    if (media.fileUrl) {
      const filePath = path.join(process.cwd(), media.fileUrl);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.database.mediaWayang.delete({
      where: {
        id: mediaId,
      },
    });
  }

  async findMedia(mediaId: number) {
    const media = await this.database.mediaWayang.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      throw new Error('MEDIA_NOT_FOUND');
    }

    return media;
  }

  async findGolongan(golonganId: number) {
    const golongan = await this.database.golongan.findUnique({
      where: {
        id: golonganId,
      },
    });

    if (!golongan) {
      throw new Error('GOLONGAN_NOT_FOUND');
    }

    return golongan;
  }

  async findPenyimpanan(penyimpananId: number) {
    const penyimpanan = await this.database.penyimpanan.findUnique({
      where: {
        id: penyimpananId,
      },
    });

    if (!penyimpanan) {
      throw new Error('PENYIMPANAN_NOT_FOUND');
    }

    return penyimpanan;
  }
}
