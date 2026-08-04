import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
@Injectable()
export class GolonganService {
  constructor(private readonly db: DatabaseService) {}

  findAll() {
    return this.db.golongan.findMany({
      orderBy: [{ tipeGolongan: 'asc' }, { namaGolongan: 'asc' }],
    });
  }
}
