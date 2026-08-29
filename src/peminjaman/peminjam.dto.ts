export interface CreatePeminjamanDto {
  namaPeminjam: string;
  alamat: string;
  noHp: string;

  wayangId?: number;
  penyimpananId?: number;

  tanggalPinjam: string | Date;
  tanggalKembali: string | Date;

  keterangan?: string;
}

export interface UpdatePeminjamanDto {
  namaPeminjam?: string;
  alamat?: string;
  noHp?: string;

  wayangId?: number | null;
  penyimpananId?: number | null;

  tanggalPinjam?: string | Date;
  tanggalKembali?: string | Date;

  keterangan?: string;
  status?: string;
}

export interface PeminjamanQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}
