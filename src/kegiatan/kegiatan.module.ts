import { Module } from '@nestjs/common';
import { KegiatanController } from './kegiatan.controller';
import { KegiatanService } from './kegiatan.service';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [KegiatanController],
  providers: [KegiatanService, DatabaseService],
  exports: [DatabaseService],
})
export class KegiatanModule {}
