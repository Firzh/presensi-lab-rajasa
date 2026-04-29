#!/usr/bin/env bash
set -e

if [ ! -f .env.prod ]; then
  echo "File .env.prod belum ada."
  echo "Jalankan: cp .env.prod.example .env.prod"
  echo "Lalu ubah password database di .env.prod"
  exit 1
fi

docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
