# Cyber Trust Sensor Dashboard  
## DEPLOYMENT_GUIDE.md  
_Production-grade deployment on Ubuntu 22.04 / 24.04 VPS_

---

## 1. Prerequisites & VPS Preparation

| Item | Minimum | Recommended |
|------|---------|-------------|
| Ubuntu | 22.04 LTS | 24.04 LTS |
| vCPU | 2 | 4 |
| RAM  | 2 GB | 4 GB |
| Disk | 20 GB SSD | 40 GB SSD (separate `/var/lib/docker`) |

1. **DNS** – Point `A` record to your VPS IP (e.g. `dashboard.example.com`).  
2. **SSH** – Hardened access:  
   ```bash
   ssh-copy-id ubuntu@<IP>
   sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
   sudo systemctl restart ssh
   ```
3. **System update**  
   ```bash
   sudo apt update && sudo apt full-upgrade -y
   sudo reboot
   ```

---

## 2. Docker Installation & Configuration

```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc -y

# Install dependencies
sudo apt install -y ca-certificates curl gnupg lsb-release

# Docker repo key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Repo
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install engine + compose plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# User without sudo
sudo usermod -aG docker $USER
newgrp docker
```

System-wide defaults:

```bash
# /etc/docker/daemon.json
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "data-root": "/var/lib/docker",
  "metrics-addr": "0.0.0.0:9323",
  "experimental": true
}
EOF
sudo systemctl restart docker
```

Enable at boot:

```bash
sudo systemctl enable docker
```

---

## 3. Application Deployment with docker-compose

1. **Clone repository**

```bash
git clone https://github.com/jaysis-ot/my-working-prototype-dashbaord.git
cd my-working-prototype-dashbaord
```

2. **Environment file**

```bash
cp .env.example .env
nano .env          # change passwords, secrets, domains
```

3. **Compose up**

```bash
docker compose pull        # pulls base images
docker compose build       # builds frontend if not already built
docker compose up -d       # launch stack
docker compose ps          # verify HEALTHY containers
```

Frontend accessible at `http://<DOMAIN>`.

---

## 4. SSL / TLS Certificate Setup

Using **Caddy** (simplest) _or_ **Let’s Encrypt + Nginx** (shown).

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dashboard.example.com --redirect --hsts
```

Cron renewals are automatically created.  
If you use an external LB, upload the `fullchain.pem`/`privkey.pem` found in `/etc/letsencrypt/live/<domain>/`.

Update `NGINX_SSL_ENABLED=true` in `.env` after certificates exist and restart:

```bash
docker compose restart nginx
```

---

## 5. Security Hardening Steps

1. **Firewall**

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

2. **Fail2Ban**

```bash
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
```

3. **Sysctl & kernel hardening**

```bash
sudo tee /etc/sysctl.d/99-hardening.conf <<'EOF'
net.ipv4.ip_forward = 0
net.ipv4.conf.all.src_valid_mark = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.disable_ipv6 = 1
EOF
sudo sysctl -p /etc/sysctl.d/99-hardening.conf
```

4. **Docker Bench**

```bash
docker run --privileged --pid=host --net=host \
  -v /:/host aquasec/trivy:latest \
  --input /host
```

Resolve high/critical findings.

---

## 6. Monitoring Setup

| Component | Port | Purpose |
|-----------|------|---------|
| Prometheus | 9090 | Metrics scrape |
| Grafana    | 3000 | Dashboards |
| cAdvisor   | 8081 | Container metrics (optional) |

1. Edit `prometheus/prometheus.yml` to scrape Docker & Node exporter.  
2. Import Grafana dashboards:  
   - **Docker**: ID `179`  
   - **Node exporter**: ID `1860`  

Create `admin` user (`GF_SECURITY_ADMIN_*` variables).

---

## 7. Backup Configuration

1. **Database dumps** – already scheduled daily 02:00 in `backup` service cron.  
2. **Verify**  
   ```bash
   docker compose exec backup ls /backups
   ```
3. **Off-site sync** (rclone example):

```bash
sudo apt install -y rclone
rclone config           # remote 's3'
echo "0 3 * * * rclone sync /opt/cyber-trust-dashboard/backups s3:ctsd-backups" | sudo tee /etc/cron.d/offsite-sync
```

---

## 8. Troubleshooting Common Issues

| Symptom | Command | Possible Fix |
|---------|---------|--------------|
| Container `unhealthy` | `docker compose logs <svc>` | Check env vars, DB creds |
| 502 Bad Gateway | `docker compose logs nginx` | Frontend health fail / API down |
| SSL renewal fails | `certbot renew --dry-run` | DNS mismatch / firewall 443 |
| Postgres crash | `docker compose logs postgres` | Disk full / wrong PGDATA path |
| High CPU | `docker stats` | Tune `cpus` limits or investigate query loops |

---

## 9. Performance Optimisation

1. **Enable gzip & caching** already set in `nginx.conf`.  
2. **Tune Postgres** (`postgresql.conf`) – set `shared_buffers = 25%` RAM, `work_mem = 16MB`.  
3. **React build optimised** – run `npm run build` in multi-stage Dockerfile; served by Nginx.  
4. **CDN** – Point static `/static/*` to Cloudflare for global edge caching.  
5. **Database indices** – monitor slow queries with `pg_stat_statements`.

---

## 10. Maintenance Procedures

| Frequency | Task | Command |
|-----------|------|---------|
| Weekly | Apply OS updates | `sudo unattended-upgrade -d` |
| Weekly | Rotate container logs | handled via `max-size`/`max-file` |
| Monthly | Rebuild images | `docker compose pull && docker compose up -d` |
| Quarterly | Pen-test OWASP scan | `docker run -t owasp/zap2docker-stable zap-baseline.py -t https://dashboard.example.com` |
| After releases | DB migration | `docker compose exec api npm run migrate` |
| Disaster | Restore backup | `docker compose down` → `docker volume rm postgres-data` → `psql -f latest.sql` |

---

### You’re live! 🎉  
Monitor Prometheus alerts; if no pages go red, grab a ☕.  
Questions or failures? Check section 8 first, then open an issue with logs.
