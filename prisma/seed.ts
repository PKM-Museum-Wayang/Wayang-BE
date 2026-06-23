import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { DatabaseService } from '../src/database/database.service';

const config = new ConfigService();
const db = new DatabaseService(config);

async function main() {
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

  const golongan = [
    // SIMPINGAN KIRI
    { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Raton' },
    { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Raja Sabrang' },
    { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Gagahan' },
    { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Katongan' },
    { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Sabrang Alus' },
    { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Lanyapan' },
    { tipeGolongan: 'SIMPINGAN_KIRI', namaGolongan: 'Ringgit Putran' },

    // SIMPINGAN KANAN
    { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Raton' },
    { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Gagahan' },
    { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Alus' },
    {
      tipeGolongan: 'SIMPINGAN_KANAN',
      namaGolongan: 'Ringgit Bambang Bokongan',
    },
    {
      tipeGolongan: 'SIMPINGAN_KANAN',
      namaGolongan: 'Ringgit Bambang Jangkah',
    },
    { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Putren' },
    { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Bayen' },
    { tipeGolongan: 'SIMPINGAN_KANAN', namaGolongan: 'Ringgit Kayon' },

    // DUDHAHAN
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Kurawa' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Patih' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Bapangan' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Bala Sabrang' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Prepat' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Keparak' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Berkasan' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Setanan' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Wanara' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Kiskenda' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Jenawa Lekapala' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Jenawa Pringgodani' },
    { tipeGolongan: 'DUDHAHAN', namaGolongan: 'Ringgit Kewanan' },
  ];

  for (const item of golongan) {
    await db.golongan.upsert({
      where: {
        tipeGolongan_namaGolongan: {
          tipeGolongan: item.tipeGolongan,
          namaGolongan: item.namaGolongan,
        },
      },
      update: {},
      create: item,
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
