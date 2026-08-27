import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

import { CreateKegiatanDto, UpdateKegiatanDto } from './kegiatan.dto';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class KegiatanService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    adminId?: number;
  }) {
    try {
      const page = Math.max(Number(query.page) || 1, 1);

      const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

      const skip = (page - 1) * limit;

      const search = query.search?.trim();

      const where = {
        ...(search
          ? {
              OR: [
                {
                  nama: {
                    contains: search,
                  },
                },
                {
                  lokasi: {
                    contains: search,
                  },
                },
                {
                  deskripsi: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),

        ...(query.adminId
          ? {
              adminId: Number(query.adminId),
            }
          : {}),
      };

      const total = await this.db.kegiatan.count({
        where,
      });

      const data = await this.db.kegiatan.findMany({
        where,

        orderBy: {
          tanggal: 'desc',
        },

        skip,

        take: limit,

        select: {
          id: true,
          nama: true,
          deskripsi: true,
          tanggal: true,
          lokasi: true,
          imageUrl: true,
          adminId: true,
          createdAt: true,
          updatedAt: true,

          admin: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      const now = new Date();

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      );

      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const startOfNextYear = new Date(now.getFullYear() + 1, 0, 1);

      const [totalBulanIni, totalTahunIni, totalAkanDatang, totalSelesai] =
        await Promise.all([
          this.db.kegiatan.count({
            where: {
              tanggal: {
                gte: startOfMonth,
                lt: startOfNextMonth,
              },
            },
          }),

          this.db.kegiatan.count({
            where: {
              tanggal: {
                gte: startOfYear,
                lt: startOfNextYear,
              },
            },
          }),

          this.db.kegiatan.count({
            where: {
              tanggal: {
                gt: now,
              },
            },
          }),

          this.db.kegiatan.count({
            where: {
              tanggal: {
                lt: now,
              },
            },
          }),
        ]);

      const kegiatanPerAdmin = await this.db.kegiatan.groupBy({
        by: ['adminId'],

        _count: {
          id: true,
        },

        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      });

      const adminIds = kegiatanPerAdmin.map((item) => item.adminId);

      const admins = await this.db.admin.findMany({
        where: {
          id: {
            in: adminIds,
          },
        },

        select: {
          id: true,
          username: true,
        },
      });

      const adminMap = new Map(
        admins.map((admin) => [admin.id, admin.username]),
      );

      const statistikAdmin = kegiatanPerAdmin.map((item) => ({
        adminId: item.adminId,
        username: adminMap.get(item.adminId) ?? null,
        totalKegiatan: item._count.id,
      }));

      return {
        data,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },

        statistics: {
          totalKegiatan: total,

          totalBulanIni,

          totalTahunIni,

          totalAkanDatang,

          totalSelesai,

          kegiatanPerAdmin: statistikAdmin,
        },
      };
    } catch {
      throw new Error('DATABASE_ERROR');
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.db.kegiatan.findUnique({
        where: {
          id,
        },

        include: {
          admin: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      if (!data) {
        throw new Error('KEGIATAN_NOT_FOUND');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.message === 'KEGIATAN_NOT_FOUND') {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }

  async create(dto: CreateKegiatanDto) {
    try {
      const admin = await this.db.admin.findUnique({
        where: {
          id: dto.adminId!,
        },
      });

      if (!admin) {
        throw new Error('ADMIN_NOT_FOUND');
      }

      return await this.db.kegiatan.create({
        data: {
          nama: dto.nama!,
          deskripsi: dto.deskripsi,
          tanggal: new Date(dto.tanggal!),
          lokasi: dto.lokasi!,
          imageUrl: dto.imageUrl,
          adminId: dto.adminId!,
        },

        include: {
          admin: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'ADMIN_NOT_FOUND') {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }

  async update(id: number, dto: UpdateKegiatanDto) {
    try {
      const existing = await this.db.kegiatan.findUnique({
        where: {
          id,
        },
      });

      if (!existing) {
        throw new Error('KEGIATAN_NOT_FOUND');
      }

      if (dto.adminId !== undefined) {
        const admin = await this.db.admin.findUnique({
          where: {
            id: dto.adminId,
          },
        });

        if (!admin) {
          throw new Error('ADMIN_NOT_FOUND');
        }
      }

      return await this.db.kegiatan.update({
        where: {
          id,
        },

        data: {
          ...(dto.nama !== undefined && {
            nama: dto.nama,
          }),

          ...(dto.deskripsi !== undefined && {
            deskripsi: dto.deskripsi,
          }),

          ...(dto.tanggal !== undefined && {
            tanggal: new Date(dto.tanggal),
          }),

          ...(dto.lokasi !== undefined && {
            lokasi: dto.lokasi,
          }),

          ...(dto.imageUrl !== undefined && {
            imageUrl: dto.imageUrl,
          }),

          ...(dto.adminId !== undefined && {
            adminId: dto.adminId,
          }),
        },

        include: {
          admin: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'KEGIATAN_NOT_FOUND' ||
          error.message === 'ADMIN_NOT_FOUND')
      ) {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.db.kegiatan.findUnique({
        where: {
          id,
        },
      });

      if (!existing) {
        throw new Error('KEGIATAN_NOT_FOUND');
      }

      await this.db.kegiatan.delete({
        where: {
          id,
        },
      });

      return existing;
    } catch (error) {
      if (error instanceof Error && error.message === 'KEGIATAN_NOT_FOUND') {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }

  async addGambar(id: number, file: Express.Multer.File) {
    try {
      const existing = await this.db.kegiatan.findUnique({
        where: {
          id,
        },
      });

      if (!existing) {
        throw new Error('KEGIATAN_NOT_FOUND');
      }

      if (!file) {
        throw new Error('FILE_REQUIRED');
      }

      // Hapus file gambar lama supaya tidak menumpuk di folder storage.
      if (existing.imageUrl) {
        const oldFilePath = path.join(process.cwd(), existing.imageUrl);

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      const imageUrl = `/storage/${file.filename}`;

      return await this.db.kegiatan.update({
        where: {
          id,
        },

        data: {
          imageUrl,
        },

        include: {
          admin: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'KEGIATAN_NOT_FOUND' ||
          error.message === 'FILE_REQUIRED')
      ) {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }
}
