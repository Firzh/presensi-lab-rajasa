#!/usr/bin/env bash
set -e

if [ ! -f .env.prod ]; then
  echo "File .env.prod belum ada."
  exit 1
fi

set -a
. ./.env.prod
set +a

mkdir -p backups

BACKUP_FILE="backups/db_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"

docker compose --env-file .env.prod -f docker-compose.prod.yml exec -T db \
  mariadb-dump -uroot -p"${DB_ROOT_PASSWORD}" "${DB_NAME}" \
  | gzip > "${BACKUP_FILE}"

echo "Backup selesai: ${BACKUP_FILE}"
