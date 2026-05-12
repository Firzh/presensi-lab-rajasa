# Environment and Docker Contract

## 1. Purpose

Kontrak ini mengatur environment variable, service Docker, port, dan Nginx agar runtime tidak ambigu.

## 2. Required Root Environment Variables

`.env` root untuk Docker Compose minimal:

```dotenv
UID=1000
GID=1000
DB_NAME=sistem_absensi_lab_qr
DB_PASSWORD=secret
FRONTEND_PORT=5173
```

## 3. Frontend Environment

Frontend hanya memakai:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/api
```

Nama berikut tidak boleh dipakai lagi:

```text
VITE_API_URL
```

Kecuali ada RFC dan migrasi seluruh kode.

## 4. Backend Environment

Backend minimal:

```dotenv
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=sistem_absensi_lab_qr
DB_USERNAME=root
DB_PASSWORD=secret
SESSION_NAME=presensi_lab_session
```

## 5. Docker Services

Service yang dikunci:

```text
db
backend
frontend
nginx
```

## 6. Nginx Contract

Nginx harus melayani:

- `/api/*` ke backend PHP front controller;
- frontend route ke Vite dev server dalam development;
- file sensitif seperti `.env` dan `.git` harus ditolak.

## 7. Backend Root Contract

Backend root target:

```text
/var/www/public
```

Maka backend wajib memiliki:

```text
backend/public/index.php
```

Jika `public/index.php` belum ada, Nginx contract belum terpenuhi.

## 8. Production Note

Dalam production, frontend sebaiknya dibuild menjadi static asset dan tidak memakai Vite dev server.

Development Compose boleh memakai Vite server. Production Compose harus dibahas terpisah.

## 9. Port Contract

| Service | Internal | External |
|---|---:|---:|
| frontend | 3000 atau 5173 sesuai Dockerfile | `${FRONTEND_PORT}` |
| backend | 9000 | tidak diekspos langsung |
| nginx | 80 | 8080 |
| db | 3306 | tidak wajib diekspos |

## 10. Env Change Rule

Setiap environment variable baru wajib:

- ditambahkan ke `.env.example`;
- ditambahkan ke dokumen ini;
- dijelaskan default value-nya;
- dijelaskan apakah secret atau non-secret.
