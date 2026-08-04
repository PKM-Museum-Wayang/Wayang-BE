import { Module } from '@nestjs/common';
import { GolonganService } from './golongan.service';
import { GolonganController } from './golongan.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [GolonganService],
  controllers: [GolonganController],
})
export class GolonganModule {}
