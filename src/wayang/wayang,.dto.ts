export class WayangDto {
  nama!: string;
  daerah?: string;
  deskripsi?: string;
  cerita?: string;
  kondisi?: string;
  gaya!: 'PY' | 'PS' | 'PK';
  golonganId!: number;
  penyimpananId!: number;

  urutan?: number;
}
