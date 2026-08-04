export class WayangQueryDto {
  search?: string;
  golonganId?: number;
  penyimpananId?: number;

  page?: number;
  limit?: number;

  sortBy?: string;
  order?: 'asc' | 'desc';
}
