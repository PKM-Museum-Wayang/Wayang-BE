import { Module } from '@nestjs/common';
import { WayangService } from './wayang.service';
import { WayangController } from './wayang.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [WayangService],
  controllers: [WayangController],
})
export class WayangModule {}
