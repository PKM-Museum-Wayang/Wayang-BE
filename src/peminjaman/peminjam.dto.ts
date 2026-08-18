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

  keterangan?: string;
}
