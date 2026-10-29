import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BiografiController } from './biografi.controller';
import { BiografiService } from './biografi.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BiografiController],
  providers: [BiografiService],
})
export class BiografiModule {}
