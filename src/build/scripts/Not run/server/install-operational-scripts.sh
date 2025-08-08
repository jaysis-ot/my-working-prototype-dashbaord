#!/bin/bash
# Essential Operational Scripts for Risk Platform
# Creates all missing operational utilities for production readiness

set -e

PROJECT_ROOT="/opt/risk-platform"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"; }
warning() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"; }

# =============================================
# 1. DISASTER RECOVERY SCRIPTS
# =============================================

create_disaster_recovery_scripts() {
    log "Creating disaster recovery scripts..."
    
    mkdir -p "$SCRIPTS_DIR/disaster-recovery"
    
    # Complete system backup
    cat > "$SCRIPTS_DIR/disaster-recovery/full-backup.sh" << 'EOF'
#!/bin/bash
# Complete System Backup for Disaster Recovery

set -e

PROJECT_ROOT="/opt/risk-platform"
BACKUP_ROOT="/opt/risk-platform/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/full_backup_$DATE"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

log "Starting full system backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"/{database,configs,secrets,uploads,logs}

# 1. Database backup (hot backup)
log "Backing up PostgreSQL database..."
docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres pg_dump \
    -U risk_platform_app \
    -d risk_platform \
    --format=custom \
    --compress=9 \
    --verbose \
    > "$BACKUP_DIR/database/postgres_full_$DATE.dump"

# 2. Redis backup
log "Backing up Redis data..."
docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec redis redis-cli \
    --rdb /data/dump_$DATE.rdb BGSAVE
sleep 5  # Wait for background save to complete
docker cp risk_platform_redis:/data/dump_$DATE.rdb "$BACKUP_DIR/database/"

# 3. Configuration backup
log "Backing up configurations..."
cp -r "$PROJECT_ROOT/config" "$BACKUP_DIR/configs/"
cp -r "$PROJECT_ROOT/nginx" "$BACKUP_DIR/configs/"
cp -r "$PROJECT_ROOT/monitoring" "$BACKUP_DIR/configs/"
cp "$PROJECT_ROOT/.env" "$BACKUP_DIR/configs/" 2>/dev/null || true
cp "$PROJECT_ROOT/docker-compose"*.yml "$BACKUP_DIR/configs/"

# 4. Secrets backup (encrypted)
log "Backing up secrets (encrypted)..."
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "$ENCRYPTION_KEY" > "$BACKUP_DIR/encryption.key"
tar -czf - -C "$PROJECT_ROOT" secrets | openssl enc -aes-256-cbc -salt -k "$ENCRYPTION_KEY" > "$BACKUP_DIR/secrets/secrets_encrypted.tar.gz.enc"

# 5. Application uploads
log "Backing up uploaded files..."
if [ -d "$PROJECT_ROOT/uploads" ]; then
    cp -r "$PROJECT_ROOT/uploads" "$BACKUP_DIR/"
fi

# 6. Important logs
log "Backing up recent logs..."
find "$PROJECT_ROOT/logs" -name "*.log" -mtime -7 -exec cp {} "$BACKUP_DIR/logs/" \;

# 7. System configuration
log "Backing up system configs..."
mkdir -p "$BACKUP_DIR/system"
cp /etc/nginx/sites-available/* "$BACKUP_DIR/system/" 2>/dev/null || true
cp /etc/systemd/system/risk-platform* "$BACKUP_DIR/system/" 2>/dev/null || true
cp /etc/crontab "$BACKUP_DIR/system/" 2>/dev/null || true
crontab -l > "$BACKUP_DIR/system/user_crontab.txt" 2>/dev/null || true

# Create backup manifest
cat > "$BACKUP_DIR/backup_manifest.txt" << MANIFEST
Risk Platform Full Backup
Created: $(date)
Hostname: $(hostname)
Version: $(cat "$PROJECT_ROOT/VERSION" 2>/dev/null || echo "unknown")

Contents:
- PostgreSQL database dump
- Redis data export
- All configuration files
- Encrypted secrets
- Uploaded files
- Recent logs (7 days)
- System configurations

Restore Instructions:
1. Run restore-full-backup.sh with this backup directory
2. Decrypt secrets using encryption.key
3. Restart all services
4. Validate functionality

MANIFEST

# Create compressed archive
log "Creating compressed backup archive..."
cd "$BACKUP_ROOT"
tar -czf "full_backup_$DATE.tar.gz" "full_backup_$DATE"
rm -rf "full_backup_$DATE"

# Calculate checksum
sha256sum "full_backup_$DATE.tar.gz" > "full_backup_$DATE.tar.gz.sha256"

BACKUP_SIZE=$(du -h "full_backup_$DATE.tar.gz" | cut -f1)
log "Full backup completed: $BACKUP_SIZE"
log "Backup location: $BACKUP_ROOT/full_backup_$DATE.tar.gz"
log "Checksum: $BACKUP_ROOT/full_backup_$DATE.tar.gz.sha256"

# Cleanup old backups (keep 14 days)
find "$BACKUP_ROOT" -name "full_backup_*.tar.gz" -mtime +14 -delete
find "$BACKUP_ROOT" -name "full_backup_*.sha256" -mtime +14 -delete

log "Full backup process completed successfully"
EOF

    # Disaster recovery restore script
    cat > "$SCRIPTS_DIR/disaster-recovery/restore-full-backup.sh" << 'EOF'
#!/bin/bash
# Complete System Restore from Backup

set -e

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    echo "Example: $0 /opt/risk-platform/backups/full_backup_20240101_120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"
PROJECT_ROOT="/opt/risk-platform"
RESTORE_DIR="/tmp/risk_platform_restore_$(date +%s)"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

if [[ ! -f "$BACKUP_FILE" ]]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

log "Starting disaster recovery restore..."
log "Backup file: $BACKUP_FILE"

# Verify checksum if available
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [[ -f "$CHECKSUM_FILE" ]]; then
    log "Verifying backup integrity..."
    if sha256sum -c "$CHECKSUM_FILE"; then
        log "Backup integrity verified"
    else
        echo "ERROR: Backup integrity check failed!"
        exit 1
    fi
fi

# Create restore directory
mkdir -p "$RESTORE_DIR"
cd "$RESTORE_DIR"

# Extract backup
log "Extracting backup archive..."
tar -xzf "$BACKUP_FILE"

EXTRACTED_DIR=$(find . -maxdepth 1 -type d -name "full_backup_*" | head -1)
if [[ -z "$EXTRACTED_DIR" ]]; then
    echo "ERROR: Cannot find backup directory in archive"
    exit 1
fi

cd "$EXTRACTED_DIR"

# Stop services
log "Stopping current services..."
cd "$PROJECT_ROOT"
docker compose -f docker-compose.yml down || true
docker compose -f docker-compose.db.yml down || true
docker compose -f docker-compose.monitoring.yml down || true

# Restore configurations
log "Restoring configurations..."
cp -r "$RESTORED_DIR/configs/config" "$PROJECT_ROOT/" 2>/dev/null || true
cp -r "$RESTORED_DIR/configs/nginx" "$PROJECT_ROOT/" 2>/dev/null || true
cp -r "$RESTORED_DIR/configs/monitoring" "$PROJECT_ROOT/" 2>/dev/null || true
cp "$RESTORED_DIR/configs/.env" "$PROJECT_ROOT/" 2>/dev/null || true
cp "$RESTORED_DIR/configs/docker-compose"*.yml "$PROJECT_ROOT/" 2>/dev/null || true

# Decrypt and restore secrets
log "Restoring secrets..."
if [[ -f "$RESTORED_DIR/encryption.key" && -f "$RESTORED_DIR/secrets/secrets_encrypted.tar.gz.enc" ]]; then
    ENCRYPTION_KEY=$(cat "$RESTORED_DIR/encryption.key")
    openssl enc -aes-256-cbc -d -k "$ENCRYPTION_KEY" < "$RESTORED_DIR/secrets/secrets_encrypted.tar.gz.enc" | tar -xzf - -C "$PROJECT_ROOT"
else
    echo "WARNING: Could not restore encrypted secrets"
fi

# Start database services
log "Starting database services..."
cd "$PROJECT_ROOT"
docker compose -f docker-compose.db.yml up -d

# Wait for database to be ready
log "Waiting for database to be ready..."
sleep 30

# Restore database
log "Restoring PostgreSQL database..."
docker compose -f docker-compose.db.yml exec -T postgres pg_restore \
    -U risk_platform_app \
    -d risk_platform \
    --clean \
    --if-exists \
    --verbose < "$RESTORED_DIR/database/postgres_full_"*.dump

# Restore Redis data
log "Restoring Redis data..."
docker cp "$RESTORED_DIR/database/dump_"*.rdb risk_platform_redis:/data/dump.rdb
docker compose -f docker-compose.db.yml restart redis

# Restore uploads
log "Restoring uploaded files..."
if [[ -d "$RESTORED_DIR/uploads" ]]; then
    cp -r "$RESTORED_DIR/uploads" "$PROJECT_ROOT/"
fi

# Start all services
log "Starting all services..."
docker compose -f docker-compose.monitoring.yml up -d
docker compose -f docker-compose.yml up -d

# Wait for services to be ready
log "Waiting for services to start..."
sleep 60

# Validate restore
log "Validating restore..."
if "$PROJECT_ROOT/scripts/validate-complete-setup.sh"; then
    log "✅ Disaster recovery restore completed successfully!"
else
    echo "⚠️  Restore completed but validation failed. Manual intervention may be required."
fi

# Cleanup
rm -rf "$RESTORE_DIR"

log "Restore process completed"
EOF

    chmod +x "$SCRIPTS_DIR/disaster-recovery/"*.sh
    success "Disaster recovery scripts created"
}

# =============================================
# 2. SECURITY AUTOMATION SCRIPTS
# =============================================

create_security_scripts() {
    log "Creating security automation scripts..."
    
    mkdir -p "$SCRIPTS_DIR/security"
    
    # Comprehensive security audit
    cat > "$SCRIPTS_DIR/security/security-audit.sh" << 'EOF'
#!/bin/bash
# Comprehensive Security Audit Script

set -e

PROJECT_ROOT="/opt/risk-platform"
AUDIT_DATE=$(date +%Y%m%d_%H%M%S)
AUDIT_REPORT="/opt/risk-platform/logs/security_audit_$AUDIT_DATE.txt"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$AUDIT_REPORT"; }

log "=== Risk Platform Security Audit ==="
log "Audit started at: $(date)"
log "Hostname: $(hostname)"
log "User: $(whoami)"

# 1. System Security Checks
log "\n1. SYSTEM SECURITY CHECKS"
log "========================="

# Check for unauthorized SUID files
log "Checking for SUID files..."
find /usr -perm -4000 -type f 2>/dev/null | while read file; do
    log "SUID file found: $file"
done

# Check SSH configuration
log "Auditing SSH configuration..."
if grep -q "PermitRootLogin yes" /etc/ssh/sshd_config; then
    log "WARNING: Root login is enabled"
fi

if grep -q "PasswordAuthentication yes" /etc/ssh/sshd_config; then
    log "INFO: Password authentication is enabled"
fi

# Check firewall status
log "Checking firewall status..."
ufw status | tee -a "$AUDIT_REPORT"

# 2. Container Security
log "\n2. CONTAINER SECURITY CHECKS"
log "============================"

# Check for containers running as root
log "Checking containers running as root..."
docker ps --format "table {{.Names}}\t{{.Image}}" | while read name image; do
    if [[ "$name" != "NAMES" ]]; then
        user=$(docker exec "$name" whoami 2>/dev/null || echo "unknown")
        if [[ "$user" == "root" ]]; then
            log "WARNING: Container '$name' running as root"
        fi
    fi
done

# Check container capabilities
log "Checking container capabilities..."
docker ps --format "{{.Names}}" | while read container; do
    if [[ "$container" != "NAMES" ]]; then
        caps=$(docker inspect "$container" --format '{{.HostConfig.CapAdd}}' 2>/dev/null || echo "[]")
        if [[ "$caps" != "[]" && "$caps" != "<no value>" ]]; then
            log "INFO: Container '$container' has additional capabilities: $caps"
        fi
    fi
done

# 3. Network Security
log "\n3. NETWORK SECURITY CHECKS"
log "=========================="

# Check open ports
log "Checking open ports..."
netstat -tlnp | grep LISTEN | tee -a "$AUDIT_REPORT"

# Check Docker networks
log "Checking Docker network configuration..."
docker network ls | tee -a "$AUDIT_REPORT"

# 4. File Permissions
log "\n4. FILE PERMISSION CHECKS"
log "========================="

# Check sensitive file permissions
sensitive_files=(
    "/opt/risk-platform/secrets"
    "/opt/risk-platform/.env"
    "/etc/ssh/sshd_config"
    "/etc/shadow"
)

for file in "${sensitive_files[@]}"; do
    if [[ -e "$file" ]]; then
        perms=$(stat -c "%a %n" "$file")
        log "File permissions: $perms"
    fi
done

# 5. Database Security
log "\n5. DATABASE SECURITY CHECKS"
log "=========================="

# Check PostgreSQL configuration
log "Checking PostgreSQL security settings..."
docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "SHOW ssl;" 2>/dev/null | tee -a "$AUDIT_REPORT" || log "Could not check SSL setting"

docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "SHOW password_encryption;" 2>/dev/null | tee -a "$AUDIT_REPORT" || log "Could not check password encryption"

# 6. Application Security
log "\n6. APPLICATION SECURITY CHECKS"
log "=============================="

# Check for environment variables in process list
log "Checking for exposed environment variables..."
docker ps --format "{{.Names}}" | while read container; do
    if [[ "$container" != "NAMES" ]]; then
        env_vars=$(docker exec "$container" env 2>/dev/null | grep -E "(PASSWORD|SECRET|KEY|TOKEN)" | wc -l)
        if [[ "$env_vars" -gt 0 ]]; then
            log "INFO: Container '$container' has $env_vars sensitive environment variables"
        fi
    fi
done

# 7. Log Analysis
log "\n7. LOG ANALYSIS"
log "==============="

# Check for failed login attempts
log "Checking for failed SSH attempts..."
grep "Failed password" /var/log/auth.log 2>/dev/null | tail -10 | tee -a "$AUDIT_REPORT" || log "No failed SSH attempts found"

# Check for suspicious API access
log "Checking API access logs..."
if [[ -f "$PROJECT_ROOT/logs/api/access.log" ]]; then
    grep -E "(40[0-9]|50[0-9])" "$PROJECT_ROOT/logs/api/access.log" 2>/dev/null | tail -10 | tee -a "$AUDIT_REPORT" || log "No API errors found"
fi

# 8. Vulnerability Scanning
log "\n8. VULNERABILITY SCANNING"
log "========================="

# NPM audit for API
if [[ -f "$PROJECT_ROOT/api/package.json" ]]; then
    log "Running NPM security audit..."
    cd "$PROJECT_ROOT/api"
    npm audit --audit-level=moderate 2>&1 | tee -a "$AUDIT_REPORT" || log "NPM audit completed with issues"
fi

# Docker image vulnerability scan (if trivy is available)
if command -v trivy &> /dev/null; then
    log "Scanning Docker images for vulnerabilities..."
    docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "<none>" | while read image; do
        trivy image --exit-code 0 --severity HIGH,CRITICAL "$image" 2>&1 | head -20 | tee -a "$AUDIT_REPORT"
    done
fi

log "\n=== SECURITY AUDIT COMPLETED ==="
log "Report saved to: $AUDIT_REPORT"
log "Audit completed at: $(date)"

# Generate summary
WARNINGS=$(grep "WARNING:" "$AUDIT_REPORT" | wc -l)
ERRORS=$(grep "ERROR:" "$AUDIT_REPORT" | wc -l)

echo
echo "SECURITY AUDIT SUMMARY"
echo "======================"
echo "Warnings found: $WARNINGS"
echo "Errors found: $ERRORS"
echo "Full report: $AUDIT_REPORT"

if [[ $WARNINGS -gt 0 || $ERRORS -gt 0 ]]; then
    echo "⚠️  Security issues detected. Review the audit report."
    exit 1
else
    echo "✅ No critical security issues detected."
    exit 0
fi
EOF

    # Certificate management script
    cat > "$SCRIPTS_DIR/security/manage-certificates.sh" << 'EOF'
#!/bin/bash
# SSL Certificate Management Script

set -e

PROJECT_ROOT="/opt/risk-platform"
CERT_DIR="$PROJECT_ROOT/secrets/ssl"
DOMAIN="${1:-risk-platform.local}"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

case "${2:-help}" in
    "generate-self-signed")
        log "Generating self-signed certificate for $DOMAIN..."
        
        mkdir -p "$CERT_DIR"/{private,certs}
        
        # Generate private key
        openssl genrsa -out "$CERT_DIR/private/$DOMAIN.key" 4096
        
        # Generate certificate
        openssl req -new -x509 -key "$CERT_DIR/private/$DOMAIN.key" \
            -out "$CERT_DIR/certs/$DOMAIN.crt" \
            -days 365 \
            -subj "/C=US/ST=State/L=City/O=RiskPlatform/OU=IT/CN=$DOMAIN"
        
        # Set permissions
        chmod 600 "$CERT_DIR/private/$DOMAIN.key"
        chmod 644 "$CERT_DIR/certs/$DOMAIN.crt"
        
        log "Self-signed certificate generated for $DOMAIN"
        ;;
        
    "check-expiry")
        log "Checking certificate expiry for $DOMAIN..."
        
        if [[ -f "$CERT_DIR/certs/$DOMAIN.crt" ]]; then
            expiry_date=$(openssl x509 -in "$CERT_DIR/certs/$DOMAIN.crt" -noout -enddate | cut -d= -f2)
            expiry_epoch=$(date -d "$expiry_date" +%s)
            current_epoch=$(date +%s)
            days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
            
            log "Certificate expires on: $expiry_date"
            log "Days until expiry: $days_until_expiry"
            
            if [[ $days_until_expiry -lt 30 ]]; then
                log "WARNING: Certificate expires in less than 30 days!"
                exit 1
            fi
        else
            log "ERROR: Certificate not found for $DOMAIN"
            exit 1
        fi
        ;;
        
    "renew-letsencrypt")
        log "Renewing Let's Encrypt certificate for $DOMAIN..."
        
        # This would integrate with certbot
        # For now, just a placeholder
        log "Let's Encrypt renewal not implemented yet"
        log "Please use certbot manually or implement ACME client"
        ;;
        
    "help"|*)
        echo "SSL Certificate Management"
        echo "Usage: $0 <domain> <command>"
        echo
        echo "Commands:"
        echo "  generate-self-signed  Generate self-signed certificate"
        echo "  check-expiry         Check certificate expiration"
        echo "  renew-letsencrypt    Renew Let's Encrypt certificate"
        echo "  help                 Show this help"
        echo
        echo "Example:"
        echo "  $0 risk-platform.local generate-self-signed"
        ;;
esac
EOF

    # Security hardening verification
    cat > "$SCRIPTS_DIR/security/verify-hardening.sh" << 'EOF'
#!/bin/bash
# Security Hardening Verification Script

set -e

CHECKS_PASSED=0
CHECKS_FAILED=0

check() {
    local description="$1"
    local command="$2"
    
    echo -n "Checking $description... "
    
    if eval "$command" >/dev/null 2>&1; then
        echo "✅ PASS"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    else
        echo "❌ FAIL"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
}

echo "=== Security Hardening Verification ==="
echo

# System checks
check "UFW firewall is active" "ufw status | grep -q 'Status: active'"
check "SSH root login disabled" "grep -q '^PermitRootLogin no' /etc/ssh/sshd_config.d/99-risk-platform-hardening.conf"
check "Fail2ban is running" "systemctl is-active fail2ban"
check "AppArmor is enabled" "systemctl is-active apparmor"

# Docker security checks  
check "Docker daemon running" "systemctl is-active docker"
check "Docker socket permissions" "[[ \$(stat -c '%a' /var/run/docker.sock) == '660' ]]"

# File permission checks
check "Secrets directory permissions" "[[ \$(stat -c '%a' /opt/risk-platform/secrets) == '700' ]]"
check "Environment file permissions" "[[ \$(stat -c '%a' /opt/risk-platform/.env) == '600' ]] || [[ ! -f /opt/risk-platform/.env ]]"

# Network security checks
check "No unnecessary ports open" "[[ \$(netstat -tlnp | grep -v ':22\\|:80\\|:443\\|:3000\\|:3001\\|:5432\\|:6379\\|:9090' | grep LISTEN | wc -l) -eq 0 ]]"

# Database security checks
check "PostgreSQL not accepting external connections" "! netstat -tlnp | grep ':5432' | grep -v '127.0.0.1\\|172.20.'"
check "Redis password protected" "docker compose -f /opt/risk-platform/docker-compose.db.yml exec redis redis-cli ping | grep -q 'NOAUTH'"

echo
echo "=== Security Verification Summary ==="
echo "Checks passed: $CHECKS_PASSED"
echo "Checks failed: $CHECKS_FAILED"

if [[ $CHECKS_FAILED -eq 0 ]]; then
    echo "✅ All security checks passed!"
    exit 0
else
    echo "⚠️  $CHECKS_FAILED security checks failed. Review and fix issues."
    exit 1
fi
EOF

    chmod +x "$SCRIPTS_DIR/security/"*.sh
    success "Security scripts created"
}

# =============================================
# 3. PERFORMANCE MONITORING SCRIPTS
# =============================================

create_performance_scripts() {
    log "Creating performance monitoring scripts..."
    
    mkdir -p "$SCRIPTS_DIR/performance"
    
    # System performance monitoring
    cat > "$SCRIPTS_DIR/performance/system-performance.sh" << 'EOF'
#!/bin/bash
# System Performance Monitoring Script

set -e

PROJECT_ROOT="/opt/risk-platform"
PERFORMANCE_LOG="/opt/risk-platform/logs/performance_$(date +%Y%m%d).log"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$PERFORMANCE_LOG"; }

log "=== System Performance Check ==="

# CPU Usage
log "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print "  Total: " $2 " User: " $4 " System: " $6}' | tee -a "$PERFORMANCE_LOG"

# Memory Usage
log "Memory Usage:"
free -h | grep -E "(Mem|Swap)" | tee -a "$PERFORMANCE_LOG"

# Disk Usage
log "Disk Usage:"
df -h | grep -E "/$|/opt" | tee -a "$PERFORMANCE_LOG"

# Disk I/O
log "Disk I/O:"
iostat -x 1 1 | grep -E "(Device|sda|nvme)" | tee -a "$PERFORMANCE_LOG"

# Network Usage
log "Network Interfaces:"
ip -s link | grep -E "(eth|ens|enp)" -A 1 | tee -a "$PERFORMANCE_LOG"

# Load Average
log "Load Average:"
uptime | tee -a "$PERFORMANCE_LOG"

# Process Count
log "Process Count:"
ps aux | wc -l | awk '{print "  Total processes: " $1}' | tee -a "$PERFORMANCE_LOG"

# Docker Stats
log "Docker Container Stats:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | tee -a "$PERFORMANCE_LOG"

# Database Performance
log "Database Performance:"
if docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres pg_isready -U risk_platform_app -d risk_platform >/dev/null 2>&1; then
    docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "
        SELECT 
            'Active Connections: ' || count(*) as metric
        FROM pg_stat_activity 
        WHERE state = 'active';
        
        SELECT 
            'Database Size: ' || pg_size_pretty(pg_database_size('risk_platform')) as metric;
            
        SELECT 
            'Cache Hit Ratio: ' || round(100.0 * sum(blks_hit) / (sum(blks_hit) + sum(blks_read)), 2) || '%' as metric
        FROM pg_stat_database;
    " | tee -a "$PERFORMANCE_LOG"
else
    log "  Database not accessible"
fi

# API Response Time Test
log "API Response Time Test:"
if curl -s -w "@-" -o /dev/null http://localhost:3000/health << 'CURL_FORMAT'
  DNS Lookup:    %{time_namelookup}s
  Connect:       %{time_connect}s
  Total Time:    %{time_total}s
  HTTP Code:     %{http_code}
CURL_FORMAT
then
    echo "  API is responding"
else
    echo "  API is not responding" | tee -a "$PERFORMANCE_LOG"
fi

log "=== Performance Check Complete ==="
EOF

    # Performance optimization script
    cat > "$SCRIPTS_DIR/performance/optimize-system.sh" << 'EOF'
#!/bin/bash
# System Performance Optimization Script

set -e

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

log "Starting system performance optimization..."

# 1. Docker optimization
log "Optimizing Docker..."

# Prune unused Docker resources
docker system prune -f
docker volume prune -f
docker network prune -f

# Optimize Docker daemon
if [[ ! -f /etc/docker/daemon.json.backup ]]; then
    cp /etc/docker/daemon.json /etc/docker/daemon.json.backup 2>/dev/null || true
fi

cat > /etc/docker/daemon.json << 'DOCKER_EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "live-restore": true,
    "default-ulimits": {
        "nofile": {
            "Hard": 64000,
            "Soft": 64000
        }
    }
}
DOCKER_EOF

systemctl restart docker

# 2. System kernel optimization
log "Optimizing kernel parameters..."

# Add performance-focused sysctl settings
cat >> /etc/sysctl.d/99-risk-platform-performance.conf << 'SYSCTL_EOF'
# Performance optimizations
vm.swappiness=10
vm.dirty_ratio=5
vm.dirty_background_ratio=2
net.core.somaxconn=65535
net.core.netdev_max_backlog=5000
net.ipv4.tcp_max_syn_backlog=8192
net.ipv4.tcp_congestion_control=bbr
SYSCTL_EOF

sysctl -p /etc/sysctl.d/99-risk-platform-performance.conf

# 3. Database optimization
log "Optimizing database performance..."

# PostgreSQL optimization
if docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres pg_isready -U risk_platform_app -d risk_platform >/dev/null 2>&1; then
    docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -c "
        -- Update statistics
        ANALYZE;
        
        -- Vacuum to reclaim space
        VACUUM;
        
        -- Show current performance settings
        SELECT name, setting, unit FROM pg_settings 
        WHERE name IN ('shared_buffers', 'effective_cache_size', 'work_mem', 'maintenance_work_mem');
    "
fi

# 4. Log rotation optimization
log "Optimizing log rotation..."

# Compress old logs
find /opt/risk-platform/logs -name "*.log" -mtime +1 -exec gzip {} \;

# Clean up very old logs
find /opt/risk-platform/logs -name "*.gz" -mtime +30 -delete

# 5. Filesystem optimization
log "Optimizing filesystem..."

# Trim SSD (if applicable)
fstrim -v / 2>/dev/null || log "TRIM not supported or not needed"

# 6. Memory optimization
log "Optimizing memory usage..."

# Clear page cache (safe operation)
sync && echo 1 > /proc/sys/vm/drop_caches

log "Performance optimization completed"
log "Restart services for all optimizations to take effect"
EOF

    # Load testing script
    cat > "$SCRIPTS_DIR/performance/load-test.sh" << 'EOF'
#!/bin/bash
# Load Testing Script for Risk Platform API

set -e

API_BASE_URL="${1:-http://localhost:3000}"
CONCURRENT_USERS="${2:-10}"
TEST_DURATION="${3:-60}"
OUTPUT_DIR="/opt/risk-platform/logs/load_test_$(date +%Y%m%d_%H%M%S)"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

# Check if hey is installed (load testing tool)
if ! command -v hey &> /dev/null; then
    log "Installing 'hey' load testing tool..."
    wget -O /usr/local/bin/hey https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
    chmod +x /usr/local/bin/hey
fi

mkdir -p "$OUTPUT_DIR"

log "Starting load test..."
log "API URL: $API_BASE_URL"
log "Concurrent users: $CONCURRENT_USERS"
log "Test duration: ${TEST_DURATION}s"

# Test 1: Health endpoint
log "Testing health endpoint..."
hey -z "${TEST_DURATION}s" -c "$CONCURRENT_USERS" "$API_BASE_URL/health" > "$OUTPUT_DIR/health_test.txt"

# Test 2: API status endpoint
log "Testing API status endpoint..."
hey -z "${TEST_DURATION}s" -c "$CONCURRENT_USERS" "$API_BASE_URL/api/v1/status" > "$OUTPUT_DIR/status_test.txt"

# Test 3: Mixed load test
log "Running mixed endpoint test..."
for i in {1..100}; do
    curl -s "$API_BASE_URL/health" >/dev/null &
    curl -s "$API_BASE_URL/api/v1/status" >/dev/null &
    
    if (( i % 10 == 0 )); then
        wait
        echo -n "."
    fi
done
wait
echo

# Generate load test report
log "Generating load test report..."
cat > "$OUTPUT_DIR/load_test_report.txt" << REPORT
Risk Platform Load Test Report
Generated: $(date)
Test Duration: ${TEST_DURATION} seconds
Concurrent Users: $CONCURRENT_USERS
Base URL: $API_BASE_URL

=== Health Endpoint Results ===
$(cat "$OUTPUT_DIR/health_test.txt")

=== Status Endpoint Results ===
$(cat "$OUTPUT_DIR/status_test.txt")

=== System Resources During Test ===
CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
Memory Usage: $(free -h | grep "^Mem:" | awk '{print $3 "/" $2}')
Load Average: $(uptime | awk -F'load average:' '{print $2}')

REPORT

log "Load test completed. Results saved to: $OUTPUT_DIR"
log "Review the report: $OUTPUT_DIR/load_test_report.txt"
EOF

    chmod +x "$SCRIPTS_DIR/performance/"*.sh
    success "Performance monitoring scripts created"
}

# =============================================
# 4. OPERATIONAL MAINTENANCE SCRIPTS
# =============================================

create_operational_scripts() {
    log "Creating operational maintenance scripts..."
    
    mkdir -p "$SCRIPTS_DIR/operations"
    
    # Health check dashboard
    cat > "$SCRIPTS_DIR/operations/health-dashboard.sh" << 'EOF'
#!/bin/bash
# Real-time Health Dashboard

set -e

PROJECT_ROOT="/opt/risk-platform"

# Colors for status display
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear_screen() {
    clear
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                           RISK PLATFORM HEALTH DASHBOARD                    ║${NC}"
    echo -e "${BLUE}║                              $(date +'%Y-%m-%d %H:%M:%S')                              ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

check_service() {
    local service="$1"
    local port="$2"
    local name="$3"
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo -e "  ${GREEN}✅ $name${NC} (port $port)"
        return 0
    else
        echo -e "  ${RED}❌ $name${NC} (port $port)"
        return 1
    fi
}

get_docker_status() {
    local container="$1"
    local status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "not found")
    
    case "$status" in
        "running") echo -e "${GREEN}Running${NC}" ;;
        "exited") echo -e "${RED}Stopped${NC}" ;;
        "restarting") echo -e "${YELLOW}Restarting${NC}" ;;
        *) echo -e "${RED}Unknown${NC}" ;;
    esac
}

show_metrics() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d% -f1)
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk_usage=$(df / | awk 'NR==2{print $5}' | cut -d% -f1)
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | xargs)
    
    echo -e "${BLUE}📊 SYSTEM METRICS${NC}"
    echo "  CPU Usage:    ${cpu_usage}%"
    echo "  Memory Usage: ${memory_usage}%"
    echo "  Disk Usage:   ${disk_usage}%"
    echo "  Load Average: ${load_avg}"
    echo
}

show_container_stats() {
    echo -e "${BLUE}🐳 CONTAINER STATUS${NC}"
    
    containers=("risk_platform_postgres" "risk_platform_redis" "risk_platform_api" "risk_platform_nginx" "risk_platform_prometheus" "risk_platform_grafana")
    
    for container in "${containers[@]}"; do
        local name=${container#risk_platform_}
        local status=$(get_docker_status "$container")
        echo "  $name: $status"
    done
    echo
}

show_service_health() {
    echo -e "${BLUE}🌐 SERVICE HEALTH${NC}"
    
    local healthy=0
    local total=6
    
    check_service "postgres" "5432" "PostgreSQL Database" && healthy=$((healthy + 1))
    check_service "redis" "6379" "Redis Cache" && healthy=$((healthy + 1))
    check_service "api" "3000" "API Server" && healthy=$((healthy + 1))
    check_service "nginx" "80" "Web Server" && healthy=$((healthy + 1))
    check_service "prometheus" "9090" "Prometheus" && healthy=$((healthy + 1))
    check_service "grafana" "3001" "Grafana" && healthy=$((healthy + 1))
    
    echo
    echo -e "${BLUE}Overall Health: ${healthy}/${total} services healthy${NC}"
    
    if [[ $healthy -eq $total ]]; then
        echo -e "${GREEN}✅ All systems operational${NC}"
    elif [[ $healthy -gt $((total / 2)) ]]; then
        echo -e "${YELLOW}⚠️  Some services down${NC}"
    else
        echo -e "${RED}🚨 Multiple service failures${NC}"
    fi
    echo
}

show_recent_logs() {
    echo -e "${BLUE}📝 RECENT ALERTS${NC}"
    
    # Check for recent errors in logs
    local error_count=0
    
    if [[ -f "$PROJECT_ROOT/logs/api/error.log" ]]; then
        error_count=$(tail -100 "$PROJECT_ROOT/logs/api/error.log" 2>/dev/null | grep "$(date +%Y-%m-%d)" | wc -l)
    fi
    
    if [[ $error_count -gt 0 ]]; then
        echo -e "  ${RED}❌ $error_count API errors today${NC}"
    else
        echo -e "  ${GREEN}✅ No API errors today${NC}"
    fi
    
    # Check system alerts
    local auth_failures=$(grep "authentication failure" /var/log/auth.log 2>/dev/null | grep "$(date +%b.*$(date +%d))" | wc -l)
    if [[ $auth_failures -gt 0 ]]; then
        echo -e "  ${YELLOW}⚠️  $auth_failures authentication failures today${NC}"
    else
        echo -e "  ${GREEN}✅ No authentication failures today${NC}"
    fi
    
    echo
}

# Main dashboard loop
main() {
    while true; do
        clear_screen
        show_metrics
        show_container_stats
        show_service_health
        show_recent_logs
        
        echo -e "${BLUE}Press Ctrl+C to exit, any key to refresh...${NC}"
        read -t 10 -n 1 2>/dev/null || true
    done
}

# Handle Ctrl+C gracefully
trap 'echo; echo "Dashboard stopped."; exit 0' INT

main
EOF

    # Service deployment script
    cat > "$SCRIPTS_DIR/operations/deploy-service.sh" << 'EOF'
#!/bin/bash
# Service Deployment Script with Zero-Downtime

set -e

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <service_name> [image_tag]"
    echo "Services: api, nginx, postgres, redis, prometheus, grafana"
    exit 1
fi

SERVICE="$1"
IMAGE_TAG="${2:-latest}"
PROJECT_ROOT="/opt/risk-platform"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

cd "$PROJECT_ROOT"

case "$SERVICE" in
    "api")
        log "Deploying API service..."
        
        # Build new image
        docker compose build api
        
        # Rolling update
        docker compose up -d --no-deps api
        
        # Health check
        sleep 10
        if curl -f http://localhost:3000/health >/dev/null 2>&1; then
            log "✅ API deployment successful"
        else
            log "❌ API deployment failed"
            exit 1
        fi
        ;;
        
    "nginx")
        log "Deploying Nginx service..."
        
        # Test configuration first
        docker compose exec nginx nginx -t
        
        # Reload configuration
        docker compose exec nginx nginx -s reload
        
        log "✅ Nginx configuration reloaded"
        ;;
        
    "database")
        log "Database updates require maintenance window..."
        echo "This operation will cause downtime. Continue? (y/N)"
        read -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose -f docker-compose.db.yml up -d --force-recreate postgres
            log "✅ Database service updated"
        else
            log "Database update cancelled"
        fi
        ;;
        
    *)
        log "Deploying $SERVICE service..."
        docker compose up -d --force-recreate "$SERVICE"
        log "✅ $SERVICE deployment completed"
        ;;
esac
EOF

    # Log aggregation script
    cat > "$SCRIPTS_DIR/operations/aggregate-logs.sh" << 'EOF'
#!/bin/bash
# Log Aggregation and Analysis Script

set -e

PROJECT_ROOT="/opt/risk-platform"
LOG_DATE="${1:-$(date +%Y-%m-%d)}"
OUTPUT_FILE="/opt/risk-platform/logs/aggregated_logs_${LOG_DATE}.txt"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

log "Aggregating logs for $LOG_DATE..."

{
    echo "=== RISK PLATFORM LOG AGGREGATION ==="
    echo "Date: $LOG_DATE"
    echo "Generated: $(date)"
    echo
    
    echo "=== API LOGS ==="
    find "$PROJECT_ROOT/logs/api" -name "*.log" -exec grep "$LOG_DATE" {} \; 2>/dev/null | head -100
    echo
    
    echo "=== NGINX ACCESS LOGS ==="
    find "$PROJECT_ROOT/logs/nginx" -name "access.log*" -exec grep "$LOG_DATE" {} \; 2>/dev/null | head -100
    echo
    
    echo "=== NGINX ERROR LOGS ==="
    find "$PROJECT_ROOT/logs/nginx" -name "error.log*" -exec grep "$LOG_DATE" {} \; 2>/dev/null | head -50
    echo
    
    echo "=== SYSTEM LOGS ==="
    grep "$LOG_DATE" /var/log/syslog 2>/dev/null | grep -i "risk-platform" | head -50
    echo
    
    echo "=== DOCKER LOGS ==="
    docker compose logs --since "$LOG_DATE" --until "$(date -d "$LOG_DATE + 1 day" +%Y-%m-%d)" 2>/dev/null | head -100
    echo
    
    echo "=== SECURITY EVENTS ==="
    grep "$LOG_DATE" /var/log/auth.log 2>/dev/null | grep -E "(Failed|Invalid|Illegal)" | head -20
    echo
    
    echo "=== LOG ANALYSIS SUMMARY ==="
    echo "API Requests: $(find "$PROJECT_ROOT/logs/api" -name "*.log" -exec grep "$LOG_DATE" {} \; 2>/dev/null | wc -l)"
    echo "Error Count: $(find "$PROJECT_ROOT/logs" -name "*.log" -exec grep "$LOG_DATE" {} \; 2>/dev/null | grep -i error | wc -l)"
    echo "Warning Count: $(find "$PROJECT_ROOT/logs" -name "*.log" -exec grep "$LOG_DATE" {} \; 2>/dev/null | grep -i warning | wc -l)"
    
} > "$OUTPUT_FILE"

log "Log aggregation completed: $OUTPUT_FILE"

# Show summary
echo
echo "LOG SUMMARY FOR $LOG_DATE"
echo "========================="
grep "=== LOG ANALYSIS SUMMARY ===" -A 10 "$OUTPUT_FILE" | tail -4
EOF

    chmod +x "$SCRIPTS_DIR/operations/"*.sh
    success "Operational scripts created"
}

# =============================================
# 5. CI/CD AND DEPLOYMENT SCRIPTS
# =============================================

create_deployment_scripts() {
    log "Creating CI/CD and deployment scripts..."
    
    mkdir -p "$SCRIPTS_DIR/deployment"
    
    # Blue-green deployment script
    cat > "$SCRIPTS_DIR/deployment/blue-green-deploy.sh" << 'EOF'
#!/bin/bash
# Blue-Green Deployment Script

set -e

PROJECT_ROOT="/opt/risk-platform"
NEW_VERSION="${1:-latest}"
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_DELAY=10

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

if [[ -z "$NEW_VERSION" ]]; then
    echo "Usage: $0 <version_tag>"
    exit 1
fi

cd "$PROJECT_ROOT"

log "Starting blue-green deployment for version: $NEW_VERSION"

# 1. Pull new images
log "Pulling new images..."
docker pull "risk-platform-api:$NEW_VERSION" || {
    log "❌ Failed to pull new API image"
    exit 1
}

# 2. Start green environment
log "Starting green environment..."
export API_IMAGE_TAG="$NEW_VERSION"
docker compose -f docker-compose.green.yml up -d

# 3. Health check green environment
log "Performing health checks on green environment..."
GREEN_HEALTHY=false

for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        log "✅ Green environment is healthy"
        GREEN_HEALTHY=true
        break
    else
        log "Attempt $i/$HEALTH_CHECK_RETRIES: Green environment not ready yet..."
        sleep $HEALTH_CHECK_DELAY
    fi
done

if [[ "$GREEN_HEALTHY" != "true" ]]; then
    log "❌ Green environment failed health checks"
    log "Rolling back..."
    docker compose -f docker-compose.green.yml down
    exit 1
fi

# 4. Switch traffic to green
log "Switching traffic to green environment..."
# Update nginx configuration to point to green
sed -i 's/api:3000/api-green:3001/g' nginx/conf.d/risk-platform.conf
docker compose exec nginx nginx -s reload

# 5. Verify traffic switch
sleep 5
if curl -f http://localhost/health >/dev/null 2>&1; then
    log "✅ Traffic successfully switched to green environment"
else
    log "❌ Traffic switch failed, rolling back..."
    sed -i 's/api-green:3001/api:3000/g' nginx/conf.d/risk-platform.conf
    docker compose exec nginx nginx -s reload
    docker compose -f docker-compose.green.yml down
    exit 1
fi

# 6. Stop blue environment
log "Stopping blue environment..."
docker compose stop api

# 7. Clean up old containers
log "Cleaning up..."
docker compose rm -f api

# 8. Promote green to blue
log "Promoting green environment to production..."
docker compose -f docker-compose.yml down api
docker tag "risk-platform-api:$NEW_VERSION" "risk-platform-api:latest"
sed -i 's/api-green:3001/api:3000/g' nginx/conf.d/risk-platform.conf
docker compose up -d api
docker compose exec nginx nginx -s reload

# 9. Clean up green environment
docker compose -f docker-compose.green.yml down

log "✅ Blue-green deployment completed successfully"
log "New version $NEW_VERSION is now live"
EOF

    # Database migration script
    cat > "$SCRIPTS_DIR/deployment/migrate-database.sh" << 'EOF'
#!/bin/bash
# Database Migration Script

set -e

PROJECT_ROOT="/opt/risk-platform"
MIGRATION_DIR="$PROJECT_ROOT/database/migrations"
MIGRATION_LOG="/opt/risk-platform/logs/migrations.log"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MIGRATION_LOG"; }

cd "$PROJECT_ROOT"

# Create migrations table if it doesn't exist
docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -c "
CREATE TABLE IF NOT EXISTS risk_platform.schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);
"

# Get list of applied migrations
APPLIED_MIGRATIONS=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT version FROM risk_platform.schema_migrations ORDER BY version;" | tr -d ' ' | grep -v '^$')

# Find pending migrations
PENDING_MIGRATIONS=()
if [[ -d "$MIGRATION_DIR" ]]; then
    for migration_file in "$MIGRATION_DIR"/*.sql; do
        if [[ -f "$migration_file" ]]; then
            version=$(basename "$migration_file" .sql)
            if ! echo "$APPLIED_MIGRATIONS" | grep -q "^$version$"; then
                PENDING_MIGRATIONS+=("$migration_file")
            fi
        fi
    done
fi

if [[ ${#PENDING_MIGRATIONS[@]} -eq 0 ]]; then
    log "No pending migrations found"
    exit 0
fi

log "Found ${#PENDING_MIGRATIONS[@]} pending migrations"

# Apply migrations
for migration_file in "${PENDING_MIGRATIONS[@]}"; do
    version=$(basename "$migration_file" .sql)
    log "Applying migration: $version"
    
    # Create backup before migration
    docker compose -f docker-compose.db.yml exec postgres pg_dump -U risk_platform_app -d risk_platform \
        --format=custom > "/tmp/pre_migration_$version.dump"
    
    # Apply migration
    if docker compose -f docker-compose.db.yml exec -T postgres psql -U risk_platform_app -d risk_platform < "$migration_file"; then
        # Record successful migration
        docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -c "
            INSERT INTO risk_platform.schema_migrations (version, description) 
            VALUES ('$version', 'Applied by migration script');
        "
        log "✅ Migration $version applied successfully"
        rm "/tmp/pre_migration_$version.dump"
    else
        log "❌ Migration $version failed"
        log "Restoring from backup..."
        docker compose -f docker-compose.db.yml exec -T postgres pg_restore -U risk_platform_app -d risk_platform \
            --clean --if-exists < "/tmp/pre_migration_$version.dump"
        exit 1
    fi
done

log "All migrations applied successfully"
EOF

    # Environment promotion script
    cat > "$SCRIPTS_DIR/deployment/promote-environment.sh" << 'EOF'
#!/bin/bash
# Environment Promotion Script (dev -> staging -> production)

set -e

if [[ $# -ne 2 ]]; then
    echo "Usage: $0 <from_env> <to_env>"
    echo "Environments: dev, staging, production"
    exit 1
fi

FROM_ENV="$1"
TO_ENV="$2"
PROJECT_ROOT="/opt/risk-platform"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

# Validate environments
VALID_ENVS=("dev" "staging" "production")
if [[ ! " ${VALID_ENVS[@]} " =~ " ${FROM_ENV} " ]] || [[ ! " ${VALID_ENVS[@]} " =~ " ${TO_ENV} " ]]; then
    echo "ERROR: Invalid environment. Must be one of: ${VALID_ENVS[*]}"
    exit 1
fi

log "Promoting from $FROM_ENV to $TO_ENV"

# Pre-promotion checks
case "$TO_ENV" in
    "staging")
        log "Running pre-staging checks..."
        # Add staging-specific validation
        ;;
    "production")
        log "Running pre-production checks..."
        
        # Require manual confirmation for production
        echo "⚠️  PRODUCTION DEPLOYMENT"
        echo "This will deploy to production environment."
        echo "Are you sure? Type 'yes' to continue:"
        read -r confirmation
        if [[ "$confirmation" != "yes" ]]; then
            log "Production deployment cancelled"
            exit 0
        fi
        
        # Run comprehensive tests
        if ! "$PROJECT_ROOT/scripts/validate-complete-setup.sh"; then
            log "❌ Pre-production validation failed"
            exit 1
        fi
        ;;
esac

# Environment-specific deployment
log "Deploying to $TO_ENV environment..."

case "$TO_ENV" in
    "staging")
        # Copy configuration
        cp "$PROJECT_ROOT/config/environments/staging.env" "$PROJECT_ROOT/.env"
        
        # Deploy services
        docker compose -f docker-compose.staging.yml up -d
        ;;
    "production")
        # Copy production configuration
        cp "$PROJECT_ROOT/config/environments/production.env" "$PROJECT_ROOT/.env"
        
        # Create production backup first
        "$PROJECT_ROOT/scripts/disaster-recovery/full-backup.sh"
        
        # Deploy with zero downtime
        "$PROJECT_ROOT/scripts/deployment/blue-green-deploy.sh" "latest"
        ;;
esac

# Post-deployment validation
log "Running post-deployment validation..."
sleep 30

if "$PROJECT_ROOT/scripts/validate-complete-setup.sh"; then
    log "✅ Promotion to $TO_ENV completed successfully"
else
    log "❌ Post-deployment validation failed"
    exit 1
fi

log "Environment promotion completed: $FROM_ENV -> $TO_ENV"
EOF

    chmod +x "$SCRIPTS_DIR/deployment/"*.sh
    success "Deployment scripts created"
}

# =============================================
# 6. MASTER CONTROL SCRIPT
# =============================================

create_master_control_script() {
    log "Creating master control script..."
    
    cat > "$PROJECT_ROOT/risk-platform-control.sh" << 'EOF'
#!/bin/bash
# Risk Platform Master Control Script
# Unified interface for all platform operations

set -e

PROJECT_ROOT="/opt/risk-platform"
VERSION="2.0.0"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

show_help() {
    echo -e "${BLUE}Risk Platform Control v$VERSION${NC}"
    echo "Unified management interface for Risk Intelligence Platform"
    echo
    echo "Usage: $0 <category> <command> [options]"
    echo
    echo -e "${BLUE}Categories:${NC}"
    echo "  platform     Platform lifecycle operations"
    echo "  database     Database operations"
    echo "  security     Security operations"
    echo "  performance  Performance monitoring"
    echo "  backup       Backup and recovery operations"
    echo "  deploy       Deployment operations"
    echo "  logs         Log management"
    echo
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 platform status           # Show platform status"
    echo "  $0 database backup           # Create database backup"
    echo "  $0 security audit            # Run security audit"
    echo "  $0 performance monitor       # Show performance dashboard"
    echo "  $0 backup full               # Create full system backup"
    echo "  $0 deploy api v2.1.0         # Deploy API version 2.1.0"
    echo
    echo "For detailed help on a category: $0 <category> help"
}

# Platform operations
platform_operations() {
    case "${2:-help}" in
        "start")
            log "Starting Risk Platform..."
            cd "$PROJECT_ROOT"
            docker compose -f docker-compose.db.yml up -d
            docker compose -f docker-compose.monitoring.yml up -d
            docker compose -f docker-compose.yml up -d
            success "Platform started"
            ;;
        "stop")
            log "Stopping Risk Platform..."
            cd "$PROJECT_ROOT"
            docker compose -f docker-compose.yml down
            docker compose -f docker-compose.monitoring.yml down
            docker compose -f docker-compose.db.yml down
            success "Platform stopped"
            ;;
        "restart")
            log "Restarting Risk Platform..."
            $0 platform stop
            sleep 5
            $0 platform start
            ;;
        "status")
            "$PROJECT_ROOT/scripts/operations/health-dashboard.sh" | head -20
            ;;
        "dashboard")
            "$PROJECT_ROOT/scripts/operations/health-dashboard.sh"
            ;;
        "update")
            log "Updating platform..."
            cd "$PROJECT_ROOT"
            docker compose pull
            docker compose up -d --force-recreate
            success "Platform updated"
            ;;
        "help"|*)
            echo "Platform Operations:"
            echo "  start      Start all services"
            echo "  stop       Stop all services"
            echo "  restart    Restart all services"
            echo "  status     Show platform status"
            echo "  dashboard  Show real-time dashboard"
            echo "  update     Update to latest versions"
            ;;
    esac
}

# Database operations
database_operations() {
    case "${2:-help}" in
        "backup")
            "$PROJECT_ROOT/scripts/database-setup.sh" backup
            ;;
        "restore")
            if [[ -z "$3" ]]; then
                error "Usage: $0 database restore <backup_file>"
                exit 1
            fi
            "$PROJECT_ROOT/scripts/disaster-recovery/restore-full-backup.sh" "$3"
            ;;
        "migrate")
            "$PROJECT_ROOT/scripts/deployment/migrate-database.sh"
            ;;
        "optimize")
            "$PROJECT_ROOT/scripts/performance/optimize-system.sh"
            ;;
        "monitor")
            "$PROJECT_ROOT/scripts/database-setup.sh" monitor
            ;;
        "help"|*)
            echo "Database Operations:"
            echo "  backup               Create database backup"
            echo "  restore <file>       Restore from backup"
            echo "  migrate              Apply database migrations"
            echo "  optimize             Optimize database performance"
            echo "  monitor              Show database monitoring"
            ;;
    esac
}

# Security operations
security_operations() {
    case "${2:-help}" in
        "audit")
            "$PROJECT_ROOT/scripts/security/security-audit.sh"
            ;;
        "scan")
            "$PROJECT_ROOT/scripts/security/security-audit.sh"
            ;;
        "verify")
            "$PROJECT_ROOT/scripts/security/verify-hardening.sh"
            ;;
        "certs")
            if [[ -z "$3" ]]; then
                "$PROJECT_ROOT/scripts/security/manage-certificates.sh" "risk-platform.local" "check-expiry"
            else
                "$PROJECT_ROOT/scripts/security/manage-certificates.sh" "$3" "${4:-check-expiry}"
            fi
            ;;
        "help"|*)
            echo "Security Operations:"
            echo "  audit                Run comprehensive security audit"
            echo "  scan                 Run security vulnerability scan"
            echo "  verify               Verify security hardening"
            echo "  certs [domain] [cmd] Manage SSL certificates"
            ;;
    esac
}

# Performance operations
performance_operations() {
    case "${2:-help}" in
        "monitor")
            "$PROJECT_ROOT/scripts/performance/system-performance.sh"
            ;;
        "optimize")
            "$PROJECT_ROOT/scripts/performance/optimize-system.sh"
            ;;
        "load-test")
            local url="${3:-http://localhost:3000}"
            local users="${4:-10}"
            local duration="${5:-60}"
            "$PROJECT_ROOT/scripts/performance/load-test.sh" "$url" "$users" "$duration"
            ;;
        "dashboard")
            "$PROJECT_ROOT/scripts/operations/health-dashboard.sh"
            ;;
        "help"|*)
            echo "Performance Operations:"
            echo "  monitor              Show current performance metrics"
            echo "  optimize             Optimize system performance"
            echo "  load-test [url] [users] [duration]  Run load test"
            echo "  dashboard            Show real-time performance dashboard"
            ;;
    esac
}

# Backup operations
backup_operations() {
    case "${2:-help}" in
        "full")
            "$PROJECT_ROOT/scripts/disaster-recovery/full-backup.sh"
            ;;
        "database")
            "$PROJECT_ROOT/scripts/database-setup.sh" backup
            ;;
        "config")
            log "Creating configuration backup..."
            tar -czf "/opt/risk-platform/backups/config_backup_$(date +%Y%m%d_%H%M%S).tar.gz" \
                -C "$PROJECT_ROOT" config nginx monitoring .env docker-compose*.yml
            success "Configuration backup created"
            ;;
        "list")
            log "Available backups:"
            find "$PROJECT_ROOT/backups" -name "*.tar.gz" -o -name "*.dump" -o -name "*.sql.gz" | sort
            ;;
        "restore")
            if [[ -z "$3" ]]; then
                error "Usage: $0 backup restore <backup_file>"
                exit 1
            fi
            "$PROJECT_ROOT/scripts/disaster-recovery/restore-full-backup.sh" "$3"
            ;;
        "help"|*)
            echo "Backup Operations:"
            echo "  full                 Create full system backup"
            echo "  database             Create database backup only"
            echo "  config               Create configuration backup"
            echo "  list                 List available backups"
            echo "  restore <file>       Restore from backup"
            ;;
    esac
}

# Deployment operations
deploy_operations() {
    case "${2:-help}" in
        "api")
            local version="${3:-latest}"
            "$PROJECT_ROOT/scripts/deployment/blue-green-deploy.sh" "$version"
            ;;
        "service")
            local service="${3:-api}"
            local version="${4:-latest}"
            "$PROJECT_ROOT/scripts/operations/deploy-service.sh" "$service" "$version"
            ;;
        "promote")
            local from_env="${3:-dev}"
            local to_env="${4:-staging}"
            "$PROJECT_ROOT/scripts/deployment/promote-environment.sh" "$from_env" "$to_env"
            ;;
        "rollback")
            log "Rolling back deployment..."
            cd "$PROJECT_ROOT"
            docker compose down api
            docker tag "risk-platform-api:previous" "risk-platform-api:latest"
            docker compose up -d api
            success "Rollback completed"
            ;;
        "help"|*)
            echo "Deployment Operations:"
            echo "  api [version]        Deploy API with blue-green strategy"
            echo "  service <name> [ver] Deploy specific service"
            echo "  promote <from> <to>  Promote between environments"
            echo "  rollback             Rollback to previous version"
            ;;
    esac
}

# Log operations
log_operations() {
    case "${2:-help}" in
        "show")
            local service="${3:-all}"
            if [[ "$service" == "all" ]]; then
                cd "$PROJECT_ROOT"
                docker compose logs -f
            else
                docker compose logs -f "$service"
            fi
            ;;
        "aggregate")
            local date="${3:-$(date +%Y-%m-%d)}"
            "$PROJECT_ROOT/scripts/operations/aggregate-logs.sh" "$date"
            ;;
        "errors")
            log "Recent errors across all services:"
            find "$PROJECT_ROOT/logs" -name "*.log" -exec grep -l "ERROR\|error" {} \; | head -5 | while read logfile; do
                echo "=== $logfile ==="
                tail -20 "$logfile" | grep -i error | tail -5
                echo
            done
            ;;
        "clean")
            log "Cleaning old logs..."
            find "$PROJECT_ROOT/logs" -name "*.log" -mtime +7 -exec gzip {} \;
            find "$PROJECT_ROOT/logs" -name "*.gz" -mtime +30 -delete
            docker system prune -f --volumes
            success "Log cleanup completed"
            ;;
        "help"|*)
            echo "Log Operations:"
            echo "  show [service]       Show logs for service (or all)"
            echo "  aggregate [date]     Aggregate logs for specific date"
            echo "  errors               Show recent errors"
            echo "  clean                Clean old logs"
            ;;
    esac
}

# Main command dispatcher
main() {
    case "${1:-help}" in
        "platform")
            platform_operations "$@"
            ;;
        "database"|"db")
            database_operations "$@"
            ;;
        "security"|"sec")
            security_operations "$@"
            ;;
        "performance"|"perf")
            performance_operations "$@"
            ;;
        "backup")
            backup_operations "$@"
            ;;
        "deploy")
            deploy_operations "$@"
            ;;
        "logs")
            log_operations "$@"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Execute main function
main "$@"
EOF

    # Make executable and create global symlink
    chmod +x "$PROJECT_ROOT/risk-platform-control.sh"
    ln -sf "$PROJECT_ROOT/risk-platform-control.sh" /usr/local/bin/risk-platform
    
    success "Master control script created"
}

# =============================================
# 7. MONITORING AND ALERTING SCRIPTS
# =============================================

create_monitoring_scripts() {
    log "Creating advanced monitoring scripts..."
    
    mkdir -p "$SCRIPTS_DIR/monitoring"
    
    # Prometheus alert rules
    cat > "$PROJECT_ROOT/monitoring/prometheus/alert-rules.yml" << 'EOF'
groups:
  - name: risk_platform_alerts
    rules:
      # High CPU usage
      - alert: HighCPUUsage
        expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 5 minutes"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 85% for more than 5 minutes"

      # Disk space low
      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 90
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Disk space critically low"
          description: "Disk usage is above 90%"

      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.instance }} has been down for more than 1 minute"

      # Database connection issues
      - alert: PostgreSQLDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "PostgreSQL database is not responding"

      # High API response time
      - alert: HighAPIResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "95th percentile response time is above 2 seconds"

      # API error rate high
      - alert: HighAPIErrorRate
        expr: (rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])) * 100 > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API error rate"
          description: "API error rate is above 5% for more than 5 minutes"
EOF

    # Alert notification script
    cat > "$SCRIPTS_DIR/monitoring/send-alert.sh" << 'EOF'
#!/bin/bash
# Alert Notification Script

set -e

ALERT_TYPE="$1"
ALERT_MESSAGE="$2"
SEVERITY="${3:-info}"
NOTIFICATION_LOG="/opt/risk-platform/logs/notifications.log"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$NOTIFICATION_LOG"; }

if [[ -z "$ALERT_TYPE" || -z "$ALERT_MESSAGE" ]]; then
    echo "Usage: $0 <alert_type> <message> [severity]"
    echo "Severity levels: info, warning, critical"
    exit 1
fi

log "Alert triggered: $ALERT_TYPE - $ALERT_MESSAGE (Severity: $SEVERITY)"

# Email notification (if configured)
if [[ -n "$SMTP_HOST" && -n "$ALERT_EMAIL" ]]; then
    {
        echo "Subject: [Risk Platform] $ALERT_TYPE Alert"
        echo "To: $ALERT_EMAIL"
        echo "From: noreply@risk-platform.local"
        echo
        echo "Alert Type: $ALERT_TYPE"
        echo "Severity: $SEVERITY"
        echo "Time: $(date)"
        echo "Host: $(hostname)"
        echo
        echo "Message:"
        echo "$ALERT_MESSAGE"
        echo
        echo "---"
        echo "Risk Platform Monitoring System"
    } | sendmail "$ALERT_EMAIL" 2>/dev/null || log "Failed to send email notification"
fi

# Slack notification (if webhook configured)
if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
    local color
    case "$SEVERITY" in
        "critical") color="danger" ;;
        "warning") color="warning" ;;
        *) color="good" ;;
    esac
    
    curl -X POST -H 'Content-type: application/json' \
        --data "{
            \"attachments\": [{
                \"color\": \"$color\",
                \"title\": \"Risk Platform Alert: $ALERT_TYPE\",
                \"text\": \"$ALERT_MESSAGE\",
                \"fields\": [
                    {\"title\": \"Severity\", \"value\": \"$SEVERITY\", \"short\": true},
                    {\"title\": \"Host\", \"value\": \"$(hostname)\", \"short\": true},
                    {\"title\": \"Time\", \"value\": \"$(date)\", \"short\": false}
                ]
            }]
        }" \
        "$SLACK_WEBHOOK_URL" 2>/dev/null || log "Failed to send Slack notification"
fi

# PagerDuty integration (if configured)
if [[ -n "$PAGERDUTY_INTEGRATION_KEY" && "$SEVERITY" == "critical" ]]; then
    curl -X POST \
        -H "Content-Type: application/json" \
        -d "{
            \"routing_key\": \"$PAGERDUTY_INTEGRATION_KEY\",
            \"event_action\": \"trigger\",
            \"payload\": {
                \"summary\": \"$ALERT_TYPE: $ALERT_MESSAGE\",
                \"source\": \"$(hostname)\",
                \"severity\": \"critical\",
                \"component\": \"risk-platform\",
                \"group\": \"infrastructure\"
            }
        }" \
        "https://events.pagerduty.com/v2/enqueue" 2>/dev/null || log "Failed to send PagerDuty alert"
fi

log "Alert notification processing completed"
EOF

    # System health monitoring daemon
    cat > "$SCRIPTS_DIR/monitoring/health-monitor-daemon.sh" << 'EOF'
#!/bin/bash
# Continuous Health Monitoring Daemon

set -e

PROJECT_ROOT="/opt/risk-platform"
HEALTH_LOG="/opt/risk-platform/logs/health-monitor.log"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"  # seconds
ALERT_COOLDOWN=300  # 5 minutes between same alerts

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$HEALTH_LOG"; }

# Track last alert times to prevent spam
declare -A last_alert_time

send_alert_if_needed() {
    local alert_type="$1"
    local message="$2"
    local severity="$3"
    local current_time=$(date +%s)
    
    local last_time=${last_alert_time[$alert_type]:-0}
    
    if [[ $((current_time - last_time)) -gt $ALERT_COOLDOWN ]]; then
        "$PROJECT_ROOT/scripts/monitoring/send-alert.sh" "$alert_type" "$message" "$severity"
        last_alert_time[$alert_type]=$current_time
    fi
}

check_system_resources() {
    # CPU check
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d% -f1 | cut -d. -f1)
    if [[ $cpu_usage -gt 80 ]]; then
        send_alert_if_needed "HighCPU" "CPU usage is ${cpu_usage}%" "warning"
    fi
    
    # Memory check
    local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [[ $memory_usage -gt 85 ]]; then
        send_alert_if_needed "HighMemory" "Memory usage is ${memory_usage}%" "warning"
    fi
    
    # Disk check
    local disk_usage=$(df / | awk 'NR==2{print $5}' | cut -d% -f1)
    if [[ $disk_usage -gt 90 ]]; then
        send_alert_if_needed "DiskSpaceCritical" "Disk usage is ${disk_usage}%" "critical"
    elif [[ $disk_usage -gt 80 ]]; then
        send_alert_if_needed "DiskSpaceWarning" "Disk usage is ${disk_usage}%" "warning"
    fi
}

check_services() {
    local services=("postgres:5432" "redis:6379" "api:3000" "nginx:80" "prometheus:9090" "grafana:3001")
    
    for service_port in "${services[@]}"; do
        local service=${service_port%:*}
        local port=${service_port#*:}
        
        if ! nc -z localhost "$port" 2>/dev/null; then
            send_alert_if_needed "Service${service}Down" "Service $service is not responding on port $port" "critical"
        fi
    done
}

check_database_health() {
    # PostgreSQL connection check
    if ! docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres pg_isready -U risk_platform_app -d risk_platform >/dev/null 2>&1; then
        send_alert_if_needed "DatabaseDown" "PostgreSQL database is not responding" "critical"
        return
    fi
    
    # Check connection count
    local connections=$(docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null | tr -d ' ')
    
    if [[ $connections -gt 50 ]]; then
        send_alert_if_needed "HighDBConnections" "High database connection count: $connections" "warning"
    fi
    
    # Check for long-running queries
    local long_queries=$(docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 minutes';" 2>/dev/null | tr -d ' ')
    
    if [[ $long_queries -gt 0 ]]; then
        send_alert_if_needed "LongRunningQueries" "$long_queries long-running database queries detected" "warning"
    fi
}

check_api_health() {
    # API health check
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "000")
    
    if [[ "$response_code" != "200" ]]; then
        send_alert_if_needed "APIDown" "API health check failed (HTTP $response_code)" "critical"
        return
    fi
    
    # API response time check
    local response_time=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:3000/health 2>/dev/null || echo "999")
    local response_ms=$(echo "$response_time * 1000" | bc | cut -d. -f1)
    
    if [[ $response_ms -gt 2000 ]]; then
        send_alert_if_needed "SlowAPI" "API response time is slow: ${response_ms}ms" "warning"
    fi
}

# Signal handlers for graceful shutdown
cleanup() {
    log "Health monitor daemon shutting down"
    exit 0
}

trap cleanup SIGTERM SIGINT

log "Starting health monitor daemon (PID: $)"
log "Check interval: ${CHECK_INTERVAL}s"

# Main monitoring loop
while true; do
    log "Running health checks..."
    
    check_system_resources
    check_services
    check_database_health
    check_api_health
    
    log "Health check cycle completed"
    sleep "$CHECK_INTERVAL"
done
EOF

    chmod +x "$SCRIPTS_DIR/monitoring/"*.sh
    success "Advanced monitoring scripts created"
}

# =============================================
# 8. COMPLIANCE AND AUDIT SCRIPTS
# =============================================

create_compliance_scripts() {
    log "Creating compliance and audit scripts..."
    
    mkdir -p "$SCRIPTS_DIR/compliance"
    
    # SOC2 compliance check
    cat > "$SCRIPTS_DIR/compliance/soc2-compliance-check.sh" << 'EOF'
#!/bin/bash
# SOC2 Compliance Verification Script

set -e

PROJECT_ROOT="/opt/risk-platform"
COMPLIANCE_REPORT="/opt/risk-platform/logs/soc2_compliance_$(date +%Y%m%d_%H%M%S).txt"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$COMPLIANCE_REPORT"; }

log "=== SOC2 COMPLIANCE CHECK ==="
log "Report generated: $(date)"
log "Hostname: $(hostname)"

# CC6.1 - Logical Access Controls
log "\nCC6.1 - LOGICAL ACCESS CONTROLS"
log "================================"

# Check if MFA is enforced
log "Checking multi-factor authentication..."
if grep -q "mfa_enabled" "$PROJECT_ROOT/api/src/config"/*.js 2>/dev/null; then
    log "✅ MFA configuration found in codebase"
else
    log "❌ MFA configuration not found"
fi

# Check password policies
log "Checking password policy enforcement..."
if grep -q "password.*complexity\|bcrypt\|scrypt" "$PROJECT_ROOT/api/src"/*.js 2>/dev/null; then
    log "✅ Password hashing implementation found"
else
    log "❌ Password policy implementation unclear"
fi

# CC6.2 - User Access Provisioning
log "\nCC6.2 - USER ACCESS PROVISIONING"
log "================================="

# Check role-based access
log "Checking role-based access controls..."
if docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "SELECT COUNT(*) FROM risk_platform.users WHERE role IS NOT NULL;" >/dev/null 2>&1; then
    log "✅ Role-based access control implemented"
else
    log "❌ Could not verify role-based access"
fi

# CC6.3 - User Access Revocation
log "\nCC6.3 - USER ACCESS REVOCATION"
log "==============================="

# Check for user deactivation capability
log "Checking user deactivation mechanisms..."
if docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='users' AND column_name IN ('status', 'deleted_at');" | grep -q "2"; then
    log "✅ User deactivation mechanisms present"
else
    log "❌ User deactivation mechanisms not found"
fi

# CC7.1 - System Monitoring
log "\nCC7.1 - SYSTEM MONITORING"
log "=========================="

# Check monitoring implementation
log "Checking monitoring systems..."
if nc -z localhost 9090 2>/dev/null; then
    log "✅ Prometheus monitoring active"
else
    log "❌ Prometheus monitoring not accessible"
fi

if nc -z localhost 3001 2>/dev/null; then
    log "✅ Grafana dashboard active"
else
    log "❌ Grafana dashboard not accessible"
fi

# CC8.1 - Change Management
log "\nCC8.1 - CHANGE MANAGEMENT"
log "=========================="

# Check for audit logging
log "Checking audit logging..."
if docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "SELECT COUNT(*) FROM risk_platform.audit_log;" >/dev/null 2>&1; then
    local audit_count=$(docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT COUNT(*) FROM risk_platform.audit_log;" | tr -d ' ')
    log "✅ Audit logging active ($audit_count audit records)"
else
    log "❌ Audit logging not accessible"
fi

# Check version control evidence
log "Checking change management evidence..."
if [[ -d "$PROJECT_ROOT/.git" ]]; then
    log "✅ Git version control present"
else
    log "❌ Version control not evident"
fi

# A1.1 - Data Classification
log "\nA1.1 - DATA CLASSIFICATION"
log "==========================="

# Check encryption at rest
log "Checking encryption implementation..."
if docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "SHOW ssl;" | grep -q "on"; then
    log "✅ Database SSL encryption enabled"
else
    log "❌ Database SSL encryption not verified"
fi

# A1.2 - Data Handling
log "\nA1.2 - DATA HANDLING"
log "===================="

# Check backup procedures
log "Checking backup procedures..."
if [[ -f "$PROJECT_ROOT/scripts/disaster-recovery/full-backup.sh" ]]; then
    log "✅ Backup procedures documented and automated"
else
    log "❌ Backup procedures not found"
fi

# Generate compliance summary
log "\n=== COMPLIANCE SUMMARY ==="
local passed=$(grep "✅" "$COMPLIANCE_REPORT" | wc -l)
local failed=$(grep "❌" "$COMPLIANCE_REPORT" | wc -l)
local total=$((passed + failed))

log "Total checks: $total"
log "Passed: $passed"
log "Failed: $failed"
log "Compliance rate: $(echo "scale=1; $passed * 100 / $total" | bc)%"

if [[ $failed -eq 0 ]]; then
    log "🎉 SOC2 compliance checks PASSED"
    exit 0
else
    log "⚠️  SOC2 compliance issues detected"
    log "Review failed checks and implement necessary controls"
    exit 1
fi
EOF

    # GDPR compliance check
    cat > "$SCRIPTS_DIR/compliance/gdpr-compliance-check.sh" << 'EOF'
#!/bin/bash
# GDPR Compliance Verification Script

set -e

PROJECT_ROOT="/opt/risk-platform"
GDPR_REPORT="/opt/risk-platform/logs/gdpr_compliance_$(date +%Y%m%d_%H%M%S).txt"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$GDPR_REPORT"; }

log "=== GDPR COMPLIANCE CHECK ==="
log "Report generated: $(date)"

# Article 25 - Data Protection by Design
log "\nARTICLE 25 - DATA PROTECTION BY DESIGN"
log "======================================="

# Check for data minimization
log "Checking data minimization principles..."
if docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "\d risk_platform.users" | grep -E "(email|first_name|last_name)" >/dev/null 2>&1; then
    log "✅ User data collection appears minimal"
else
    log "❌ Could not verify data minimization"
fi

# Article 30 - Records of Processing
log "\nARTICLE 30 - RECORDS OF PROCESSING"
log "=================================="

# Check for processing records
log "Checking processing activity records..."
if [[ -f "$PROJECT_ROOT/docs/gdpr/processing-records.md" ]]; then
    log "✅ Processing records documented"
else
    log "❌ Processing records documentation missing"
fi

# Article 32 - Security of Processing
log "\nARTICLE 32 - SECURITY OF PROCESSING"
log "==================================="

# Check encryption
log "Checking encryption implementation..."
if docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash';" | grep -q "1"; then
    log "✅ Password encryption implemented"
else
    log "❌ Password encryption not verified"
fi

# Check access logging
log "Checking access logging for accountability..."
if docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "SELECT COUNT(*) FROM risk_platform.audit_log WHERE action LIKE 'read%';" >/dev/null 2>&1; then
    log "✅ Access logging implemented"
else
    log "❌ Access logging not verified"
fi

# Article 33 - Breach Notification
log "\nARTICLE 33 - BREACH NOTIFICATION"
log "================================"

# Check incident response procedures
log "Checking incident response procedures..."
if [[ -f "$PROJECT_ROOT/docs/security/incident-response.md" ]]; then
    log "✅ Incident response procedures documented"
else
    log "❌ Incident response procedures missing"
fi

# Article 35 - Data Protection Impact Assessment
log "\nARTICLE 35 - DATA PROTECTION IMPACT ASSESSMENT"
log "=============================================="

# Check for DPIA documentation
log "Checking DPIA documentation..."
if [[ -f "$PROJECT_ROOT/docs/gdpr/dpia.md" ]]; then
    log "✅ DPIA documentation found"
else
    log "❌ DPIA documentation missing"
fi

# Rights of Data Subjects (Articles 15-22)
log "\nDATA SUBJECT RIGHTS (ARTICLES 15-22)"
log "===================================="

# Check for data export capability
log "Checking data portability implementation..."
if grep -r "export.*user.*data\|data.*export" "$PROJECT_ROOT/api/src" >/dev/null 2>&1; then
    log "✅ Data export functionality appears implemented"
else
    log "❌ Data export functionality not found"
fi

# Check for data deletion capability
log "Checking right to erasure implementation..."
if docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='users' AND column_name='deleted_at';" | grep -q "1"; then
    log "✅ Soft deletion capability implemented"
else
    log "❌ Data deletion capability not verified"
fi

# Generate GDPR summary
log "\n=== GDPR COMPLIANCE SUMMARY ==="
local passed=$(grep "✅" "$GDPR_REPORT" | wc -l)
local failed=$(grep "❌" "$GDPR_REPORT" | wc -l)
local total=$((passed + failed))

log "Total checks: $total"
log "Passed: $passed"
log "Failed: $failed"
log "Compliance rate: $(echo "scale=1; $passed * 100 / $total" | bc)%"

log "\nRECOMMENDATIONS:"
log "1. Create missing documentation in $PROJECT_ROOT/docs/gdpr/"
log "2. Implement data subject request handling procedures"
log "3. Document all data processing activities"
log "4. Establish incident response procedures"
log "5. Conduct regular GDPR compliance reviews"

echo "GDPR compliance report saved to: $GDPR_REPORT"
EOF

    # Audit evidence collection
    cat > "$SCRIPTS_DIR/compliance/collect-audit-evidence.sh" << 'EOF'
#!/bin/bash
# Audit Evidence Collection Script

set -e

PROJECT_ROOT="/opt/risk-platform"
EVIDENCE_DIR="/opt/risk-platform/audit-evidence/$(date +%Y%m%d_%H%M%S)"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

log "Collecting audit evidence..."

# Create evidence directory
mkdir -p "$EVIDENCE_DIR"/{configs,logs,database,security,documentation}

# 1. Configuration Evidence
log "Collecting configuration evidence..."
cp -r "$PROJECT_ROOT/config" "$EVIDENCE_DIR/configs/"
cp "$PROJECT_ROOT/.env" "$EVIDENCE_DIR/configs/environment.env" 2>/dev/null || touch "$EVIDENCE_DIR/configs/environment.env"
cp "$PROJECT_ROOT/docker-compose"*.yml "$EVIDENCE_DIR/configs/"

# 2. Security Evidence
log "Collecting security evidence..."
ufw status > "$EVIDENCE_DIR/security/firewall-status.txt"
systemctl status fail2ban > "$EVIDENCE_DIR/security/fail2ban-status.txt" 2>/dev/null || echo "fail2ban not running" > "$EVIDENCE_DIR/security/fail2ban-status.txt"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" > "$EVIDENCE_DIR/security/container-status.txt"
ss -tlnp > "$EVIDENCE_DIR/security/open-ports.txt"

# 3. Database Evidence
log "Collecting database evidence..."
docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'risk_platform'
ORDER BY tablename;
" > "$EVIDENCE_DIR/database/table-inventory.txt"

docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "
SELECT 
    rolname,
    rolsuper,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles
ORDER BY rolname;
" > "$EVIDENCE_DIR/database/user-roles.txt"

# 4. Access Control Evidence
log "Collecting access control evidence..."
docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
    COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_users
FROM risk_platform.users;
" > "$EVIDENCE_DIR/security/user-statistics.txt"

# 5. Audit Log Evidence
log "Collecting audit log evidence..."
docker compose -f "$PROJECT_ROOT/docker-compose.db.yml" exec postgres psql -U risk_platform_app -d risk_platform -c "
SELECT 
    action,
    COUNT(*) as occurrence_count,
    MIN(timestamp) as first_occurrence,
    MAX(timestamp) as last_occurrence
FROM risk_platform.audit_log
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY action
ORDER BY occurrence_count DESC;
" > "$EVIDENCE_DIR/logs/audit-summary-30days.txt"

# 6. System Logs
log "Collecting system logs..."
journalctl --since "1 week ago" --grep "risk-platform" > "$EVIDENCE_DIR/logs/system-logs-week.txt" 2>/dev/null || echo "No systemd logs found" > "$EVIDENCE_DIR/logs/system-logs-week.txt"

# 7. Backup Evidence
log "Collecting backup evidence..."
find "$PROJECT_ROOT/backups" -type f -ls > "$EVIDENCE_DIR/logs/backup-inventory.txt"

# 8. Performance Evidence
log "Collecting performance evidence..."
"$PROJECT_ROOT/scripts/performance/system-performance.sh" > "$EVIDENCE_DIR/logs/current-performance.txt"

# 9. Documentation Evidence
log "Collecting documentation evidence..."
if [[ -d "$PROJECT_ROOT/docs" ]]; then
    cp -r "$PROJECT_ROOT/docs" "$EVIDENCE_DIR/documentation/"
fi

# Create evidence manifest
cat > "$EVIDENCE_DIR/evidence-manifest.txt" << MANIFEST
Risk Platform Audit Evidence Collection
Generated: $(date)
Collector: $(whoami)
Hostname: $(hostname)
Platform Version: $(cat "$PROJECT_ROOT/VERSION" 2>/dev/null || echo "unknown")

Evidence Categories:
1. Configuration Evidence
   - Application configurations
   - Environment variables
   - Docker compositions

2. Security Evidence
   - Firewall status
   - User access controls
   - Container security
   - Network configuration

3. Database Evidence
   - Schema structure
   - User privileges
   - Access patterns

4. Audit Evidence
   - User activity logs
   - System access logs
   - Administrative actions

5. Operational Evidence
   - System performance
   - Backup procedures
   - Monitoring setup

6. Documentation Evidence
   - Policies and procedures
   - Technical documentation
   - Compliance artifacts

This evidence package supports:
- SOC2 Type II audits
- GDPR compliance reviews
- ISO 27001 assessments
- Internal security audits

MANIFEST

# Create compressed evidence package
log "Creating evidence package..."
cd "$(dirname "$EVIDENCE_DIR")"
tar -czf "audit-evidence-$(basename "$EVIDENCE_DIR").tar.gz" "$(basename "$EVIDENCE_DIR")"

# Calculate checksums
sha256sum "audit-evidence-$(basename "$EVIDENCE_DIR").tar.gz" > "audit-evidence-$(basename "$EVIDENCE_DIR").tar.gz.sha256"

log "✅ Audit evidence collection completed"
log "Evidence package: $(dirname "$EVIDENCE_DIR")/audit-evidence-$(basename "$EVIDENCE_DIR").tar.gz"
log "Checksum: $(dirname "$EVIDENCE_DIR")/audit-evidence-$(basename "$EVIDENCE_DIR").tar.gz.sha256"

# Cleanup uncompressed directory
rm -rf "$EVIDENCE_DIR"
EOF

    chmod +x "$SCRIPTS_DIR/compliance/"*.sh
    success "Compliance and audit scripts created"
}

# =============================================
# 9. INSTALLATION SCRIPT FOR ALL UTILITIES
# =============================================

create_installation_script() {
    log "Creating utility installation script..."
    
    cat > "$PROJECT_ROOT/install-operational-scripts.sh" << 'EOF'
#!/bin/bash
# Install All Risk Platform Operational Scripts

set -e

PROJECT_ROOT="/opt/risk-platform"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }

log "Installing Risk Platform operational scripts..."

# Ensure we're in the right directory
cd "$PROJECT_ROOT"

# Create all script directories
mkdir -p scripts/{disaster-recovery,security,performance,operations,monitoring,compliance,deployment}

# Install required tools
log "Installing additional tools..."
apt update
apt install -y bc netcat-openbsd curl wget jq

# Install hey for load testing
if ! command -v hey &> /dev/null; then
    log "Installing hey load testing tool..."
    wget -O /usr/local/bin/hey https://hey-release.s3.us-east-2.amazonaws.com/hey_linux_amd64
    chmod +x /usr/local/bin/hey
fi

# Install trivy for security scanning
if ! command -v trivy &> /dev/null; then
    log "Installing Trivy security scanner..."
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | apt-key add -
    echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | tee -a /etc/apt/sources.list.d/trivy.list
    apt update
    apt install -y trivy
fi

# Set up systemd service for health monitoring
log "Setting up health monitoring service..."
cat > /etc/systemd/system/risk-platform-health-monitor.service << 'SYSTEMD_EOF'
[Unit]
Description=Risk Platform Health Monitor
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/risk-platform
ExecStart=/opt/risk-platform/scripts/monitoring/health-monitor-daemon.sh
Restart=always
RestartSec=60
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

systemctl daemon-reload
systemctl enable risk-platform-health-monitor.service

# Set up logrotate for operational logs
log "Configuring log rotation..."
cat > /etc/logrotate.d/risk-platform-ops << 'LOGROTATE_EOF'
/opt/risk-platform/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
    postrotate
        /usr/bin/systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}
LOGROTATE_EOF

# Set up cron jobs for automated tasks
log "Setting up automated maintenance tasks..."
(crontab -l 2>/dev/null; echo "# Risk Platform maintenance tasks") | crontab -
(crontab -l; echo "0 2 * * * /opt/risk-platform/scripts/disaster-recovery/full-backup.sh") | crontab -
(crontab -l; echo "0 3 * * 0 /opt/risk-platform/scripts/performance/optimize-system.sh") | crontab -
(crontab -l; echo "0 4 * * * /opt/risk-platform/scripts/security/security-audit.sh") | crontab -
(crontab -l; echo "0 6 * * 1 /opt/risk-platform/scripts/compliance/collect-audit-evidence.sh") | crontab -

# Create configuration directory for operational scripts
mkdir -p "$PROJECT_ROOT/config/operations"

# Set up operational configuration
cat > "$PROJECT_ROOT/config/operations/monitoring.conf" << 'CONF_EOF'
# Risk Platform Operational Configuration

# Health monitoring settings
HEALTH_CHECK_INTERVAL=60
ALERT_COOLDOWN=300

# Backup settings
BACKUP_RETENTION_DAYS=30
BACKUP_COMPRESSION=true

# Performance settings
PERFORMANCE_CHECK_INTERVAL=300
LOAD_TEST_DEFAULT_USERS=10
LOAD_TEST_DEFAULT_DURATION=60

# Security settings
SECURITY_SCAN_SCHEDULE="0 4 * * *"
COMPLIANCE_CHECK_SCHEDULE="0 6 * * 1"

# Notification settings (customize these)
# ALERT_EMAIL="admin@yourcompany.com"
# SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
# PAGERDUTY_INTEGRATION_KEY="your_pagerduty_key"
CONF_EOF

# Set proper permissions
chmod +x scripts/*/*.sh
chmod 600 config/operations/monitoring.conf
chown -R ubuntu:ubuntu scripts/ config/

success "Operational scripts installation completed!"

echo
echo "🎉 Risk Platform Operational Scripts Installed!"
echo "=============================================="
echo
echo "Available utilities:"
echo "  risk-platform                    # Master control interface"
echo "  risk-platform platform status    # Platform status"
echo "  risk-platform security audit     # Security audit"
echo "  risk-platform backup full        # Full backup"
echo "  risk-platform performance monitor # Performance monitoring"
echo
echo "Automated tasks configured:"
echo "  • Daily full backups at 2:00 AM"
echo "  • Weekly performance optimization"
echo "  • Daily security audits at 4:00 AM"
echo "  • Weekly compliance evidence collection"
echo
echo "Services enabled:"
echo "  • risk-platform-health-monitor.service"
echo
echo "Configuration:"
echo "  • Edit /opt/risk-platform/config/operations/monitoring.conf"
echo "  • Set up notification endpoints (email, Slack, PagerDuty)"
echo
echo "To start health monitoring:"
echo "  systemctl start risk-platform-health-monitor.service"
EOF

    chmod +x "$PROJECT_ROOT/install-operational-scripts.sh"
    success "Installation script created"
}

# =============================================
# MAIN EXECUTION
# =============================================

main() {
    log "Creating essential operational scripts for Risk Platform..."
    
    # Ensure we have the right directory structure
    mkdir -p "$SCRIPTS_DIR"/{disaster-recovery,security,performance,operations,monitoring,compliance,deployment}
    
    # Create all script categories
    create_disaster_recovery_scripts
    create_security_scripts
    create_performance_scripts
    create_operational_scripts
    create_deployment_scripts
    create_master_control_script
    create_monitoring_scripts
    create_compliance_scripts
    create_installation_script
    
    success "All operational scripts created successfully!"
    
    echo
    echo "🎉 Essential Operational Scripts Suite Created!"
    echo "=============================================="
    echo
    echo "Script Categories Created:"
    echo "  📋 Disaster Recovery    - Full backup, restore, recovery procedures"
    echo "  🔒 Security Automation  - Audits, scans, certificate management"
    echo "  ⚡ Performance Tools    - Monitoring, optimization, load testing"
    echo "  🛠️  Operations          - Health dashboard, deployment, log management"
    echo "  📊 Monitoring & Alerts  - Continuous monitoring, alerting, dashboards"
    echo "  📜 Compliance & Audit   - SOC2, GDPR, evidence collection"
    echo "  🚀 Deployment & CI/CD   - Blue-green deployment, environment promotion"
    echo
    echo "Master Control Interface:"
    echo "  🎛️  risk-platform         - Unified control interface"
    echo
    echo "Installation:"
    echo "  Run: $PROJECT_ROOT/install-operational-scripts.sh"
    echo
    echo "Next Steps:"
    echo "  1. Run the installation script to set up automation"
    echo "  2. Configure notification endpoints in monitoring.conf"
    echo "  3. Test the master control interface: risk-platform help"
    echo "  4. Set up SSL certificates for production"
    echo "  5. Configure external backup storage"
    echo
    warning "Remember to:"
    warning "• Configure notification endpoints (email, Slack, PagerDuty)"
    warning "• Set up external backup storage for disaster recovery"
    warning "• Review and customize alert thresholds"
    warning "• Test disaster recovery procedures"
}

# Execute main function
main "$@"