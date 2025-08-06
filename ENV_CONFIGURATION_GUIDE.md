# ENV_CONFIGURATION_GUIDE.md  
_Author: Factory Assistant & Jay Dee • Last updated: 2025-08-06_

This guide teaches you **exactly** how to create, secure, verify, and use the `.env` file for the **Cyber Trust Sensor Dashboard** stack. Follow it top-to-bottom once, and future deployments will be copy-paste simple.

---

## 1 ️⃣ Step-by-Step Setup

1. **Copy the template**  
   ```bash
   cd my-working-prototype-dashbaord
   cp .env.example .env
   ```
2. **Open the file**  
   ```bash
   nano .env     # or code .env / vim .env
   ```
3. **Fill each required value** (see section 2).  
4. **Save & exit** – `CTRL+O ↵ CTRL+X` (nano).  
5. **Verify formatting**  
   ```bash
   grep -vE '^\s*#' .env | grep -vE '^\s*$'
   # each VAR=value should echo correctly
   ```
6. **Run configuration tests** (section 8) before `docker compose up -d`.

---

## 2 ️⃣ Variable-by-Variable Cheat-Sheet

| Key | Critical? | Purpose | Typical Value |
|-----|-----------|---------|---------------|
| `APP_VERSION` | ⭐ | Tag shown in UI & images | `1.0.0` |
| `NODE_ENV` | ⭐ | Tells Node/React build mode | `production` / `development` |
| `DATA_PATH` | ⭐ | Host directory for mounted volumes | `/opt/cyber-trust-dashboard` |
| `POSTGRES_DB` / `USER` / `PASSWORD` | ⭐ | Database credentials | `trustdb` / `trustuser` / _strong pw_ |
| `REDIS_PASSWORD` | ⭐ | Secures in-memory cache | _strong pw_ |
| `JWT_SECRET` | ⭐ | Signs auth tokens | 64-char random string |
| `NGINX_HOST` | ⭐ | Public FQDN | `dashboard.example.com` |
| `NGINX_SSL_ENABLED` | ⭐ | Toggle TLS termination | `true` / `false` |
| `GRAFANA_ADMIN_USER` / `PASSWORD` | ★ | Initial Grafana admin creds | `admin` / _strong pw_ |
| Feature flags (`FEATURE_*`) | Optional | Turn modules on/off | `true`/`false` |

_⭐ = must set for production._

---

## 3 ️⃣ Security Considerations

1. **Never commit `.env`** – add it to `.gitignore`.  
2. **Unique secrets per environment** – staging creds ≠ prod creds.  
3. **Rotate secrets** every 90 days (Postgres, Redis, JWT).  
4. **Minimal privileges** – DB user should not be `postgres` superuser.  
5. **Enable SSL** (`NGINX_SSL_ENABLED=true`) and redirect HTTP → HTTPS.  
6. **Rate limiting** – `RATE_LIMIT=100` can be tuned down for public demos.  

---

## 4 ️⃣ Generating Secure Passwords & Secrets

```bash
# 64-char base64 JWT secret
openssl rand -base64 48

# 32-char PostgreSQL / Redis password
openssl rand -hex 16
```

Paste the output **as-is** (no spaces or quotes) into your `.env`.

---

## 5 ️⃣ Domain & SSL Configuration

1. **DNS** – Create an `A` record for `dashboard.example.com` → VPS IP.  
2. **Enable TLS**  
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d dashboard.example.com --redirect --hsts
   ```
3. **Update `.env`**  
   ```
   NGINX_HOST=dashboard.example.com
   NGINX_SSL_ENABLED=true
   ```
4. **Restart Nginx container**  
   ```bash
   docker compose restart nginx
   ```
5. **Verify**  
   ```bash
   curl -I https://dashboard.example.com/health
   # HTTP/2 200
   ```

---

## 6 ️⃣ Deployment Scenarios

| Scenario | `.env` tweaks | Notes |
|----------|---------------|-------|
| **Local Dev** | `NODE_ENV=development`, `NGINX_SSL_ENABLED=false`, `RATE_LIMIT=0`, simple passwords | Expose only port 3000 if skipping Nginx (`npm start`). |
| **Staging** | Dedicated subdomain `staging.example.com`, moderate rate limit, mock email creds | Enable verbose logging (`LOG_LEVEL=debug`). |
| **Production** | Full TLS, WAF/CDN in front, strong secrets, `NODE_ENV=production` | Turn on all feature flags needed; disable anonymous Grafana. |

---

## 7 ️⃣ Troubleshooting Common Issues

| Symptom | Likely Var | Fix |
|---------|-----------|-----|
| `postgres` container `unhealthy` | `POSTGRES_PASSWORD` mismatch | Same value in `.env` _and_ existing volume, or wipe volume. |
| Frontend shows blank page | `REACT_APP_API_URL` wrong | Should match Nginx proxy path `/api`. |
| 502 Bad Gateway | `NGINX_HOST` / SSL vars | Check cert renewal, container health. |
| Tokens invalid after redeploy | `JWT_SECRET` changed | Keep secret constant or force re-login across users. |

---

## 8 ️⃣ Validation Checklist

1. **Dotenv syntax**  
   ```bash
   docker run --rm --env-file .env alpine:latest env | grep POSTGRES_DB
   ```
2. **Container health**  
   ```bash
   docker compose up -d
   docker compose ps    # all = healthy
   ```
3. **Database connectivity**  
   ```bash
   docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c '\l'
   ```
4. **JWT test**  
   - Call `/login` endpoint, decode token at jwt.io → `iss` matches `JWT_ISSUER`.
5. **Prometheus scrape** – open `http://<IP>:9090/-/healthy`.

---

## 9 ️⃣ Best Practices for Secrets Management

1. **Docker Secrets / Vault** – in Swarm or Kubernetes, mount secrets instead of env variables.  
2. **.env only for local / small VPS** – in production use `docker-compose.yml` → `env_file:`, permissions `chmod 600`.  
3. **CI/CD** – store secrets in GitHub Actions _Secrets_; inject at build/deploy time.  
4. **Audit** – run `trivy config` to detect hard-coded passwords before commits.  

---

## 🔟 Real-World Examples

```dotenv
# === CORE ===
APP_VERSION=1.2.3
NODE_ENV=production
DATA_PATH=/opt/cyber-trust-dashboard

# === DATABASE ===
POSTGRES_DB=trustdb
POSTGRES_USER=trustsvc
POSTGRES_PASSWORD=8b6c9076444f4e1e9d455ef2a6d86a2a
PG_POOL_SIZE=20

# === REDIS ===
REDIS_PASSWORD=8c97d52d34614af08a5db1fbad782132

# === AUTH ===
JWT_SECRET=YzQ3OTliNjc0NDM2OTc1YTQ3OTliNjc0NDM2OTc1YTQ3OTliNjc0NDM2OTc1YQ==
JWT_EXPIRATION=3600
JWT_ISSUER=cyber-trust-dashboard

# === NGINX / DOMAIN ===
NGINX_HOST=dashboard.acme-corp.com
NGINX_SSL_ENABLED=true

# === GRAFANA ===
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=e1440be6bcb64bddb43c46c4f31f652e

# === SECURITY ===
RATE_LIMIT=60
SECURITY_HEADERS_ENABLED=true
CORS_ALLOWED_ORIGINS=https://dashboard.acme-corp.com

# === FEATURES ===
FEATURE_THREAT_INTEL=true
FEATURE_MITRE_ATTACK=true
FEATURE_INCIDENT_MANAGEMENT=false
FEATURE_ANALYTICS=true
```

---

### ✨ You’re configured!

Run `docker compose up -d`, open `https://<your-domain>`, and enjoy a fully secured Cyber Trust Sensor Dashboard. If something feels off, scan sections 7 & 8, or open a GitHub issue with logs.

Happy shipping 🚀
