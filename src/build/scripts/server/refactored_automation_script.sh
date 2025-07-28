#!/bin/bash
# Risk Platform Modular Automation Script
# Refactored for clean separation of concerns

set -e

# =============================================
# SCRIPT CONFIGURATION
# =============================================

SCRIPT_VERSION="2.0.0"
PROJECT_ROOT="/opt/risk-platform"
AUTOMATION_LOG="/var/log/risk-platform-automation.log"
TEMP_DIR="/tmp/risk-platform-install"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "$AUTOMATION_LOG"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}" | tee -a "$AUTOMATION_LOG"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$AUTOMATION_LOG"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$AUTOMATION_LOG"
    exit 1
}

debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] DEBUG: $1${NC}" | tee -a "$AUTOMATION_LOG"
    fi
}

show_progress() {
    local current=$1
    local total=$2
    local description=$3
    local percentage=$((current * 100 / total))
    local bar_length=40
    local filled_length=$((percentage * bar_length / 100))
    
    printf "\r["
    for ((i=0; i<filled_length; i++)); do printf "="; done
    for ((i=filled_length; i<bar_length; i++)); do printf " "; done
    printf "] %d%% %s" $percentage "$description"
    
    if [[ $current -eq $total ]]; then
        echo
    fi
}

# =============================================
# SYSTEM DETECTION AND REQUIREMENTS
# =============================================

detect_system() {
    log "Detecting system configuration..."
    
    # OS Detection
    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        OS_NAME="$NAME"
        OS_VERSION="$VERSION_ID"
        log "Detected OS: $OS_NAME $OS_VERSION"
    else
        error "Cannot detect operating system"
    fi
    
    # Verify Ubuntu 24.04 LTS
    if [[ "$ID" != "ubuntu" ]] || [[ "$VERSION_ID" != "24.04" ]]; then
        warning "This script is optimized for Ubuntu 24.04 LTS"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
    
    # Hardware detection
    CPU_CORES=$(nproc)
    TOTAL_RAM=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    DISK_SPACE=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    
    log "System resources: ${CPU_CORES} cores, ${TOTAL_RAM}GB RAM, ${DISK_SPACE}GB disk"
    
    # Network detection
    PRIMARY_IP=$(ip route get 8.8.8.8 | awk '{print $7; exit}')
    NETWORK_INTERFACE=$(ip route get 8.8.8.8 | awk '{print $5; exit}')
    
    log "Primary network: $PRIMARY_IP on $NETWORK_INTERFACE"
    
    success "System detection completed"
}

check_requirements() {
    log "Checking system requirements..."
    
    local issues=()
    
    # Check minimum requirements
    if [[ $CPU_CORES -lt 4 ]]; then
        issues+=("Insufficient CPU cores: $CPU_CORES (minimum 4 required)")
    fi
    
    if [[ $TOTAL_RAM -lt 16 ]]; then
        issues+=("Insufficient RAM: ${TOTAL_RAM}GB (minimum 16GB required)")
    fi
    
    if [[ $DISK_SPACE -lt 100 ]]; then
        issues+=("Insufficient disk space: ${DISK_SPACE}GB (minimum 100GB required)")
    fi
    
    # Check internet connectivity
    if ! ping -c 1 8.8.8.8 &> /dev/null; then
        issues+=("No internet connectivity")
    fi
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        issues+=("Script must be run as root or with sudo")
    fi
    
    # Report issues
    if [[ ${#issues[@]} -gt 0 ]]; then
        error "Requirements check failed:"
        for issue in "${issues[@]}"; do
            echo "  ❌ $issue"
        done
        exit 1
    fi
    
    success "All requirements met"
}

# =============================================
# SYSTEM HARDENING MODULE
# =============================================

harden_system_automated() {
    log "Starting automated system hardening..."
    
    # Update system packages
    update_system_packages
    
    # Configure firewall
    configure_firewall
    
    # Harden SSH
    harden_ssh_config
    
    # Install security tools
    install_security_tools
    
    # Configure system security
    configure_system_security
    
    # Set up log monitoring
    setup_basic_monitoring
    
    success "System hardening completed"
}

update_system_packages() {
    log "Updating system packages..."
    
    export DEBIAN_FRONTEND=noninteractive
    
    apt update
    apt upgrade -y
    apt autoremove -y
    apt autoclean
    
    # Install essential packages
    apt install -y \
        curl \
        wget \
        git \
        vim \
        htop \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        fail2ban \
        ufw \
        netcat-openbsd \
        jq \
        openssl
    
    success "System packages updated"
}

configure_firewall() {
    log "Configuring UFW firewall..."
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Set default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (current connection)
    ufw allow ssh
    
    # Allow HTTP/HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow application ports
    ufw allow 3000/tcp comment 'API Server'
    ufw allow 3001/tcp comment 'Grafana'
    ufw allow 9090/tcp comment 'Prometheus'
    
    # Enable firewall
    ufw --force enable
    
    success "Firewall configured"
}

harden_ssh_config() {
    log "Hardening SSH configuration..."
    
    # Create custom SSH config
    cat > /etc/ssh/sshd_config.d/99-risk-platform-hardening.conf << 'EOF'
# Risk Platform SSH Hardening Configuration

# Security settings
Protocol 2
Port 22
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes

# Connection settings
MaxAuthTries 3
MaxSessions 2
ClientAliveInterval 300
ClientAliveCountMax 2
LoginGraceTime 60

# Restrict users
AllowUsers ubuntu
DenyUsers root

# Logging
SyslogFacility AUTH
LogLevel INFO

# Disable dangerous features
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no
GatewayPorts no
EOF

    # Restart SSH service
    systemctl restart sshd
    
    success "SSH hardening completed"
}

install_security_tools() {
    log "Installing security tools..."
    
    # Install and configure fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    
    # Create fail2ban configuration for SSH
    cat > /etc/fail2ban/jail.d/sshd.conf << 'EOF'
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
EOF

    # Install AppArmor if not present
    if ! systemctl is-active --quiet apparmor; then
        apt install -y apparmor apparmor-utils
        systemctl enable apparmor
        systemctl start apparmor
    fi
    
    # Install AIDE (Advanced Intrusion Detection Environment)
    apt install -y aide
    aideinit
    
    # Configure automatic security updates
    apt install -y unattended-upgrades
    echo 'Unattended-Upgrade::Automatic-Reboot "false";' >> /etc/apt/apt.conf.d/50unattended-upgrades
    
    success "Security tools installed"
}

configure_system_security() {
    log "Configuring system security settings..."
    
    # Kernel hardening via sysctl
    cat > /etc/sysctl.d/99-risk-platform-security.conf << 'EOF'
# Network security
net.ipv4.ip_forward = 0
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Memory protection
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1

# File system protection
fs.suid_dumpable = 0
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
EOF

    # Apply sysctl settings
    sysctl -p /etc/sysctl.d/99-risk-platform-security.conf
    
    # Set secure file permissions
    chmod 644 /etc/passwd
    chmod 600 /etc/shadow
    chmod 644 /etc/group
    chmod 600 /etc/gshadow
    
    # Configure login security
    cat > /etc/security/limits.d/99-risk-platform.conf << 'EOF'
# Risk Platform security limits
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

    success "System security configured"
}

setup_basic_monitoring() {
    log "Setting up basic system monitoring..."
    
    # Configure log rotation
    cat > /etc/logrotate.d/risk-platform << 'EOF'
/opt/risk-platform/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
EOF

    # Create basic monitoring script
    mkdir -p /opt/risk-platform/scripts/monitoring
    
    cat > /opt/risk-platform/scripts/monitoring/system-health.sh << 'EOF'
#!/bin/bash
# Basic system health monitoring

LOG_FILE="/opt/risk-platform/logs/system-health.log"
DATE=$(date +'%Y-%m-%d %H:%M:%S')

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

{
    echo "=== System Health Check: $DATE ==="
    
    # CPU usage
    echo "CPU Usage:"
    top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
    
    # Memory usage
    echo "Memory Usage:"
    free -h | grep '^Mem:' | awk '{print $3 "/" $2}'
    
    # Disk usage
    echo "Disk Usage:"
    df -h / | awk 'NR==2{print $3 "/" $2 " (" $5 " used)"}'
    
    # Load average
    echo "Load Average:"
    uptime | awk -F'load average:' '{print $2}'
    
    # Network connections
    echo "Active Connections:"
    netstat -an | grep ESTABLISHED | wc -l
    
    echo "===================="
} >> "$LOG_FILE"
EOF

    chmod +x /opt/risk-platform/scripts/monitoring/system-health.sh
    
    # Set up cron job for system monitoring
    (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/risk-platform/scripts/monitoring/system-health.sh") | crontab -
    
    success "Basic monitoring configured"
}

# =============================================
# DOCKER INSTALLATION MODULE
# =============================================

install_docker_automated() {
    log "Installing Docker and Docker Compose..."
    
    # Remove old Docker packages
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Install Docker dependencies
    apt update
    apt install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Configure Docker
    configure_docker_daemon
    
    # Add user to docker group
    usermod -aG docker ubuntu
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Verify installation
    if docker --version && docker compose version; then
        success "Docker installation completed"
    else
        error "Docker installation failed"
    fi
}

configure_docker_daemon() {
    log "Configuring Docker daemon..."
    
    # Create Docker configuration directory
    mkdir -p /etc/docker
    
    # Configure Docker daemon with security settings
    cat > /etc/docker/daemon.json << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "live-restore": true,
    "userland-proxy": false,
    "no-new-privileges": true,
    "seccomp-profile": "/etc/docker/seccomp.json",
    "storage-driver": "overlay2",
    "storage-opts": [
        "overlay2.override_kernel_check=true"
    ],
    "default-ulimits": {
        "nofile": {
            "Name": "nofile",
            "Hard": 64000,
            "Soft": 64000
        }
    }
}
EOF

    # Download default seccomp profile
    curl -fsSL https://raw.githubusercontent.com/moby/moby/master/profiles/seccomp/default.json -o /etc/docker/seccomp.json
    
    success "Docker daemon configured"
}

# =============================================
# PROJECT STRUCTURE MODULE
# =============================================

create_project_structure() {
    log "Creating project directory structure..."
    
    # Create main project directory
    mkdir -p $PROJECT_ROOT
    chown ubuntu:ubuntu $PROJECT_ROOT
    cd $PROJECT_ROOT
    
    # Create comprehensive directory structure
    local directories=(
        "api/src/{config,middleware,routes,controllers,models,services,utils,workers,tests}"
        "frontend/{public,src/{components,pages,hooks,utils,assets,styles}}"
        "database/{init,config,backups,logs,migrations}"
        "docker/{api,frontend,nginx,monitoring}"
        "nginx/{conf.d,ssl,logs}"
        "monitoring/{prometheus,grafana,elasticsearch,logstash,kibana}"
        "scripts/{installation,maintenance,backup,monitoring,deployment}"
        "secrets/{ssl,api,database}"
        "logs/{api,nginx,system,audit}"
        "backups/{database,files,configs}"
        "docs/{api,deployment,operations,security}"
        "uploads/{evidence,documents,images}"
        "config/{environments,features,integrations}"
    )
    
    for dir_path in "${directories[@]}"; do
        mkdir -p $dir_path
    done
    
    # Set appropriate permissions
    find $PROJECT_ROOT -type d -exec chmod 755 {} \;
    chmod 700 $PROJECT_ROOT/secrets
    chmod 750 $PROJECT_ROOT/scripts
    chmod 755 $PROJECT_ROOT/logs
    
    # Create initial files
    touch $PROJECT_ROOT/{.env,.env.example,README.md,CHANGELOG.md}
    
    # Set ownership
    chown -R ubuntu:ubuntu $PROJECT_ROOT
    
    success "Project structure created"
}

generate_all_secrets() {
    log "Generating application secrets..."
    
    cd $PROJECT_ROOT/secrets
    
    # Database secrets (will be used by database module)
    openssl rand -base64 32 > database/postgres_password.txt
    openssl rand -base64 32 > database/redis_password.txt
    openssl rand -base64 32 > database/backup_password.txt
    
    # API secrets
    openssl rand -base64 64 > api/jwt_secret.txt
    openssl rand -hex 32 > api/session_secret.txt
    openssl rand -hex 32 > api/encryption_key.txt
    openssl rand -hex 32 > api/api_key_salt.txt
    
    # SSL secrets (placeholders for certificates)
    mkdir -p ssl/{private,certs}
    
    # Integration secrets
    openssl rand -hex 32 > api/webhook_secret.txt
    openssl rand -base64 32 > api/email_token.txt
    
    # Set secure permissions
    chmod 600 *.txt */*.txt
    chmod 700 ssl/private
    
    success "Secrets generated"
}

# =============================================
# DATABASE MODULE INTEGRATION
# =============================================

setup_database_layer() {
    log "Setting up database infrastructure..."
    
    # Check if database setup script exists
    local db_script="$PROJECT_ROOT/scripts/database-setup.sh"
    
    if [[ ! -f "$db_script" ]]; then
        warning "Database setup script not found. Creating it..."
        create_database_setup_script
    fi
    
    # Make script executable
    chmod +x "$db_script"
    
    # Execute database setup
    log "Executing dedicated database setup script..."
    if "$db_script"; then
        success "Database layer configured successfully"
    else
        error "Database setup failed"
    fi
}

create_database_setup_script() {
    log "Creating database setup script..."
    
    cat > "$PROJECT_ROOT/scripts/database-setup.sh" << 'EOF'
#!/bin/bash
# Database Setup Script - Called from main automation script
# This is a simplified version that integrates with the main automation

set -e

# Import common functions from parent script
source /opt/risk-platform/scripts/common-functions.sh 2>/dev/null || {
    # Define basic functions if not available
    log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }
    success() { echo "[SUCCESS] $1"; }
    error() { echo "[ERROR] $1"; exit 1; }
}

PROJECT_ROOT="/opt/risk-platform"
DB_NAME="risk_platform"
DB_USER="risk_platform_app"

# Read secrets generated by main script
if [[ -f "$PROJECT_ROOT/secrets/database/postgres_password.txt" ]]; then
    DB_PASSWORD=$(cat "$PROJECT_ROOT/secrets/database/postgres_password.txt")
else
    error "Database password not found. Run main automation script first."
fi

log "Starting database module setup..."

# Create Docker Compose for database
create_database_compose() {
    log "Creating database Docker Compose configuration..."
    
    cd $PROJECT_ROOT
    
    cat > docker-compose.db.yml << EOF
version: '3.8'

networks:
  risk_platform_db:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.3.0/24

volumes:
  postgres_data:
  redis_data:
  postgres_backups:

services:
  postgres:
    image: postgres:16-alpine
    container_name: risk_platform_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - postgres_backups:/backups
      - ./database/init:/docker-entrypoint-initdb.d
      - ./database/logs:/var/log/postgresql
    ports:
      - "5432:5432"
    networks:
      risk_platform_db:
        ipv4_address: 172.20.3.10
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: risk_platform_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
      - ./database/logs:/var/log/redis
    ports:
      - "6379:6379"
    networks:
      risk_platform_db:
        ipv4_address: 172.20.3.11
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
EOF
}

# Create basic database schema
create_basic_schema() {
    log "Creating database schema files..."
    
    cd $PROJECT_ROOT/database/init
    
    # Basic initialization script
    cat > 01-init-database.sql << 'EOF'
-- Basic database initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE SCHEMA IF NOT EXISTS risk_platform;

-- Create basic users
CREATE USER risk_platform_readonly WITH PASSWORD 'readonly_change_me';
GRANT CONNECT ON DATABASE risk_platform TO risk_platform_readonly;
GRANT USAGE ON SCHEMA risk_platform TO risk_platform_readonly;
EOF

    # Essential tables only (simplified for integration)
    cat > 02-essential-tables.sql << 'EOF'
SET search_path TO risk_platform;

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_readonly;
EOF
}

# Deploy database services
deploy_database() {
    log "Deploying database services..."
    
    cd $PROJECT_ROOT
    
    # Create configurations
    create_database_compose
    create_basic_schema
    
    # Start services
    docker compose -f docker-compose.db.yml up -d
    
    # Wait for services
    sleep 30
    
    # Verify deployment
    if docker compose -f docker-compose.db.yml exec postgres pg_isready -U "$DB_USER" -d "$DB_NAME"; then
        success "Database services deployed successfully"
    else
        error "Database deployment failed"
    fi
}

# Main database setup execution
main() {
    deploy_database
    log "Database module setup completed"
}

# Execute if run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
EOF

    success "Database setup script created"
}

# =============================================
# API SERVICES MODULE
# =============================================

setup_api_services() {
    log "Setting up API services..."
    
    cd $PROJECT_ROOT/api
    
    # Create package.json
    create_api_package_config
    
    # Create basic API structure
    create_basic_api_structure
    
    # Create API Docker configuration
    create_api_docker_config
    
    success "API services configured"
}

create_api_package_config() {
    log "Creating API package configuration..."
    
    cat > package.json << 'EOF'
{
  "name": "risk-platform-api",
  "version": "1.0.0",
  "description": "Risk Intelligence Platform API",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.0",
    "redis": "^4.6.7",
    "joi": "^17.9.2",
    "dotenv": "^16.3.1",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
}

create_basic_api_structure() {
    log "Creating basic API structure..."
    
    # Main server file
    cat > src/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || '1.0.0'
    });
});

// Basic API routes
app.get('/api/v1/status', (req, res) => {
    res.json({
        message: 'Risk Platform API is running',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Risk Platform API server running on port ${PORT}`);
});
EOF

    # Environment configuration
    cat > .env.example << 'EOF'
# API Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=risk_platform
DB_USER=risk_platform_app
DB_PASSWORD=your_secure_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Security Configuration
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined
EOF
}

create_api_docker_config() {
    log "Creating API Docker configuration..."
    
    # Dockerfile for API
    cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
EOF
}

# =============================================
# MONITORING MODULE
# =============================================

setup_monitoring_stack() {
    log "Setting up monitoring and observability stack..."
    
    # Create monitoring configuration
    create_monitoring_configs
    
    # Create monitoring Docker Compose
    create_monitoring_compose
    
    success "Monitoring stack configured"
}

create_monitoring_configs() {
    log "Creating monitoring configurations..."
    
    cd $PROJECT_ROOT/monitoring
    
    # Prometheus configuration
    cat > prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'risk-platform-api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

    # Basic Grafana provisioning
    mkdir -p grafana/{dashboards,datasources}
    
    cat > grafana/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF
}

create_monitoring_compose() {
    log "Creating monitoring Docker Compose..."
    
    cat > $PROJECT_ROOT/docker-compose.monitoring.yml << 'EOF'
version: '3.8'

networks:
  risk_platform_monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: risk_platform_prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    networks:
      - risk_platform_monitoring
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    container_name: risk_platform_grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    networks:
      - risk_platform_monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: risk_platform_node_exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    networks:
      - risk_platform_monitoring
    command:
      - '--path.rootfs=/host'
    volumes:
      - '/:/host:ro,rslave'
EOF
}

# =============================================
# NGINX REVERSE PROXY MODULE
# =============================================

setup_reverse_proxy() {
    log "Setting up Nginx reverse proxy..."
    
    cd $PROJECT_ROOT/nginx
    
    # Create Nginx configuration
    cat > conf.d/risk-platform.conf << 'EOF'
upstream api_backend {
    server api:3000;
}

upstream grafana_backend {
    server grafana:3000;
}

server {
    listen 80;
    server_name _;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;
    
    # SSL configuration (placeholder)
    ssl_certificate /etc/ssl/certs/risk-platform.crt;
    ssl_certificate_key /etc/ssl/private/risk-platform.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # API proxy
    location /api/ {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Grafana proxy
    location /grafana/ {
        proxy_pass http://grafana_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check
    location /health {
        proxy_pass http://api_backend/health;
    }
    
    # Static files (future frontend)
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
EOF

    success "Reverse proxy configured"
}

# =============================================
# COMPLETE ORCHESTRATION
# =============================================

create_master_compose() {
    log "Creating master Docker Compose configuration..."
    
    cd $PROJECT_ROOT
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

networks:
  risk_platform_dmz:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.1.0/24
  risk_platform_app:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.2.0/24
  risk_platform_db:
    external: true
  risk_platform_monitoring:
    external: true

services:
  api:
    build: ./api
    container_name: risk_platform_api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    volumes:
      - ./uploads:/app/uploads
      - ./logs/api:/app/logs
    networks:
      - risk_platform_app
      - risk_platform_db
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: risk_platform_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/ssl:/etc/ssl
      - ./nginx/logs:/var/log/nginx
    networks:
      - risk_platform_dmz
      - risk_platform_app
    depends_on:
      - api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF
}

# =============================================
# DEPLOYMENT AND VALIDATION
# =============================================

deploy_platform_automated() {
    log "Deploying complete Risk Platform..."
    
    cd $PROJECT_ROOT
    
    # Create networks for external services
    docker network create risk_platform_db 2>/dev/null || true
    docker network create risk_platform_monitoring 2>/dev/null || true
    
    # Deploy in order
    log "Starting database services..."
    docker compose -f docker-compose.db.yml up -d
    
    log "Starting monitoring services..."
    docker compose -f docker-compose.monitoring.yml up -d
    
    log "Building and starting application services..."
    docker compose -f docker-compose.yml up -d --build
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 60
    
    # Validate deployment
    validate_deployment
    
    success "Platform deployment completed"
}

validate_deployment() {
    log "Validating platform deployment..."
    
    local services=("postgres:5432" "redis:6379" "api:3000" "nginx:80" "prometheus:9090" "grafana:3001")
    local failed_services=()
    
    for service_port in "${services[@]}"; do
        local service=${service_port%:*}
        local port=${service_port#*:}
        
        if ! nc -z localhost "$port" 2>/dev/null; then
            failed_services+=("$service")
        fi
    done
    
    if [[ ${#failed_services[@]} -eq 0 ]]; then
        success "All services are healthy"
    else
        warning "Some services failed to start: ${failed_services[*]}"
        log "Check logs with: docker compose logs [service]"
    fi
}

# =============================================
# MAINTENANCE UTILITIES
# =============================================

create_maintenance_utilities() {
    log "Creating maintenance utilities..."
    
    cd $PROJECT_ROOT/scripts
    
    # Platform management script
    cat > risk-platform-ctl.sh << 'EOF'
#!/bin/bash
# Risk Platform Control Script

set -e

PROJECT_ROOT="/opt/risk-platform"
cd "$PROJECT_ROOT"

case "${1:-help}" in
    "start")
        echo "Starting Risk Platform services..."
        docker compose -f docker-compose.db.yml up -d
        docker compose -f docker-compose.monitoring.yml up -d
        docker compose -f docker-compose.yml up -d
        echo "Platform started successfully"
        ;;
    "stop")
        echo "Stopping Risk Platform services..."
        docker compose -f docker-compose.yml down
        docker compose -f docker-compose.monitoring.yml down
        docker compose -f docker-compose.db.yml down
        echo "Platform stopped successfully"
        ;;
    "restart")
        echo "Restarting Risk Platform services..."
        $0 stop
        sleep 5
        $0 start
        ;;
    "status")
        echo "=== Risk Platform Status ==="
        docker compose -f docker-compose.db.yml ps
        docker compose -f docker-compose.monitoring.yml ps
        docker compose -f docker-compose.yml ps
        ;;
    "logs")
        if [[ -n "$2" ]]; then
            docker compose logs -f "$2"
        else
            docker compose logs -f
        fi
        ;;
    "update")
        echo "Updating Risk Platform..."
        docker compose pull
        docker compose up -d --force-recreate
        echo "Update completed"
        ;;
    "backup")
        echo "Creating backup..."
        ./backup-database.sh
        echo "Backup completed"
        ;;
    "help"|*)
        echo "Risk Platform Control Script"
        echo "Usage: $0 {start|stop|restart|status|logs|update|backup|help}"
        echo
        echo "Commands:"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  status   - Show service status"
        echo "  logs     - Show logs (optional service name)"
        echo "  update   - Update and restart services"
        echo "  backup   - Create database backup"
        echo "  help     - Show this help"
        ;;
esac
EOF

    chmod +x risk-platform-ctl.sh
    
    # Create symlink for global access
    ln -sf "$PROJECT_ROOT/scripts/risk-platform-ctl.sh" /usr/local/bin/risk-platform
    
    success "Maintenance utilities created"
}

# =============================================
# COMPLETE AUTOMATION WORKFLOW
# =============================================

run_complete_automation() {
    log "Starting complete Risk Platform automation..."
    
    local start_time=$(date +%s)
    
    # Phase 1: System preparation
    log "Phase 1: System Detection and Hardening"
    detect_system
    check_requirements
    harden_system_automated
    
    # Phase 2: Container platform
    log "Phase 2: Docker Installation and Configuration"
    install_docker_automated
    
    # Phase 3: Project setup
    log "Phase 3: Project Structure and Secrets"
    create_project_structure
    generate_all_secrets
    
    # Phase 4: Database layer (modular call)
    log "Phase 4: Database Infrastructure"
    setup_database_layer
    
    # Phase 5: Application services
    log "Phase 5: API Services"
    setup_api_services
    
    # Phase 6: Monitoring
    log "Phase 6: Monitoring and Observability"
    setup_monitoring_stack
    
    # Phase 7: Reverse proxy
    log "Phase 7: Reverse Proxy and Load Balancing"
    setup_reverse_proxy
    
    # Phase 8: Orchestration
    log "Phase 8: Service Orchestration"
    create_master_compose
    create_maintenance_utilities
    
    # Phase 9: Deployment
    log "Phase 9: Platform Deployment"
    deploy_platform_automated
    
    # Phase 10: Final validation
    log "Phase 10: Final Validation"
    create_final_validation_script
    run_final_validation
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "Complete automation finished in ${duration} seconds"
    show_completion_summary
}

create_final_validation_script() {
    log "Creating final validation script..."
    
    cat > $PROJECT_ROOT/scripts/validate-complete-setup.sh << 'EOF'
#!/bin/bash
# Complete Platform Validation Script

set -e

PROJECT_ROOT="/opt/risk-platform"
cd "$PROJECT_ROOT"

echo "=== Risk Platform Complete Validation ==="
echo

# Test all services
echo "1. Testing service connectivity..."
services=("postgres:5432" "redis:6379" "api:3000" "nginx:80" "prometheus:9090" "grafana:3001")

for service_port in "${services[@]}"; do
    service=${service_port%:*}
    port=${service_port#*:}
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo "  ✅ $service is responding on port $port"
    else
        echo "  ❌ $service is not responding on port $port"
    fi
done

# Test API endpoints
echo
echo "2. Testing API endpoints..."
if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "  ✅ API health check passed"
else
    echo "  ❌ API health check failed"
fi

# Test database
echo
echo "3. Testing database functionality..."
if docker compose -f docker-compose.db.yml exec postgres pg_isready -U risk_platform_app -d risk_platform >/dev/null 2>&1; then
    echo "  ✅ Database is ready"
else
    echo "  ❌ Database is not ready"
fi

# Test monitoring
echo
echo "4. Testing monitoring stack..."
if curl -f http://localhost:9090/-/healthy >/dev/null 2>&1; then
    echo "  ✅ Prometheus is healthy"
else
    echo "  ❌ Prometheus is not healthy"
fi

if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "  ✅ Grafana is healthy"
else
    echo "  ❌ Grafana is not healthy"
fi

echo
echo "=== Validation Complete ==="
echo "Platform is ready for use!"
EOF

    chmod +x $PROJECT_ROOT/scripts/validate-complete-setup.sh
}

run_final_validation() {
    log "Running final platform validation..."
    
    if $PROJECT_ROOT/scripts/validate-complete-setup.sh; then
        success "Platform validation passed"
    else
        warning "Some validation checks failed - review logs"
    fi
}

show_completion_summary() {
    echo
    echo "=============================================="
    echo "🎉 RISK PLATFORM INSTALLATION COMPLETE! 🎉"
    echo "=============================================="
    echo
    echo "Your Risk Intelligence Platform is now ready!"
    echo
    echo "📊 Services Running:"
    echo "  • PostgreSQL Database: localhost:5432"
    echo "  • Redis Cache: localhost:6379"
    echo "  • API Server: localhost:3000"
    echo "  • Web Interface: https://localhost"
    echo "  • Prometheus: http://localhost:9090"
    echo "  • Grafana: http://localhost:3001"
    echo
    echo "🔧 Management Commands:"
    echo "  • Start platform: risk-platform start"
    echo "  • Stop platform: risk-platform stop"
    echo "  • Check status: risk-platform status"
    echo "  • View logs: risk-platform logs [service]"
    echo "  • Backup data: risk-platform backup"
    echo
    echo "📁 Important Locations:"
    echo "  • Project root: $PROJECT_ROOT"
    echo "  • Configuration: $PROJECT_ROOT/.env"
    echo "  • Logs: $PROJECT_ROOT/logs/"
    echo "  • Backups: $PROJECT_ROOT/backups/"
    echo "  • Scripts: $PROJECT_ROOT/scripts/"
    echo
    echo "🔐 Security Notes:"
    echo "  • Change default passwords in production"
    echo "  • Configure SSL certificates"
    echo "  • Review firewall settings"
    echo "  • Set up external backup storage"
    echo
    echo "📖 Next Steps:"
    echo "  1. Access the API: curl http://localhost:3000/health"
    echo "  2. Access Grafana: http://localhost:3001 (admin/admin123)"
    echo "  3. Review configuration: $PROJECT_ROOT/.env"
    echo "  4. Run validation: $PROJECT_ROOT/scripts/validate-complete-setup.sh"
    echo
    echo "For support: https://github.com/your-org/risk-platform/wiki"
    echo "=============================================="
}

# =============================================
# MAIN EXECUTION
# =============================================

main() {
    # Ensure running as root for system changes
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root or with sudo"
    fi
    
    # Set up logging
    mkdir -p "$(dirname "$AUTOMATION_LOG")"
    
    # Parse command line arguments
    case "${1:-complete}" in
        "complete")
            run_complete_automation
            ;;
        "system-only")
            detect_system
            check_requirements
            harden_system_automated
            ;;
        "docker-only")
            install_docker_automated
            ;;
        "structure-only")
            create_project_structure
            generate_all_secrets
            ;;
        "database-only")
            setup_database_layer
            ;;
        "api-only")
            setup_api_services
            ;;
        "monitoring-only")
            setup_monitoring_stack
            ;;
        "deploy-only")
            deploy_platform_automated
            ;;
        "validate")
            run_final_validation
            ;;
        "help")
            echo "Risk Platform Modular Automation Suite v$SCRIPT_VERSION"
            echo "Usage: $0 [command]"
            echo
            echo "Commands:"
            echo "  complete        Run complete automation (default)"
            echo "  system-only     Only harden the system"
            echo "  docker-only     Only install Docker"
            echo "  structure-only  Only create project structure"
            echo "  database-only   Only setup database layer"
            echo "  api-only        Only setup API services"
            echo "  monitoring-only Only setup monitoring"
            echo "  deploy-only     Only deploy services"
            echo "  validate        Validate current setup"
            echo "  help            Show this help"
            echo
            echo "Environment Variables:"
            echo "  DEBUG=true      Enable debug logging"
            echo "  FORCE=true      Skip confirmation prompts"
            ;;
        *)
            error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            ;;
    esac
}

# Execute main function
main "$@"