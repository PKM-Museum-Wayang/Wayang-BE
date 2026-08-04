export class CreatePeminjamanDto {
  namaPeminjam!: string;
  alamat!: string;
  noHp!: string;

  wayangId!: number;

  tanggalPinjam!: Date;
  tanggalKembali!: Date;

  keterangan?: string;
}
