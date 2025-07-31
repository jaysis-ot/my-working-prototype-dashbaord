#!/bin/bash
# =========================================================================
# Risk Platform Automation Script - VPS Edition
# =========================================================================
# This script automates the deployment of Risk Platform on a VPS/cloud server
# with special considerations for public-facing, internet-accessible deployments.
#
# VPS-specific features:
# - Preserves RDP access (port 3389) for Windows remote administration
# - Enhanced security for internet-facing servers
# - IP whitelisting for administrative access
# - Geographic IP filtering options
# - Basic DDoS protection with rate limiting
# - Cloud provider compatibility
# - Enhanced logging for internet-exposed services
#
# Usage: ./automation-script-vps-complete.sh [OPTIONS]
#   Options:
#     --system        Configure system and security only
#     --docker        Install Docker only
#     --structure     Create project structure only
#     --services      Set up API and monitoring services only
#     --deploy        Deploy all services only
#     --all           Execute all steps
#     --help          Display this help message
#
# Version: 1.0.0
# Date: 2025-07-31
# =========================================================================

# Strict error handling
set -e

# =============================================
# CONFIGURATION
# =============================================

SCRIPT_VERSION="1.0.0"
PROJECT_ROOT="/opt/risk-platform"
LOG_DIR="${PROJECT_ROOT}/logs"
AUTOMATION_LOG="${LOG_DIR}/automation.log"
STATE_FILE="${PROJECT_ROOT}/.automation_state"
TEMP_DIR="/tmp/risk-platform-automation"

# VPS-specific configuration
ADMIN_IPS=""                    # Comma-separated list of IPs for admin access
GEO_RESTRICT=""                 # Comma-separated list of country codes to allow
CLOUD_PROVIDER="auto"           # auto, aws, digitalocean, azure, gcp, vultr
RDP_PORT="3389"                 # Default RDP port
ENABLE_RDP=true                 # Enable RDP access
RATE_LIMIT=true                 # Enable rate limiting
ENHANCED_LOGGING=true           # Enable enhanced logging
MONITORING_PORT="9090"          # Prometheus port
GRAFANA_PORT="3001"             # Grafana port

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# =============================================
# LOGGING FUNCTIONS
# =============================================

# Ensure log directory exists
mkdir -p "${LOG_DIR}"
mkdir -p "${TEMP_DIR}"

# Initialize log file
echo "===== RISK PLATFORM VPS AUTOMATION $(date) =====" > "${AUTOMATION_LOG}"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

critical() {
    echo -e "${RED}${BOLD}[$(date +'%Y-%m-%d %H:%M:%S')] CRITICAL: $1${NC}" | tee -a "${AUTOMATION_LOG}"
    exit 1
}

section() {
    echo -e "\n${BOLD}${BLUE}=== $1 ===${NC}" | tee -a "${AUTOMATION_LOG}"
}

info() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

# =============================================
# UTILITY FUNCTIONS
# =============================================

save_state() {
    local state=$1
    mkdir -p "$(dirname "${STATE_FILE}")"
    echo "${state}" > "${STATE_FILE}"
    log "Automation state saved: ${state}"
}

get_state() {
    if [[ -f "${STATE_FILE}" ]]; then
        cat "${STATE_FILE}"
    else
        echo "not_started"
    fi
}

confirm() {
    local message=$1
    local default=${2:-n}
    
    local prompt
    if [[ "${default}" == "y" ]]; then
        prompt="Y/n"
    else
        prompt="y/N"
    fi
    
    read -p "${message} [${prompt}]: " -n 1 -r response
    echo
    
    response=${response:-$default}
    if [[ "${response}" =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Detect cloud provider automatically
detect_cloud_provider() {
    log "Detecting cloud provider..."
    
    if [[ "${CLOUD_PROVIDER}" != "auto" ]]; then
        log "Using specified cloud provider: ${CLOUD_PROVIDER}"
        return
    fi
    
    # Check for AWS
    if curl -s --connect-timeout 2 http://169.254.169.254/latest/meta-data/ > /dev/null; then
        CLOUD_PROVIDER="aws"
        log "Detected cloud provider: AWS"
        return
    fi
    
    # Check for DigitalOcean
    if curl -s --connect-timeout 2 http://169.254.169.254/metadata/v1/id > /dev/null; then
        CLOUD_PROVIDER="digitalocean"
        log "Detected cloud provider: DigitalOcean"
        return
    fi
    
    # Check for Azure
    if curl -s --connect-timeout 2 -H "Metadata:true" http://169.254.169.254/metadata/instance?api-version=2021-02-01 > /dev/null; then
        CLOUD_PROVIDER="azure"
        log "Detected cloud provider: Azure"
        return
    fi
    
    # Check for GCP
    if curl -s --connect-timeout 2 -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/ > /dev/null; then
        CLOUD_PROVIDER="gcp"
        log "Detected cloud provider: GCP"
        return
    fi
    
    # Default to generic VPS
    CLOUD_PROVIDER="generic"
    log "No specific cloud provider detected, using generic VPS configuration"
}

# Get public IP address
get_public_ip() {
    curl -s https://api.ipify.org || curl -s https://ifconfig.me || curl -s https://icanhazip.com
}

# =============================================
# PREREQUISITE CHECKING
# =============================================

check_prerequisites() {
    section "Checking Prerequisites"
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        critical "This script must be run as root or with sudo"
    fi
    
    # Check Ubuntu version
    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        if [[ "$ID" != "ubuntu" ]]; then
            warning "This script is optimized for Ubuntu. Found: $ID"
            if ! confirm "Continue with non-Ubuntu OS?" "n"; then
                exit 0
            fi
        fi
        
        if [[ "$VERSION_ID" != "24.04" && "$VERSION_ID" != "22.04" && "$VERSION_ID" != "20.04" ]]; then
            warning "This script is optimized for Ubuntu 20.04/22.04/24.04 LTS. Found: $VERSION_ID"
            if ! confirm "Continue with non-LTS Ubuntu version?" "n"; then
                exit 0
            fi
        fi
    else
        critical "Cannot detect operating system"
    fi
    
    # Check hardware requirements
    CPU_CORES=$(nproc)
    TOTAL_RAM=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    DISK_SPACE=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    
    log "System resources: ${CPU_CORES} CPU cores, ${TOTAL_RAM}GB RAM, ${DISK_SPACE}GB disk"
    
    if [[ $CPU_CORES -lt 2 ]]; then
        warning "Low CPU core count. Recommended: 4, Found: $CPU_CORES"
        if ! confirm "Continue with limited CPU resources?" "n"; then
            exit 0
        fi
    fi
    
    if [[ $TOTAL_RAM -lt 4 ]]; then
        warning "Low memory. Recommended: 8GB, Found: ${TOTAL_RAM}GB"
        if ! confirm "Continue with limited memory?" "n"; then
            exit 0
        fi
    fi
    
    if [[ $DISK_SPACE -lt 20 ]]; then
        warning "Low disk space. Recommended: 50GB, Found: ${DISK_SPACE}GB"
        if ! confirm "Continue with limited disk space?" "n"; then
            exit 0
        fi
    fi
    
    # Check internet connectivity
    if ! curl -s --connect-timeout 5 https://github.com > /dev/null; then
        critical "Internet connectivity check failed. Please ensure you have internet access."
    fi
    
    # Detect cloud provider
    detect_cloud_provider
    
    # Get public IP
    PUBLIC_IP=$(get_public_ip)
    log "Public IP address: ${PUBLIC_IP}"
    
    # Check if RDP port is already in use
    if [[ "${ENABLE_RDP}" == "true" ]]; then
        if ss -tln | grep -q ":${RDP_PORT}"; then
            log "RDP port ${RDP_PORT} is already in use, which is good for Windows VPS"
        else
            warning "RDP port ${RDP_PORT} is not currently in use. If this is a Windows VPS, ensure RDP is properly configured."
        fi
    fi
    
    # Create required directories
    mkdir -p "${PROJECT_ROOT}"
    mkdir -p "${LOG_DIR}"
    
    success "Prerequisite checks completed"
}

# =============================================
# SYSTEM HARDENING MODULE
# =============================================

setup_system_hardening() {
    section "System Hardening"
    log "Starting system hardening..."
    save_state "system_start"
    
    # Backup SSH configuration
    if [[ ! -f /etc/ssh/sshd_config.backup ]]; then
        cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
        success "SSH configuration backed up"
    else
        info "SSH backup already exists, skipping"
    fi
    
    # Update system packages
    log "Updating system packages..."
    apt update && apt upgrade -y
    
    # Install essential security packages
    log "Installing security packages..."
    apt install -y \
        ufw \
        fail2ban \
        rkhunter \
        lynis \
        unattended-upgrades \
        apt-listchanges \
        auditd \
        apparmor \
        apparmor-utils \
        iptables-persistent \
        ipset \
        geoip-bin \
        geoip-database \
        net-tools \
        tcpdump \
        rsyslog
    
    # VPS-specific: Install enhanced monitoring tools
    log "Installing VPS monitoring tools..."
    apt install -y \
        htop \
        iotop \
        iftop \
        nload \
        nmon \
        logwatch \
        sysstat
    
    # Configure UFW (Uncomplicated Firewall)
    log "Configuring firewall for VPS environment..."
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow 22/tcp comment 'SSH'
    
    # Allow HTTP/HTTPS
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # VPS-specific: Allow RDP if enabled
    if [[ "${ENABLE_RDP}" == "true" ]]; then
        log "Enabling RDP access on port ${RDP_PORT}..."
        ufw allow ${RDP_PORT}/tcp comment 'RDP Access'
    fi
    
    # VPS-specific: Allow monitoring ports with restricted access
    log "Configuring restricted access to monitoring ports..."
    if [[ -n "${ADMIN_IPS}" ]]; then
        IFS=',' read -ra IPS <<< "${ADMIN_IPS}"
        for ip in "${IPS[@]}"; do
            ufw allow from ${ip} to any port ${MONITORING_PORT} proto tcp comment 'Prometheus - Admin Only'
            ufw allow from ${ip} to any port ${GRAFANA_PORT} proto tcp comment 'Grafana - Admin Only'
        done
    else
        # If no admin IPs specified, restrict to localhost and warn
        warning "No admin IPs specified. Monitoring ports will only be accessible locally."
        ufw allow from 127.0.0.1 to any port ${MONITORING_PORT} proto tcp comment 'Prometheus - Localhost Only'
        ufw allow from 127.0.0.1 to any port ${GRAFANA_PORT} proto tcp comment 'Grafana - Localhost Only'
    fi
    
    # VPS-specific: Add IP whitelisting for administrative access
    if [[ -n "${ADMIN_IPS}" ]]; then
        log "Setting up IP whitelisting for administrative access..."
        IFS=',' read -ra IPS <<< "${ADMIN_IPS}"
        for ip in "${IPS[@]}"; do
            ufw allow from ${ip} to any port 22 proto tcp comment 'SSH - Admin Only'
        done
    fi
    
    # Only enable if not already enabled to avoid disconnection
    if [[ $(ufw status | grep -c "Status: active") -eq 0 ]]; then
        log "Enabling UFW firewall..."
        echo "y" | ufw enable
    fi
    
    # VPS-specific: Configure rate limiting for DDoS protection
    if [[ "${RATE_LIMIT}" == "true" ]]; then
        log "Setting up rate limiting for DDoS protection..."
        
        # Create iptables rules for rate limiting
        cat > /etc/iptables/rules.v4 << EOF
*filter
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
:RATE-LIMIT - [0:0]

# Rate limiting chain
-A INPUT -p tcp --dport 80 -j RATE-LIMIT
-A INPUT -p tcp --dport 443 -j RATE-LIMIT
-A RATE-LIMIT -m hashlimit --hashlimit-name HTTP --hashlimit-above 200/minute --hashlimit-burst 100 --hashlimit-mode srcip --hashlimit-htable-expire 300000 -j DROP

COMMIT
EOF
        
        # Apply iptables rules
        iptables-restore < /etc/iptables/rules.v4
        
        # Make sure iptables-persistent is enabled
        systemctl enable netfilter-persistent
    fi
    
    # VPS-specific: Geographic IP filtering
    if [[ -n "${GEO_RESTRICT}" ]]; then
        log "Setting up geographic IP filtering..."
        
        # Install required packages if not already installed
        apt install -y ipset geoip-bin geoip-database
        
        # Create ipset for allowed countries
        ipset create allowed-countries hash:net
        
        # Add countries to ipset
        IFS=',' read -ra COUNTRIES <<< "${GEO_RESTRICT}"
        for country in "${COUNTRIES[@]}"; do
            log "Adding country ${country} to allowed list..."
            for ip in $(geoiplookup -f /usr/share/GeoIP/GeoIP.dat "${country}" | grep "${country}" | sed -e 's/.*: \([0-9.]*\) - \([0-9.]*\).*/\1-\2/'); do
                ipset add allowed-countries ${ip}
            done
        done
        
        # Create iptables rules for geo-filtering
        iptables -A INPUT -m set --match-set allowed-countries src -j ACCEPT
        iptables -A INPUT -p tcp --dport 80 -j DROP
        iptables -A INPUT -p tcp --dport 443 -j DROP
        
        # Save iptables rules
        iptables-save > /etc/iptables/rules.v4
    fi
    
    # Configure fail2ban with VPS-specific settings
    log "Configuring fail2ban with enhanced settings for VPS..."
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 86400  # 24 hours
findtime = 600   # 10 minutes
maxretry = 3     # 3 retries
banaction = ufw

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 300
bantime = 86400

[rdp]
enabled = ${ENABLE_RDP}
port = ${RDP_PORT}
filter = rdp
logpath = /var/log/auth.log
maxretry = 3
findtime = 300
bantime = 86400

[http-auth]
enabled = true
port = http,https
filter = apache-auth
logpath = /var/log/apache*/*error.log
maxretry = 3
findtime = 300
bantime = 3600
EOF
    
    # Create custom RDP filter for fail2ban
    cat > /etc/fail2ban/filter.d/rdp.conf << EOF
[Definition]
failregex = ^.*failed login attempt by user .*from <HOST>.*$
            ^.*authentication failure; .* from=<HOST>.*$
ignoreregex =
EOF
    
    systemctl restart fail2ban
    
    # Configure SSH hardening with VPS-specific settings
    log "Hardening SSH configuration for VPS environment..."
    cat > /etc/ssh/sshd_config.d/99-risk-platform.conf << EOF
# Risk Platform SSH Hardening for VPS
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowTcpForwarding no
PermitEmptyPasswords no
MaxStartups 10:30:60
LoginGraceTime 30
EOF
    
    # Restart SSH service
    systemctl restart sshd
    
    # VPS-specific: Enhanced logging configuration
    if [[ "${ENHANCED_LOGGING}" == "true" ]]; then
        log "Setting up enhanced logging for VPS environment..."
        
        # Configure rsyslog for better logging
        cat > /etc/rsyslog.d/99-risk-platform.conf << EOF
# Risk Platform Enhanced Logging
# Log authentication attempts
auth,authpriv.*                 /var/log/auth.log
# Log all kernel messages
kern.*                          /var/log/kern.log
# Log all mail messages
mail.*                          /var/log/mail.log
# Log cron jobs
cron.*                          /var/log/cron.log
# Log emergency messages
*.emerg                         :omusrmsg:*
# Log firewall messages
:msg, contains, "UFW BLOCK"     /var/log/ufw.log
# Log SSH connections
:msg, contains, "sshd"          /var/log/ssh.log
# Log RDP connections
:msg, contains, "rdp"           /var/log/rdp.log
EOF
        
        # Configure logrotate for log management
        cat > /etc/logrotate.d/risk-platform << EOF
/var/log/auth.log
/var/log/kern.log
/var/log/mail.log
/var/log/cron.log
/var/log/ufw.log
/var/log/ssh.log
/var/log/rdp.log
{
    rotate 14
    daily
    missingok
    notifempty
    compress
    delaycompress
    sharedscripts
    postrotate
        /usr/lib/rsyslog/rsyslog-rotate
    endscript
}
EOF
        
        # Restart rsyslog
        systemctl restart rsyslog
    fi
    
    # Configure automatic security updates
    log "Setting up automatic security updates..."
    cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
Unattended-Upgrade::Automatic-Reboot "false";
EOF
    
    # Run Lynis audit
    log "Running security audit with Lynis..."
    lynis audit system --quick > "${LOG_DIR}/lynis-audit.log"
    
    # VPS-specific: Set up basic intrusion detection
    log "Setting up basic intrusion detection..."
    apt install -y rkhunter
    rkhunter --update
    rkhunter --propupd
    
    # Create daily security scan
    cat > /etc/cron.daily/security-scan << EOF
#!/bin/bash
rkhunter --check --skip-keypress --report-warnings-only > /var/log/rkhunter-daily.log
lynis audit system --quick --no-colors > /var/log/lynis-daily.log
EOF
    chmod +x /etc/cron.daily/security-scan
    
    # VPS-specific: Create a network fallback script
    log "Creating network fallback script..."
    mkdir -p "${PROJECT_ROOT}/scripts"
    cat > "${PROJECT_ROOT}/scripts/network-fallback.sh" << EOF
#!/bin/bash
# Network fallback script for emergency access
# This script will reset the firewall to allow basic access if you get locked out

# Reset UFW
ufw reset

# Allow essential services
ufw allow 22/tcp  # SSH
ufw allow ${RDP_PORT}/tcp  # RDP
ufw default allow outgoing
ufw default deny incoming

# Enable UFW
echo "y" | ufw enable

# Restart networking
systemctl restart networking

echo "Network fallback completed. Basic access restored."
EOF
    chmod +x "${PROJECT_ROOT}/scripts/network-fallback.sh"
    
    success "System hardening completed"
    save_state "system_complete"
}

# =============================================
# DOCKER INSTALLATION MODULE
# =============================================

setup_docker() {
    section "Docker Installation"
    log "Starting Docker installation..."
    save_state "docker_start"
    
    # Install prerequisites
    log "Installing Docker prerequisites..."
    apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    log "Adding Docker GPG key..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up Docker repository
    log "Setting up Docker repository..."
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    log "Installing Docker Engine..."
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker
    log "Starting and enabling Docker service..."
    systemctl start docker
    systemctl enable docker
    
    # VPS-specific: Configure Docker security
    log "Configuring Docker security for VPS environment..."
    
    # Create Docker daemon configuration
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "iptables": false,
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true
}
EOF
    
    # Restart Docker
    systemctl restart docker
    
    # VPS-specific: Configure Docker network security
    log "Configuring Docker network security..."
    
    # Create Docker network with restricted access
    docker network create --driver bridge risk-platform-network
    
    # Add UFW rules for Docker
    ufw allow in on docker0 from 172.17.0.0/16 to 172.17.0.0/16
    ufw reload
    
    success "Docker installation completed"
    save_state "docker_complete"
}

# =============================================
# PROJECT STRUCTURE MODULE
# =============================================

setup_project_structure() {
    section "Project Structure Setup"
    log "Setting up project structure..."
    save_state "structure_start"
    
    # Create main directories
    log "Creating project directories..."
    mkdir -p "${PROJECT_ROOT}/{api,database,docker-compose,monitoring,scripts,secrets,logs,config}"
    mkdir -p "${PROJECT_ROOT}/database/{data,backups,init}"
    mkdir -p "${PROJECT_ROOT}/monitoring/{prometheus,grafana,alertmanager}"
    mkdir -p "${PROJECT_ROOT}/config/{nginx,environments,integrations}"
    mkdir -p "${PROJECT_ROOT}/secrets/{database,api,monitoring}"
    
    # VPS-specific: Create additional directories
    mkdir -p "${PROJECT_ROOT}/scripts/{backup,security,monitoring,recovery}"
    mkdir -p "${PROJECT_ROOT}/logs/{security,access,performance}"
    
    # Set proper permissions
    log "Setting secure permissions..."
    chmod 750 "${PROJECT_ROOT}/secrets"
    chmod 750 "${PROJECT_ROOT}/database"
    chmod 750 "${PROJECT_ROOT}/scripts"
    
    # Generate random passwords and save them securely
    log "Generating secure passwords..."
    
    # Database passwords
    openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/database/postgres_password.txt"
    openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/database/postgres_root_password.txt"
    openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/database/redis_password.txt"
    
    # API keys
    openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/api/jwt_secret.txt"
    openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/api/api_key.txt"
    
    # Set proper permissions for secret files
    chmod 600 "${PROJECT_ROOT}/secrets/database/"*
    chmod 600 "${PROJECT_ROOT}/secrets/api/"*
    
    # VPS-specific: Create backup script
    log "Creating VPS backup script..."
    cat > "${PROJECT_ROOT}/scripts/backup/backup-vps.sh" << EOF
#!/bin/bash
# VPS Backup Script
# This script creates a full backup of the Risk Platform

BACKUP_DIR="${PROJECT_ROOT}/database/backups"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\${BACKUP_DIR}/risk_platform_full_\${DATE}.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "\${BACKUP_DIR}"

# Stop services
docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" down

# Backup data
tar -czf "\${BACKUP_FILE}" \\
    "${PROJECT_ROOT}/database/data" \\
    "${PROJECT_ROOT}/config" \\
    "${PROJECT_ROOT}/secrets"

# Start services
docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" up -d

echo "Backup completed: \${BACKUP_FILE}"
EOF
    chmod +x "${PROJECT_ROOT}/scripts/backup/backup-vps.sh"
    
    # VPS-specific: Create recovery script
    log "Creating VPS recovery script..."
    cat > "${PROJECT_ROOT}/scripts/recovery/recover-vps.sh" << EOF
#!/bin/bash
# VPS Recovery Script
# This script restores a full backup of the Risk Platform

if [ \$# -ne 1 ]; then
    echo "Usage: \$0 <backup_file>"
    exit 1
fi

BACKUP_FILE=\$1

if [ ! -f "\${BACKUP_FILE}" ]; then
    echo "Backup file not found: \${BACKUP_FILE}"
    exit 1
fi

# Stop services
docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" down

# Backup current data
DATE=\$(date +%Y%m%d_%H%M%S)
CURRENT_BACKUP="${PROJECT_ROOT}/database/backups/pre_restore_\${DATE}.tar.gz"
tar -czf "\${CURRENT_BACKUP}" \\
    "${PROJECT_ROOT}/database/data" \\
    "${PROJECT_ROOT}/config" \\
    "${PROJECT_ROOT}/secrets"

# Restore from backup
tar -xzf "\${BACKUP_FILE}" -C /

# Start services
docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" up -d

echo "Recovery completed from: \${BACKUP_FILE}"
echo "Previous state backed up to: \${CURRENT_BACKUP}"
EOF
    chmod +x "${PROJECT_ROOT}/scripts/recovery/recover-vps.sh"
    
    # Create Docker Compose files
    log "Creating Docker Compose files..."
    
    # Database Docker Compose
    cat > "${PROJECT_ROOT}/docker-compose/db.yml" << EOF
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: risk-platform-postgres
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_root_password
      POSTGRES_USER: postgres
      POSTGRES_DB: postgres
    volumes:
      - ${PROJECT_ROOT}/database/data:/var/lib/postgresql/data
      - ${PROJECT_ROOT}/database/init:/docker-entrypoint-initdb.d
    networks:
      - risk-platform-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    secrets:
      - postgres_root_password

  redis:
    image: redis:alpine
    container_name: risk-platform-redis
    restart: unless-stopped
    command: redis-server --requirepass \${REDIS_PASSWORD}
    environment:
      REDIS_PASSWORD_FILE: /run/secrets/redis_password
    networks:
      - risk-platform-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    secrets:
      - redis_password

networks:
  risk-platform-network:
    external: true

secrets:
  postgres_root_password:
    file: ${PROJECT_ROOT}/secrets/database/postgres_root_password.txt
  redis_password:
    file: ${PROJECT_ROOT}/secrets/database/redis_password.txt
EOF
    
    # Main Docker Compose
    cat > "${PROJECT_ROOT}/docker-compose/base.yml" << EOF
version: '3.8'

services:
  api:
    image: node:16-alpine
    container_name: risk-platform-api
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ${PROJECT_ROOT}/api:/app
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: risk_platform
      DB_USER: risk_platform_app
      REDIS_HOST: redis
      REDIS_PORT: 6379
    networks:
      - risk-platform-network
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    secrets:
      - postgres_password
      - redis_password
      - jwt_secret

  nginx:
    image: nginx:alpine
    container_name: risk-platform-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ${PROJECT_ROOT}/config/nginx:/etc/nginx/conf.d
      - ${PROJECT_ROOT}/logs/nginx:/var/log/nginx
    networks:
      - risk-platform-network
    depends_on:
      - api
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  prometheus:
    image: prom/prometheus
    container_name: risk-platform-prometheus
    restart: unless-stopped
    ports:
      - "127.0.0.1:${MONITORING_PORT}:9090"
    volumes:
      - ${PROJECT_ROOT}/monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    networks:
      - risk-platform-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3

  grafana:
    image: grafana/grafana
    container_name: risk-platform-grafana
    restart: unless-stopped
    ports:
      - "127.0.0.1:${GRAFANA_PORT}:3000"
    volumes:
      - ${PROJECT_ROOT}/monitoring/grafana:/var/lib/grafana
    networks:
      - risk-platform-network
    depends_on:
      - prometheus
    environment:
      GF_SECURITY_ADMIN_PASSWORD__FILE: /run/secrets/grafana_admin_password
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    secrets:
      - grafana_admin_password

  alertmanager:
    image: prom/alertmanager
    container_name: risk-platform-alertmanager
    restart: unless-stopped
    ports:
      - "127.0.0.1:9093:9093"
    volumes:
      - ${PROJECT_ROOT}/monitoring/alertmanager:/etc/alertmanager
    networks:
      - risk-platform-network
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9093/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  risk-platform-network:
    external: true

volumes:
  prometheus_data:

secrets:
  postgres_password:
    file: ${PROJECT_ROOT}/secrets/database/postgres_password.txt
  redis_password:
    file: ${PROJECT_ROOT}/secrets/database/redis_password.txt
  jwt_secret:
    file: ${PROJECT_ROOT}/secrets/api/jwt_secret.txt
  grafana_admin_password:
    file: ${PROJECT_ROOT}/secrets/monitoring/grafana_admin_password.txt
EOF
    
    # VPS-specific: Create Nginx configuration with enhanced security
    log "Creating Nginx configuration with VPS security enhancements..."
    mkdir -p "${PROJECT_ROOT}/config/nginx"
    
    cat > "${PROJECT_ROOT}/config/nginx/default.conf" << EOF
# Risk Platform Nginx Configuration for VPS
# Enhanced security settings for public-facing deployment

# Rate limiting zone
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=10r/s;

# IP blocking for known bad actors
geo \$bad_actor {
    default 0;
    # Add known bad IP addresses here
    # 192.168.1.1 1;
}

server {
    listen 80;
    server_name _;
    
    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
    
    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}

server {
    listen 443 ssl;
    server_name _;
    
    # SSL configuration
    ssl_certificate /etc/nginx/conf.d/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/conf.d/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # HSTS (uncomment after you're certain everything works)
    # add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Block bad actors
    if (\$bad_actor) {
        return 403;
    }
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # API proxy with rate limiting
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://api:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint - no rate limiting
    location /health {
        proxy_pass http://api:3000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    # Static content
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    
    # VPS-specific: Create Prometheus configuration
    log "Creating Prometheus configuration..."
    mkdir -p "${PROJECT_ROOT}/monitoring/prometheus"
    
    cat > "${PROJECT_ROOT}/monitoring/prometheus/prometheus.yml" << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'api'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['api:3000']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
EOF
    
    # VPS-specific: Create Alertmanager configuration
    log "Creating Alertmanager configuration..."
    mkdir -p "${PROJECT_ROOT}/monitoring/alertmanager"
    
    cat > "${PROJECT_ROOT}/monitoring/alertmanager/alertmanager.yml" << EOF
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'email'

receivers:
  - name: 'email'
    email_configs:
      - to: 'admin@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alertmanager'
        auth_password: 'password'
        require_tls: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
EOF
    
    # VPS-specific: Create alert rules
    mkdir -p "${PROJECT_ROOT}/monitoring/prometheus/rules"
    
    cat > "${PROJECT_ROOT}/monitoring/prometheus/rules/alerts.yml" << EOF
groups:
  - name: instance
    rules:
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Instance {{ \$labels.instance }} down"
          description: "{{ \$labels.instance }} of job {{ \$labels.job }} has been down for more than 1 minute."

  - name: api
    rules:
      - alert: APIHighResponseTime
        expr: http_request_duration_seconds{quantile="0.9"} > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "API response time is above 1 second for 5 minutes."

  - name: system
    rules:
      - alert: HighCPULoad
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU load on {{ \$labels.instance }}"
          description: "CPU load is above 80% for 5 minutes."
          
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ \$labels.instance }}"
          description: "Memory usage is above 80% for 5 minutes."
          
      - alert: HighDiskUsage
        expr: node_filesystem_free_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100 < 20
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High disk usage on {{ \$labels.instance }}"
          description: "Disk usage is above 80% for 5 minutes."
EOF
    
    # Create Grafana admin password
    openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/monitoring/grafana_admin_password.txt"
    chmod 600 "${PROJECT_ROOT}/secrets/monitoring/grafana_admin_password.txt"
    
    # VPS-specific: Create environment configuration
    log "Creating environment configuration..."
    mkdir -p "${PROJECT_ROOT}/config/environments"
    
    cat > "${PROJECT_ROOT}/config/environments/production.env" << EOF
# Risk Platform Production Environment Configuration
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=risk_platform
DB_USER=risk_platform_app
DB_PASSWORD_FILE=/run/secrets/postgres_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD_FILE=/run/secrets/redis_password

# JWT
JWT_SECRET_FILE=/run/secrets/jwt_secret
JWT_EXPIRES_IN=8h

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://risk-platform.example.com
EOF
    
    # Create symbolic link for active environment
    ln -sf "${PROJECT_ROOT}/config/environments/production.env" "${PROJECT_ROOT}/.env"
    
    success "Project structure setup completed"
    save_state "structure_complete"
}

# =============================================
# API AND MONITORING SERVICES MODULE
# =============================================

setup_services() {
    section "API and Monitoring Services Setup"
    log "Setting up API and monitoring services..."
    save_state "services_start"
    
    # Create API directory structure
    log "Creating API directory structure..."
    mkdir -p "${PROJECT_ROOT}/api/{src,public,config,scripts}"
    mkdir -p "${PROJECT_ROOT}/api/src/{controllers,models,routes,middleware,services,utils}"
    
    # Create basic API files
    log "Creating basic API files..."
    
    # Package.json
    cat > "${PROJECT_ROOT}/api/package.json" << EOF
{
  "name": "risk-platform-api",
  "version": "1.0.0",
  "description": "Risk Platform API",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.17.3",
    "pg": "^8.7.3",
    "redis": "^4.0.6",
    "jsonwebtoken": "^8.5.1",
    "bcrypt": "^5.0.1",
    "cors": "^2.8.5",
    "helmet": "^5.0.2",
    "winston": "^3.7.2",
    "dotenv": "^16.0.0",
    "express-rate-limit": "^6.3.0",
    "prom-client": "^14.0.1"
  },
  "devDependencies": {
    "jest": "^27.5.1",
    "nodemon": "^2.0.15",
    "supertest": "^6.2.2"
  }
}
EOF
    
    # Main index.js
    cat > "${PROJECT_ROOT}/api/src/index.js" << EOF
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const { Pool } = require('pg');
const fs = require('fs');
const prometheus = require('prom-client');
const logger = require('./utils/logger');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Prometheus metrics
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

// HTTP request counter
const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    
    httpRequestDurationMicroseconds
      .labels(req.method, req.path, res.statusCode)
      .observe(durationInSeconds);
    
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: durationInSeconds,
      ip: req.ip
    });
  });
  
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || fs.readFileSync(process.env.DB_PASSWORD_FILE, 'utf8').trim()
});

// Redis connection
const redisClient = createClient({
  url: \`redis://\${process.env.REDIS_HOST}:\${process.env.REDIS_PORT}\`,
  password: process.env.REDIS_PASSWORD || fs.readFileSync(process.env.REDIS_PASSWORD_FILE, 'utf8').trim()
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    database: 'down',
    redis: 'down'
  };
  
  try {
    await pool.query('SELECT 1');
    healthcheck.database = 'up';
  } catch (error) {
    logger.error('Database health check failed', { error });
  }
  
  try {
    if (redisClient.isReady) {
      healthcheck.redis = 'up';
    }
  } catch (error) {
    logger.error('Redis health check failed', { error });
  }
  
  res.status(healthcheck.database === 'up' && healthcheck.redis === 'up' ? 200 : 500)
    .json(healthcheck);
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Start server
app.listen(port, () => {
  logger.info(\`Server is running on port \${port}\`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close server and database connections
  pool.end();
  redisClient.quit();
  
  process.exit(0);
});
EOF
    
    # Logger utility
    mkdir -p "${PROJECT_ROOT}/api/src/utils"
    cat > "${PROJECT_ROOT}/api/src/utils/logger.js" << EOF
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'risk-platform-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

module.exports = logger;
EOF
    
    # Create Grafana datasource
    mkdir -p "${PROJECT_ROOT}/monitoring/grafana/provisioning/datasources"
    cat > "${PROJECT_ROOT}/monitoring/grafana/provisioning/datasources/prometheus.yml" << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF
    
    # Create Grafana dashboard
    mkdir -p "${PROJECT_ROOT}/monitoring/grafana/provisioning/dashboards"
    cat > "${PROJECT_ROOT}/monitoring/grafana/provisioning/dashboards/dashboard.yml" << EOF
apiVersion: 1

providers:
  - name: 'Default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /var/lib/grafana/dashboards
EOF
    
    # Create Grafana dashboard directory
    mkdir -p "${PROJECT_ROOT}/monitoring/grafana/dashboards"
    
    # VPS-specific: Create enhanced monitoring dashboard
    cat > "${PROJECT_ROOT}/monitoring/grafana/dashboards/vps-monitoring.json" << EOF
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": 1,
  "links": [],
  "panels": [
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 2,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.3.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "http_request_duration_seconds_sum / http_request_duration_seconds_count",
          "interval": "",
          "legendFormat": "{{method}} {{route}}",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "API Response Time",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "s",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    },
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 4,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.3.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "rate(http_request_duration_seconds_count[5m])",
          "interval": "",
          "legendFormat": "{{method}} {{route}}",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "Request Rate",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "reqps",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    }
  ],
  "schemaVersion": 26,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "Risk Platform VPS Monitoring",
  "uid": "vps-monitoring",
  "version": 1
}
EOF
    
    # VPS-specific: Create Node Exporter service
    log "Creating Node Exporter service for VPS monitoring..."
    cat > "${PROJECT_ROOT}/docker-compose/node-exporter.yml" << EOF
version: '3.8'

services:
  node-exporter:
    image: prom/node-exporter:latest
    container_name: risk-platform-node-exporter
    restart: unless-stopped
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'
    ports:
      - "127.0.0.1:9100:9100"
    networks:
      - risk-platform-network

networks:
  risk-platform-network:
    external: true
EOF
    
    # VPS-specific: Create Nginx configuration for monitoring
    log "Creating Nginx configuration for secure monitoring access..."
    cat > "${PROJECT_ROOT}/config/nginx/monitoring.conf" << EOF
# Risk Platform Monitoring Nginx Configuration for VPS
# This configuration secures access to monitoring tools

server {
    listen 443 ssl;
    server_name monitoring.risk-platform.example.com;
    
    # SSL configuration
    ssl_certificate /etc/nginx/conf.d/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/conf.d/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # IP restriction - only allow admin IPs
    satisfy any;
    
    # If admin IPs are specified, restrict access
    # Otherwise, require authentication
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/conf.d/.htpasswd;
    
    # Prometheus
    location /prometheus/ {
        proxy_pass http://prometheus:9090/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Grafana
    location /grafana/ {
        proxy_pass http://grafana:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Alertmanager
    location /alertmanager/ {
        proxy_pass http://alertmanager:9093/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # Create basic auth for monitoring
    log "Creating basic auth for monitoring access..."
    if ! command -v htpasswd &> /dev/null; then
        apt install -y apache2-utils
    fi
    
    # Generate random password
    MONITORING_PASSWORD=$(openssl rand -base64 12)
    htpasswd -bc "${PROJECT_ROOT}/config/nginx/.htpasswd" admin "${MONITORING_PASSWORD}"
    
    log "Monitoring access credentials:"
    log "Username: admin"
    log "Password: ${MONITORING_PASSWORD}"
    log "Save these credentials securely!"
    
    # Save credentials to a secure file
    echo "Username: admin" > "${PROJECT_ROOT}/secrets/monitoring/credentials.txt"
    echo "Password: ${MONITORING_PASSWORD}" >> "${PROJECT_ROOT}/secrets/monitoring/credentials.txt"
    chmod 600 "${PROJECT_ROOT}/secrets/monitoring/credentials.txt"
    
    # VPS-specific: Create network security monitoring
    log "Setting up network security monitoring..."
    cat > "${PROJECT_ROOT}/scripts/security/network-monitor.sh" << EOF
#!/bin/bash
# Network Security Monitoring Script for VPS

LOG_DIR="${PROJECT_ROOT}/logs/security"
mkdir -p "\${LOG_DIR}"

# Log SSH connection attempts
grep "sshd" /var/log/auth.log | grep "$(date +%b\ %d)" > "\${LOG_DIR}/ssh-attempts-$(date +%Y%m%d).log"

# Log failed login attempts
grep "Failed password" /var/log/auth.log | grep "$(date +%b\ %d)" > "\${LOG_DIR}/failed-logins-$(date +%Y%m%d).log"

# Log successful logins
grep "Accepted" /var/log/auth.log | grep "$(date +%b\ %d)" > "\${LOG_DIR}/successful-logins-$(date +%Y%m%d).log"

# Log UFW blocked connections
grep "UFW BLOCK" /var/log/syslog | grep "$(date +%b\ %d)" > "\${LOG_DIR}/ufw-blocked-$(date +%Y%m%d).log"

# Log suspicious connections (optional)
if command -v tcpdump &> /dev/null; then
    tcpdump -i any -c 1000 port not 22 and port not 80 and port not 443 -w "\${LOG_DIR}/suspicious-traffic-$(date +%Y%m%d).pcap"
fi

# Check for brute force attempts
BRUTE_FORCE=\$(grep "Failed password" /var/log/auth.log | grep "$(date +%b\ %d)" | awk '{print \$11}' | sort | uniq -c | sort -nr | head -10)
echo "\${BRUTE_FORCE}" > "\${LOG_DIR}/brute-force-attempts-$(date +%Y%m%d).log"

# Alert if high number of failed attempts
HIGH_ATTEMPTS=\$(echo "\${BRUTE_FORCE}" | awk '\$1 > 10 {print}')
if [[ -n "\${HIGH_ATTEMPTS}" ]]; then
    echo "WARNING: High number of failed login attempts detected!" > "\${LOG_DIR}/security-alert-$(date +%Y%m%d%H%M%S).log"
    echo "\${HIGH_ATTEMPTS}" >> "\${LOG_DIR}/security-alert-$(date +%Y%m%d%H%M%S).log"
fi
EOF
    chmod +x "${PROJECT_ROOT}/scripts/security/network-monitor.sh"
    
    # Add to crontab
    log "Adding network monitoring to crontab..."
    (crontab -l 2>/dev/null; echo "0 * * * * ${PROJECT_ROOT}/scripts/security/network-monitor.sh") | crontab -
    
    success "API and monitoring services setup completed"
    save_state "services_complete"
}

# =============================================
# SERVICE DEPLOYMENT MODULE
# =============================================

deploy_services() {
    section "Service Deployment"
    log "Starting service deployment..."
    save_state "deploy_start"
    
    # Start Node Exporter
    log "Starting Node Exporter..."
    cd "${PROJECT_ROOT}"
    docker compose -f docker-compose/node-exporter.yml up -d
    
    # Start database services
    log "Starting database services..."
    docker compose -f docker-compose/db.yml up -d
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    for i in {1..30}; do
        if docker compose -f docker-compose/db.yml exec postgres pg_isready -U postgres; then
            log "Database is ready"
            break
        fi
        log "Waiting for database... (${i}/30)"
        sleep 2
    done
    
    # Initialize database
    log "Initializing database..."
    cat > "${PROJECT_ROOT}/database/init/01-init.sql" << EOF
-- Create application user and database
CREATE USER risk_platform_app WITH PASSWORD '$(cat ${PROJECT_ROOT}/secrets/database/postgres_password.txt)';
CREATE DATABASE risk_platform;
GRANT ALL PRIVILEGES ON DATABASE risk_platform TO risk_platform_app;

-- Connect to the risk_platform database
\c risk_platform

-- Create schema
CREATE SCHEMA risk_platform;
GRANT ALL ON SCHEMA risk_platform TO risk_platform_app;

-- Set search path
SET search_path TO risk_platform;

-- Create tables
CREATE TABLE risk_platform.organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE risk_platform.users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES risk_platform.organizations(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE risk_platform.threats (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES risk_platform.organizations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add sample data
INSERT INTO risk_platform.organizations (name, description)
VALUES ('Demo Organization', 'Demo organization for testing');

-- Password hash for 'password123'
INSERT INTO risk_platform.users (organization_id, email, password_hash, first_name, last_name, role)
VALUES (1, 'admin@example.com', '\$2b\$10\$3euPcmQFCiblsZeEu5s7p.9MUZWg8KqjLYx4vqG9BZ0PRAKmUfUFS', 'Admin', 'User', 'admin');
EOF
    
    # Apply database initialization
    log "Applying database initialization..."
    docker compose -f docker-compose/db.yml exec postgres psql -U postgres -f /docker-entrypoint-initdb.d/01-init.sql
    
    # Start main services
    log "Starting main services..."
    docker compose -f docker-compose/base.yml up -d
    
    # Create SSL directory
    mkdir -p "${PROJECT_ROOT}/config/nginx/ssl"
    
    # Generate self-signed certificate for initial setup
    log "Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "${PROJECT_ROOT}/config/nginx/ssl/key.pem" \
        -out "${PROJECT_ROOT}/config/nginx/ssl/cert.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=risk-platform.example.com"
    
    # VPS-specific: Set up Let's Encrypt (commented out by default)
    log "Setting up Let's Encrypt configuration (not enabled by default)..."
    cat > "${PROJECT_ROOT}/scripts/security/setup-letsencrypt.sh" << EOF
#!/bin/bash
# Let's Encrypt Setup Script for VPS

# This script sets up Let's Encrypt SSL certificates
# Uncomment and run this script when you have a proper domain name

# Check if domain is provided
if [ \$# -ne 1 ]; then
    echo "Usage: \$0 <domain>"
    exit 1
fi

DOMAIN=\$1
EMAIL="admin@\${DOMAIN}"

# Install certbot
apt update
apt install -y certbot python3-certbot-nginx

# Stop Nginx
docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" stop nginx

# Get certificate
certbot certonly --standalone -d \${DOMAIN} -d www.\${DOMAIN} --email \${EMAIL} --agree-tos --non-interactive

# Copy certificates
cp /etc/letsencrypt/live/\${DOMAIN}/fullchain.pem "${PROJECT_ROOT}/config/nginx/ssl/cert.pem"
cp /etc/letsencrypt/live/\${DOMAIN}/privkey.pem "${PROJECT_ROOT}/config/nginx/ssl/key.pem"

# Set permissions
chmod 644 "${PROJECT_ROOT}/config/nginx/ssl/cert.pem"
chmod 600 "${PROJECT_ROOT}/config/nginx/ssl/key.pem"

# Start Nginx
docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" start nginx

# Set up auto-renewal
echo "0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/\${DOMAIN}/fullchain.pem ${PROJECT_ROOT}/config/nginx/ssl/cert.pem && cp /etc/letsencrypt/live/\${DOMAIN}/privkey.pem ${PROJECT_ROOT}/config/nginx/ssl/key.pem && docker compose -f ${PROJECT_ROOT}/docker-compose/base.yml restart nginx" | crontab -

echo "Let's Encrypt SSL certificate installed for \${DOMAIN}"
EOF
    chmod +x "${PROJECT_ROOT}/scripts/security/setup-letsencrypt.sh"
    
    # Create basic HTML page
    mkdir -p "${PROJECT_ROOT}/api/public"
    cat > "${PROJECT_ROOT}/api/public/index.html" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f5f5f5;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
        }
        p {
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Risk Platform</h1>
        <p>The platform is running successfully.</p>
        <p>VPS Edition</p>
    </div>
</body>
</html>
EOF
    
    # Copy HTML to Nginx directory
    mkdir -p "${PROJECT_ROOT}/config/nginx/html"
    cp "${PROJECT_ROOT}/api/public/index.html" "${PROJECT_ROOT}/config/nginx/html/"
    
    # VPS-specific: Create backup script
    log "Creating backup script..."
    cat > "${PROJECT_ROOT}/scripts/backup/backup.sh" << EOF
#!/bin/bash
# Daily backup script for Risk Platform VPS

# Configuration
BACKUP_DIR="${PROJECT_ROOT}/database/backups"
RETENTION_DAYS=7
DATE=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "\${BACKUP_DIR}"

# Database backup
echo "Creating database backup..."
docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec -T postgres pg_dump -U postgres risk_platform > "\${BACKUP_DIR}/risk_platform_\${DATE}.sql"

# Compress backup
gzip "\${BACKUP_DIR}/risk_platform_\${DATE}.sql"

# Config backup
echo "Creating configuration backup..."
tar -czf "\${BACKUP_DIR}/config_\${DATE}.tar.gz" "${PROJECT_ROOT}/config"

# Clean up old backups
echo "Cleaning up old backups..."
find "\${BACKUP_DIR}" -name "risk_platform_*.sql.gz" -mtime +\${RETENTION_DAYS} -delete
find "\${BACKUP_DIR}" -name "config_*.tar.gz" -mtime +\${RETENTION_DAYS} -delete

echo "Backup completed at \$(date)"
EOF

# Make the backup script executable
chmod +x "${PROJECT_ROOT}/scripts/backup/backup.sh"

success "Backup script created"

success "Service deployment completed"
save_state "deploy_complete"
}

# =============================================
# HELPER / DISPATCH FUNCTIONS
# =============================================

help() {
    cat << USAGE
Risk-Platform VPS Automation  (version ${SCRIPT_VERSION})

Usage: \$0 [OPTIONS]
    --all        Run ALL steps (default if no option supplied)
    --system     System hardening & firewall only
    --docker     Docker installation only
    --structure  Create project structure only
    --services   API & monitoring services setup only
    --deploy     Deploy containers & finish install only
    --help       Show this help message

Examples:
    sudo \$0 --all
    sudo \$0 --system
USAGE
}

# Main dispatcher
main() {
    local arg=\${1:---all}

    case "\$arg" in
        --system)
            check_prerequisites
            setup_system_hardening
            ;;
        --docker)
            check_prerequisites
            setup_docker
            ;;
        --structure)
            check_prerequisites
            setup_project_structure
            ;;
        --services)
            check_prerequisites
            setup_services
            ;;
        --deploy)
            check_prerequisites
            deploy_services
            ;;
        --all)
            check_prerequisites
            setup_system_hardening
            setup_docker
            setup_project_structure
            setup_services
            deploy_services
            ;;
        --help|-h)
            help
            ;;
        *)
            echo "Unknown option: \$arg"
            help
            exit 1
            ;;
    esac
}

# ---- script entry point ----
main "$@"