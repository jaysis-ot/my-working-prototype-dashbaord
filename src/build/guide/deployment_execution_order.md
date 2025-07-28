# Risk Platform Deployment Execution Order

## Overview

This guide provides the exact sequence for deploying your Risk Platform from a fresh Ubuntu 24.04 LTS server to a fully operational enterprise system. Follow this order precisely to ensure all dependencies are met.

---

## Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Fresh Ubuntu 24.04 LTS server
- [ ] Minimum 4 CPU cores, 16GB RAM, 100GB disk
- [ ] Internet connectivity
- [ ] Root or sudo access
- [ ] Domain name configured (for SSL certificates)
- [ ] DNS records pointing to server

### Preparation Steps
```bash
# 1. Update the system
sudo apt update && sudo apt upgrade -y

# 2. Create deployment user (if needed)
sudo adduser ubuntu
sudo usermod -aG sudo ubuntu

# 3. Switch to deployment user
su - ubuntu

# 4. Create project directory
sudo mkdir -p /opt/risk-platform
sudo chown ubuntu:ubuntu /opt/risk-platform
cd /opt/risk-platform
```

---

## Phase 1: Foundation Scripts (30-45 minutes)

### Step 1.1: System Detection and Hardening
**Script:** `automation-script.sh system-only`
**Duration:** ~15 minutes
**Purpose:** OS hardening, firewall, SSH security

```bash
# Download the refactored automation script
sudo ./automation-script.sh system-only

# Verify system hardening
sudo ufw status
systemctl status fail2ban
```

**Success Criteria:**
- UFW firewall active
- SSH hardened (no root login)
- Fail2ban running
- Security tools installed

**If this fails:** Check system requirements and network connectivity

---

### Step 1.2: Docker Installation
**Script:** `automation-script.sh docker-only`
**Duration:** ~10 minutes
**Purpose:** Install Docker and Docker Compose

```bash
sudo ./automation-script.sh docker-only

# Verify Docker installation
docker --version
docker compose version
sudo usermod -aG docker ubuntu

# IMPORTANT: Log out and back in for group changes
exit
# SSH back in
sudo su - ubuntu
cd /opt/risk-platform
```

**Success Criteria:**
- Docker running as service
- Docker Compose available
- User in docker group

---

### Step 1.3: Project Structure Setup
**Script:** `automation-script.sh structure-only`
**Duration:** ~5 minutes
**Purpose:** Create directories and generate secrets

```bash
sudo ./automation-script.sh structure-only

# Verify structure
ls -la /opt/risk-platform/
ls -la /opt/risk-platform/secrets/
```

**Success Criteria:**
- Directory structure created
- Secrets generated with proper permissions (600)
- Project ownership set correctly

---

## Phase 2: Database Layer (15-20 minutes)

### Step 2.1: Database Installation
**Script:** `database-setup.sh`
**Duration:** ~15 minutes
**Purpose:** PostgreSQL, Redis, schema creation

```bash
# Make database script executable
chmod +x database-setup.sh

# Run database installation
./database-setup.sh

# Wait for completion and verify
docker compose -f docker-compose.db.yml ps
docker compose -f docker-compose.db.yml exec postgres pg_isready -U risk_platform_app -d risk_platform
```

**Success Criteria:**
- PostgreSQL container running
- Redis container running
- Database schema created (15+ tables)
- Sample data loaded
- Backup scripts functional

**If this fails:** 
- Check Docker is running: `systemctl status docker`
- Check disk space: `df -h`
- Review logs: `docker compose -f docker-compose.db.yml logs`

---

### Step 2.2: Database Validation
**Script:** `validate-database-setup.sh`
**Duration:** ~3 minutes
**Purpose:** Verify database installation

```bash
cd /opt/risk-platform/scripts
./validate-database-setup.sh

# Additional manual verification
docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -c "SELECT COUNT(*) FROM risk_platform.organizations;"
```

**Success Criteria:**
- All database health checks pass
- Schema validation passes
- Functions working correctly
- No critical errors in logs

---

## Phase 3: Application Services (10-15 minutes)

### Step 3.1: API Services Setup
**Script:** `automation-script.sh api-only`
**Duration:** ~10 minutes
**Purpose:** Node.js API application setup

```bash
sudo ./automation-script.sh api-only

# Verify API structure
ls -la /opt/risk-platform/api/
cat /opt/risk-platform/api/package.json
```

**Success Criteria:**
- API directory structure created
- Package.json with dependencies
- Basic API routes configured
- Environment configuration present

---

### Step 3.2: Monitoring Stack Setup
**Script:** `automation-script.sh monitoring-only`
**Duration:** ~5 minutes
**Purpose:** Prometheus, Grafana configuration

```bash
sudo ./automation-script.sh monitoring-only

# Verify monitoring configs
ls -la /opt/risk-platform/monitoring/
cat /opt/risk-platform/monitoring/prometheus/prometheus.yml
```

**Success Criteria:**
- Monitoring configurations created
- Prometheus rules configured
- Grafana provisioning setup

---

## Phase 4: Service Deployment (10-15 minutes)

### Step 4.1: Complete Platform Deployment
**Script:** `automation-script.sh deploy-only`
**Duration:** ~10 minutes
**Purpose:** Start all services

```bash
sudo ./automation-script.sh deploy-only

# Monitor deployment progress
docker compose logs -f

# Wait for services to stabilize (2-3 minutes)
sleep 180
```

**Success Criteria:**
- All containers running
- No restart loops
- Health checks passing

**If containers fail to start:**
```bash
# Check individual service logs
docker compose logs api
docker compose logs nginx
docker compose logs prometheus
docker compose logs grafana

# Check resource usage
docker stats
free -h
df -h
```

---

### Step 4.2: Deployment Validation
**Script:** `validate-complete-setup.sh`
**Duration:** ~5 minutes
**Purpose:** End-to-end validation

```bash
cd /opt/risk-platform/scripts
./validate-complete-setup.sh

# Manual health checks
curl http://localhost:3000/health
curl http://localhost:9090/-/healthy
curl http://localhost:3001/api/health
```

**Success Criteria:**
- All service endpoints responding
- API returning proper JSON
- Monitoring systems active
- No critical errors detected

---

## Phase 5: Operational Scripts Installation (10 minutes)

### Step 5.1: Essential Operational Scripts
**Script:** `create-essential-scripts.sh` + `install-operational-scripts.sh`
**Duration:** ~5 minutes
**Purpose:** Install all operational utilities

```bash
# Create essential operational scripts
./create-essential-scripts.sh

# Install operational utilities
./install-operational-scripts.sh

# Verify master control interface
risk-platform help
risk-platform platform status
```

**Success Criteria:**
- All operational scripts created
- Master control interface working
- Automated tasks scheduled
- Health monitoring service enabled

---

### Step 5.2: Final Missing Scripts Installation
**Script:** `create-final-scripts.sh` + `install-final-scripts.sh`
**Duration:** ~5 minutes
**Purpose:** Advanced operational capabilities

```bash
# Create final missing scripts
./create-final-scripts.sh

# Install final utilities
./install-final-scripts.sh

# Test new capabilities
risk-platform-add-user --help
risk-platform-ioc list
risk-platform-analytics help
```

**Success Criteria:**
- Threat intelligence scripts working
- User management utilities available
- Analytics and reporting functional
- Integration scripts ready

---

## Phase 6: Configuration and Testing (15-20 minutes)

### Step 6.1: SSL Certificate Setup
**Duration:** ~5 minutes
**Purpose:** Configure HTTPS

```bash
# For development (self-signed)
/opt/risk-platform/scripts/security/manage-certificates.sh risk-platform.local generate-self-signed

# For production (Let's Encrypt)
# Install certbot and configure properly

# Update nginx configuration
docker compose restart nginx
```

---

### Step 6.2: External Service Configuration
**Duration:** ~10 minutes
**Purpose:** Configure integrations

```bash
# Edit integration configuration
sudo vi /opt/risk-platform/config/integrations/external-services.conf

# Add your service credentials:
# SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
# ALERT_EMAIL="admin@yourcompany.com"
# SMTP_HOST="your-smtp-server.com"

# Test integrations
/opt/risk-platform/scripts/integrations/slack-integration.sh test
/opt/risk-platform/scripts/integrations/email-notifications.sh test admin@yourcompany.com
```

---

### Step 6.3: Comprehensive System Test
**Duration:** ~5 minutes
**Purpose:** End-to-end functionality test

```bash
# Run comprehensive test suite
/opt/risk-platform/scripts/api-management/api-test-suite.sh

# Run security audit
risk-platform security audit

# Generate test analytics report
risk-platform-analytics executive-dashboard

# Test backup functionality
risk-platform backup full
```

---

## Phase 7: Production Readiness (5-10 minutes)

### Step 7.1: Production Environment Setup
**Script:** `setup-environment.sh production`
**Duration:** ~3 minutes

```bash
/opt/risk-platform/scripts/environments/setup-environment.sh production

# Review production configuration
cat /opt/risk-platform/config/environments/production.env

# Copy to active configuration
cp /opt/risk-platform/config/environments/production.env /opt/risk-platform/.env
```

---

### Step 7.2: Final Security Hardening
**Duration:** ~5 minutes

```bash
# Run security verification
risk-platform security verify

# Update firewall for production
sudo ufw status numbered
# Review and adjust firewall rules as needed

# Change default passwords
sudo vi /opt/risk-platform/secrets/database/postgres_password.txt
# Update other default credentials

# Restart services with new configuration
risk-platform platform restart
```

---

### Step 7.3: Production Validation
**Duration:** ~2 minutes

```bash
# Final production readiness check
risk-platform platform status
curl -k https://localhost/health
curl -k https://localhost/api/v1/status

# Test critical workflows
# - User authentication
# - Data access
# - Monitoring alerts
```

---

## Complete Execution Script

Here's a single script that runs the entire deployment in the correct order:

```bash
#!/bin/bash
# Complete Risk Platform Deployment Script

set -e

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

log "Starting complete Risk Platform deployment..."

# Phase 1: Foundation
log "PHASE 1: Foundation Setup"
sudo ./automation-script.sh system-only
sudo ./automation-script.sh docker-only

# Log out/in required for Docker group changes
log "Please log out and back in, then run this script with 'continue' parameter"
if [[ "${1:-}" != "continue" ]]; then
    exit 0
fi

sudo ./automation-script.sh structure-only

# Phase 2: Database
log "PHASE 2: Database Setup"
./database-setup.sh
./scripts/validate-database-setup.sh

# Phase 3: Application
log "PHASE 3: Application Services"
sudo ./automation-script.sh api-only
sudo ./automation-script.sh monitoring-only

# Phase 4: Deployment
log "PHASE 4: Service Deployment"
sudo ./automation-script.sh deploy-only
sleep 180  # Wait for services to stabilize
./scripts/validate-complete-setup.sh

# Phase 5: Operational Scripts
log "PHASE 5: Operational Scripts"
./create-essential-scripts.sh
./install-operational-scripts.sh
./create-final-scripts.sh
./install-final-scripts.sh

# Phase 6: Configuration
log "PHASE 6: Configuration and Testing"
/opt/risk-platform/scripts/security/manage-certificates.sh risk-platform.local generate-self-signed
docker compose restart nginx

# Phase 7: Production Readiness
log "PHASE 7: Production Readiness"
/opt/risk-platform/scripts/environments/setup-environment.sh production
risk-platform security verify

log "🎉 Risk Platform deployment completed successfully!"
log "Access your platform at: https://$(hostname -I | awk '{print $1}')"
```

---

## Troubleshooting Common Issues

### If Database Installation Fails
```bash
# Check Docker status
systemctl status docker

# Check available space
df -h

# Check port conflicts
netstat -tlnp | grep ":5432\|:6379"

# Clean up and retry
docker compose -f docker-compose.db.yml down
docker volume prune -f
./database-setup.sh
```

### If API Services Won't Start
```bash
# Check database connectivity
docker compose -f docker-compose.db.yml exec postgres pg_isready -U risk_platform_app -d risk_platform

# Check API logs
docker compose logs api

# Check environment configuration
cat /opt/risk-platform/.env

# Restart with fresh build
docker compose down
docker compose build api
docker compose up -d
```

### If Monitoring Stack Fails
```bash
# Check Prometheus configuration
docker compose exec prometheus promtool check config /etc/prometheus/prometheus.yml

# Check Grafana logs
docker compose logs grafana

# Verify monitoring ports
netstat -tlnp | grep ":9090\|:3001"
```

---

## Post-Deployment Checklist

After successful deployment, verify these items:

- [ ] All services responding to health checks
- [ ] Database contains sample data
- [ ] User authentication working
- [ ] Monitoring dashboards accessible
- [ ] Backup procedures tested
- [ ] Security audit passes
- [ ] SSL certificates configured
- [ ] External integrations tested
- [ ] Documentation updated
- [ ] Team trained on operations

---

## Summary

**Total Deployment Time:** 90-120 minutes for complete setup

**Critical Success Factors:**
1. Follow the exact order - dependencies matter
2. Verify each phase before proceeding
3. Check logs immediately if anything fails
4. Test thoroughly before declaring success
5. Document any customizations made

**Your Risk Platform will be production-ready with:**
- Enterprise-grade security and compliance
- Comprehensive operational procedures
- Automated monitoring and alerting
- Full backup and disaster recovery
- Multi-environment support
- Advanced threat intelligence integration

This deployment order ensures your Risk Platform launches successfully and operates reliably from day one.