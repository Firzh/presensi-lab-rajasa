#!/usr/bin/env bash
docker compose exec backend vendor/bin/phpunit --filter AttendanceReportTest
