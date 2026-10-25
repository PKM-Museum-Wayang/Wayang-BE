# Watermark foto wayang

## Persiapan

```bash
npm install
npm run build
npm test -- --runInBand storage.spec wayang-watermark
```

`npm install` memasang `sharp` dan menyinkronkan package-lock.json. Di deployment, sertakan `public/logo.png` dan folder `storage` di root proyek bersama package.json. Path upload, logo, preview, dan static file memakai resolver root yang sama, baik di src maupun dist. Fitur ini tidak memerlukan migration database baru.

## Perilaku

- Berlaku di `POST /wayang/:id/media` dan `PATCH /wayang/media/:mediaId`.
- Logo dari `public/logo.png`, tulisan **Wayang Sutarwin** tepat di bawahnya.
- Opacity 28%, posisi kanan bawah dengan margin kanan 2,5% dari sisi terpendek foto dan jarak bawah minimal 8% dari tinggi foto (dibatasi agar tetap muat). Logo dan tulisan diposisikan sebagai satu kesatuan. Ukuran menyesuaikan foto, maksimal seperempat tinggi foto.
- Upload ditahan di memory sampai proses watermark selesai. Foto tanpa watermark tidak diterbitkan di storage.
- Hasil foto adalah WebP kualitas 92, dengan orientasi EXIF diterapkan. Gunakan `fileUrl` respons, bukan ekstensi file upload.
- `jenis` ditentukan dari hasil pemrosesan; nilai dari klien tidak dapat melewati watermark.
- Maksimal file 50 MiB dan foto 40 megapiksel. Foto rusak, animasi, dan gambar multi-halaman ditolak, bukan disimpan tanpa watermark.
- Video MP4/MOV, WebM, dan AVI tetap didukung tanpa watermark (fitur ini khusus foto).
- Saat mengganti foto, file lama dipertahankan sampai pemrosesan dan update database berhasil. File baru dibersihkan bila operasi database gagal.
- Foto lama di storage tidak diubah secara massal.

## Test Postman

Login terlebih dahulu melalui `POST /auth/login` agar cookie `access_token` tersimpan.

Upload `POST http://localhost:3000/wayang/1/media`, **Body → form-data**:

| Key | Type | Value |
| --- | --- | --- |
| namaFile | Text | Foto wayang |
| jenis | Text | IMAGE |
| keterangan | Text | Uji watermark |
| file | File | Pilih foto JPG/PNG/WebP |

Jangan mengisi header Content-Type secara manual: Postman menentukan multipart boundary.

Buka `http://localhost:3000` ditambah `data.fileUrl` dari respons untuk memeriksa watermark. Untuk mengganti foto, kirim form-data yang sama ke `PATCH /wayang/media/ID_MEDIA`. Sesuaikan port dengan konfigurasi aplikasi.

## Langsung tampilkan contoh di browser/Postman

Setelah backend direstart, buka:

```text
GET http://localhost:3000/storage/preview
```

Endpoint ini otomatis memilih satu foto statis yang sudah ada di storage, membuat salinan `storage/watermark-preview.webp`, dan langsung mengirim gambar ber-watermark (`Content-Type: image/webp`). Tidak perlu menjalankan script atau memasukkan nama foto. Request bersamaan dalam satu proses digabung agar tidak memproses preview berkali-kali. Gunakan URL ini untuk membuat ulang preview setelah mengganti logo; respons tidak di-cache.

`/storage` dan `/storage/` diarahkan ke `/storage/preview`, bukan ke `index.html`. `/storage/watermark-preview.webp` juga membuat preview otomatis bila file belum tersedia. Jika storage belum berisi foto yang valid, respons 404 menjelaskan agar Anda mengupload foto terlebih dahulu.

## Alternatif: membuat tepat satu contoh lewat CLI

```bash
npm run watermark:preview
```

Script memilih satu gambar statis yang dapat dibaca dari `storage`, menambahkan watermark menggunakan fungsi yang sama dengan upload, lalu menyimpan salinan:

```text
storage/watermark-preview.webp
```

Gambar asli dan record database tidak diubah. Untuk menentukan sumber:

```bash
npm run watermark:preview -- storage/nama-foto.jpg
```

Saat backend berjalan, buka:

```text
http://localhost:3000/storage/watermark-preview.webp
```

Script/endpoint dapat menimpa file preview pada pemanggilan berikutnya, tetapi tidak pernah menimpa sumbernya. Preview tidak terdaftar sebagai media di database.

## Troubleshooting

- `ENOENT ... storage/index.html`: konfigurasi fallback SPA lama. Static serving kini hanya dipasang sekali di `main.ts` melalui `configureStorage`, dengan `index: false` dan `fallthrough: true`. Hentikan server lama, build/restart backend; jangan menjalankan build dist lama.
- `Cannot find module sharp`: jalankan `npm install`, lalu restart backend.
- Foto lama belum memiliki watermark: memasang sharp tidak memodifikasi file lama. Buka `/storage/preview` untuk contoh salinan, atau upload ulang foto melalui endpoint media.
- File gambar lain tidak ditemukan: gunakan URL persis dari `data.fileUrl` respons upload, termasuk nama file dan ekstensi `.webp`. File yang tidak ada mendapat 404 biasa, bukan fallback index.html.
- Watermark gagal: pastikan `public/logo.png` benar-benar tersedia dan valid pada deployment. Detail penyebab dicatat di log server; foto tidak diterbitkan tanpa watermark.
