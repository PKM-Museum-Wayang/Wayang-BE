import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PesanKontakController } from './pesan-kontak.controller';
import { PesanKontakService } from './pesan-kontak.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PesanKontakController],
  providers: [PesanKontakService],
})
export class PesanKontakModule {}
