import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

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
      });
    } catch {
      throw new Error('DATABASE_ERROR');
    }
  }
}
