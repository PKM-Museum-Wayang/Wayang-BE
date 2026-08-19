export class CreatePeminjamanDto {
  namaPeminjam!: string;
  alamat!: string;
  noHp!: string;

  wayangId!: number;

  tanggalPinjam!: Date;
  tanggalKembali!: Date;

  keterangan?: string;
}

export class UpdatePeminjamanDto {
  namaPeminjam?: string;
  alamat?: string;
  noHp?: string;

  wayangId?: number;

  tanggalPinjam?: Date;
  tanggalKembali?: Date;
  status?: 'DIPINJAM' | 'DIKEMBALIKAN';
  keterangan?: string;
}

export class PeminjamanQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  status?: 'DIPINJAM' | 'TERLAMBAT' | 'DIKEMBALIKAN';
}
