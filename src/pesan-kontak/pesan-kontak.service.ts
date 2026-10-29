import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  createPesanKontakSchema,
  parsePesanKontak,
  queryPesanKontakSchema,
  updatePesanKontakSchema,
} from './pesan-kontak.dto';

@Injectable()
export class PesanKontakService {
  constructor(private readonly db: DatabaseService) {}

  async create(body: unknown) {
    const data = parsePesanKontak(createPesanKontakSchema, body);
    const created = await this.db.pesanKontak.create({ data, select: { id: true } });
    return created;
  }

  async findAll(query: unknown) {
    const { page, limit, jenisTopik } = parsePesanKontak(queryPesanKontakSchema, query);
    const where = jenisTopik ? { jenisTopik } : {};
    const [data, total] = await Promise.all([
      this.db.pesanKontak.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.pesanKontak.count({ where }),
    ]);
    return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const data = await this.db.pesanKontak.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Pesan kontak tidak ditemukan.');
    return data;
  }

  async update(id: number, body: unknown) {
    const data = parsePesanKontak(updatePesanKontakSchema, body);
    try {
      return await this.db.pesanKontak.update({ where: { id }, data });
    } catch (error) {
      this.rethrowMutationError(error);
    }
  }

  async remove(id: number) {
    try {
      await this.db.pesanKontak.delete({ where: { id } });
    } catch (error) {
      this.rethrowMutationError(error);
    }
  }

  private rethrowMutationError(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
      throw new NotFoundException('Pesan kontak tidak ditemukan.');
    }
    throw error;
  }
}
