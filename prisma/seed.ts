import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { DatabaseService } from '../src/database/database.service';
import {
  GOLONGAN_ORDER,
  LEGACY_GOLONGAN_NAMES,
} from '../src/golongan/golongan-order';

const config = new ConfigService();
const db = new DatabaseService(config);

async function main() {
  // Admin
  await db.admin.upsert({
    where: {
      username: 'admin',
    },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
    },
  });

  // Order eksplisit: hasil tetap sama meskipun urutan insert berubah.
  for (const item of GOLONGAN_ORDER) {
    await db.$transaction(async (tx) => {
      const where = {
        namaGolongan_tipeGolongan: {
          namaGolongan: item.namaGolongan,
          tipeGolongan: item.tipeGolongan,
        },
      };
      const legacyName = Object.entries(LEGACY_GOLONGAN_NAMES).find(
        ([, canonical]) => canonical === item.namaGolongan,
      )?.[0];
      const legacy = legacyName
        ? await tx.golongan.findUnique({
            where: {
              namaGolongan_tipeGolongan: {
                namaGolongan: legacyName,
                tipeGolongan: item.tipeGolongan,
              },
            },
          })
        : null;
      const existing = await tx.golongan.findUnique({ where });

      // Pertahankan ID lama jika nama baku belum ada.
      if (legacy && !existing) {
        await tx.golongan.update({ where: { id: legacy.id }, data: item });
        return;
      }

      const golongan = await tx.golongan.upsert({
        where,
        update: { order: item.order },
        create: item,
      });

      // Jika keduanya sudah ada, gabungkan tanpa menghapus wayang terkait.
      if (legacy) {
        await tx.wayang.updateMany({
          where: { golonganId: legacy.id },
          data: { golonganId: golongan.id },
        });
        await tx.golongan.delete({ where: { id: legacy.id } });
      }
    });
  }

  console.log('Seeder berhasil dijalankan');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });