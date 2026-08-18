import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateGolonganDto, UpdateGolonganDto } from './golongan.controller';

@Injectable()
export class GolonganService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    try {
      return await this.db.golongan.findMany({
        orderBy: [
          {
            tipeGolongan: 'asc',
          },
          {
            namaGolongan: 'asc',
          },
        ],
        include: {
          _count: { select: { wayang: true } },
        },
      });
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
