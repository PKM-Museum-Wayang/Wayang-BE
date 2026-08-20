export class WayangQueryDto {
  page?: number;
  limit?: number;

  search?: string;

  golonganId?: number;

  tipeGolongan?: string;

  penyimpananId?: number;

  sortBy?: string;

  order?: 'asc' | 'desc';
}
