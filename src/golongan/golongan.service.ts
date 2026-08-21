import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';

import {
  CreateGolonganDto,
  UpdateGolonganDto,
  GolonganQueryDto,
} from './golongan.controller';

@Injectable()
export class GolonganService {
  constructor(private readonly db: DatabaseService) {}

  async findAllWithoutPagination(tipeGolongan?: string) {
    try {
      const where: any = {};

      if (tipeGolongan?.trim()) {
        where.tipeGolongan = tipeGolongan.trim();
      }

      return await this.db.golongan.findMany({
        where,

        select: {
          id: true,
          namaGolongan: true,
          tipeGolongan: true,
        },

        orderBy: {
          namaGolongan: 'asc',
        },
      });
    } catch {
      throw new Error('DATABASE_ERROR');
    }
  }


  async findAll(query: GolonganQueryDto) {
    try {
      const page = Math.max(Number(query.page) || 1, 1);

      const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

      const skip = (page - 1) * limit;

      const where: any = {};


      if (query.search?.trim()) {
        where.namaGolongan = {
          contains: query.search.trim(),
        };
      }


      if (query.tipeGolongan?.trim()) {
        where.tipeGolongan = query.tipeGolongan.trim();
      }


      const [data, total] = await Promise.all([
        this.db.golongan.findMany({
          where,
          skip,
          take: limit,

          orderBy: [
            {
              tipeGolongan: 'asc',
            },
            {
              namaGolongan: 'asc',
            },
          ],

          include: {
            _count: {
              select: {
                wayang: true,
              },
            },
          },
        }),

        this.db.golongan.count({
          where,
        }),
      ]);

      return {
        data,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch {
      throw new Error('DATABASE_ERROR');
    }
  }


  async findOne(id: number) {
    try {
      const data = await this.db.golongan.findUnique({
        where: { id },
      });

      if (!data) {
        throw new Error('GOLONGAN_NOT_FOUND');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.message === 'GOLONGAN_NOT_FOUND') {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }



  async create(dto: CreateGolonganDto) {
    try {
      return await this.db.golongan.create({
        data: {
          namaGolongan: dto.namaGolongan!,
          tipeGolongan: dto.tipeGolongan!,
        },
      });
    } catch {
      throw new Error('DATABASE_ERROR');
    }
  }



  async update(id: number, dto: UpdateGolonganDto) {
    try {
      const existing = await this.db.golongan.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('GOLONGAN_NOT_FOUND');
      }

      return await this.db.golongan.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'GOLONGAN_NOT_FOUND') {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }


  async remove(id: number) {
    try {
      const existing = await this.db.golongan.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error('GOLONGAN_NOT_FOUND');
      }

      await this.db.golongan.delete({
        where: { id },
      });

      return existing;
    } catch (error) {
      if (error instanceof Error && error.message === 'GOLONGAN_NOT_FOUND') {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }
}
