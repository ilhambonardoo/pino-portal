# 🤖 Pino Portal Backend

Backend API performa tinggi berbasis **Go (Golang)** untuk memfasilitasi otentikasi (JWT/RBAC), manajemen _dashboard_, serta komunikasi _real-time_ via WebSocket antara **Robot Pino** dan **Home Assistant (HASS)**.

---

## 🛠️ Tech Stack & Dependencies

- **Framework & Router:** [`go-chi/chi v5`](https://github.com/go-chi/chi)
- **Database Driver:** [`go-sql-driver/mysql`](https://github.com/go-sql-driver/mysql)
- **Real-Time Communication:** [`gorilla/websocket`](https://github.com/gorilla/websocket)
- **Authentication & Security:** [`golang-jwt/jwt v5`](https://github.com/golang-jwt/jwt) & [`golang.org/x/crypto`](https://golang.org/x/crypto) (Bcrypt)
- **CORS Middleware:** [`rs/cors`](https://github.com/rs/cors)

---

## 📁 Struktur Proyek

Proyek ini menerapkan arsitektur terpisah (_layered architecture_) untuk memastikan keterbacaan kode (_maintainability_) dan kemudahan pengujian (_testability_):

```text
pino-portal/
├── app/          # Inisialisasi Database MySQL & Setup Router
├── controller/   # REST Handlers (Auth, Dashboard) & Handler WS
│   ├── auth_controller.go
│   ├── dashboard_controller.go
│   └── websocket_controller.go  # Engine real-time Robot Pino & HASS
├── middleware/   # Middleware Otentikasi JWT & RBAC (Role-Based Access Control)
├── model/        # Struct Data Domain, Request, & Response DTO
├── repository/   # Akses & Query Database MySQL
├── service/      # Logika Bisnis Utama (Ruang Lingkup RBAC, Aturan Perangkat)
├── helper/       # Utility Error Handling & Format Standar JSON Response
├── main.go       # Entry Point Aplikasi Go
├── go.mod
└── go.sum

```

---

## 🚀 Panduan Instalasi & Memulai

### 1. Prasyarat

Pastikan Anda telah menginstal **Go** (versi 1.18+) dan **MySQL Server** di mesin lokal/server Anda.

### 2. Install Dependensi

Jalankan perintah berikut di terminal untuk mengunduh semua library yang dibutuhkan:

```bash
# Router HTTP & CORS
go get -u github.com/go-chi/chi/v5
go get -u github.com/rs/cors

# Engine WebSocket
go get -u github.com/gorilla/websocket

# Driver Database MySQL
go get -u github.com/go-sql-driver/mysql

# JWT & Hashing Password untuk Auth/RBAC
go get -u github.com/golang-jwt/jwt/v5
go get -u golang.org/x/crypto

# godotenv untuk konfigurasi file .env
go get -u github.com/joho/godotenv

# Install library wire ke dalam modul
go get github.com/google/wire

# Install CLI tool wire untuk generate kode
go install github.com/google/wire/cmd/wire@lates

# Install library validator
go get github.com/go-playground/validator/v10

```

Atau cukup jalankan perintah otomatis dari `go.mod`:

```bash
go mod tidy

```

### 3. Konfigurasi Lingkungan (.env)

Buat file `.env` di root direktori project untuk mengatur konfigurasi database dan rahasia JWT:

```env
PORT=8080
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pino_portal_db
JWT_SECRET=your_super_secret_jwt_key

```

### 4. Menjalankan Server

Jalankan perintah berikut untuk mengeksekusi entry point:

```bash
go run main.go

```

Server HTTP & WebSocket akan berjalan di `http://localhost:8080`.

---

## 📌 Endpoint API Utama

| Method | Endpoint                | Deskripsi                                         | Akses         |
| ------ | ----------------------- | ------------------------------------------------- | ------------- |
| `POST` | `/api/v1/auth/register` | Pendaftaran pengguna baru                         | Public        |
| `POST` | `/api/v1/auth/login`    | Otentikasi & Penerbitan JWT Token                 | Public        |
| `GET`  | `/api/v1/dashboard`     | Menampilkan metrik & status perangkat             | Authenticated |
| `GET`  | `/ws/pino-hass`         | Endpoint duplex WebSocket untuk Robot Pino & HASS | WS Upgrade    |

---

## 🔐 Keamanan & Otentikasi

- **JWT (JSON Web Token):** Setiap request terkunci memerlukan _header_ `Authorization: Bearer <token>`.
- **RBAC (Role-Based Access Control):** Pengaksesan fitur dibatasi berdasarkan peran (Role) pengguna melalui layer `middleware/`.
- **Password Security:** Seluruh password di-hash menggunakan algoritma Bcrypt dari `golang.org/x/crypto`.
