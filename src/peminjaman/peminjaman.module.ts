import { Module } from '@nestjs/common';
import { PeminjamanService } from './peminjaman.service';
import { PeminjamanController } from './peminjaman.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [PeminjamanService],
  controllers: [PeminjamanController],
})
export class PeminjamanModule {}
