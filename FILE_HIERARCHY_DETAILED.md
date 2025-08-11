# Cyber Trust Sensor Dashboard  
**Detailed File-Hierarchy & Functional Map**

> Revision Date: 2025-08-07  
> Host Path: `~/my-working-prototype-dashbaord`

---

## 1. Directory Tree (essential artefacts only)

```
.
├── Dockerfile                         (4 KB)  – Multi-stage build
├── docker-compose.yml                (17 KB)  – Orchestration manifest
├── .env.example                       (1 KB)  – Environment template
├── nginx
│   ├── conf.d
│   │   └── default.conf              (2.3 KB) – Active vhost
│   ├── ssl/                          (-)      – TLS assets (empty)
│   └── logs/                         (-)      – Bind-mount for access/error logs
├── nginx.conf                         (3 KB)  – Legacy SPA config (dev)
├── src/ …                            (220 KB) – React 19 SPA sources
├── public/ …                         (15 KB)  – Static assets & index.html
├── package.json                       (4 KB)
├── package-lock.json                 (270 KB)
├── diagnose-port80.sh                 (18 KB) – Diagnostic script
├── scripts
│   └── backup.sh                      (1 KB)  – DB backup cron
├── postgres
│   ├── init/ …                       (-)      – SQL seed
│   └── backups/                      (-)      – Dump output
├── prometheus
│   └── prometheus.yml                (1.4 KB)
├── grafana
│   └── provisioning
│       ├── datasources.yml           (0.8 KB)
│       └── dashboards/ …             (-)
└── PROJECT_INVENTORY.md              (9 KB)
```
*(sizes rounded)*

---

## 2. File-by-File Functionality Matrix

| Path | Type / Key Settings | Purpose & Functionality | Dependencies / Relations | Deployment Role | Dev vs Prod | Security Notes |
|------|--------------------|-------------------------|--------------------------|-----------------|-------------|----------------|
| **Dockerfile** | Multi-stage; `USER nginx`; fixes `/var/cache/nginx`; forces `legacy-peer-deps` | Builds React app then bakes into Nginx image `cyber-trust-dashboard`. | Relies on `package*.json`, `nginx.conf`, build output; consumed by Compose. | Produces immutable runtime image. | Dev uses `npm start` instead. | Runs non-root, strips server-tokens, adds headers. |
| **docker-compose.yml** | Compose v3.8; 7 services; two custom networks; health-checks; volumes | Wires containers, maps `80:80`, declares data volumes. | Pulls images (`cyber-trust-dashboard`, `nginx`, `redis`, `postgres`, etc.). | Main deploy entry; CI/CD uses `docker compose up -d`. | Dev may use slim `dev-compose.yml`. | Secrets via `.env`; internal `backend-network` is `internal:true`. |
| **.env.example** | Key-value template | Holds DB, Redis, JWT, Grafana creds, SMTP, etc. | Sourced by Compose & app. | Copy to `.env` before deployment. | Dev uses lightweight vars; prod uses long random secrets. | Never commit filled `.env`. |
| **nginx/conf.d/default.conf** | Nginx vhost, `listen 80`; CSP; gzip; `/health`; `/api` 404 | Delivers SPA, handles routing, caching, security headers. | Volume-mounted into `nginx` container; served by `temp-nginx`. | Critical runtime config. | Dev uses webpack dev-server; prod uses this. | Strict CSP, HSTS, XFO, Permissions-Policy. |
| **nginx.conf** | Legacy dev config (`listen 8080` & proxy_pass) | Older SPA config; helpful for local single-container test. | Not mounted in prod. | None (kept for reference). | Used when debugging locally. | Contains removed upstream API risk. |
| **diagnose-port80.sh** | Bash; 600 lines; netstat, docker, firewall checks | Automated port-80/ nginx diagnostics. | Calls Docker CLI, ss/netstat, ufw. | Ops run on VPS to root-cause binding issues. | Dev rarely used. | Read-only; no changes. |
| **scripts/backup.sh** | Bash cron; `pg_dumpall` | Nightly backup of Postgres into `/backups`. | Mounted into `backup` service in Compose. | Automated retention (`BACKUP_RETENTION_DAYS`). | Same script for all envs. | Dumps encrypted at volume level (future). |
| **prometheus/prometheus.yml** | YAML scrape config | Monitors Docker, node exporter. | Vol-mounted into `prometheus` container. | Observability stack. | Optional in dev. | No secrets. |
| **grafana/provisioning/** | Datasource & dashboard YAML | Auto-provisions Prometheus datasource + pre-built dashboards. | Grafana reads at startup. | Observability front-end. | Dev optional. | Default admin creds replaced via env. |
| **package.json / lock** | Node manifests | React 19, `react-scripts@5`, TypeScript 5.8. | Dockerfile uses to install. | Core app logic. | Same code both envs. | SCA scanning required (future). |
| **src/** | TSX/JSX, hooks, components | All UI logic with atomic design folders. | Builds to static bundle. | N/A runtime once built. | Live-reload dev server. | No secrets should exist. |
| **public/** | `index.html`, favicon | Base HTML shell. | Copied into Nginx dir. | Display skeleton. | Same both. | Injects CSP meta (redundant but harmless). |
| **postgres/** | SQL init scripts | Creates DB/schema on first run. | Entrypoint of postgres image. | Data persistence. | Local dev may skip heavy schema. | `PGDATA` outside container. |
| **PROJECT_INVENTORY.md** | Doc | Overview & architecture. | Linked from README. | Ops onboarding. | Always. | None. |

---

## 3. Dependency & Relationship Graph (simplified)

```
src/*  ──┐
public/*─┤→ [Dockerfile build] →  cyber-trust-dashboard:latest  ─┐
        │                                                        │
nginx/conf.d/default.conf  ──────── volume ──────► nginx:stable  │→ :80
.docker-compose.yml  ────────────────────────────────────────────┘
.env  ─────────────── env → compose services (postgres, redis…)
scripts/backup.sh  ─── volume → backup service → cron
prometheus.yml  ────── volume → prometheus
grafana provisioning ─ volume → grafana
```

---

## 4. Configuration Purpose & Key Settings

| Config | Critical settings |
|--------|-------------------|
| `default.conf` | `listen 80`, security headers, `/api` placeholder, caching, SPA `try_files`. |
| `.env` | `POSTGRES_*`, `REDIS_PASSWORD`, `JWT_SECRET`, `NGINX_HOST/PORT`, `GF_SECURITY_*`. |
| `docker-compose.yml` | Ports `80:80`, networks, resource limits, healthchecks. |
| `Dockerfile` | `legacy-peer-deps`, non-root perms, `EXPOSE 80`, custom headers. |

---

## 5. Deployment Roles

1. **Dockerfile** – Build pipeline (CI).  
2. **Compose** – Runtime orchestrator (VPS).  
3. **default.conf** – Live reverse-proxy.  
4. **diagnose-port80.sh** – Post-deploy troubleshooting.  
5. **backup.sh** – Scheduled maintenance.  
6. **Prometheus+Grafana** – Ops monitoring.

---

## 6. Dev vs Prod Differences

| Area | Development | Production |
|------|-------------|------------|
| Web server | `npm start` (webpack) | Nginx static |
| Port | 3000 | 80 (443 later) |
| API | Mock or none | Placeholder container (returns HTML) |
| TLS | Self-signed / disabled | Let’s Encrypt (future, `nginx/ssl`) |
| Logging | Console | Json-file w/ rotation (Compose) |

---

## 7. Security Notes per File Type

* **Nginx configs** – Hardened headers, HSTS; ensure no `proxy_pass` to un-trusted hosts.  
* **Dockerfile** – Runs `USER nginx`; temp directories pre-chowned.  
* **Compose** – Networks isolate backend; do **not** expose Postgres/Redis.  
* **.env** – Must be chmod 600, excluded from VCS.  
* **Scripts** – `backup.sh` should store dumps off-server or encrypt at rest.  
* **Prometheus/Grafana** – Port 9090/3000 internal only (or behind auth).

---

## 8. Size & Storage Overview

| Volume | Host Path | Est. Size | Persistence |
|--------|-----------|-----------|-------------|
| Postgres | `/opt/cyber-trust-dashboard/postgres-data` | 1–10 GB | Long-term |
| Redis | `/opt/…/redis-data` | < 100 MB | Optional |
| Nginx cache | `/opt/…/nginx-cache` | < 50 MB | Ephemeral |
| Backups | `/backups` | Policy-driven retention | Encrypted gzip |

---

## 9. Build & Deployment Commands

```bash
# Build image with exact hash
docker build -t cyber-trust-dashboard:$(git rev-parse --short HEAD) .

# Deploy
docker compose --env-file .env up -d

# Validate
docker compose exec nginx nginx -t
curl http://<host>/health
```

---

*End of FILE_HIERARCHY_DETAILED.md*
