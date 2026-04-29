#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/doan-cms}"
ENV_FILE="${ENV_FILE:-.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

cd "$APP_DIR"

echo "[deploy] Pulling latest code"
git fetch --all --prune
git reset --hard origin/main

echo "[deploy] Starting containers"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull || true
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build

echo "[deploy] Pruning old images"
docker image prune -f >/dev/null 2>&1 || true

echo "[deploy] Done"

