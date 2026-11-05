# Pino Portal Backend

Backend API berbasis Go untuk autentikasi JWT, kontrol akses berbasis role (RBAC), dan manajemen user. Aplikasi menggunakan MySQL sebagai database dan Chi sebagai HTTP router.

## Tech Stack

- Go 1.26.5
- Chi v5 untuk routing dan middleware HTTP
- MySQL melalui `go-sql-driver/mysql`
- JWT v5 untuk autentikasi
- Bcrypt melalui `golang.org/x/crypto`
- Wire untuk dependency injection
- `godotenv` untuk membaca file `.env`

## Struktur Proyek

```text
backend/
├── app/
│   ├── database.go       # Koneksi dan konfigurasi MySQL
│   └── server.go         # Router, middleware, dan route HTTP
├── cmd/api/
│   ├── main.go            # Entry point aplikasi
│   ├── injector.go        # Definisi dependency injection Wire
│   └── wire_gen.go        # Kode hasil generate Wire
├── config/config.go       # Pembacaan environment variable
├── db/migrations/         # Direktori migration database
├── internal/
│   ├── delivery/http/     # Controller dan middleware HTTP
│   ├── domain/            # Model domain dan request/response
│   ├── repository/        # Akses data dan query database
│   ├── service/           # Logika bisnis
│   └── utils/             # JWT, error handler, dan utilitas transaksi
├── go.mod
└── go.sum
```

Alur request mengikuti pola `delivery -> service -> repository`. Dependency aplikasi dirakit melalui Wire pada `cmd/api`.

## Instalasi dan Menjalankan

Semua perintah berikut dijalankan dari direktori `backend`:

```bash
cd backend
go mod download
```

### Database

Pastikan MySQL aktif, lalu buat database yang digunakan aplikasi:

```sql
CREATE DATABASE pino_db;
```

Direktori `db/migrations` belum berisi migration. Jika tabel belum dibuat, siapkan schema database secara manual sebelum menjalankan server.

### Environment Variable

Buat file `backend/.env`:

```env
PORT=8080
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASS=your_password
DB_NAME=pino_db
JWT_SECRET=your_super_secret_jwt_key
```

Nilai default yang digunakan aplikasi adalah `PORT=8080`, `DB_HOST=127.0.0.1`, `DB_PORT=3307`, `DB_USER=root`, `DB_PASS=` dan `DB_NAME=pino_db`. File `.env` bersifat opsional jika environment variable sudah tersedia di sistem.

### Menjalankan Server

```bash
go run ./cmd/api
```

Server tersedia di `http://localhost:8080` atau port yang ditentukan oleh `PORT`.

### Test dan Generate Wire

```bash
go test ./...
go generate ./cmd/api
```

Perintah generate Wire membutuhkan CLI Wire. Instal jika belum tersedia:

```bash
go install github.com/google/wire/cmd/wire@latest
```

## Endpoint API

### Public

| Method | Endpoint                | Deskripsi                 |
| ------ | ----------------------- | ------------------------- |
| `POST` | `/api/v1/auth/register` | Mendaftarkan user baru    |
| `POST` | `/api/v1/auth/login`    | Login dan mendapatkan JWT |

Contoh register:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
	-H 'Content-Type: application/json' \
	-d '{"username":"admin","password":"password123","role":"admin"}'
```

Contoh login:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"username":"admin","password":"password123"}'
```

Response login berisi `token` dan `role`:

```json
{
  "token": "<jwt-token>",
  "role": "admin"
}
```

### Admin Only

Semua endpoint berikut membutuhkan header `Authorization: Bearer <jwt-token>` dan role `admin`.

| Method   | Endpoint                  | Deskripsi                       |
| -------- | ------------------------- | ------------------------------- |
| `GET`    | `/api/v1/users/`          | Mengambil semua user            |
| `POST`   | `/api/v1/users/`          | Membuat user                    |
| `GET`    | `/api/v1/users/{id}`      | Mengambil user berdasarkan ID   |
| `PUT`    | `/api/v1/users/{id}`      | Memperbarui user                |
| `DELETE` | `/api/v1/users/{id}`      | Menghapus user                  |
| `GET`    | `/api/v1/admin/dashboard` | Mengambil pesan dashboard admin |

Contoh request endpoint yang dilindungi:

```bash
curl http://localhost:8080/api/v1/users/ \
	-H 'Authorization: Bearer <jwt-token>'
```

Role yang didukung user adalah `admin`, `karyawan`, dan `user`. Password tidak dikembalikan pada response API.

## Autentikasi dan Keamanan

- Password disimpan dalam bentuk hash Bcrypt.
- JWT dikirim melalui header `Authorization` dengan format `Bearer <token>`.
- Request tanpa token atau dengan token tidak valid menghasilkan `401 Unauthorized`.
- User dengan role selain `admin` menghasilkan `403 Forbidden` untuk route admin.
- CORS dikonfigurasi untuk menerima request dari semua origin.

Endpoint dashboard umum dan WebSocket belum terdaftar pada router saat ini.
