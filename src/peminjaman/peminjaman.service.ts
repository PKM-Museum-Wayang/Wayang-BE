import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';
import type { Prisma } from 'src/generated/prisma/client';

import type {
  CreatePeminjamanDto,
  UpdatePeminjamanDto,
  PeminjamanQueryDto,
} from './peminjam.dto';

@Injectable()
export class PeminjamanService {
  constructor(private readonly database: DatabaseService) {}

  private getDateOnly(tanggal: string | Date): string {
    if (tanggal instanceof Date) {
      if (isNaN(tanggal.getTime())) {
        throw new Error('INVALID_DATE');
      }

      return tanggal.toISOString().slice(0, 10);
    }

    if (!tanggal || typeof tanggal !== 'string') {
      throw new Error('INVALID_DATE');
    }

    const dateOnly = tanggal.slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      throw new Error('INVALID_DATE');
    }

    return dateOnly;
  }

  private parseTanggalPinjam(tanggal: string | Date): Date {
    const dateOnly = this.getDateOnly(tanggal);

    const date = new Date(`${dateOnly}T00:00:00`);

    if (isNaN(date.getTime())) {
      throw new Error('INVALID_DATE');
    }

    return date;
  }

  private parseTanggalKembali(tanggal: string | Date): Date {
    const dateOnly = this.getDateOnly(tanggal);

    const date = new Date(`${dateOnly}T23:59:59`);

    if (isNaN(date.getTime())) {
      throw new Error('INVALID_DATE');
    }

    return date;
  }

  private async checkAvailability(
    tx: Prisma.TransactionClient,
    wayangId: number | null,
    penyimpananId: number | null,
    tanggalPinjam: Date,
    tanggalKembali: Date,
    excludeId?: number,
  ) {
    let kotakId = penyimpananId;
    if (wayangId !== null) {
      const wayang = await tx.wayang.findUnique({ where: { id: wayangId } });
      if (!wayang) throw new Error('WAYANG_NOT_FOUND');
      kotakId = wayang.penyimpananId;
    }

    const kotak = await tx.$queryRaw<{ id: number }[]>`SELECT id FROM Penyimpanan WHERE id = ${kotakId} FOR UPDATE`;
    if (!kotak.length) throw new Error('PENYIMPANAN_NOT_FOUND');

    const bentrok = await tx.logPeminjaman.findFirst({
      where: {
        ...(excludeId !== undefined && { id: { not: excludeId } }),
        status: 'DIPINJAM',
        tanggalPinjam: { lte: tanggalKembali },
        tanggalKembali: { gte: tanggalPinjam },
        OR: wayangId !== null
          ? [{ wayangId }, { penyimpananId: kotakId }]
          : [{ penyimpananId: kotakId }, { wayang: { penyimpananId: kotakId! } }],
      },
    });
    if (bentrok) throw new Error(wayangId !== null ? 'WAYANG_UNAVAILABLE' : 'PENYIMPANAN_UNAVAILABLE');
  }

  async create(body: CreatePeminjamanDto) {
    const wayangId = body.wayangId ?? null;
    const penyimpananId = body.penyimpananId ?? null;
    if ((wayangId === null) === (penyimpananId === null)) throw new Error('INVALID_LOAN_TARGET');

    const tanggalPinjam = this.parseTanggalPinjam(body.tanggalPinjam);
    const tanggalKembali = this.parseTanggalKembali(body.tanggalKembali);
    if (tanggalKembali <= tanggalPinjam) throw new Error('INVALID_DATE');

    return this.database.$transaction(async (tx) => {
      await this.checkAvailability(tx, wayangId, penyimpananId, tanggalPinjam, tanggalKembali);
      const noHp = body.noHp.trim();
      let peminjam = await tx.peminjam.findFirst({ where: { noHp } });
      if (!peminjam) {
        peminjam = await tx.peminjam.create({
          data: { namaPeminjam: body.namaPeminjam.trim(), alamat: body.alamat.trim(), noHp },
        });
      }
      return tx.logPeminjaman.create({
        data: { peminjamId: peminjam.id, wayangId, penyimpananId, tanggalPinjam, tanggalKembali, keterangan: body.keterangan?.trim() || null, status: 'DIPINJAM' },
        include: { peminjam: true, wayang: true, penyimpanan: true },
      });
    }, { isolationLevel: 'ReadCommitted' });
  }

  async findAll(query: PeminjamanQueryDto) {
    const page = Math.max(Number(query.page) || 1, 1);

    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    const now = new Date();

    const where: any = {};

    if (search) {
      where.OR = [
        {
          peminjam: {
            namaPeminjam: {
              contains: search,
            },
          },
        },

        {
          peminjam: {
            noHp: {
              contains: search,
            },
          },
        },

        {
          wayang: {
            nama: {
              contains: search,
            },
          },
        },
      ];
    }

    if (query.status === 'DIPINJAM') {
      where.status = 'DIPINJAM';

      where.tanggalKembali = {
        gte: now,
      };
    }

    if (query.status === 'DIKEMBALIKAN') {
      where.status = 'DIKEMBALIKAN';
    }

    if (query.status === 'TERLAMBAT') {
      where.status = 'DIPINJAM';

      where.tanggalKembali = {
        lt: now,
      };
    }

    const [
      data,
      total,
      totalPeminjaman,
      totalDipinjam,
      totalDikembalikan,
      totalPeminjam,
    ] = await Promise.all([
      this.database.logPeminjaman.findMany({
        where,

        include: {
          peminjam: true,
          wayang: true,
          penyimpanan: true,
        },

        orderBy: {
          id: 'desc',
        },

        skip,

        take: limit,
      }),

      this.database.logPeminjaman.count({
        where,
      }),

      this.database.logPeminjaman.count(),

      this.database.logPeminjaman.count({
        where: {
          status: 'DIPINJAM',
        },
      }),

      this.database.logPeminjaman.count({
        where: {
          status: 'DIKEMBALIKAN',
        },
      }),

      this.database.logPeminjaman.findMany({
        distinct: ['peminjamId'],

        select: {
          peminjamId: true,
        },
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

      statistics: {
        totalPeminjaman,
        totalPeminjam: totalPeminjam.length,
        totalDipinjam,
        totalDikembalikan,
      },
    };
  }

  async findOne(id: number) {
    const peminjaman = await this.database.logPeminjaman.findUnique({
      where: {
        id,
      },

      include: {
        peminjam: true,
        wayang: true,
        penyimpanan: true,
      },
    });

    if (!peminjaman) {
      throw new Error('LOAN_NOT_FOUND');
    }

    return peminjaman;
  }

  async update(id: number, body: UpdatePeminjamanDto) {
    return this.database.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM LogPeminjaman WHERE id = ${id} FOR UPDATE`;
      const existing = await tx.logPeminjaman.findUnique({ where: { id } });
      if (!existing) throw new Error('LOAN_NOT_FOUND');

      const wayangId = body.wayangId !== undefined ? body.wayangId : existing.wayangId;
      const penyimpananId = body.penyimpananId !== undefined ? body.penyimpananId : existing.penyimpananId;
      if ((wayangId === null) === (penyimpananId === null)) throw new Error('INVALID_LOAN_TARGET');

      const tanggalPinjam = body.tanggalPinjam !== undefined ? this.parseTanggalPinjam(body.tanggalPinjam) : existing.tanggalPinjam;
      const tanggalKembali = body.tanggalKembali !== undefined ? this.parseTanggalKembali(body.tanggalKembali) : existing.tanggalKembali;
      if (!tanggalKembali || tanggalKembali <= tanggalPinjam) throw new Error('INVALID_DATE');

      const status = body.status ?? existing.status;
      if (status !== 'DIPINJAM' && status !== 'DIKEMBALIKAN') throw new Error('INVALID_STATUS');
      if (status === 'DIPINJAM') {
        await this.checkAvailability(tx, wayangId, penyimpananId, tanggalPinjam, tanggalKembali, id);
      } else if (wayangId !== null) {
        if (!await tx.wayang.findUnique({ where: { id: wayangId } })) throw new Error('WAYANG_NOT_FOUND');
      } else if (!await tx.penyimpanan.findUnique({ where: { id: penyimpananId! } })) {
        throw new Error('PENYIMPANAN_NOT_FOUND');
      }

      if (body.namaPeminjam !== undefined || body.alamat !== undefined || body.noHp !== undefined) {
        await tx.peminjam.update({
          where: { id: existing.peminjamId },
          data: {
            ...(body.namaPeminjam !== undefined && { namaPeminjam: body.namaPeminjam.trim() }),
            ...(body.alamat !== undefined && { alamat: body.alamat.trim() }),
            ...(body.noHp !== undefined && { noHp: body.noHp.trim() }),
          },
        });
      }
      return tx.logPeminjaman.update({
        where: { id },
        data: { wayangId, penyimpananId, tanggalPinjam, tanggalKembali, status, ...(body.keterangan !== undefined && { keterangan: body.keterangan.trim() || null }) },
        include: { peminjam: true, wayang: true, penyimpanan: true },
      });
    }, { isolationLevel: 'ReadCommitted' });
  }

  async remove(id: number) {
    const existing = await this.database.logPeminjaman.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new Error('LOAN_NOT_FOUND');
    }

    await this.database.logPeminjaman.delete({
      where: {
        id,
      },
    });

    return {
      id,
    };
  }

  async returnLoan(id: number) {
    const existing = await this.database.logPeminjaman.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new Error('LOAN_NOT_FOUND');
    }

    if (existing.status === 'DIKEMBALIKAN') {
      throw new Error('LOAN_ALREADY_RETURNED');
    }

    return this.database.logPeminjaman.update({
      where: {
        id,
      },

      data: {
        status: 'DIKEMBALIKAN',
      },

      include: {
        peminjam: true,
        wayang: true,
        penyimpanan: true,
      },
    });
  }
}
