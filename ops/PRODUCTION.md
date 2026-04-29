## Production deployment (single VPS, Docker Compose)

### 0) Prereqs on VPS (Ubuntu)
- Install Docker + Docker Compose plugin
- Open ports 80 and 443 in firewall / security group
- Point DNS `A` record of your domain to the VPS IP

### 1) Clone repo
```bash
sudo mkdir -p /opt/doan-cms && sudo chown -R $USER:$USER /opt/doan-cms
git clone <your-repo-url> /opt/doan-cms
cd /opt/doan-cms
```

### 2) Create environment file
```bash
cp .env.prod.example .env.prod
nano .env.prod
```

### 3) First boot (HTTP fallback)
```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build nginx backend frontend mongo
```

At this point Nginx will run in HTTP fallback mode and serve:
- `http://<domain>/` (frontend)
- `http://<domain>/api/health` (backend)
- `http://<domain>/.well-known/acme-challenge/...` (certbot webroot)

### 4) Obtain HTTPS certificates (Let's Encrypt)
Run certbot service once (or keep it running with profile).
```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml --profile certbot up -d certbot
```

Wait ~1 minute then restart nginx to load HTTPS config:
```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml restart nginx
```

### 5) Verify
- `https://<domain>/`
- `https://<domain>/api/health`
- `https://<domain>/media/<file>` (uploaded assets)

### 6) CI/CD (GitHub Actions)
Set GitHub secrets:
- `PROD_SSH_HOST`
- `PROD_SSH_USER`
- `PROD_SSH_KEY` (private key)
- `PROD_SSH_PORT` (optional)

The workflow runs on push to `main` and executes `ops/deploy-prod.sh` on the VPS.

