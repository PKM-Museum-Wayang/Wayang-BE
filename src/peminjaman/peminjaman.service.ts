import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreatePeminjamanDto, UpdatePeminjamanDto } from './peminjam.dto';

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

  async create(body: CreatePeminjamanDto) {
    const tanggalPinjam = this.parseTanggalPinjam(body.tanggalPinjam);

    const tanggalKembali = this.parseTanggalKembali(body.tanggalKembali);

    if (tanggalKembali <= tanggalPinjam) {
      throw new Error('INVALID_DATE');
    }

    let peminjam = await this.database.peminjam.findFirst({
      where: {
        noHp: body.noHp,
      },
    });

    if (!peminjam) {
      peminjam = await this.database.peminjam.create({
        data: {
          namaPeminjam: body.namaPeminjam.trim(),

          alamat: body.alamat.trim(),

          noHp: body.noHp.trim(),
        },
      });
    }

    const wayang = await this.database.wayang.findUnique({
      where: {
        id: body.wayangId,
      },
    });

    if (!wayang) {
      throw new Error('WAYANG_NOT_FOUND');
    }

    const bentrok = await this.database.logPeminjaman.findFirst({
      where: {
        wayangId: body.wayangId,

        status: 'DIPINJAM',

        tanggalPinjam: {
          lte: tanggalKembali,
        },

        tanggalKembali: {
          gte: tanggalPinjam,
        },
      },
    });

    if (bentrok) {
      throw new Error('WAYANG_UNAVAILABLE');
    }

    return this.database.logPeminjaman.create({
      data: {
        peminjamId: peminjam.id,

        wayangId: body.wayangId,

        tanggalPinjam,

        tanggalKembali,

        keterangan: body.keterangan?.trim() || null,

        status: 'DIPINJAM',
      },

      include: {
        peminjam: true,
        wayang: true,
      },
    });
  }

  async findAll() {
    return this.database.logPeminjaman.findMany({
      include: {
        peminjam: true,
        wayang: true,
      },

      orderBy: {
        id: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const peminjaman = await this.database.logPeminjaman.findUnique({
      where: {
        id,
      },

      include: {
        peminjam: true,
        wayang: true,
      },
    });

    if (!peminjaman) {
      throw new Error('LOAN_NOT_FOUND');
    }

    return peminjaman;
  }

  async update(id: number, body: UpdatePeminjamanDto) {
    const existing = await this.database.logPeminjaman.findUnique({
      where: {
        id,
      },

      include: {
        peminjam: true,
      },
    });

    if (!existing) {
      throw new Error('LOAN_NOT_FOUND');
    }

    const tanggalPinjam =
      body.tanggalPinjam !== undefined
        ? this.parseTanggalPinjam(body.tanggalPinjam)
        : this.parseTanggalPinjam(existing.tanggalPinjam);

    const tanggalKembali =
      body.tanggalKembali !== undefined
        ? this.parseTanggalKembali(body.tanggalKembali)
        : this.parseTanggalKembali(existing.tanggalKembali!);

    if (tanggalKembali <= tanggalPinjam) {
      throw new Error('INVALID_DATE');
    }

    const wayangId = body.wayangId ?? existing.wayangId;

    const wayang = await this.database.wayang.findUnique({
      where: {
        id: wayangId,
      },
    });

    if (!wayang) {
      throw new Error('WAYANG_NOT_FOUND');
    }

    const bentrok = await this.database.logPeminjaman.findFirst({
      where: {
        id: {
          not: id,
        },

        wayangId,

        status: 'DIPINJAM',

        tanggalPinjam: {
          lte: tanggalKembali,
        },

        tanggalKembali: {
          gte: tanggalPinjam,
        },
      },
    });

    if (bentrok) {
      throw new Error('WAYANG_UNAVAILABLE');
    }

    if (
      body.namaPeminjam !== undefined ||
      body.alamat !== undefined ||
      body.noHp !== undefined
    ) {
      await this.database.peminjam.update({
        where: {
          id: existing.peminjamId,
        },

        data: {
          ...(body.namaPeminjam !== undefined && {
            namaPeminjam: body.namaPeminjam.trim(),
          }),

          ...(body.alamat !== undefined && {
            alamat: body.alamat.trim(),
          }),

          ...(body.noHp !== undefined && {
            noHp: body.noHp.trim(),
          }),
        },
      });
    }

    return this.database.logPeminjaman.update({
      where: {
        id,
      },

      data: {
        wayangId,

        tanggalPinjam,

        tanggalKembali,

        ...(body.keterangan !== undefined && {
          keterangan: body.keterangan.trim() || null,
        }),
      },

      include: {
        peminjam: true,
        wayang: true,
      },
    });
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
      },
    });
  }
}
