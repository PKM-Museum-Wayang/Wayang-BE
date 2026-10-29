# API Biografi Owner (Singleton)

Sistem hanya memiliki **satu owner dan satu biografi**, bukan daftar biografi.
Frontend cukup menampilkan satu profil dan satu form pengaturan.

## Endpoint

| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| GET | `/biografi` | Publik | Ambil satu objek biografi |
| POST | `/biografi` | Admin | Pengisian awal; ditolak dengan 409 jika sudah ada |
| PATCH | `/biografi` | Admin | Perbarui sebagian data/foto profil yang sama |
| DELETE | `/biografi` | Admin | Hapus profil beserta foto |

Endpoint `GET/PATCH/DELETE /biografi/:id` tidak lagi digunakan.
ID internal selalu `1`; jangan kirim ID dalam body.
GET/PATCH/DELETE mengembalikan 404 jika profil belum diisi.
Setelah penghapusan, POST dapat digunakan untuk mengisi ulang profil.

## Autentikasi

Login melalui `POST /auth/login` dengan JSON `{ "username": "...", "password": "..." }`.
Backend memakai cookie HttpOnly `access_token`, bukan token dari body respons.
Gunakan `credentials: 'include'` pada login dan seluruh request admin.
Origin frontend harus terdaftar di `FRONTEND_URL`. Base URL lokal: `http://localhost:3000`.

## Field dan validasi

POST menggunakan `multipart/form-data`: semua field wajib dan foto harus diisi.
PATCH menerima JSON tanpa foto atau multipart jika mengunggah foto.
Jangan mengatur header Content-Type secara manual untuk FormData.

| Field | Wajib POST | Aturan |
| --- | --- | --- |
| fotoProfil | Ya | File JPEG/PNG/WebP, maksimal 5 MiB |
| namaPemilikKoleksi | Ya | String 1–255 karakter setelah trim |
| email | Ya | Email valid, maksimal 255 karakter |
| phoneNumber | Ya | String 8–15 digit, opsional diawali `+` |
| alamat | Ya | String 1–10000 karakter |
| hariMulai | Ya | SENIN, SELASA, RABU, KAMIS, JUMAT, SABTU, MINGGU |
| hariSelesai | Ya | Enum hari yang sama, inklusif |
| jamBuka | Ya | Format HH:mm, 00:00–23:59 |
| jamTutup | Ya | HH:mm, harus sesudah jamBuka |
| instagram | Tidak | URL http/https, maksimal 2048 karakter atau null |
| facebook | Tidak | Aturan sama dengan instagram |
| youtube | Tidak | Aturan sama dengan instagram |

- Nama field case-sensitive; gunakan `phoneNumber`, bukan `noWa`/`phonenumber`.
- Field tidak dikenal, termasuk `id`, `createdAt`, `updatedAt`, ditolak.
- PATCH harus berisi minimal satu field atau foto. Field yang tidak dikirim tetap tersimpan.
- URL sosial kosong atau JSON null menghapus tautan. Pada multipart gunakan string kosong, bukan string `"null"`.
- Rentang hari boleh melewati akhir minggu; hari mulai dan selesai sama berarti satu hari.
- Jadwal lintas tengah malam tidak didukung. Perubahan satu jam divalidasi terhadap jam lain yang tersimpan.
- Foto tidak dapat dihapus sendiri; unggah foto pengganti.

## Respons

GET/PATCH: HTTP 200. POST: HTTP 201. `data` selalu **satu objek, bukan array**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Biografi retrieved successfully.",
  "data": {
    "id": 1,
    "fotoProfil": "/storage/biografi-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.webp",
    "namaPemilikKoleksi": "Budi Santoso",
    "email": "budi@example.com",
    "phoneNumber": "081234567890",
    "alamat": "Yogyakarta",
    "hariMulai": "SENIN",
    "hariSelesai": "SABTU",
    "jamBuka": "08:00",
    "jamTutup": "17:00",
    "instagram": null,
    "facebook": null,
    "youtube": null,
    "createdAt": "2026-08-20T00:00:00.000Z",
    "updatedAt": "2026-08-20T00:00:00.000Z"
  }
}
```

POST memakai pesan `Biografi created successfully.`, PATCH `Biografi updated successfully.`.
DELETE: HTTP 200 dengan `success`, `statusCode`, dan pesan `Biografi deleted successfully.`, tanpa `data`.

## Alur frontend

1. Panggil `GET /biografi`, gunakan `result.data` langsung; jangan mengambil `[0]`.
2. Jika 404, tampilkan keadaan belum diisi; admin dapat mengisi melalui POST.
3. Jika sudah ada, tampilkan form edit dan simpan melalui PATCH, bukan POST.
4. Jika POST mendapat 409, muat ulang profil dan beralih ke form edit.
5. Setelah PATCH sukses, gunakan objek respons terbaru untuk memperbarui state.

```ts
const API_BASE_URL = 'http://localhost:3000';

// Ambil profil tunggal.
const response = await fetch(`${API_BASE_URL}/biografi`);
if (response.status === 404) {
  // Profil belum diisi; tampilkan empty state.
} else if (response.ok) {
  const { data: biografi } = await response.json();
  const imageUrl = new URL(biografi.fotoProfil, API_BASE_URL).href;
  console.log(biografi, imageUrl);
}

// Perbarui profil yang sama tanpa ID.
await fetch(`${API_BASE_URL}/biografi`, {
  method: 'PATCH',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phoneNumber: '+6281234567890' }),
});

// Ganti foto: Content-Type/boundary diatur browser.
const form = new FormData();
form.append('fotoProfil', file);
await fetch(`${API_BASE_URL}/biografi`, {
  method: 'PATCH',
  credentials: 'include',
  body: form,
});
```

Foto diperiksa dari isi, disesuaikan orientasinya, dikecilkan hingga maksimal 1200×1200 tanpa memperbesar, lalu disimpan sebagai WebP. URL `/storage/...` bersifat publik. Foto lama dibersihkan setelah mutasi berhasil; foto baru dibersihkan jika database gagal. Batas input gambar 25 juta piksel.

## Error

| HTTP | Penyebab |
| --- | --- |
| 400 | Validasi field/foto/jam, PATCH kosong |
| 401 | Cookie admin tidak valid/tidak terkirim |
| 404 | Biografi belum ada |
| 409 | POST saat biografi sudah ada, termasuk request bersamaan |
| 413 | Upload melebihi 5 MiB |
| 500 | Kegagalan database/storage/internal |

Validasi schema mengembalikan `{ success: false, statusCode: 400, message: "Data biografi tidak valid.", errors: [{ field, message }] }`.
Exception lain memakai format NestJS `{ statusCode, message, error }`; jangan mengasumsikan semua error memiliki `errors` atau `success`.

## Migrasi

Lihat [docs/biografi-api.md](docs/biografi-api.md). Jika sebelumnya ada banyak profil, migrasi mempertahankan profil dengan ID terbesar sebagai profil tunggal dan mencadangkan seluruh baris lama sebelum normalisasi.
