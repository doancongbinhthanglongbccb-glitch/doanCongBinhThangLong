#!/usr/bin/env sh
set -eu

: "${MONGO_URI:?MONGO_URI is required}"
: "${BACKUP_DIR:=./backups}"
: "${RETENTION_COUNT:=7}"

timestamp=$(date +%Y%m%d_%H%M%S)
archive_path="$BACKUP_DIR/mongo-$timestamp.archive.gz"

mkdir -p "$BACKUP_DIR"

mongodump --uri="$MONGO_URI" --archive="$archive_path" --gzip

backup_count=$(find "$BACKUP_DIR" -type f -name 'mongo-*.archive.gz' | wc -l | tr -d ' ')

if [ "$backup_count" -gt "$RETENTION_COUNT" ]; then
	delete_count=$((backup_count - RETENTION_COUNT))
	find "$BACKUP_DIR" -type f -name 'mongo-*.archive.gz' | sort | head -n "$delete_count" | while IFS= read -r old_backup; do
		rm -f "$old_backup"
	done
fi