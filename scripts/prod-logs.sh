#!/usr/bin/env bash
set -e

docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f --tail=150
