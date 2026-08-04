import { Module } from '@nestjs/common';
import { WayangService } from './wayang.service';
import { WayangController } from './wayang.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [WayangService],
  controllers: [WayangController],
})
export class WayangModule {}
