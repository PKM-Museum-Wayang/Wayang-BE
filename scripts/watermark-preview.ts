import 'dotenv/config';
import { createWatermarkPreview } from '../src/wayang/wayang-watermark-preview';

async function main() {
  const result = await createWatermarkPreview({ source: process.argv[2] });
  const port = process.env.PORT ?? '3000';
  console.log(`Sumber (tidak diubah): ${result.source}`);
  console.log(`Preview tersimpan: ${result.output}`);
  console.log(`Buka: http://localhost:${port}${result.fileUrl}`);
  console.log(`Atau buat ulang langsung: http://localhost:${port}/storage/preview`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
