#!/bin/sh

set -eu

BACKUP_DIR="${BACKUP_DIR:-/backups}"
MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-doan_cms}"
BACKUP_INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-43200}"

mkdir -p "$BACKUP_DIR"

run_backup() {
  timestamp="$(date +%Y-%m-%d-%H-%M)"
  archive_file="$BACKUP_DIR/backup-$timestamp.gz"

  echo "[mongo-backup] Starting backup to $archive_file"

  if [ -n "${MONGO_INITDB_ROOT_USERNAME:-}" ] && [ -n "${MONGO_INITDB_ROOT_PASSWORD:-}" ]; then
    mongodump \
      --host "$MONGO_HOST" \
      --port "$MONGO_PORT" \
      --username "$MONGO_INITDB_ROOT_USERNAME" \
      --password "$MONGO_INITDB_ROOT_PASSWORD" \
      --authenticationDatabase "admin" \
      --db "$MONGO_DB" \
      --archive \
      --gzip > "$archive_file"
  else
    mongodump \
      --host "$MONGO_HOST" \
      --port "$MONGO_PORT" \
      --db "$MONGO_DB" \
      --archive \
      --gzip > "$archive_file"
  fi

  echo "[mongo-backup] Backup complete: $archive_file"
}

if [ "${1:-}" = "backup-once" ]; then
  run_backup
  exit 0
fi

while true; do
  run_backup
  sleep "$BACKUP_INTERVAL_SECONDS"
done
