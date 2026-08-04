import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PenyimpananDto } from './penyimpanan.dto';

@Injectable()
export class PenyimpananService {
  constructor(private readonly db: DatabaseService) {}

  async create(body: PenyimpananDto) {
    try {
      return await this.db.penyimpanan.create({
        data: {
          namaKotak: body.namaKotak,
        },
      });
    } catch {
      throw new Error('DATABASE_ERROR');
    }
  }

  async findAll() {
    try {
      return await this.db.penyimpanan.findMany({
        include: {
          wayang: true,
        },
      });
    } catch {
      throw new Error('DATABASE_ERROR');
    }
  }

  async findOne(id: number) {
    try {
      const data = await this.db.penyimpanan.findUnique({
        where: {
          id,
        },
        include: {
          wayang: true,
        },
      });

      if (!data) {
        throw new Error('PENYIMPANAN_NOT_FOUND');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }

  async update(id: number, body: PenyimpananDto) {
    try {
      const data = await this.db.penyimpanan.findUnique({
        where: {
          id,
        },
      });

      if (!data) {
        throw new Error('PENYIMPANAN_NOT_FOUND');
      }

      return await this.db.penyimpanan.update({
        where: {
          id,
        },
        data: {
          namaKotak: body.namaKotak,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }

  async remove(id: number) {
    try {
      const data = await this.db.penyimpanan.findUnique({
        where: {
          id,
        },
      });

      if (!data) {
        throw new Error('PENYIMPANAN_NOT_FOUND');
      }

      await this.db.penyimpanan.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('DATABASE_ERROR');
    }
  }
}
