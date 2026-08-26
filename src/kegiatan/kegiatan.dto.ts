export class CreateKegiatanDto {
  nama?: string;
  deskripsi?: string;
  tanggal?: string;
  lokasi?: string;
  imageUrl?: string;
  adminId?: number;
}

export class UpdateKegiatanDto {
  nama?: string;
  deskripsi?: string;
  tanggal?: string;
  lokasi?: string;
  imageUrl?: string;
  adminId?: number;
}

export class KegiatanQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  adminId?: number;
}
