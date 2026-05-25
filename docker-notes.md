# Docker Notes - Presensi Rajasa

Catatan untuk menjalankan project dengan Docker.

## Catatan Linux

Jika Docker belum bisa dijalankan tanpa `sudo`, gunakan `sudo` di depan setiap command.

Contoh:

```bash
sudo docker compose ps
```

Alternatif permanen adalah menambahkan user ke group Docker, tetapi setelah itu perlu logout/login ulang.

```bash
sudo usermod -aG docker $USER
```

## 1. Cek Docker Sudah Terpasang

```bash
docker --version
docker compose version
```

Expected: muncul versi Docker dan Docker Compose.

## 2. Masuk ke Folder Project

```bash
cd presensi-lab-rajasa
```

Cek file utama:

```bash
ls
```

Expected minimal ada:

```text
docker-compose.yml
backend/
frontend/
scripts/
```

## 3. Build dan Jalankan Semua Service

```bash
docker compose up -d --build
```

Arti command:

```text
up       = menjalankan container
-d       = mode background/detached
--build  = build ulang image jika ada perubahan Dockerfile/source
```

## 4. Cek Status Container

```bash
docker compose ps
```

Expected: service utama berstatus running/up.

Biasanya service:

```text
backend
frontend
nginx
db
```

## 5. Lihat Log Semua Service

```bash
docker compose logs -f
```

Keluar dari log:

```text
CTRL + C
```

## 6. Lihat Log Per Service

Database:

```bash
docker compose logs -f db
```

Backend:

```bash
docker compose logs -f backend
```

Frontend:

```bash
docker compose logs -f frontend
```

Nginx:

```bash
docker compose logs -f nginx
```

## 7. Install Dependency Backend

```bash
docker compose exec backend composer install
```

Jika autoload perlu disegarkan:

```bash
docker compose exec backend composer dump-autoload
```

## 8. Install Dependency Frontend

```bash
docker compose exec frontend npm install
```

## 9. Cek Backend Entry Point

```bash
docker compose exec backend ls -lah /var/www/public/index.php
```

Expected: file `index.php` ditemukan.

## 10. Jalankan Frontend Dev Server

```bash
docker compose exec frontend npm run dev -- --host
```

Alternatif:

```bash
docker compose exec frontend npm run dev
```

## 11. Test Nginx Config

```bash
docker compose exec nginx nginx -t
```

Expected:

```text
syntax is ok
test is successful
```

## 12. Reload Nginx

```bash
docker compose exec nginx nginx -s reload
```

Jika reload gagal, restart nginx:

```bash
docker compose restart nginx
```

## 13. Restart Semua Service

```bash
docker compose restart
```

## 14. Restart Per Service

Backend:

```bash
docker compose restart backend
```

Frontend:

```bash
docker compose restart frontend
```

Nginx:

```bash
docker compose restart nginx
```

Database:

```bash
docker compose restart db
```

## 15. Stop Semua Service

```bash
docker compose down
```

Jika ingin menjalankan lagi:

```bash
docker compose up -d
```

Jika ingin build ulang:

```bash
docker compose up -d --build
```

## 16. Test Akses HTTP

Cek nginx/backend:

```bash
curl -I http://localhost:8080
```

Cek frontend:

```bash
curl -I http://localhost:3000
```

Cek API health:

```bash
curl -i http://localhost:8080/api/health
```

Jika frontend memakai proxy API:

```bash
curl -i http://localhost:3000/api/health
```

## 17. Jalankan Test Backend

Full backend test:

```bash
./scripts/test-backend.sh
```

Unit test:

```bash
./scripts/test-backend-unit.sh
```

Feature test:

```bash
./scripts/test-backend-feature.sh
```

Filter test tertentu:

```bash
docker compose exec backend ./vendor/bin/phpunit --filter PresensiSessionTest
```

```bash
docker compose exec backend ./vendor/bin/phpunit --filter PresensiScanTest
```

## 18. Build Frontend

```bash
docker compose exec frontend npm run build
```

Expected: build selesai tanpa error.

## 19. Masuk ke Shell Container

Backend:

```bash
docker compose exec backend sh
```

Frontend:

```bash
docker compose exec frontend sh
```

Nginx:

```bash
docker compose exec nginx sh
```

Database:

```bash
docker compose exec db sh
```

Keluar dari shell container:

```bash
exit
```

## 20. Reset Database Demo

```bash
./scripts/db-reset-demo.sh
```

## Load Schema dan Seed Manual via Docker

Gunakan bagian ini jika ingin import database secara manual tanpa script reset.

### 1. Cek nama container database

```bash
docker compose ps
```

Pastikan service database bernama:

```text
db
```

### 2. Cek file schema dan seed

```bash
docker compose exec backend find database -maxdepth 3 -type f
```

Expected minimal:

```text
database/schema/prototype-db-3.9.sql
database/seeds/seed_permissions_mvp_presensi_qr.sql
database/seeds/seed_akun_demo_mvp_presensi_qr.sql
```

### 3. Masuk ke MySQL dari container db

```bash
docker compose exec db mysql -uroot -p
```

Masukkan password database jika diminta.

Keluar dari MySQL:

```sql
exit;
```

### 4. Load schema database

Jika database sudah ada dan ingin import schema langsung:

```bash
docker compose exec -T db mysql -uroot -p presensi_rajasa < backend/database/schema/prototype-db-3.9.sql
```

Jika nama database mengikuti `.env`, cek dulu:

```bash
grep '^DB_DATABASE=' .env
```

Contoh jika hasilnya:

```text
DB_DATABASE=presensi_lab_rajasa
```

Maka command menjadi:

```bash
docker compose exec -T db mysql -uroot -p presensi_lab_rajasa < backend/database/schema/prototype-db-3.9.sql
```

### 5. Load seed permission

```bash
docker compose exec -T db mysql -uroot -p presensi_lab_rajasa < backend/database/seeds/seed_permissions_mvp_presensi_qr.sql
```

### 6. Load seed akun demo

```bash
docker compose exec -T db mysql -uroot -p presensi_lab_rajasa < backend/database/seeds/seed_akun_demo_mvp_presensi_qr.sql
```

### 7. Versi memakai variabel dari `.env`

Agar tidak mengetik nama database manual:

```bash
DB_NAME="$(grep '^DB_DATABASE=' .env | cut -d '=' -f2-)"
```

Jika password root sama dengan `DB_PASSWORD`:

```bash
DB_PASS="$(grep '^DB_PASSWORD=' .env | cut -d '=' -f2-)"
```

Load schema:

```bash
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" < backend/database/schema/prototype-db-3.9.sql
```

Load seed permission:

```bash
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" < backend/database/seeds/seed_permissions_mvp_presensi_qr.sql
```

Load seed akun demo:

```bash
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" < backend/database/seeds/seed_akun_demo_mvp_presensi_qr.sql
```

### 8. Cek tabel berhasil terisi

```bash
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" -e "SHOW TABLES;"
```

Cek user demo:

```bash
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" -e "SELECT username FROM users LIMIT 10;"
```

Cek permission:

```bash
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" -e "SELECT permission_code FROM permissions LIMIT 10;"
```

### 9. Jika ingin reset total manual

Hati-hati: command ini menghapus database lama.

```bash
DB_NAME="$(grep '^DB_DATABASE=' .env | cut -d '=' -f2-)"
DB_PASS="$(grep '^DB_PASSWORD=' .env | cut -d '=' -f2-)"

docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" < backend/database/schema/prototype-db-3.9.sql
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" < backend/database/seeds/seed_permissions_mvp_presensi_qr.sql
docker compose exec -T -e MYSQL_PWD="$DB_PASS" db mysql -uroot "$DB_NAME" < backend/database/seeds/seed_akun_demo_mvp_presensi_qr.sql
```

### 10. Catatan penting

```text
-T wajib dipakai saat import file SQL dengan redirect <.
Tanpa -T, import sering gagal karena TTY.
```

```text
Jika memakai sudo untuk Docker, tambahkan sudo di depan command docker.
```

Contoh:

```bash
sudo docker compose exec -T db mysql -uroot -p presensi_lab_rajasa < backend/database/schema/prototype-db-3.9.sql
```

Setelah reset, jalankan test atau import sesuai kebutuhan.

## 21. Import Data Scan Readiness

```bash
./scripts/import-scan-readiness.sh backend/database/data/data-siswa.csv
```

## 22. Audit Import

```bash
./scripts/check-import-table-fill.sh
```

## 23. Audit Presensi Fresh

```bash
./scripts/check-successful-attendance.sh
```

## 24. Cloudflare Tunnel untuk Kamera HP

Jalankan:

```bash
docker run --rm -it --network host cloudflare/cloudflared:latest tunnel --url http://localhost:3000
```

Buka URL HTTPS yang muncul di HP.

Gunakan untuk test:

```text
/dev/scan
/dev/attendance-audit
```

## 25. Bersihkan Docker

Stop container:

```bash
docker compose down
```

Hapus container, network, dan volume project:

```bash
docker compose down -v
```

Hapus image yang tidak dipakai:

```bash
docker image prune
```

Hapus container, image, network, dan cache yang tidak dipakai:

```bash
docker system prune
```

Hati-hati: command prune dapat menghapus cache/image Docker lain.

## 26. Refresh Docker via Script

Jika tersedia script:

```bash
sh docker-refresh.sh
```

Atau di Git Bash:

```bash
./docker-refresh.sh
```

## 27. Troubleshooting Cepat

Cek container:

```bash
docker compose ps
```

Cek log backend:

```bash
docker compose logs -f backend
```

Cek log frontend:

```bash
docker compose logs -f frontend
```

Cek log nginx:

```bash
docker compose logs -f nginx
```

Cek log database:

```bash
docker compose logs -f db
```

Restart service bermasalah:

```bash
docker compose restart backend
docker compose restart frontend
docker compose restart nginx
docker compose restart db
```

Build ulang semua:

```bash
docker compose down
docker compose up -d --build
```

## 28. Urutan Running dari Nol

```bash
cd presensi-lab-rajasa
docker --version
docker compose version
docker compose up -d --build
docker compose ps
docker compose exec backend composer install
docker compose exec frontend npm install
curl -i http://localhost:8080/api/health
docker compose exec frontend npm run build
./scripts/test-backend.sh
```

Expected akhir:

```text
API health berhasil
frontend build passed
backend test OK
```
