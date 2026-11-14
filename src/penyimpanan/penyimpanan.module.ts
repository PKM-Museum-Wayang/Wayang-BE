import { Module } from '@nestjs/common';
import { PenyimpananService } from './penyimpanan.service';
import { PenyimpananController } from './penyimpanan.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [PenyimpananService],
  controllers: [PenyimpananController],
})
export class PenyimpananModule {}
