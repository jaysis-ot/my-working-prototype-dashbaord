#!/bin/bash
# vps-complete-deployment.sh
# Comprehensive deployment script for Risk Platform on Ubuntu 24.04 VPS
# Version: 1.0.0
# Date: 2025-08-01
# This script consolidates all fixes discovered during previous deployment attempts

# ===== CONFIGURATION =====
# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Base directories
BASE_DIR="/opt/risk-platform"
CONFIG_DIR="${BASE_DIR}/config"
DATA_DIR="${BASE_DIR}/data"
LOGS_DIR="${BASE_DIR}/logs"
BACKUP_DIR="${BASE_DIR}/backups"
SCRIPTS_DIR="${BASE_DIR}/scripts"

# Docker Compose file
DOCKER_COMPOSE_FILE="${BASE_DIR}/docker-compose.yml"

# Logging
LOG_FILE="/var/log/risk-platform-deployment-$(date +%Y%m%d-%H%M%S).log"
DEPLOYMENT_STATE_FILE="/var/log/risk-platform-deployment-state.json"

# Firewall ports
SSH_PORT=22
HTTP_PORT=80
HTTPS_PORT=443
RDP_PORT=3389

# Database credentials
DB_USER="risk_platform"
DB_PASSWORD="risk_platform_password"
DB_NAME="risk_platform"

# Grafana credentials
GRAFANA_USER="admin"
GRAFANA_PASSWORD="admin"
GRAFANA_USER_ID=472
GRAFANA_GROUP_ID=0

# API placeholder
API_DIR="${BASE_DIR}/api"
API_PORT=3001

# ===== UTILITY FUNCTIONS =====

# Logging functions
log_info() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${BLUE}INFO:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] INFO: $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${GREEN}SUCCESS:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] SUCCESS: $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${YELLOW}WARNING:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] WARNING: $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${RED}ERROR:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ERROR: $1" >> "$LOG_FILE"
}

log_section() {
    echo -e "\n${CYAN}===== $1 =====${NC}"
    echo "===== $1 =====" >> "$LOG_FILE"
}

# Error handling
handle_error() {
    log_error "An error occurred on line $1"
    update_deployment_state "failed" "Error on line $1"
    
    if [ "$ALLOW_ERRORS" != "true" ]; then
        log_info "Deployment failed. Check the log file for details: $LOG_FILE"
        log_info "To continue from this point, run: $0 --continue"
        exit 1
    else
        log_warning "Continuing despite error (--force mode enabled)"
    fi
}

# Set up error handling
trap 'handle_error $LINENO' ERR

# Update deployment state
update_deployment_state() {
    local status=$1
    local message=$2
    local step=$CURRENT_STEP
    
    # Create state file if it doesn't exist
    if [ ! -f "$DEPLOYMENT_STATE_FILE" ]; then
        echo "{}" > "$DEPLOYMENT_STATE_FILE"
    fi
    
    # Update the state
    cat > "$DEPLOYMENT_STATE_FILE" <<EOF
{
  "status": "$status",
  "last_step": "$step",
  "message": "$message",
  "timestamp": "$(date +"%Y-%m-%d %H:%M:%S")"
}
EOF
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if a package is installed
package_installed() {
    dpkg -l "$1" | grep -q ^ii
}

# Run a command with error handling
run_command() {
    log_info "Running: $*"
    if "$@" >> "$LOG_FILE" 2>&1; then
        return 0
    else
        log_error "Command failed: $*"
        return 1
    fi
}

# Check if a service is running
service_running() {
    systemctl is-active --quiet "$1"
}

# Wait for a service to be ready
wait_for_service() {
    local service=$1
    local max_attempts=$2
    local delay=$3
    local attempt=1
    
    log_info "Waiting for $service to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if systemctl is-active --quiet "$service"; then
            log_success "$service is ready"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: $service is not ready yet, waiting ${delay}s..."
        sleep $delay
        attempt=$((attempt + 1))
    done
    
    log_error "$service did not become ready within the expected time"
    return 1
}

# Wait for a port to be open
wait_for_port() {
    local host=$1
    local port=$2
    local max_attempts=$3
    local delay=$4
    local attempt=1
    
    log_info "Waiting for port $port on $host to be open..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port"; then
            log_success "Port $port on $host is open"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: Port $port on $host is not open yet, waiting ${delay}s..."
        sleep $delay
        attempt=$((attempt + 1))
    done
    
    log_error "Port $port on $host did not open within the expected time"
    return 1
}

# Check if we're running in a cloud environment
detect_cloud_provider() {
    log_info "Detecting cloud provider..."
    
    # Check for AWS
    if curl -s http://169.254.169.254/latest/meta-data/ --connect-timeout 2 > /dev/null; then
        log_success "Detected cloud provider: AWS"
        echo "aws"
        return
    fi
    
    # Check for Azure
    if curl -s -H Metadata:true "http://169.254.169.254/metadata/instance?api-version=2021-02-01" --connect-timeout 2 > /dev/null; then
        log_success "Detected cloud provider: Azure"
        echo "azure"
        return
    fi
    
    # Check for Google Cloud
    if curl -s "http://metadata.google.internal/computeMetadata/v1/instance/" -H "Metadata-Flavor: Google" --connect-timeout 2 > /dev/null; then
        log_success "Detected cloud provider: Google Cloud"
        echo "gcp"
        return
    fi
    
    # Check for DigitalOcean
    if [ -f /etc/digitalocean ]; then
        log_success "Detected cloud provider: DigitalOcean"
        echo "digitalocean"
        return
    fi
    
    # If no specific cloud provider detected, assume generic VPS
    log_info "No specific cloud provider detected, assuming generic VPS"
    echo "generic"
}

# Get public IP address
get_public_ip() {
    curl -s https://api.ipify.org
}

# ===== DEPLOYMENT STEPS =====

# Step 1: System Prerequisites
step_system_prerequisites() {
    CURRENT_STEP="system_prerequisites"
    update_deployment_state "running" "Checking system prerequisites"
    
    log_section "System Prerequisites"
    
    # Check if running as root
    if [ "$(id -u)" -ne 0 ]; then
        log_error "This script must be run as root!"
        exit 1
    fi
    
    # Check Ubuntu version
    if ! grep -q "Ubuntu 24.04" /etc/os-release; then
        log_warning "This script is optimized for Ubuntu 24.04. You're running: $(cat /etc/os-release | grep PRETTY_NAME)"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment aborted by user"
            exit 1
        fi
    else
        log_success "Ubuntu 24.04 detected"
    fi
    
    # Detect cloud provider
    CLOUD_PROVIDER=$(detect_cloud_provider)
    PUBLIC_IP=$(get_public_ip)
    log_info "Public IP address: $PUBLIC_IP"
    
    # Check for minimum system requirements
    log_info "Checking minimum system requirements..."
    
    # CPU cores
    CPU_CORES=$(nproc)
    if [ "$CPU_CORES" -lt 2 ]; then
        log_warning "Minimum 2 CPU cores recommended, found: $CPU_CORES"
    else
        log_success "CPU cores: $CPU_CORES"
    fi
    
    # RAM
    TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$TOTAL_RAM" -lt 2048 ]; then
        log_warning "Minimum 2GB RAM recommended, found: ${TOTAL_RAM}MB"
    else
        log_success "RAM: ${TOTAL_RAM}MB"
    fi
    
    # Disk space
    DISK_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$DISK_SPACE" -lt 20 ]; then
        log_warning "Minimum 20GB free disk space recommended, found: ${DISK_SPACE}GB"
    else
        log_success "Free disk space: ${DISK_SPACE}GB"
    fi
    
    update_deployment_state "completed" "System prerequisites checked"
}

# Step 2: APT Source Cleanup
step_apt_source_cleanup() {
    CURRENT_STEP="apt_source_cleanup"
    update_deployment_state "running" "Cleaning up APT sources"
    
    log_section "APT Source Cleanup"
    
    # Backup sources.list
    log_info "Backing up APT sources..."
    cp /etc/apt/sources.list /etc/apt/sources.list.backup
    
    # Remove duplicate entries
    log_info "Removing duplicate APT sources..."
    awk '!a[$0]++' /etc/apt/sources.list > /tmp/sources.list.tmp
    mv /tmp/sources.list.tmp /etc/apt/sources.list
    
    # Fix any malformed sources
    log_info "Fixing malformed APT sources..."
    sed -i 's/^deb-src/# deb-src/g' /etc/apt/sources.list
    
    # Update package lists
    log_info "Updating package lists..."
    run_command apt-get update
    
    log_success "APT sources cleaned up"
    update_deployment_state "completed" "APT sources cleaned up"
}

# Step 3: System Update
step_system_update() {
    CURRENT_STEP="system_update"
    update_deployment_state "running" "Updating system packages"
    
    log_section "System Update"
    
    # Update package lists
    log_info "Updating package lists..."
    run_command apt-get update
    
    # Upgrade packages
    log_info "Upgrading packages..."
    run_command DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
    
    # Install essential packages
    log_info "Installing essential packages..."
    run_command apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        software-properties-common \
        net-tools \
        netcat \
        unzip \
        jq
    
    log_success "System updated"
    update_deployment_state "completed" "System packages updated"
}

# Step 4: System Hardening
step_system_hardening() {
    CURRENT_STEP="system_hardening"
    update_deployment_state "running" "Hardening system security"
    
    log_section "System Hardening"
    
    # SSH hardening
    log_info "Hardening SSH configuration..."
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Update SSH config
    cat > /etc/ssh/sshd_config.d/hardening.conf <<EOF
# SSH hardening configuration
PermitRootLogin prohibit-password
PasswordAuthentication no
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
AllowAgentForwarding no
AllowTcpForwarding no
PermitEmptyPasswords no
EOF
    
    # Restart SSH service
    log_info "Restarting SSH service..."
    systemctl restart sshd
    
    # Set up automatic security updates
    log_info "Setting up automatic security updates..."
    apt-get install -y unattended-upgrades
    
    cat > /etc/apt/apt.conf.d/20auto-upgrades <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
    
    # Configure firewall (UFW)
    log_info "Configuring firewall with UFW..."
    
    # Install UFW if not already installed
    if ! command_exists ufw; then
        log_info "Installing UFW..."
        run_command apt-get install -y ufw
    fi
    
    # Reset UFW to default
    log_info "Resetting UFW to default..."
    run_command ufw --force reset
    
    # Configure UFW
    log_info "Configuring UFW rules..."
    run_command ufw default deny incoming
    run_command ufw default allow outgoing
    
    # Allow SSH, HTTP, HTTPS, and RDP
    log_info "Allowing SSH (port $SSH_PORT)..."
    run_command ufw allow $SSH_PORT/tcp
    
    log_info "Allowing HTTP (port $HTTP_PORT)..."
    run_command ufw allow $HTTP_PORT/tcp
    
    log_info "Allowing HTTPS (port $HTTPS_PORT)..."
    run_command ufw allow $HTTPS_PORT/tcp
    
    log_info "Allowing RDP (port $RDP_PORT)..."
    run_command ufw allow $RDP_PORT/tcp
    
    # Enable UFW
    log_info "Enabling UFW..."
    run_command echo "y" | ufw enable
    
    # Install and configure Fail2ban
    log_info "Installing and configuring Fail2ban..."
    run_command apt-get install -y fail2ban
    
    # Configure Fail2ban
    cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = $SSH_PORT
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
EOF
    
    # Start Fail2ban
    log_info "Starting Fail2ban..."
    run_command systemctl enable fail2ban
    run_command systemctl restart fail2ban
    
    log_success "System hardening completed"
    update_deployment_state "completed" "System security hardened"
}

# Step 5: Docker Installation
step_docker_installation() {
    CURRENT_STEP="docker_installation"
    update_deployment_state "running" "Installing Docker"
    
    log_section "Docker Installation"
    
    # Check if Docker is already installed
    if command_exists docker && command_exists docker-compose; then
        log_info "Docker and Docker Compose are already installed"
        docker --version
        docker-compose --version
        
        # Make sure Docker service is running
        if ! service_running docker; then
            log_info "Starting Docker service..."
            run_command systemctl start docker
        fi
        
        log_success "Docker is running"
        update_deployment_state "completed" "Docker already installed"
        return
    fi
    
    # Install Docker
    log_info "Installing Docker..."
    
    # Remove old versions if they exist
    log_info "Removing old Docker versions if they exist..."
    run_command apt-get remove -y docker docker-engine docker.io containerd runc || true
    
    # Add Docker repository
    log_info "Adding Docker repository..."
    run_command curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package lists
    log_info "Updating package lists..."
    run_command apt-get update
    
    # Install Docker
    log_info "Installing Docker packages..."
    run_command apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Start Docker
    log_info "Starting Docker service..."
    run_command systemctl enable docker
    run_command systemctl start docker
    
    # Install Docker Compose
    log_info "Installing Docker Compose..."
    run_command curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    run_command chmod +x /usr/local/bin/docker-compose
    
    # Verify installation
    log_info "Verifying Docker installation..."
    if command_exists docker; then
        log_success "Docker installed successfully: $(docker --version)"
    else
        log_error "Docker installation failed"
        return 1
    fi
    
    if command_exists docker-compose; then
        log_success "Docker Compose installed successfully: $(docker-compose --version)"
    else
        log_error "Docker Compose installation failed"
        return 1
    fi
    
    # Test Docker
    log_info "Testing Docker with hello-world..."
    run_command docker run --rm hello-world
    
    log_success "Docker installation completed"
    update_deployment_state "completed" "Docker installed"
}

# Step 6: Directory Structure Setup
step_directory_structure() {
    CURRENT_STEP="directory_structure"
    update_deployment_state "running" "Setting up directory structure"
    
    log_section "Directory Structure Setup"
    
    # Create base directory
    log_info "Creating base directory: $BASE_DIR"
    run_command mkdir -p "$BASE_DIR"
    
    # Create subdirectories
    log_info "Creating configuration directory: $CONFIG_DIR"
    run_command mkdir -p "$CONFIG_DIR"
    
    log_info "Creating data directory: $DATA_DIR"
    run_command mkdir -p "$DATA_DIR"
    
    log_info "Creating logs directory: $LOGS_DIR"
    run_command mkdir -p "$LOGS_DIR"
    
    log_info "Creating backups directory: $BACKUP_DIR"
    run_command mkdir -p "$BACKUP_DIR"
    
    log_info "Creating scripts directory: $SCRIPTS_DIR"
    run_command mkdir -p "$SCRIPTS_DIR"
    
    # Create subdirectories for services
    log_info "Creating service directories..."
    run_command mkdir -p "$DATA_DIR/postgres"
    run_command mkdir -p "$DATA_DIR/api"
    run_command mkdir -p "$DATA_DIR/nginx"
    run_command mkdir -p "$DATA_DIR/monitoring/prometheus"
    run_command mkdir -p "$DATA_DIR/monitoring/grafana"
    run_command mkdir -p "$DATA_DIR/monitoring/alertmanager"
    
    # Set permissions
    log_info "Setting directory permissions..."
    run_command chmod -R 755 "$BASE_DIR"
    
    # Set Grafana directory permissions
    log_info "Setting Grafana directory permissions..."
    run_command chown -R $GRAFANA_USER_ID:$GRAFANA_GROUP_ID "$DATA_DIR/monitoring/grafana"
    
    log_success "Directory structure setup completed"
    update_deployment_state "completed" "Directory structure set up"
}

# Step 7: API Placeholder Setup
step_api_placeholder() {
    CURRENT_STEP="api_placeholder"
    update_deployment_state "running" "Setting up API placeholder"
    
    log_section "API Placeholder Setup"
    
    # Create API directory
    log_info "Creating API directory: $API_DIR"
    run_command mkdir -p "$API_DIR"
    
    # Create package.json
    log_info "Creating package.json..."
    cat > "$API_DIR/package.json" <<EOF
{
  "name": "risk-platform-api",
  "version": "1.0.0",
  "description": "Risk Platform API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF
    
    # Create server.js
    log_info "Creating server.js..."
    cat > "$API_DIR/server.js" <<EOF
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Risk Platform API' });
});

app.get('/status', (req, res) => {
  res.json({ 
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(\`API server running on port \${port}\`);
});
EOF
    
    # Create Dockerfile
    log_info "Creating Dockerfile..."
    cat > "$API_DIR/Dockerfile" <<EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
EOF
    
    log_success "API placeholder setup completed"
    update_deployment_state "completed" "API placeholder set up"
}

# Step 8: Docker Compose Setup
step_docker_compose() {
    CURRENT_STEP="docker_compose"
    update_deployment_state "running" "Setting up Docker Compose"
    
    log_section "Docker Compose Setup"
    
    # Create Docker Compose file
    log_info "Creating Docker Compose file: $DOCKER_COMPOSE_FILE"
    cat > "$DOCKER_COMPOSE_FILE" <<EOF
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: risk-platform-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - ${DATA_DIR}/postgres:/var/lib/postgresql/data
    networks:
      - risk-platform-network

  # API Service
  api:
    build: ${API_DIR}
    container_name: risk-platform-api
    restart: unless-stopped
    ports:
      - "127.0.0.1:${API_PORT}:3001"
    volumes:
      - ${API_DIR}:/app
      - ${LOGS_DIR}/api:/app/logs
    networks:
      - risk-platform-network
    depends_on:
      - postgres

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: risk-platform-nginx
    restart: unless-stopped
    ports:
      - "${HTTP_PORT}:80"
      - "${HTTPS_PORT}:443"
    volumes:
      - ${CONFIG_DIR}/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ${CONFIG_DIR}/nginx/conf.d:/etc/nginx/conf.d:ro
      - ${DATA_DIR}/nginx/html:/usr/share/nginx/html:ro
      - ${DATA_DIR}/nginx/certs:/etc/nginx/certs:ro
      - ${LOGS_DIR}/nginx:/var/log/nginx
    networks:
      - risk-platform-network
    depends_on:
      - api
      - grafana
      - prometheus

  # Prometheus Monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: risk-platform-prometheus
    restart: unless-stopped
    volumes:
      - ${CONFIG_DIR}/prometheus:/etc/prometheus
      - ${DATA_DIR}/monitoring/prometheus:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - risk-platform-network

  # Grafana Dashboard
  grafana:
    image: grafana/grafana:latest
    container_name: risk-platform-grafana
    restart: unless-stopped
    user: "${GRAFANA_USER_ID}:${GRAFANA_GROUP_ID}"
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    volumes:
      - ${DATA_DIR}/monitoring/grafana:/var/lib/grafana
    networks:
      - risk-platform-network
    depends_on:
      - prometheus

  # Alertmanager
  alertmanager:
    image: prom/alertmanager:latest
    container_name: risk-platform-alertmanager
    restart: unless-stopped
    volumes:
      - ${CONFIG_DIR}/alertmanager:/etc/alertmanager
      - ${DATA_DIR}/monitoring/alertmanager:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - risk-platform-network
    depends_on:
      - prometheus

networks:
  risk-platform-network:
    driver: bridge
EOF
    
    log_success "Docker Compose setup completed"
    update_deployment_state "completed" "Docker Compose set up"
}

# Step 9: Configuration Files Setup
step_configuration_files() {
    CURRENT_STEP="configuration_files"
    update_deployment_state "running" "Setting up configuration files"
    
    log_section "Configuration Files Setup"
    
    # Create Nginx configuration
    log_info "Creating Nginx configuration..."
    mkdir -p "$CONFIG_DIR/nginx/conf.d"
    
    # Main nginx.conf
    cat > "$CONFIG_DIR/nginx/nginx.conf" <<EOF
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    include /etc/nginx/conf.d/*.conf;
}
EOF
    
    # Default site configuration
    cat > "$CONFIG_DIR/nginx/conf.d/default.conf" <<EOF
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # API proxy
    location /api/ {
        proxy_pass http://api:3001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Monitoring dashboard
    location /monitoring/ {
        proxy_pass http://grafana:3000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Prometheus (protected)
    location /prometheus/ {
        auth_basic "Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://prometheus:9090/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Alertmanager (protected)
    location /alertmanager/ {
        auth_basic "Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://alertmanager:9093/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://api:3001/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Allow internal health checks
        allow 127.0.0.1;
        allow 172.16.0.0/12;
        deny all;
    }
}
EOF
    
    # Create default HTML page
    mkdir -p "$DATA_DIR/nginx/html"
    cat > "$DATA_DIR/nginx/html/index.html" <<EOF
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
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #2c3e50;
        }
        .links {
            margin-top: 20px;
        }
        .links a {
            display: inline-block;
            margin: 10px;
            padding: 10px 15px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .links a:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Risk Platform</h1>
        <p>Welcome to the Risk Platform. This is a placeholder page for the dashboard.</p>
        
        <div class="links">
            <a href="/api">API</a>
            <a href="/monitoring">Monitoring Dashboard</a>
        </div>
        
        <p>Status: <span id="status">Checking...</span></p>
    </div>
    
    <script>
        // Check API status
        fetch('/api/status')
            .then(response => response.json())
            .then(data => {
                document.getElementById('status').textContent = data.status || 'Operational';
            })
            .catch(error => {
                document.getElementById('status').textContent = 'Error connecting to API';
            });
    </script>
</body>
</html>
EOF
    
    # Create Prometheus configuration
    log_info "Creating Prometheus configuration..."
    mkdir -p "$CONFIG_DIR/prometheus"
    
    cat > "$CONFIG_DIR/prometheus/prometheus.yml" <<EOF
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
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "api"
    metrics_path: /metrics
    static_configs:
      - targets: ["api:3001"]

  - job_name: "node"
    static_configs:
      - targets: ["node-exporter:9100"]
EOF
    
    # Create Alertmanager configuration
    log_info "Creating Alertmanager configuration..."
    mkdir -p "$CONFIG_DIR/alertmanager"
    
    cat > "$CONFIG_DIR/alertmanager/alertmanager.yml" <<EOF
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://127.0.0.1:5001/'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
EOF
    
    log_success "Configuration files setup completed"
    update_deployment_state "completed" "Configuration files set up"
}

# Step 10: Backup Scripts Setup
step_backup_scripts() {
    CURRENT_STEP="backup_scripts"
    update_deployment_state "running" "Setting up backup scripts"
    
    log_section "Backup Scripts Setup"
    
    # Create backup scripts directory
    log_info "Creating backup scripts directory..."
    mkdir -p "$SCRIPTS_DIR/backup"
    
    # Create database backup script
    log_info "Creating database backup script..."
    cat > "$SCRIPTS_DIR/backup/database_backup.sh" <<EOF
#!/bin/bash
# Database backup script

# Configuration
BACKUP_DIR="${BACKUP_DIR}/database"
RETENTION_DAYS=7
TIMESTAMP=\$(date +%Y%m%d-%H%M%S)
CONTAINER_NAME="risk-platform-postgres"
DB_NAME="${DB_NAME}"
DB_USER="${DB_USER}"

# Create backup directory if it doesn't exist
mkdir -p "\$BACKUP_DIR"

# Backup database
echo "Backing up database \$DB_NAME..."
docker exec \$CONTAINER_NAME pg_dump -U \$DB_USER \$DB_NAME | gzip > "\$BACKUP_DIR/\$DB_NAME-\$TIMESTAMP.sql.gz"

# Check if backup was successful
if [ \$? -eq 0 ]; then
    echo "Backup completed successfully: \$BACKUP_DIR/\$DB_NAME-\$TIMESTAMP.sql.gz"
else
    echo "Backup failed!"
    exit 1
fi

# Remove old backups
echo "Removing backups older than \$RETENTION_DAYS days..."
find "\$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +\$RETENTION_DAYS -delete

echo "Backup process completed"
EOF
    
    # Create configuration backup script
    log_info "Creating configuration backup script..."
    cat > "$SCRIPTS_DIR/backup/config_backup.sh" <<EOF
#!/bin/bash
# Configuration backup script

# Configuration
BACKUP_DIR="${BACKUP_DIR}/config"
RETENTION_DAYS=30
TIMESTAMP=\$(date +%Y%m%d-%H%M%S)
CONFIG_DIR="${CONFIG_DIR}"

# Create backup directory if it doesn't exist
mkdir -p "\$BACKUP_DIR"

# Backup configuration
echo "Backing up configuration..."
tar -czf "\$BACKUP_DIR/config-\$TIMESTAMP.tar.gz" -C "\$(dirname \$CONFIG_DIR)" "\$(basename \$CONFIG_DIR)"

# Check if backup was successful
if [ \$? -eq 0 ]; then
    echo "Backup completed successfully: \$BACKUP_DIR/config-\$TIMESTAMP.tar.gz"
else
    echo "Backup failed!"
    exit 1
fi

# Remove old backups
echo "Removing backups older than \$RETENTION_DAYS days..."
find "\$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +\$RETENTION_DAYS -delete

echo "Backup process completed"
EOF
    
    # Create full backup script
    log_info "Creating full backup script..."
    cat > "$SCRIPTS_DIR/backup/full_backup.sh" <<EOF
#!/bin/bash
# Full backup script

# Configuration
BACKUP_DIR="${BACKUP_DIR}/full"
RETENTION_DAYS=60
TIMESTAMP=\$(date +%Y%m%d-%H%M%S)
BASE_DIR="${BASE_DIR}"

# Create backup directory if it doesn't exist
mkdir -p "\$BACKUP_DIR"

# Stop services before backup
echo "Stopping services for backup..."
cd "\$BASE_DIR" && docker-compose down

# Backup entire platform directory
echo "Creating full backup..."
tar -czf "\$BACKUP_DIR/risk-platform-full-\$TIMESTAMP.tar.gz" -C "\$(dirname \$BASE_DIR)" "\$(basename \$BASE_DIR)"

# Check if backup was successful
if [ \$? -eq 0 ]; then
    echo "Backup completed successfully: \$BACKUP_DIR/risk-platform-full-\$TIMESTAMP.tar.gz"
else
    echo "Backup failed!"
    exit 1
fi

# Start services after backup
echo "Starting services after backup..."
cd "\$BASE_DIR" && docker-compose up -d

# Remove old backups
echo "Removing backups older than \$RETENTION_DAYS days..."
find "\$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +\$RETENTION_DAYS -delete

echo "Backup process completed"
EOF
    
    # Make scripts executable
    log_info "Making backup scripts executable..."
    chmod +x "$SCRIPTS_DIR/backup/database_backup.sh"
    chmod +x "$SCRIPTS_DIR/backup/config_backup.sh"
    chmod +x "$SCRIPTS_DIR/backup/full_backup.sh"
    
    # Set up cron jobs for backups
    log_info "Setting up cron jobs for backups..."
    
    # Remove existing cron jobs for risk platform
    crontab -l | grep -v "risk-platform" | crontab -
    
    # Add new cron jobs
    (crontab -l ; echo "# Risk Platform Backup Jobs") | crontab -
    (crontab -l ; echo "0 2 * * * $SCRIPTS_DIR/backup/database_backup.sh >> $LOGS_DIR/database_backup.log 2>&1") | crontab -
    (crontab -l ; echo "0 3 * * * $SCRIPTS_DIR/backup/config_backup.sh >> $LOGS_DIR/config_backup.log 2>&1") | crontab -
    (crontab -l ; echo "0 4 * * 0 $SCRIPTS_DIR/backup/full_backup.sh >> $LOGS_DIR/full_backup.log 2>&1") | crontab -
    
    log_success "Backup scripts setup completed"
    update_deployment_state "completed" "Backup scripts set up"
}

# Step 11: Health Check Scripts Setup
step_health_check() {
    CURRENT_STEP="health_check"
    update_deployment_state "running" "Setting up health check scripts"
    
    log_section "Health Check Scripts Setup"
    
    # Create health check scripts directory
    log_info "Creating health check scripts directory..."
    mkdir -p "$SCRIPTS_DIR/monitoring"
    
    # Create health check script
    log_info "Creating health check script..."
    cat > "$SCRIPTS_DIR/monitoring/health_check.sh" <<EOF
#!/bin/bash
# Health check script

# Configuration
LOG_FILE="${LOGS_DIR}/health_check.log"
ALERT_EMAIL="admin@example.com"
SERVICES=("postgres" "api" "nginx" "prometheus" "grafana" "alertmanager")
CONTAINER_PREFIX="risk-platform-"

# Log function
log() {
    echo "[\$(date +"%Y-%m-%d %H:%M:%S")] \$1" >> "\$LOG_FILE"
    echo "[\$(date +"%Y-%m-%d %H:%M:%S")] \$1"
}

# Send alert function
send_alert() {
    local subject="\$1"
    local message="\$2"
    
    log "ALERT: \$subject - \$message"
    
    # Uncomment to enable email alerts
    # echo "\$message" | mail -s "Risk Platform Alert: \$subject" "\$ALERT_EMAIL"
}

# Check if Docker is running
log "Checking if Docker is running..."
if ! systemctl is-active --quiet docker; then
    send_alert "Docker not running" "Docker service is not running. Attempting to start..."
    systemctl start docker
    sleep 5
    
    if ! systemctl is-active --quiet docker; then
        send_alert "Docker failed to start" "Docker service failed to start. Manual intervention required."
        exit 1
    else
        log "Docker service started successfully"
    fi
else
    log "Docker is running"
fi

# Check each service
for service in "\${SERVICES[@]}"; do
    container="\${CONTAINER_PREFIX}\${service}"
    
    log "Checking \$container..."
    
    # Check if container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^\$container\$"; then
        send_alert "Container missing" "Container \$container does not exist. Deployment may be incomplete."
        continue
    fi
    
    # Check if container is running
    if ! docker ps --format '{{.Names}}' | grep -q "^\$container\$"; then
        send_alert "Container stopped" "Container \$container is not running. Attempting to start..."
        docker start "\$container"
        sleep 5
        
        if ! docker ps --format '{{.Names}}' | grep -q "^\$container\$"; then
            send_alert "Container failed to start" "Container \$container failed to start. Manual intervention required."
        else
            log "Container \$container started successfully"
        fi
    else
        log "Container \$container is running"
    fi
done

# Check API health
log "Checking API health..."
if ! curl -s http://localhost/api/health > /dev/null; then
    send_alert "API unhealthy" "API health check failed. Service may be down."
else
    log "API is healthy"
fi

# Check disk space
log "Checking disk space..."
disk_usage=\$(df -h / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ "\$disk_usage" -gt 80 ]; then
    send_alert "Disk space low" "Disk usage is at \${disk_usage}%. Consider cleaning up or expanding storage."
else
    log "Disk space is adequate (\${disk_usage}%)"
fi

# Check memory usage
log "Checking memory usage..."
memory_usage=\$(free | grep Mem | awk '{print \$3/\$2 * 100.0}' | cut -d. -f1)
if [ "\$memory_usage" -gt 80 ]; then
    send_alert "Memory usage high" "Memory usage is at \${memory_usage}%. Consider optimizing or adding more RAM."
else
    log "Memory usage is adequate (\${memory_usage}%)"
fi

log "Health check completed"
EOF
    
    # Make script executable
    log_info "Making health check script executable..."
    chmod +x "$SCRIPTS_DIR/monitoring/health_check.sh"
    
    # Set up cron job for health check
    log_info "Setting up cron job for health check..."
    (crontab -l ; echo "*/5 * * * * $SCRIPTS_DIR/monitoring/health_check.sh >> $LOGS_DIR/health_check.log 2>&1") | crontab -
    
    log_success "Health check scripts setup completed"
    update_deployment_state "completed" "Health check scripts set up"
}

# Step 12: Log Rotation Setup
step_log_rotation() {
    CURRENT_STEP="log_rotation"
    update_deployment_state "running" "Setting up log rotation"
    
    log_section "Log Rotation Setup"
    
    # Install logrotate if not already installed
    log_info "Installing logrotate..."
    run_command apt-get install -y logrotate
    
    # Create logrotate configuration
    log_info "Creating logrotate configuration..."
    cat > "/etc/logrotate.d/risk-platform" <<EOF
${LOGS_DIR}/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF
    
    log_success "Log rotation setup completed"
    update_deployment_state "completed" "Log rotation set up"
}

# Step 13: Platform Deployment
step_platform_deployment() {
    CURRENT_STEP="platform_deployment"
    update_deployment_state "running" "Deploying platform"
    
    log_section "Platform Deployment"
    
    # Navigate to base directory
    log_info "Navigating to base directory: $BASE_DIR"
    cd "$BASE_DIR"
    
    # Build and start services
    log_info "Building and starting services..."
    run_command docker-compose build
    run_command docker-compose up -d
    
    # Wait for services to start
    log_info "Waiting for services to start..."
    sleep 30
    
    # Check service status
    log_info "Checking service status..."
    docker-compose ps
    
    # Verify API is running
    log_info "Verifying API is running..."
    if curl -s http://localhost/api/status > /dev/null; then
        log_success "API is running"
    else
        log_warning "API may not be running properly"
    fi
    
    log_success "Platform deployment completed"
    update_deployment_state "completed" "Platform deployed"
}

# Step 14: Validation
step_validation() {
    CURRENT_STEP="validation"
    update_deployment_state "running" "Validating deployment"
    
    log_section "Validation"
    
    # Check Docker containers
    log_info "Checking Docker containers..."
    docker ps
    
    # Check if all expected containers are running
    log_info "Verifying all containers are running..."
    EXPECTED_CONTAINERS=("risk-platform-postgres" "risk-platform-api" "risk-platform-nginx" "risk-platform-prometheus" "risk-platform-grafana" "risk-platform-alertmanager")
    MISSING_CONTAINERS=()
    
    for container in "${EXPECTED_CONTAINERS[@]}"; do
        if ! docker ps --format '{{.Names}}' | grep -q "^$container$"; then
            MISSING_CONTAINERS+=("$container")
        fi
    done
    
    if [ ${#MISSING_CONTAINERS[@]} -eq 0 ]; then
        log_success "All expected containers are running"
    else
        log_warning "Some containers are not running: ${MISSING_CONTAINERS[*]}"
    fi
    
    # Check network connectivity
    log_info "Checking network connectivity..."
    
    # Check API
    log_info "Checking API..."
    if curl -s http://localhost/api/status > /dev/null; then
        log_success "API is accessible"
    else
        log_warning "API is not accessible"
    fi
    
    # Check Grafana
    log_info "Checking Grafana..."
    if curl -s http://localhost/monitoring > /dev/null; then
        log_success "Grafana is accessible"
    else
        log_warning "Grafana is not accessible"
    fi
    
    # Final validation
    log_info "Performing final validation..."
    
    # Check firewall status
    log_info "Checking firewall status..."
    ufw status
    
    # Check if RDP port is open
    log_info "Verifying RDP port is open..."
    if ufw status | grep -q "$RDP_PORT"; then
        log_success "RDP port $RDP_PORT is open"
    else
        log_warning "RDP port $RDP_PORT may not be open"
    fi
    
    # Get public IP
    PUBLIC_IP=$(get_public_ip)
    
    log_success "Validation completed"
    update_deployment_state "completed" "Deployment validated"
    
    # Display deployment summary
    log_section "Deployment Summary"
    
    echo -e "${GREEN}Risk Platform has been successfully deployed!${NC}"
    echo
    echo -e "${CYAN}Access URLs:${NC}"
    echo -e "Main Platform: ${YELLOW}http://$PUBLIC_IP${NC}"
    echo -e "Monitoring Dashboard: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
    echo -e "API Status: ${YELLOW}http://$PUBLIC_IP/api/status${NC}"
    echo
    echo -e "${CYAN}Credentials:${NC}"
    echo -e "Grafana: ${YELLOW}Username: $GRAFANA_USER, Password: $GRAFANA_PASSWORD${NC}"
    echo -e "Database: ${YELLOW}Username: $DB_USER, Password: $DB_PASSWORD, Database: $DB_NAME${NC}"
    echo
    echo -e "${CYAN}Important Directories:${NC}"
    echo -e "Base Directory: ${YELLOW}$BASE_DIR${NC}"
    echo -e "Configuration: ${YELLOW}$CONFIG_DIR${NC}"
    echo -e "Data: ${YELLOW}$DATA_DIR${NC}"
    echo -e "Logs: ${YELLOW}$LOGS_DIR${NC}"
    echo -e "Backups: ${YELLOW}$BACKUP_DIR${NC}"
    echo -e "Scripts: ${YELLOW}$SCRIPTS_DIR${NC}"
    echo
    echo -e "${CYAN}Automated Operations:${NC}"
    echo -e "Database Backups: ${YELLOW}Daily at 2 AM${NC}"
    echo -e "Configuration Backups: ${YELLOW}Daily at 3 AM${NC}"
    echo -e "Full Backups: ${YELLOW}Weekly on Sundays at 4 AM${NC}"
    echo -e "Health Checks: ${YELLOW}Every 5 minutes${NC}"
    echo -e "Log Rotation: ${YELLOW}Daily at 1 AM${NC}"
    echo
    echo -e "${CYAN}Next Steps:${NC}"
    echo -e "1. ${YELLOW}Customize the API placeholder with your actual Risk Platform code${NC}"
    echo -e "2. ${YELLOW}Set up proper SSL certificates for HTTPS${NC}"
    echo -e "3. ${YELLOW}Configure monitoring alerts in Grafana${NC}"
    echo -e "4. ${YELLOW}Test backup/restore procedures${NC}"
    echo
    echo -e "${GREEN}Deployment log saved to: $LOG_FILE${NC}"
}

# ===== MAIN FUNCTION =====

main() {
    # Parse command line arguments
    ALLOW_ERRORS=false
    CONTINUE_FROM=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                echo "Usage: $0 [options]"
                echo
                echo "Options:"
                echo "  --help, -h                 Show this help message"
                echo "  --force                    Continue despite errors"
                echo "  --continue [step]          Continue from a specific step"
                echo "  --skip [step]              Skip a specific step"
                echo
                echo "Available steps:"
                echo "  system_prerequisites       Check system prerequisites"
                echo "  apt_source_cleanup         Clean up APT sources"
                echo "  system_update              Update system packages"
                echo "  system_hardening           Harden system security"
                echo "  docker_installation        Install Docker"
                echo "  directory_structure        Set up directory structure"
                echo "  api_placeholder            Set up API placeholder"
                echo "  docker_compose             Set up Docker Compose"
                echo "  configuration_files        Set up configuration files"
                echo "  backup_scripts             Set up backup scripts"
                echo "  health_check               Set up health check scripts"
                echo "  log_rotation               Set up log rotation"
                echo "  platform_deployment        Deploy platform"
                echo "  validation                 Validate deployment"
                exit 0
                ;;
            --force)
                ALLOW_ERRORS=true
                shift
                ;;
            --continue)
                CONTINUE_FROM=$2
                shift 2
                ;;
            --skip)
                SKIP_STEPS="$SKIP_STEPS $2"
                shift 2
                ;;
            *)
                echo "Unknown option: $1"
                echo "Use --help to see available options"
                exit 1
                ;;
        esac
    done
    
    # Display header
    echo "==============================================="
    echo "  Risk Platform VPS Deployment - Version 1.0.0  "
    echo "==============================================="
    echo ""
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    chmod 640 "$LOG_FILE"
    
    log_info "Starting Risk Platform deployment"
    log_info "Deployment log: $LOG_FILE"
    
    # Initialize deployment state
    update_deployment_state "started" "Deployment started"
    
    # Define deployment steps
    STEPS=(
        "system_prerequisites"
        "apt_source_cleanup"
        "system_update"
        "system_hardening"
        "docker_installation"
        "directory_structure"
        "api_placeholder"
        "docker_compose"
        "configuration_files"
        "backup_scripts"
        "health_check"
        "log_rotation"
        "platform_deployment"
        "validation"
    )
    
    # Run deployment steps
    CONTINUE=false
    if [ -z "$CONTINUE_FROM" ]; then
        CONTINUE=true
    fi
    
    for step in "${STEPS[@]}"; do
        # Check if we should continue from this step
        if [ "$CONTINUE_FROM" = "$step" ]; then
            CONTINUE=true
        fi
        
        # Skip if not continuing yet
        if [ "$CONTINUE" = false ]; then
            log_info "Skipping step: $step (will continue from $CONTINUE_FROM)"
            continue
        fi
        
        # Skip if explicitly requested
        if [[ $SKIP_STEPS == *"$step"* ]]; then
            log_info "Skipping step: $step (explicitly skipped)"
            continue
        fi
        
        # Run the step
        CURRENT_STEP=$step
        "step_$step"
    done
    
    # Update deployment state
    update_deployment_state "completed" "Deployment completed successfully"
    
    log_success "Risk Platform deployment completed successfully!"
    
    return 0
}

# Run main function
main "$@"
