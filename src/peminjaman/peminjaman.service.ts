import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreatePeminjamanDto } from './peminjam.dto';

@Injectable()
export class PeminjamanService {
  constructor(private readonly database: DatabaseService) {}

  async create(body: CreatePeminjamanDto) {
    if (body.tanggalPinjam >= body.tanggalKembali) {
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
          namaPeminjam: body.namaPeminjam,
          alamat: body.alamat,
          noHp: body.noHp,
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
          lte: body.tanggalKembali,
        },

        tanggalKembali: {
          gte: body.tanggalPinjam,
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
        tanggalPinjam: body.tanggalPinjam,
        tanggalKembali: body.tanggalKembali,
        keterangan: body.keterangan,
        status: 'DIPINJAM',
      },
      include: {
        peminjam: true,
        wayang: true,
      },
    });
  }
}
