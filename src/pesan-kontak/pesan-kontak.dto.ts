import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export const jenisTopikSchema = z.enum([
  'KUNJUNGAN',
  'PENELITIAN',
  'KERJA_SAMA',
  'DONASI_KOLEKSI',
  'LAINNYA',
]);

export const createPesanKontakSchema = z.object({
  namaLengkap: z.string().trim().min(1).max(255),
  asal: z.string().trim().min(1).max(255),
  email: z.string().trim().email().max(255),
  noTelp: z.string().trim().regex(/^\+?[0-9]{8,15}$/, {
    message: 'Nomor telepon harus berisi 8–15 digit, boleh diawali +.',
  }),
  jenisTopik: jenisTopikSchema,
  pesan: z.string().trim().min(1).max(10000),
}).strict();

export const updatePesanKontakSchema = createPesanKontakSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Minimal satu field harus diubah.' },
);

const positiveInteger = z.string().regex(/^[1-9]\d*$/).transform(Number)
  .refine(Number.isSafeInteger, { message: 'Angka terlalu besar.' });

export const queryPesanKontakSchema = z.object({
  page: positiveInteger.refine((value) => value <= 21474836, {
    message: 'Halaman terlalu besar.',
  }).optional().default(1),
  limit: positiveInteger.refine((value) => value <= 100, {
    message: 'Limit maksimal 100.',
  }).optional().default(10),
  jenisTopik: jenisTopikSchema.optional(),
}).strict();

export function parsePesanKontak<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new BadRequestException({
      success: false,
      statusCode: 400,
      message: 'Data pesan kontak tidak valid.',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }
  return result.data;
}
