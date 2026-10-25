import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { WayangModule } from './wayang/wayang.module';
import { GolonganModule } from './golongan/golongan.module';
import { PenyimpananModule } from './penyimpanan/penyimpanan.module';
import { PeminjamanModule } from './peminjaman/peminjaman.module';
import { StorageController } from './storage/storage.controller';
import { KegiatanModule } from './kegiatan/kegiatan.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    WayangModule,
    GolonganModule,
    PenyimpananModule,
    PeminjamanModule,
    KegiatanModule,
  ],
  controllers: [AppController, StorageController],
  providers: [AppService],
})
export class AppModule {}
