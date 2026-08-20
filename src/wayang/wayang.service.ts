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

    const gayaMap: Record<string, string> = {
      'Purwo Yogyakarta': 'PY',
      'Purwo Surakarta': 'PS',
      'Purwo Kedu': 'PK',
    };

    const kodeGaya = gayaMap[body.gaya];

    if (!kodeGaya) {
      throw new Error('INVALID_GAYA');
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

    const kodeGolonganMap: Record<string, string> = {
      SIMPINGAN_KIRI: 'KI',
      SIMPINGAN_KANAN: 'KA',
      DUDHAHAN: 'D',
    };

    const kodeGolongan = kodeGolonganMap[golongan.tipeGolongan];

    if (!kodeGolongan) {
      throw new Error('INVALID_GOLONGAN_TYPE');
    }

    const noWayang = `${kodeGaya} ${urutanGolongan} ${kodeGolongan} ${body.penyimpananId} - ${urutanDalamKotak}`;

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

    const search = query.search?.trim();

    /*
     * ==========================================
     * FILTER
     * ==========================================
     */

    const where = {
      /*
       * Search berdasarkan nama wayang
       */
      ...(search
        ? {
            nama: {
              contains: search,
            },
          }
        : {}),

      /*
       * Filter berdasarkan tipe golongan
       *
       * Contoh:
       * SIMPINGAN_KIRI
       * SIMPINGAN_KANAN
       * DUDHAHAN
       */
      ...(query.tipeGolongan
        ? {
            golongan: {
              tipeGolongan: query.tipeGolongan,
            },
          }
        : {}),

      /*
       * Filter berdasarkan nama golongan
       */
      ...(query.golonganId
        ? {
            golonganId: Number(query.golonganId),
          }
        : {}),

      /*
       * Filter berdasarkan penyimpanan / kotak
       */
      ...(query.penyimpananId
        ? {
            penyimpananId: Number(query.penyimpananId),
          }
        : {}),
    };

    /*
     * ==========================================
     * SORT
     * ==========================================
     */

    const allowedSort = ['id', 'nama', 'noWayang', 'daerah', 'kondisi'];

    const sortBy =
      query.sortBy && allowedSort.includes(query.sortBy) ? query.sortBy : 'id';

    const order = query.order === 'desc' ? 'desc' : 'asc';

    const orderBy = {
      [sortBy]: order,
    };

    /*
     * ==========================================
     * TOTAL
     * ==========================================
     *
     * Total adalah jumlah wayang
     * setelah filter diterapkan.
     */

    const total = await this.database.wayang.count({
      where,
    });

    /*
     * ==========================================
     * DATA
     * ==========================================
     */

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

        /*
         * MEDIA
         */
        media: {
          select: {
            id: true,
            namaFile: true,
            jenis: true,
            fileUrl: true,
            keterangan: true,
          },
        },

        /*
         * GOLONGAN
         */
        golongan: {
          select: {
            id: true,
            namaGolongan: true,
            tipeGolongan: true,
          },
        },

        /*
         * PENYIMPANAN
         *
         * PENTING:
         * field yang benar adalah namaKotak,
         * bukan nama.
         */
        penyimpanan: {
          select: {
            id: true,
            namaKotak: true,
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

      /*
       * Statistik hanya total wayang
       */
      statistics: {
        totalWayang: total,
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

      select: {
        id: true,
        namaKotak: true,
      },
    });

    if (!penyimpanan) {
      throw new Error('PENYIMPANAN_NOT_FOUND');
    }

    return penyimpanan;
  }

  async addRelasi(wayangId: number, relasi: number[]) {
    const wayang = await this.database.wayang.findUnique({
      where: {
        id: wayangId,
      },
    });

    if (!wayang) {
      throw new Error('WAYANG_NOT_FOUND');
    }

    const relatedWayangs = await this.database.wayang.findMany({
      where: {
        id: {
          in: relasi,
        },
      },

      select: {
        id: true,
      },
    });

    if (relatedWayangs.length !== relasi.length) {
      throw new Error('RELATION_WAYANG_NOT_FOUND');
    }

    if (relasi.includes(wayangId)) {
      throw new Error('SELF_RELATION_NOT_ALLOWED');
    }

    return this.database.wayang.update({
      where: {
        id: wayangId,
      },

      data: {
        relasi,
      },

      include: {
        media: true,
        golongan: true,
        penyimpanan: true,
      },
    });
  }
}
