import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';

export const hariSchema = z.enum([
  'SENIN',
  'SELASA',
  'RABU',
  'KAMIS',
  'JUMAT',
  'SABTU',
  'MINGGU',
]);

const jamSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
  message: 'Jam harus menggunakan format HH:mm (00:00–23:59).',
});

const socialUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (value) => {
      if (value === '') return true;
      try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) && !!url.hostname;
      } catch {
        return false;
      }
    },
    { message: 'URL harus menggunakan http:// atau https://.' },
  )
  .transform((value) => value || null)
  .nullable()
  .optional();

export const createBiografiSchema = z
  .object({
    namaPemilikKoleksi: z.string().trim().min(1).max(255),
    email: z.string().trim().email().max(255),
    phoneNumber: z.string().trim().regex(/^\+?[0-9]{8,15}$/, {
      message: 'Nomor telepon harus berisi 8–15 digit, boleh diawali +.',
    }),
    alamat: z.string().trim().min(1).max(10000),
    hariMulai: hariSchema,
    hariSelesai: hariSchema,
    jamBuka: jamSchema,
    jamTutup: jamSchema,
    instagram: socialUrlSchema,
    facebook: socialUrlSchema,
    youtube: socialUrlSchema,
  })
  .strict();

export const updateBiografiSchema = createBiografiSchema.partial();
export type CreateBiografiDto = z.infer<typeof createBiografiSchema>;
export type UpdateBiografiDto = z.infer<typeof updateBiografiSchema>;

export function parseBiografi<T extends z.ZodType>(schema: T, body: unknown): z.output<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new BadRequestException({
      success: false,
      statusCode: 400,
      message: 'Data biografi tidak valid.',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }
  return result.data;
}

export function validateJamBuka(jamBuka: string, jamTutup: string) {
  if (jamBuka >= jamTutup) {
    throw new BadRequestException('jamTutup harus lebih besar dari jamBuka.');
  }
}
