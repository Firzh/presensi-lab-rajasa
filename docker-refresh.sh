#!/bin/bash

set -e

if [ ! -f .env ]; then
  echo "ERROR: .env tidak ditemukan. Salin .env.example ke .env lalu isi nilainya."
  exit 1
fi

HOST_UID="$(id -u)"
HOST_GID="$(id -g)"

ENV_UID="$(grep '^UID=' .env | cut -d '=' -f2)"
ENV_GID="$(grep '^GID=' .env | cut -d '=' -f2)"

if [ "$ENV_UID" != "$HOST_UID" ] || [ "$ENV_GID" != "$HOST_GID" ]; then
  echo "WARNING: UID/GID di .env tidak sama dengan user host."
  echo "Host UID:GID = ${HOST_UID}:${HOST_GID}"
  echo ".env UID:GID = ${ENV_UID}:${ENV_GID}"
  echo "Update .env agar file hasil container tidak bermasalah permission."
fi

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