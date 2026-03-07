#!/bin/bash

echo "--- [1/3] Menghentikan semua kontainer ---"
docker compose down

echo "--- [2/3] Membersihkan image tanpa nama (dangling) ---"
# Menghapus image <none> agar penyimpanan tidak penuh
docker image prune -f

echo "--- [3/3] Build ulang dan jalankan di background ---"
# Menghapus 'version' secara otomatis di background (jika masih ada)
# dan menjalankan layanan baru
docker compose up -d --build --remove-orphans

echo "--- Selesai! Cek status dengan: docker compose ps ---"