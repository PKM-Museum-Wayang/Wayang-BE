<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


## Project setup

Install dependencies:

```bash
npm install
```
## Environment Setup

```bash
cp .env.example .env
```

Generate Prisma:

```bash
npx prisma generate
```

Run migration:

```bash
npx prisma migrate dev
```

Seed database:

```bash
npx prisma db seed
```
Run application:

```bash
npm run start:dev
```


## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
# Authentication API

## Login

### Endpoint

```http
POST /auth/login
```

### Request

```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Success Response (200)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "token": "<JWT_TOKEN>",
    "admin": {
      "id": 1,
      "username": "admin"
    }
  }
}
```

### Error Response (401)

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid username or password."
}
```

atau

```json
{
  "success": false,
  "statusCode": 401,
  "message": "User not found."
}
```
# Wayang API

---

## Get All Wayang

```http
GET /wayang
```

### Request

**Query Parameters (Optional)**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| page | Number | Page number | `page=1` |
| limit | Number | Number of data per page | `limit=10` |
| search | String | Search by wayang name | `search=Arjuna` |
| golonganId | Number | Filter by golongan | `golonganId=1` |
| penyimpananId | Number | Filter by penyimpanan | `penyimpananId=2` |
| sortBy | String | Sort field | `sortBy=nama` |
| order | String | Sort order (`asc` / `desc`) | `order=asc` |

Example:

```http
GET /wayang?page=1&limit=10&search=Arjuna&golonganId=1&penyimpananId=2&sortBy=nama&order=asc
```

### Response

```json
{
  "data": [
    {
      "id": 1,
      "noWayang": "01-KI-1-1",
      "nama": "Arjuna",
      "golonganId": 1,
      "penyimpananId": 1,
      "media": [
        {
          "id": 1
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

---

## Get Detail Wayang

```http
GET /wayang/:id
```

### Request

Path Parameter

| Parameter | Type |
|----------|------|
| id | Number |

Example

```http
GET /wayang/1
```

### Response

```json
{
  "id": 1,
  "noWayang": "01-KI-1-1",
  "nama": "Arjuna",
  "daerah": "Yogyakarta",
  "deskripsi": "Wayang Kulit",
  "cerita": "Mahabharata",
  "kondisi": "Baik",
  "golonganId": 1,
  "penyimpananId": 1,
  "media": [],
  "golongan": {},
  "penyimpanan": {}
}
```

---

## Create Wayang 

```http
POST /wayang
```

### Authorization

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request

**Content-Type**

```
application/json
```

```json
{
  "nama": "Arjuna",
  "daerah": "Yogyakarta",
  "deskripsi": "Wayang Kulit",
  "cerita": "Mahabharata",
  "kondisi": "Baik",
  "golonganId": 1,
  "penyimpananId": 1
}
```

### Response

```json
{
  "id": 1,
  "noWayang": "01-KI-1-1",
  "nama": "Arjuna",
  "daerah": "Yogyakarta",
  "deskripsi": "Wayang Kulit",
  "cerita": "Mahabharata",
  "kondisi": "Baik",
  "golongan": {},
  "penyimpanan": {},
  "media": []
}
```

---

## Update Wayang 

```http
PATCH /wayang/:id
```

### Authorization

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request

Path Parameter

| Parameter | Type |
|----------|------|
| id | Number |

**Content-Type**

```
application/json
```

```json
{
  "nama": "Arjuna",
  "daerah": "Yogyakarta",
  "deskripsi": "Wayang Kulit",
  "cerita": "Mahabharata",
  "kondisi": "Baik",
  "golonganId": 1,
  "penyimpananId": 1
}
```

### Response

```json
{
  "id": 1,
  "noWayang": "01-KI-1-1",
  "nama": "Arjuna",
  "daerah": "Yogyakarta",
  "deskripsi": "Wayang Kulit",
  "cerita": "Mahabharata",
  "kondisi": "Baik",
  "golongan": {},
  "penyimpanan": {},
  "media": []
}
```

---

## Delete Wayang 

```http
DELETE /wayang/:id
```

### Authorization

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request

Path Parameter

| Parameter | Type |
|----------|------|
| id | Number |

### Response

```http
204 No Content
```

---

## Add Media 

```http
POST /wayang/:id/media
```

### Authorization

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request

**Content-Type**

```
multipart/form-data
```

| Field | Type | Required |
|------|------|----------|
| file | File | Yes |
| namaFile | Text | Yes |
| jenis | Text | Yes |
| keterangan | Text | No |

### Response

```json
{
  "id": 1,
  "namaFile": "Arjuna Depan",
  "jenis": "IMAGE",
  "keterangan": "Tampak Depan",
  "fileUrl": "/storage/1785691347022.jpeg",
  "wayangId": 1
}
```

---

## Update Media 

```http
PATCH /wayang/media/:mediaId
```

### Authorization

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request

Path Parameter

| Parameter | Type |
|----------|------|
| mediaId | Number |

**Content-Type**

```
multipart/form-data
```

| Field | Type | Required |
|------|------|----------|
| file | File | Optional |
| namaFile | Text | Yes |
| jenis | Text | Yes |
| keterangan | Text | No |

### Response

```json
{
  "id": 1,
  "namaFile": "Arjuna Depan Baru",
  "jenis": "IMAGE",
  "keterangan": "Update",
  "fileUrl": "/storage/1785699999999.jpeg",
  "wayangId": 1
}
```

---

## Delete Media

```http
DELETE /wayang/media/:mediaId
```

### Authorization

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request

Path Parameter

| Parameter | Type |
|----------|------|
| mediaId | Number |

### Response

```http
204 No Content
```

---

## Get Media

```http
GET /wayang/media/:mediaId
```

### Request

Path Parameter

| Parameter | Type |
|----------|------|
| mediaId | Number |

### Response

```json
{
  "id": 1,
  "namaFile": "Arjuna Depan",
  "jenis": "IMAGE",
  "keterangan": "Tampak Depan",
  "fileUrl": "/storage/1785691347022.jpeg",
  "wayangId": 1
}
```

---

## Get Golongan

```http
GET /wayang/golongan/:golonganId
```

### Request

Path Parameter

| Parameter | Type |
|----------|------|
| golonganId | Number |

### Response

```json
{
  "id": 1,
  "namaGolongan": "Simpingan Kiri",
  "tipeGolongan": "SIMPINGAN_KIRI"
}
```

# Penyimpanan API

---

## Get All Storage

```http
GET /penyimpanan
```

### Request

Tidak memerlukan parameter.

### Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Storage retrieved successfully.",
  "data": [
    {
      "id": 1,
      "namaKotak": "Kotak 1",
      "wayang": []
    },
    {
      "id": 2,
      "namaKotak": "Kotak 2",
      "wayang": []
    }
  ]
}
```

---

## Get Storage Detail

```http
GET /penyimpanan/:id
```

### Request

| Parameter | Type |
|----------|------|
| id | Number |

Example

```http
GET /penyimpanan/1
```

### Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Storage retrieved successfully.",
  "data": {
    "id": 1,
    "namaKotak": "Kotak 1",
    "wayang": []
  }
}
```

---

## Create Storage

```http
POST /penyimpanan
```

### Request

**Content-Type**

```
application/json
```

```json
{
  "namaKotak": "Kotak 1"
}
```

### Response

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Storage created successfully.",
  "data": {
    "id": 1,
    "namaKotak": "Kotak 1"
  }
}
```

---

## Update Storage

```http
PATCH /penyimpanan/:id
```

### Request

| Parameter | Type |
|----------|------|
| id | Number |

**Content-Type**

```
application/json
```

```json
{
  "namaKotak": "Kotak Baru"
}
```

### Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Storage updated successfully.",
  "data": {
    "id": 1,
    "namaKotak": "Kotak Baru"
  }
}
```

---

## Delete Storage

```http
DELETE /penyimpanan/:id
```

### Request

| Parameter | Type |
|----------|------|
| id | Number |

Example

```http
DELETE /penyimpanan/1
```

### Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Storage deleted successfully."
}
```

---

## Error Response

### Storage Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Storage not found."
}
```

### Database Error

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Database error."
}
```

### Internal Server Error

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error."
}
```

---

# Golongan API

---

## Get All Golongan

```http
GET /golongan
```

### Request

Tidak memerlukan parameter.

### Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Golongan retrieved successfully.",
  "data": [
    {
      "id": 1,
      "namaGolongan": "Simpingan Kiri",
      "tipeGolongan": "SIMPINGAN_KIRI"
    },
    {
      "id": 2,
      "namaGolongan": "Simpingan Kanan",
      "tipeGolongan": "SIMPINGAN_KANAN"
    },
    {
      "id": 3,
      "namaGolongan": "Dudhahan",
      "tipeGolongan": "DUDHAHAN"
    }
  ]
}
```

---

## Error Response

### Database Error

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Database error."
}
```

### Internal Server Error

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error."
}
```
# Peminjaman API

---

## Create peminjaman

```http
POST /peminjaman
```

### Authorization

```http
Authorization: Bearer <JWT_TOKEN>
```

### Request

**Content-Type**

```
application/json
```

```json
{
  "namaPeminjam": "Budi Santoso",
  "alamat": "Jl. Malioboro No. 10, Yogyakarta",
  "noHp": "081234567890",
  "wayangIds": [1, 2, 3],
  "tanggalPinjam": "2026-08-04",
  "tanggalKembali": "2026-08-11",
  "keterangan": "Peminjaman untuk pameran."
}
```

### Response

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Loan created.",
  "data": {
    "id": 1,
    "namaPeminjam": "Budi Santoso",
    "alamat": "Jl. Malioboro No. 10, Yogyakarta",
    "noHp": "081234567890",
    "tanggalPinjam": "2026-08-04T00:00:00.000Z",
    "tanggalKembali": "2026-08-11T00:00:00.000Z",
    "keterangan": "Peminjaman untuk pameran.",
    "wayang": [
      {
        "id": 1,
        "nama": "Arjuna"
      },
      {
        "id": 2,
        "nama": "Werkudara"
      },
      {
        "id": 3,
        "nama": "Nakula"
      }
    ]
  }
}
```

---

## Error Response

### Invalid Date

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid dates."
}
```

### Wayang Unavailable

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Wayang unavailable."
}
```

### Wayang Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Wayang not found."
}
```

### Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Internal Server Error

```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error."
}
```
