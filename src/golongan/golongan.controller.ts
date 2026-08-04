import { Controller, Get } from '@nestjs/common';
import { GolonganService } from './golongan.service';

@Controller('golongan')
export class GolonganController {
  constructor(private readonly golonganService: GolonganService) {}
  @Get()
  findAll() {
    return this.golonganService.findAll();
  }
}
