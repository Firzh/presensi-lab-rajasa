#!/usr/bin/env bash
set -e

docker compose --env-file .env.prod -f docker-compose.prod.yml down
