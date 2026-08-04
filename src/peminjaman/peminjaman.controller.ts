import { Body, Controller, Post } from '@nestjs/common';
import { PeminjamanService } from './peminjaman.service';
import { CreatePeminjamanDto } from './peminjam.dto';

@Controller('peminjaman')
export class PeminjamanController {
  constructor(private readonly peminjamanService: PeminjamanService) {}

  @Post()
  create(@Body() body: CreatePeminjamanDto) {
    return this.peminjamanService.create(body);
  }
}
