import { Module } from '@nestjs/common';
import { PenyimpananService } from './penyimpanan.service';
import { PenyimpananController } from './penyimpanan.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [PenyimpananService],
  controllers: [PenyimpananController],
})
export class PenyimpananModule {}
