import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PenyimpananDto } from './penyimpanan.dto';

@Injectable()
export class PenyimpananService {
  constructor(private readonly db: DatabaseService) {}

  create(body: PenyimpananDto) {
    return this.db.penyimpanan.create({
      data: {
        namaKotak: body.namaKotak,
      },
    });
  }

  findAll() {
    return this.db.penyimpanan.findMany({
      include: {
        wayang: true,
      },
    });
  }

  findOne(id: number) {
    return this.db.penyimpanan.findUnique({
      where: { id },
      include: {
        wayang: true,
      },
    });
  }

  update(id: number, body: PenyimpananDto) {
    return this.db.penyimpanan.update({
      where: { id },
      data: {
        namaKotak: body.namaKotak,
      },
    });
  }

  remove(id: number) {
    return this.db.penyimpanan.delete({
      where: { id },
    });
  }
}
