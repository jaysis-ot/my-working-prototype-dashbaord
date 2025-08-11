# Cyber Trust Sensor Dashboard  
**Project Inventory & Architecture Guide**

---

## 1. Project Overview & High-Level Architecture
Cyber Trust Sensor Dashboard is a React-based single-page application (SPA) served by Nginx and containerised with Docker / Docker Compose.  
The stack is intentionally minimal for MVP:

* **Frontend** – React 19 SPA (built and baked into `cyber-trust-dashboard` image).  
* **Reverse-Proxy / Static Server** – Nginx (main production entry).  
* **API placeholder** – Simple Node/HTTP-server for future backend integration.  
* **Stateful Services** – PostgreSQL & Redis (optional, prepared for future use).  
* **Observability** – Prometheus & Grafana.  
* **Networking** – Two user-defined bridges (`frontend-network`, `backend-network`).  

```
┌────────┐      ┌─────────┐
│Browser │ ⇄   │  NGINX  │  → /usr/share/nginx/html
└────────┘      └─────────┘
      ↘ /api/*          ↘ static
        (returns 404)     assets
```

---

## 2. Complete File Hierarchy (abridged)

| Path | Type | Description |
|------|------|-------------|
| `Dockerfile` | Build script | Multi-stage build (Node → Nginx). Handles legacy peer-deps & non-root perms. |
| `docker-compose.yml` | Orchestration | Defines 7 services, volumes, networks, healthchecks. |
| `nginx.conf` | Nginx SPA config (dev) | Legacy version (8080); replaced in production by `nginx/conf.d/default.conf`. |
| `nginx/` | Dir | Centralised Nginx artefacts. |
| `nginx/conf.d/default.conf` | Active Nginx vhost – **fixed** port 80, no API proxy. |
| `nginx/logs/` | Dir | Bind-mount host logs. |
| `nginx/ssl/` | Dir | Placeholder for certs/keys. |
| `postgres/` | Data & init scripts. |
| `scripts/backup.sh` | DB backup cron. |
| `prometheus/prometheus.yml` | Scrape config. |
| `grafana/provisioning/` | Datasources & dashboards. |
| `package.json` / `package-lock.json` | Node deps – React 19, react-scripts 5.0.1 etc. |
| `diagnose-port80.sh` | Bash utility – full port-80 diagnostic (created during debugging). |

---

## 3. Detailed Functionality per File/Directory

### Application & Build
- **Dockerfile**  
  Stage 1 builds React app (`npm install --legacy-peer-deps`, `npm run build`).  
  Stage 2 copies build → `/usr/share/nginx/html`, sets security headers, fixes `/var/cache/nginx` perms, runs `nginx` as non-root on **port 80**.

- **package.json**  
  React scripts, ESLint, TypeScript 5.8; note peer-dep clash with react-scripts (solved by `legacy-peer-deps`).

### Infrastructure & Runtime
- **docker-compose.yml**  
  *Frontend*, *api*, *nginx*, *postgres*, *redis*, *prometheus*, *grafana*, *backup*.  
  Healthchecks ensure graceful restarts; volumes bind host data path.

- **nginx/conf.d/default.conf**  
  SPA routing, gzip, caching, strict security headers, `/health` endpoint, `/api/` returns JSON 404.

- **diagnose-port80.sh**  
  Performs 16-step analysis: docker status, netstat, nginx config validation, firewall, mounts, SELinux, etc.

### Observability
- **prometheus.yml** – Scrapes Docker, node-exporter (future), Grafana datasource auto-provisioned.

### Backup
- **scripts/backup.sh** – Hot-dump, gzip, rotate by `$BACKUP_RETENTION_DAYS`.

---

## 4. Configuration Files & Purposes

| File | Purpose |
|------|---------|
| `.env.example` | Template env vars (DB creds, JWT secret, Grafana admin, etc.). |
| `docker-compose.yml` | Main environment wiring. |
| `nginx/conf.d/default.conf` | Production Nginx config (port 80). |
| `prometheus/prometheus.yml` | Monitoring scrape targets. |
| `grafana/provisioning/…` | Auto-load datasources / dashboards. |

---

## 5. Deployment Setup & Infrastructure

1. **VPS (Ubuntu 24.04)** with Docker 28 + Compose v2.  
2. Clone repo → `~/my-working-prototype-dashbaord`.  
3. Edit `.env`, create `nginx/conf.d/default.conf`.  
4. `docker compose up -d` – builds images, provisions networks.  
5. Port 80 mapped → public IP. SSL (443) ready – just mount certs to `nginx/ssl` and add `listen 443 ssl;` block.

---

## 6. Development & Production Workflows

### Development (local)
```bash
npm install
npm start          # React dev-server on :3000
```
Optional Docker dev:
```bash
docker compose -f dev-compose.yml up --build
```

### Production (CI/CD)
1. `docker build -t cyber-trust-dashboard:$(git rev-parse --short HEAD) .`
2. Push to registry.
3. VPS pulls and `docker compose up -d`.

---

## 7. Security Implementations

* Nginx headers: X-Frame-Options, XSS, HSTS, CSP, Referrer-Policy, Permissions-Policy.  
* Containers run as non-root (`USER nginx`) with restricted volumes.  
* Secrets via `.env` and Docker secrets (future).  
* UFW rules allow 22,80,443,9090 only.  
* Automated DB backups & volume separation.

---

## 8. Troubleshooting Guides

### Port 80 Not Binding
1. Run `diagnose-port80.sh` – checks config, conflicts, firewall.  
2. Common root-causes found & fixed:  
   - **Corrupted `default.conf` (40 bytes) ➜ recreated**  
   - Wrong `listen 8080;` ➜ changed to 80  
   - API proxy caused “[emerg] host not found in upstream ‘api’” ➜ replaced with 404.  

### Frontend Container Restarting
```
mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)
```
Fixed by Dockerfile step creating cache dirs & chown to `nginx`.

### Build Fails (TypeScript peer-deps)
Use:
```
echo 'legacy-peer-deps=true' > .npmrc
npm install --legacy-peer-deps
```
Dockerfile updated accordingly.

---

## 9. Future Development Roadmap

| Milestone | Description | Target |
|-----------|-------------|--------|
| 1 | Replace API placeholder with real Express/GraphQL micro-service | Q3-2025 |
| 2 | SSL termination (Let’s Encrypt, automatic renew) | Q3-2025 |
| 3 | CI/CD (GitHub Actions: build, scan, push, deploy) | Q4-2025 |
| 4 | Role-based authentication (JWT, refresh tokens) | Q4-2025 |
| 5 | Kubernetes Helm charts for scalable deploy | 2026 |
| 6 | Automated smoke & e2e tests (Playwright) | 2026 |
| 7 | SAST + Dependabot + Trivy scanning in pipeline | 2026 |

---

## Appendix A – Quick Commands

```bash
# Bring everything up
docker compose up -d

# View logs
docker compose logs -f nginx

# Validate nginx config inside container
docker exec <nginx-container> nginx -t

# One-off diagnostic
sudo bash diagnose-port80.sh
```

---

**End of PROJECT_INVENTORY.md**
