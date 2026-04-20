# Production Deployment

## 1. Runtime Model

- Frontend is served by Nginx.
- `/api/*` is reverse proxied to the backend service.
- MongoDB is kept on the private Docker network.
- HTTPS is terminated by Nginx using Let’s Encrypt certificates mounted into the container.
- The production stack is defined in [docker-compose.prod.yml](../docker-compose.prod.yml).

## 2. Nginx

The active container config is in [frontend/nginx.conf](../frontend/nginx.conf).

The HTTPS-ready deployment config is in [deploy/nginx/production.conf](../deploy/nginx/production.conf).

For direct HTTPS deployment, use a server block like the following:

```nginx
server {
  listen 80;
  server_name example.com;

  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }

  location / {
    return 301 https://$host$request_uri;
  }
}

server {
  listen 443 ssl http2;
  server_name example.com;

  ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

  location /api/ {
    proxy_pass http://backend:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}
```

## 3. GitHub Actions

The CI pipeline is in [.github/workflows/ci.yml](../.github/workflows/ci.yml).

The production runtime stack is in [docker-compose.prod.yml](../docker-compose.prod.yml).

Suggested launch flow:

1. Start the stack without the `certbot` profile.
2. Issue the first certificate with `docker compose -f docker-compose.prod.yml --profile certbot up certbot`.
3. Reload Nginx after certificates are present.

Example:

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml --profile certbot up certbot
docker compose -f docker-compose.prod.yml restart nginx
```

Recommended secrets for optional deployment:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`

## 4. Sentry

Backend environment variables:

- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT`
- `SENTRY_TRACES_SAMPLE_RATE`

Frontend environment variables:

- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ENVIRONMENT`
- `VITE_SENTRY_TRACES_SAMPLE_RATE`

Source map upload is enabled in production builds when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are present in the build environment.

## 5. Environment Safety

- Copy [.env.example](../.env.example) into a real `.env` file for deployment.
- Copy [backend/.env.example](../backend/.env.example) into `backend/.env`.
- Copy [frontend/.env.example](../frontend/.env.example) into `frontend/.env`.
- Do not commit real secrets.
- Production startup fails if required backend secrets are missing or placeholder values are left in place.
- The initial admin account is seeded idempotently during migration when `ADMIN_USERNAME` and `ADMIN_PASSWORD` are provided.
- If an admin already exists, bootstrap skips seeding instead of overwriting existing credentials.

## 6. Database Backups

Use [ops/backup-mongo.sh](../ops/backup-mongo.sh) from a cron job or scheduled runner.

An example crontab entry is in [ops/backup-cron.example](../ops/backup-cron.example).

Example:

```bash
MONGO_URI="mongodb://admin:password@mongo:27017/doan_cms?authSource=admin" \
BACKUP_DIR=/var/backups/doan-cms \
RETENTION_COUNT=14 \
./ops/backup-mongo.sh
```

Backups are rotated by count, keeping the newest `RETENTION_COUNT` archives.

## 7. Migration Plan

- Keep migration files in [backend/src/migrations](../backend/src/migrations).
- Name them with an ordered prefix, for example `20260418_0001_sync_indexes.js`.
- Run them with `npm run migrate:db` from the backend folder.
- Track applied migrations in the `schema_migrations` collection.
- Add one migration per schema or data change to keep rollbacks and audits simple.
- The production backend container runs [backend/src/scripts/migrateDatabase.js](../backend/src/scripts/migrateDatabase.js) before starting the API server.

## 8. Health Monitoring

- Backend health endpoint: `GET /api/health`
- Public Nginx health endpoint: `GET /health`
- Use Uptime Kuma, Pingdom, Better Stack, or a similar monitor to poll both URLs.
- Alert on consecutive failures and on elevated latency, not just hard downtime.
- For Docker health checks, probe the backend endpoint inside the container and the Nginx `/health` route from the edge.

## 9. Restart and Recovery

- Keep `restart: unless-stopped` on all long-running services.
- If Mongo is restored from backup, run `npm run migrate:db` in the backend container before putting traffic back on the site.
- After cert renewal, reload Nginx so the updated certificate is picked up.