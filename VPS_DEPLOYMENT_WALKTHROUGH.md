# VPS_DEPLOYMENT_WALKTHROUGH.md  
_Cyber Trust Sensor Dashboard – Complete “copy-paste” guide for deploying to Ubuntu VPS (IP 31.97.114.80)_  

**Author:** Jay Dee & Factory Assistant  **Last updated:** 2025-08-06  

---

## Table of Contents
1. Prerequisites  
2. Step-by-Step Environment Setup  
3. Secure Password Generation  
4. Production-Ready `.env` Template  
5. Directory Creation & Permissions  
6. Configuration Validation  
7. Stack Deployment Commands  
8. Verification Procedures  
9. Security Hardening Steps  
10. Domain & SSL Setup (Optional)  
11. Final Verification Checklist  
12. Common Issues & Troubleshooting  

---

## 1. Prerequisites
| Item | Minimum | Recommended |
|------|---------|-------------|
| OS   | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| vCPU | 2 | 4 |
| RAM  | 2 GB | 4 GB |
| Disk | 20 GB SSD | 40 GB SSD (separate `/var/lib/docker`) |
| Access | SSH key-based login to `ubuntu@31.97.114.80` | — |

Docker & Docker Compose are assumed installed (see DEPLOYMENT_GUIDE.md §2 if not).

---

## 2. Step-by-Step Environment Setup

```bash
# SSH into the VPS
ssh ubuntu@31.97.114.80

# Clone or pull the repository
git clone https://github.com/jaysis-ot/my-working-prototype-dashbaord.git
cd my-working-prototype-dashbaord

# Copy environment template
cp .env.example .env

# Open for editing
nano .env      # or use vim / code
```

---

## 3. Secure Password Generation Commands

```bash
# Generate 32-char hex passwords
POSTGRES_PASSWORD=$(openssl rand -hex 16)
REDIS_PASSWORD=$(openssl rand -hex 16)
GRAFANA_ADMIN_PASSWORD=$(openssl rand -hex 16)

# Generate 64-char base64 JWT secret
JWT_SECRET=$(openssl rand -base64 48)

# Print them (copy somewhere safe)
echo $POSTGRES_PASSWORD
echo $REDIS_PASSWORD
echo $GRAFANA_ADMIN_PASSWORD
echo $JWT_SECRET
```

Paste these values into the `.env` file where indicated.

---

## 4. Production-Ready `.env` File Template

Replace the placeholder comments (`# ← replace`) with your generated secrets or desired values.

```
###################  CORE  ###################
APP_VERSION=1.0.0
NODE_ENV=production
DATA_PATH=/opt/cyber-trust-dashboard
LOG_LEVEL=info

###################  DATABASE  ###############
POSTGRES_DB=trustdb
POSTGRES_USER=trustuser
POSTGRES_PASSWORD=<paste POSTGRES_PASSWORD>   # ← replace
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
PGDATA=/var/lib/postgresql/data/pgdata
PG_POOL_SIZE=10
PG_STATEMENT_TIMEOUT=300000

###################  REDIS  ###################
REDIS_PASSWORD=<paste REDIS_PASSWORD>         # ← replace
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PREFIX=trust:

###################  JWT AUTH  ###############
JWT_SECRET=<paste JWT_SECRET>                 # ← replace
JWT_EXPIRATION=3600
JWT_REFRESH_EXPIRATION=604800
JWT_ISSUER=cyber-trust-dashboard

###################  NGINX  ###################
NGINX_HOST=31.97.114.80       # update to FQDN later
NGINX_PORT=80
NGINX_SSL_PORT=443
NGINX_SSL_ENABLED=false       # change to true after SSL
NGINX_CLIENT_MAX_BODY_SIZE=20M

###################  GRAFANA  #################
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=<paste GRAFANA_ADMIN_PASSWORD>   # ← replace
GRAFANA_PORT=3000
GRAFANA_DOMAIN=grafana.localhost
GRAFANA_ANONYMOUS_ACCESS=false
GRAFANA_ORG_NAME=Cyber Trust

###################  SECURITY  ################
RATE_LIMIT=100
SECURITY_HEADERS_ENABLED=true
TLS_MIN_VERSION=TLSv1.2
CORS_ALLOWED_ORIGINS=http://31.97.114.80

###################  FEATURES  ################
FEATURE_THREAT_INTEL=true
FEATURE_MITRE_ATTACK=true
FEATURE_INCIDENT_MANAGEMENT=true
FEATURE_BUSINESS_PLAN=true
FEATURE_ANALYTICS=true

###################  BACKUPS  #################
BACKUP_RETENTION_DAYS=7
BACKUP_ENABLED=true
```

_Save and close the file (`CTRL+O → Enter → CTRL+X` in nano)._  

Protect it:  
```bash
chmod 600 .env
```

---

## 5. Directory Creation & Permissions

```bash
sudo mkdir -p /opt/cyber-trust-dashboard
sudo chown $USER:$USER /opt/cyber-trust-dashboard

# Create sub-directories for volumes
mkdir -p /opt/cyber-trust-dashboard/{postgres-data,redis-data,api-data,nginx-cache,prometheus-data,grafana-data}
```

---

## 6. Configuration Validation Steps

```bash
# Show non-comment lines to ensure no empty values
grep -vE '^\s*#' .env | grep -vE '^\s*$'

# Simple dotenv load test
docker run --rm --env-file .env alpine:latest env | grep POSTGRES_DB
```

If the variable prints correctly, formatting is fine.

---

## 7. Stack Deployment Commands

```bash
# Pull base images
docker compose pull

# Build the frontend image (if not cached)
docker compose build

# Start the full stack
docker compose up -d

# View status (should be "healthy")
docker compose ps
```

---

## 8. Verification Procedures

1. **Frontend health**  
   ```bash
   curl -I http://31.97.114.80/health   # HTTP/1.1 200 OK
   ```

2. **Dashboard access** – open `http://31.97.114.80` in browser.  

3. **PostgreSQL connectivity**  
   ```bash
   docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c '\l'
   ```

4. **Redis ping**  
   ```bash
   docker compose exec redis redis-cli -a $REDIS_PASSWORD ping   # PONG
   ```

5. **Prometheus health** – visit `http://31.97.114.80:9090/-/healthy`.  

6. **Grafana login** – `http://31.97.114.80:3000` (admin / your password).

---

## 9. Security Hardening Steps

```bash
# 1. UFW firewall
sudo ufw allow 22,80,443,9090/tcp
sudo ufw enable

# 2. Fail2Ban
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban

# 3. System hardening kernel params
sudo tee /etc/sysctl.d/99-hardening.conf <<'EOF'
net.ipv4.ip_forward = 0
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.disable_ipv6 = 1
EOF
sudo sysctl --system

# 4. Container security scan (Trivy)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image cyber-trust-dashboard:latest
```

---

## 10. Domain & SSL Setup (Optional)

1. **DNS** – Create `A` record: `dashboard.example.com → 31.97.114.80`.  
2. **Certbot automatic certificate**  
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d dashboard.example.com --redirect --hsts
   ```
3. **Update `.env`**  
   ```bash
   sed -i 's/NGINX_HOST=.*/NGINX_HOST=dashboard.example.com/' .env
   sed -i 's/NGINX_SSL_ENABLED=false/NGINX_SSL_ENABLED=true/' .env
   ```
4. **Restart Nginx container**  
   ```bash
   docker compose restart nginx
   ```
5. **Verify**  
   ```bash
   curl -I https://dashboard.example.com/health   # HTTP/2 200
   ```

---

## 11. Final Verification Checklist

- [ ] `.env` secrets set & file permission `600`  
- [ ] Volumes mounted under `/opt/cyber-trust-dashboard`  
- [ ] `docker compose ps` shows all services **healthy**  
- [ ] Dashboard reachable in browser  
- [ ] DB & Redis respond to CLI tests  
- [ ] Prometheus & Grafana accessible  
- [ ] UFW firewall enabled  
- [ ] Fail2Ban active (`sudo fail2ban-client status`)  
- [ ] SSL certificate valid (if domain configured)  

---

## 12. Common Issues & Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `postgres` **unhealthy** | Wrong password in `.env` or corrupted volume | Ensure password matches; delete `postgres-data` volume & redeploy |
| Blank page / 502 | Frontend container unhealthy | `docker compose logs frontend` for details |
| `curl /health` 404 | Containers not yet ready | Wait 30 s or check health status |
| Certbot fails | Port 80 blocked or DNS not propagated | Confirm UFW rule & DNS TTL |
| “JWT invalid” | `JWT_SECRET` changed after users logged in | Keep secret constant or force re-login |

---

### 🎉 Deployment Complete!
You now have the Cyber Trust Sensor Dashboard running on your Ubuntu VPS. Re-run the verification steps after any upgrade and keep passwords rotated every 90 days for maximum security.

Happy shipping! 🚀
