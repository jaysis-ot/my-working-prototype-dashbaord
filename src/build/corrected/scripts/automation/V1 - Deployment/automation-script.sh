#!/bin/bash
# =========================================================================
# Risk Platform Modular Automation Script (Corrected Version)
# =========================================================================
# This script orchestrates the deployment of the Risk Platform infrastructure
# with proper error handling, validation, and rollback capabilities.
# 
# Usage: ./automation-script.sh [OPTIONS]
#   Options:
#     --system      Configure and harden the operating system
#     --docker      Install Docker and Docker Compose
#     --structure   Create project directory structure and secrets
#     --services    Install API and monitoring services
#     --deploy      Deploy all platform services
#     --all         Execute all phases in sequence
#     --help        Display this help message
#
# Dependencies:
#   - Ubuntu 24.04 LTS
#   - Root or sudo access
#   - Internet connectivity
#   - Minimum 4 CPU cores, 16GB RAM, 100GB disk
# =========================================================================

# Strict error handling
set -e

# =============================================
# CONFIGURATION
# =============================================

SCRIPT_VERSION="2.1.0"
PROJECT_ROOT="/opt/risk-platform"
SCRIPTS_DIR="${PROJECT_ROOT}/scripts"
VALIDATION_DIR="${SCRIPTS_DIR}/validation"
ROLLBACK_DIR="${SCRIPTS_DIR}/rollback"
LOG_DIR="${PROJECT_ROOT}/logs"
AUTOMATION_LOG="${LOG_DIR}/automation.log"
TEMP_DIR="/tmp/risk-platform-install"
STATE_FILE="${PROJECT_ROOT}/.automation_state"
LOCK_FILE="/var/lock/risk-platform-automation.lock"

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

log() {
    local level="INFO"
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        local level="DEBUG"
        echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${AUTOMATION_LOG}"
    fi
}

info() {
    local level="INFO"
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

success() {
    local level="SUCCESS"
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

warning() {
    local level="WARNING"
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

error() {
    local level="ERROR"
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${AUTOMATION_LOG}"
}

critical() {
    local level="CRITICAL"
    echo -e "${RED}${BOLD}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${AUTOMATION_LOG}"
    exit 1
}

# =============================================
# UTILITY FUNCTIONS
# =============================================

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

acquire_lock() {
    if [[ -e "${LOCK_FILE}" ]]; then
        local pid=$(cat "${LOCK_FILE}")
        if ps -p "${pid}" > /dev/null; then
            critical "Another instance of this script is already running (PID: ${pid}). Exiting."
        else
            warning "Found stale lock file. Removing."
            rm -f "${LOCK_FILE}"
        fi
    fi
    
    echo "$$" > "${LOCK_FILE}"
    trap release_lock EXIT
}

release_lock() {
    rm -f "${LOCK_FILE}"
}

save_state() {
    local phase=$1
    mkdir -p "$(dirname "${STATE_FILE}")"
    echo "${phase}" > "${STATE_FILE}"
}

get_state() {
    if [[ -f "${STATE_FILE}" ]]; then
        cat "${STATE_FILE}"
    else
        echo "none"
    fi
}

# =============================================
# PREREQUISITE CHECKING
# =============================================

check_prerequisites() {
    log "Checking system prerequisites..."
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        critical "This script must be run as root or with sudo"
    fi
    
    # Check Ubuntu version
    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        if [[ "$ID" != "ubuntu" ]]; then
            critical "This script requires Ubuntu OS. Found: $ID"
        fi
        
        if [[ "$VERSION_ID" != "24.04" ]]; then
            warning "This script is optimized for Ubuntu 24.04 LTS. Found: $VERSION_ID"
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
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
    
    if [[ $CPU_CORES -lt 4 ]]; then
        warning "Insufficient CPU cores. Minimum: 4, Found: $CPU_CORES"
    fi
    
    if [[ $TOTAL_RAM -lt 16 ]]; then
        warning "Insufficient RAM. Minimum: 16GB, Found: ${TOTAL_RAM}GB"
    fi
    
    if [[ $DISK_SPACE -lt 100 ]]; then
        warning "Insufficient disk space. Minimum: 100GB, Found: ${DISK_SPACE}GB"
    fi
    
    # Check internet connectivity
    if ! curl -s --connect-timeout 5 https://github.com > /dev/null; then
        critical "Internet connectivity check failed. Please ensure you have internet access."
    fi
    
    success "Prerequisite checks completed"
}

# =============================================
# SYSTEM HARDENING MODULE
# =============================================

setup_system_hardening() {
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
    info "Updating system packages..."
    apt update && apt upgrade -y
    
    # Install essential security packages
    info "Installing security packages..."
    apt install -y \
        ufw \
        fail2ban \
        rkhunter \
        lynis \
        unattended-upgrades \
        apt-listchanges \
        auditd \
        apparmor \
        apparmor-utils
    
    # Configure UFW (Uncomplicated Firewall)
    info "Configuring firewall..."
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    
    # Only enable if not already enabled to avoid disconnection
    if [[ $(ufw status | grep -c "Status: active") -eq 0 ]]; then
        echo "y" | ufw enable
    fi
    
    # Configure fail2ban
    info "Configuring fail2ban..."
    cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
findtime = 600
bantime = 3600
EOF
    
    systemctl restart fail2ban
    
    # Configure SSH hardening
    info "Hardening SSH configuration..."
    cat > /etc/ssh/sshd_config.d/99-risk-platform.conf << EOF
# Risk Platform SSH Hardening
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
EOF
    
    # Restart SSH service
    systemctl restart sshd
    
    # Configure automatic security updates
    info "Setting up automatic security updates..."
    cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
    
    # Run Lynis audit
    info "Running security audit with Lynis..."
    lynis audit system --quick > "${LOG_DIR}/lynis-audit.log"
    
    # Validate system hardening
    if validate_system_hardening; then
        success "System hardening completed successfully"
        save_state "system_complete"
        return 0
    else
        error "System hardening validation failed"
        rollback_system_hardening
        return 1
    fi
}

validate_system_hardening() {
    info "Validating system hardening..."
    
    # Check UFW status
    if ! ufw status | grep -q "Status: active"; then
        error "Firewall is not active"
        return 1
    fi
    
    # Check fail2ban status
    if ! systemctl is-active --quiet fail2ban; then
        error "fail2ban service is not running"
        return 1
    fi
    
    # Check SSH configuration
    if ! sshd -t; then
        error "SSH configuration is invalid"
        return 1
    fi
    
    # Check automatic updates
    if ! grep -q "Unattended-Upgrade \"1\"" /etc/apt/apt.conf.d/20auto-upgrades; then
        error "Automatic security updates not configured"
        return 1
    fi
    
    return 0
}

rollback_system_hardening() {
    warning "Rolling back system hardening..."
    
    # Restore SSH configuration
    if [[ -f /etc/ssh/sshd_config.backup ]]; then
        cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
        rm -f /etc/ssh/sshd_config.d/99-risk-platform.conf
        systemctl restart sshd
    fi
    
    # Disable UFW
    ufw disable
    
    # Stop fail2ban
    systemctl stop fail2ban
    
    warning "System hardening has been rolled back"
}

# =============================================
# DOCKER INSTALLATION MODULE
# =============================================

setup_docker() {
    log "Starting Docker installation..."
    save_state "docker_start"
    
    # Check if Docker is already installed
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        info "Docker and Docker Compose are already installed"
        if validate_docker_installation; then
            success "Docker installation validated"
            save_state "docker_complete"
            return 0
        else
            warning "Docker is installed but validation failed"
        fi
    fi
    
    # Install prerequisites
    info "Installing Docker prerequisites..."
    apt update
    apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    info "Adding Docker repository GPG key..."
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    info "Installing Docker and Docker Compose..."
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Start and enable Docker service
    info "Enabling Docker service..."
    systemctl start docker
    systemctl enable docker
    
    # Create docker group and add current user
    info "Setting up Docker user permissions..."
    groupadd -f docker
    
    # Get the sudo user if script is run with sudo
    SUDO_USER=${SUDO_USER:-$USER}
    if [[ "$SUDO_USER" != "root" ]]; then
        usermod -aG docker "$SUDO_USER"
        info "Added user $SUDO_USER to docker group"
    fi
    
    # Validate Docker installation
    if validate_docker_installation; then
        success "Docker installation completed successfully"
        save_state "docker_complete"
        return 0
    else
        error "Docker installation validation failed"
        rollback_docker_installation
        return 1
    fi
}

validate_docker_installation() {
    info "Validating Docker installation..."
    
    # Check Docker version
    if ! docker --version; then
        error "Docker is not installed correctly"
        return 1
    fi
    
    # Check Docker Compose
    if ! docker compose version; then
        error "Docker Compose is not installed correctly"
        return 1
    fi
    
    # Check Docker service
    if ! systemctl is-active --quiet docker; then
        error "Docker service is not running"
        return 1
    fi
    
    # Check Docker functionality
    if ! docker run --rm hello-world; then
        error "Docker functionality test failed"
        return 1
    fi
    
    return 0
}

rollback_docker_installation() {
    warning "Rolling back Docker installation..."
    
    # Stop Docker service
    systemctl stop docker
    
    # Remove Docker packages
    apt purge -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    apt autoremove -y
    
    # Remove Docker files
    rm -rf /var/lib/docker
    rm -rf /etc/docker
    rm -f /etc/apt/sources.list.d/docker.list
    
    warning "Docker installation has been rolled back"
}

# =============================================
# PROJECT STRUCTURE MODULE
# =============================================

setup_project_structure() {
    log "Setting up project directory structure..."
    save_state "structure_start"
    
    # Create project root directory if it doesn't exist
    if [[ ! -d "${PROJECT_ROOT}" ]]; then
        mkdir -p "${PROJECT_ROOT}"
    fi
    
    # Create directory structure
    info "Creating directory structure..."
    mkdir -p "${PROJECT_ROOT}"/{database/{init,config,backups},secrets,scripts/{validation,rollback,operational,security},docker-compose,config,logs,api,monitoring/{prometheus,grafana}}
    
    # Set proper permissions
    info "Setting secure permissions..."
    chmod 750 "${PROJECT_ROOT}"/{database,secrets,scripts}
    chmod 755 "${PROJECT_ROOT}"/{monitoring,logs,api}
    
    # Generate random passwords and store securely
    info "Generating secure credentials..."
    mkdir -p "${PROJECT_ROOT}/secrets/database"
    
    # Only generate passwords if they don't exist
    if [[ ! -f "${PROJECT_ROOT}/secrets/database/postgres_password.txt" ]]; then
        openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/database/postgres_password.txt"
    fi
    
    if [[ ! -f "${PROJECT_ROOT}/secrets/database/postgres_root_password.txt" ]]; then
        openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/database/postgres_root_password.txt"
    fi
    
    if [[ ! -f "${PROJECT_ROOT}/secrets/database/redis_password.txt" ]]; then
        openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/database/redis_password.txt"
    fi
    
    # Set strict permissions on secret files
    chmod 600 "${PROJECT_ROOT}/secrets/database/"*.txt
    
    # Create basic docker-compose files
    info "Creating Docker Compose templates..."
    
    # Base docker-compose.yml
    cat > "${PROJECT_ROOT}/docker-compose/base.yml" << EOF
version: '3.8'

services:
  api:
    build: 
      context: ../api
    restart: unless-stopped
    depends_on:
      - postgres
      - redis
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=risk_platform
      - DB_USER=risk_platform_app
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    ports:
      - "3000:3000"
    networks:
      - risk-platform-network

  nginx:
    image: nginx:stable
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ../config/nginx:/etc/nginx/conf.d
      - ../logs/nginx:/var/log/nginx
    depends_on:
      - api
    networks:
      - risk-platform-network

  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    volumes:
      - ../monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - risk-platform-network

  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    volumes:
      - ../monitoring/grafana:/etc/grafana
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
    networks:
      - risk-platform-network

networks:
  risk-platform-network:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
EOF
    
    # Database docker-compose.yml
    cat > "${PROJECT_ROOT}/docker-compose/db.yml" << EOF
version: '3.8'

services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres_root_password
      - POSTGRES_USER=postgres
      - POSTGRES_DB=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../database/init:/docker-entrypoint-initdb.d
      - ../database/config:/etc/postgresql/conf.d
      - ../database/backups:/backups
    ports:
      - "5432:5432"
    networks:
      - risk-platform-network
    secrets:
      - postgres_root_password

  redis:
    image: redis:7
    restart: unless-stopped
    command: redis-server --requirepass \${REDIS_PASSWORD}
    environment:
      - REDIS_PASSWORD_FILE=/run/secrets/redis_password
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - risk-platform-network
    secrets:
      - redis_password

networks:
  risk-platform-network:
    driver: bridge

volumes:
  postgres_data:
  redis_data:

secrets:
  postgres_root_password:
    file: ../secrets/database/postgres_root_password.txt
  redis_password:
    file: ../secrets/database/redis_password.txt
EOF
    
    # Create basic database initialization script
    info "Creating database initialization template..."
    mkdir -p "${PROJECT_ROOT}/database/init"
    cat > "${PROJECT_ROOT}/database/init/01-init-db.sh" << 'EOF'
#!/bin/bash
set -e

# Load the app user password
POSTGRES_APP_PASSWORD=$(cat /run/secrets/postgres_app_password)

# Create application database and user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" << EOSQL
    CREATE USER risk_platform_app WITH PASSWORD '$POSTGRES_APP_PASSWORD';
    CREATE DATABASE risk_platform;
    GRANT ALL PRIVILEGES ON DATABASE risk_platform TO risk_platform_app;
    
    \c risk_platform
    
    CREATE SCHEMA IF NOT EXISTS risk_platform;
    GRANT ALL ON SCHEMA risk_platform TO risk_platform_app;
    
    -- Set search path
    ALTER USER risk_platform_app SET search_path TO risk_platform;
EOSQL

echo "Database initialization completed"
EOF
    
    # Make initialization script executable
    chmod +x "${PROJECT_ROOT}/database/init/01-init-db.sh"
    
    # Create placeholder for app user password
    if [[ ! -f "${PROJECT_ROOT}/secrets/database/postgres_app_password.txt" ]]; then
        openssl rand -base64 32 > "${PROJECT_ROOT}/secrets/database/postgres_app_password.txt"
        chmod 600 "${PROJECT_ROOT}/secrets/database/postgres_app_password.txt"
    fi
    
    # Validate project structure
    if validate_project_structure; then
        success "Project structure setup completed successfully"
        save_state "structure_complete"
        return 0
    else
        error "Project structure validation failed"
        rollback_project_structure
        return 1
    fi
}

validate_project_structure() {
    info "Validating project structure..."
    
    # Check if key directories exist
    for dir in database secrets scripts docker-compose config logs api monitoring; do
        if [[ ! -d "${PROJECT_ROOT}/${dir}" ]]; then
            error "Required directory ${dir} is missing"
            return 1
        fi
    done
    
    # Check if secret files exist with proper permissions
    for secret in postgres_password.txt postgres_root_password.txt redis_password.txt; do
        if [[ ! -f "${PROJECT_ROOT}/secrets/database/${secret}" ]]; then
            error "Required secret file ${secret} is missing"
            return 1
        fi
        
        # Check permissions (should be 600)
        local perms=$(stat -c "%a" "${PROJECT_ROOT}/secrets/database/${secret}")
        if [[ "${perms}" != "600" ]]; then
            error "Secret file ${secret} has incorrect permissions: ${perms}, should be 600"
            return 1
        fi
    done
    
    # Check if docker-compose files exist
    for compose_file in base.yml db.yml; do
        if [[ ! -f "${PROJECT_ROOT}/docker-compose/${compose_file}" ]]; then
            error "Required Docker Compose file ${compose_file} is missing"
            return 1
        fi
    done
    
    return 0
}

rollback_project_structure() {
    warning "Rolling back project structure setup..."
    
    # Only perform rollback if explicitly requested and if we're in a clean state
    read -p "This will remove all project files. Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "${PROJECT_ROOT}"
        warning "Project structure has been completely removed"
    else
        warning "Project structure rollback aborted"
    fi
}

# =============================================
# SERVICES INSTALLATION MODULE
# =============================================

setup_services() {
    log "Setting up API and monitoring services..."
    save_state "services_start"
    
    # Create API directory structure
    info "Setting up API service structure..."
    mkdir -p "${PROJECT_ROOT}/api/src"
    
    # Create basic API application
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
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "redis": "^4.6.10",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.1"
  }
}
EOF
    
    # Create basic API application code
    cat > "${PROJECT_ROOT}/api/src/index.js" << EOF
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');
const winston = require('winston');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: 'info',
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

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'risk_platform',
  user: process.env.DB_USER || 'risk_platform_app',
  password: process.env.DB_PASSWORD
});

// Redis connection
const redisClient = redis.createClient({
  url: \`redis://\${process.env.REDIS_HOST || 'redis'}:\${process.env.REDIS_PORT || 6379}\`,
  password: process.env.REDIS_PASSWORD
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis');
  } catch (err) {
    logger.error('Redis connection error:', err);
  }
})();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbClient = await pool.connect();
    await dbClient.query('SELECT 1');
    dbClient.release();
    
    // Check Redis connection
    if (!redisClient.isReady) {
      throw new Error('Redis not connected');
    }
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: 'up',
        redis: 'up'
      }
    });
  } catch (err) {
    logger.error('Health check failed:', err);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err.message
    });
  }
});

// API routes
app.get('/api/v1/status', (req, res) => {
  res.json({
    service: 'Risk Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  logger.info(\`Risk Platform API listening on port \${port}\`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  redisClient.quit();
  pool.end();
  process.exit(0);
});
EOF
    
    # Create Dockerfile for API
    cat > "${PROJECT_ROOT}/api/Dockerfile" << EOF
FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Set proper permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
EOF
    
    # Setup Prometheus configuration
    info "Setting up Prometheus monitoring..."
    mkdir -p "${PROJECT_ROOT}/monitoring/prometheus"
    
    cat > "${PROJECT_ROOT}/monitoring/prometheus/prometheus.yml" << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
  
  - job_name: "api"
    static_configs:
      - targets: ["api:3000"]
EOF
    
    # Setup Grafana provisioning
    info "Setting up Grafana dashboards..."
    mkdir -p "${PROJECT_ROOT}/monitoring/grafana/provisioning/datasources"
    mkdir -p "${PROJECT_ROOT}/monitoring/grafana/provisioning/dashboards"
    
    # Create Prometheus datasource
    cat > "${PROJECT_ROOT}/monitoring/grafana/provisioning/datasources/prometheus.yml" << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
EOF
    
    # Setup Nginx configuration
    info "Setting up Nginx reverse proxy..."
    mkdir -p "${PROJECT_ROOT}/config/nginx"
    
    cat > "${PROJECT_ROOT}/config/nginx/default.conf" << EOF
server {
    listen 80;
    server_name _;
    
    # Redirect all HTTP requests to HTTPS
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name _;
    
    # SSL configuration (will be updated by certificate script)
    ssl_certificate /etc/nginx/conf.d/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/conf.d/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; img-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self';";
    
    # API proxy
    location /api/ {
        proxy_pass http://api:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://api:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Prometheus (with basic auth in production)
    location /prometheus/ {
        proxy_pass http://prometheus:9090/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Grafana
    location /grafana/ {
        proxy_pass http://grafana:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files (future frontend)
    location / {
        root /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    
    # Create self-signed SSL directory and placeholder
    mkdir -p "${PROJECT_ROOT}/config/nginx/ssl"
    
    # Validate services setup
    if validate_services_setup; then
        success "Services setup completed successfully"
        save_state "services_complete"
        return 0
    else
        error "Services setup validation failed"
        rollback_services_setup
        return 1
    fi
}

validate_services_setup() {
    info "Validating services setup..."
    
    # Check if API files exist
    if [[ ! -f "${PROJECT_ROOT}/api/package.json" ]] || [[ ! -f "${PROJECT_ROOT}/api/src/index.js" ]]; then
        error "API files are missing"
        return 1
    fi
    
    # Check if Prometheus config exists
    if [[ ! -f "${PROJECT_ROOT}/monitoring/prometheus/prometheus.yml" ]]; then
        error "Prometheus configuration is missing"
        return 1
    fi
    
    # Check if Grafana config exists
    if [[ ! -f "${PROJECT_ROOT}/monitoring/grafana/provisioning/datasources/prometheus.yml" ]]; then
        error "Grafana configuration is missing"
        return 1
    fi
    
    # Check if Nginx config exists
    if [[ ! -f "${PROJECT_ROOT}/config/nginx/default.conf" ]]; then
        error "Nginx configuration is missing"
        return 1
    fi
    
    return 0
}

rollback_services_setup() {
    warning "Rolling back services setup..."
    
    # Remove API directory
    rm -rf "${PROJECT_ROOT}/api"
    
    # Remove monitoring configurations
    rm -rf "${PROJECT_ROOT}/monitoring/prometheus"
    rm -rf "${PROJECT_ROOT}/monitoring/grafana"
    
    # Remove Nginx configuration
    rm -rf "${PROJECT_ROOT}/config/nginx"
    
    warning "Services setup has been rolled back"
}

# =============================================
# DEPLOYMENT MODULE
# =============================================

deploy_services() {
    log "Deploying platform services..."
    save_state "deploy_start"
    
    # Create .env file with secrets
    info "Creating environment configuration..."
    cat > "${PROJECT_ROOT}/.env" << EOF
# Risk Platform Environment Configuration
# Generated by automation script

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=risk_platform
DB_USER=risk_platform_app
DB_PASSWORD=$(cat "${PROJECT_ROOT}/secrets/database/postgres_app_password.txt")

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$(cat "${PROJECT_ROOT}/secrets/database/redis_password.txt")

# API Configuration
API_PORT=3000
NODE_ENV=production

# Monitoring Configuration
PROMETHEUS_RETENTION_TIME=15d
EOF
    
    # Set proper permissions on .env file
    chmod 600 "${PROJECT_ROOT}/.env"
    
    # Start database services first
    info "Starting database services..."
    cd "${PROJECT_ROOT}"
    docker compose -f docker-compose/db.yml up -d
    
    # Wait for database to be ready
    info "Waiting for database to be ready..."
    for i in {1..30}; do
        if docker compose -f docker-compose/db.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
            success "Database is ready"
            break
        fi
        
        if [[ $i -eq 30 ]]; then
            error "Database failed to start within the timeout period"
            rollback_deployment
            return 1
        fi
        
        echo -n "."
        sleep 2
    done
    
    # Start other services
    info "Starting API and monitoring services..."
    docker compose -f docker-compose/base.yml up -d
    
    # Wait for services to stabilize
    info "Waiting for services to stabilize (3 minutes)..."
    for i in {1..36}; do
        show_progress $i 36 "Waiting for services to stabilize"
        sleep 5
    done
    
    # Validate deployment
    if validate_deployment; then
        success "Platform deployment completed successfully"
        save_state "deploy_complete"
        return 0
    else
        error "Platform deployment validation failed"
        rollback_deployment
        return 1
    fi
}

validate_deployment() {
    info "Validating platform deployment..."
    
    # Check if all containers are running
    local containers=$(docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" ps -q)
    local db_containers=$(docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" ps -q)
    
    if [[ -z "$containers" ]] || [[ -z "$db_containers" ]]; then
        error "Some containers are not running"
        return 1
    fi
    
    # Check API health endpoint
    if ! curl -s --fail http://localhost:3000/health > /dev/null; then
        error "API health check failed"
        return 1
    fi
    
    # Check Prometheus
    if ! curl -s --fail http://localhost:9090/-/healthy > /dev/null; then
        error "Prometheus health check failed"
        return 1
    fi
    
    # Check if Grafana is responding
    if ! curl -s --fail http://localhost:3001/api/health > /dev/null; then
        error "Grafana health check failed"
        return 1
    fi
    
    return 0
}

rollback_deployment() {
    warning "Rolling back deployment..."
    
    # Stop all containers
    cd "${PROJECT_ROOT}"
    docker compose -f docker-compose/base.yml down
    docker compose -f docker-compose/db.yml down
    
    warning "Platform deployment has been rolled back"
}

# =============================================
# INTEGRATION WITH EXTERNAL SCRIPTS
# =============================================

run_database_setup() {
    log "Running database setup script..."
    
    local db_script="${SCRIPTS_DIR}/database/database_setup_script.sh"
    
    if [[ ! -f "${db_script}" ]]; then
        error "Database setup script not found at ${db_script}"
        return 1
    fi
    
    # Make script executable
    chmod +x "${db_script}"
    
    # Execute database setup script
    info "Executing database setup script..."
    if "${db_script}"; then
        success "Database setup completed successfully"
        return 0
    else
        error "Database setup failed"
        return 1
    fi
}

run_validation_script() {
    local script_name=$1
    log "Running validation script: ${script_name}..."
    
    local validation_script="${VALIDATION_DIR}/${script_name}"
    
    if [[ ! -f "${validation_script}" ]]; then
        error "Validation script not found at ${validation_script}"
        return 1
    fi
    
    # Make script executable
    chmod +x "${validation_script}"
    
    # Execute validation script
    info "Executing validation script..."
    if "${validation_script}"; then
        success "Validation completed successfully"
        return 0
    else
        error "Validation failed"
        return 1
    fi
}

# =============================================
# MAIN EXECUTION LOGIC
# =============================================

show_help() {
    echo -e "${BLUE}Risk Platform Automation Script v${SCRIPT_VERSION}${NC}"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --system      Configure and harden the operating system"
    echo "  --docker      Install Docker and Docker Compose"
    echo "  --structure   Create project directory structure and secrets"
    echo "  --services    Install API and monitoring services"
    echo "  --deploy      Deploy all platform services"
    echo "  --all         Execute all phases in sequence"
    echo "  --help        Display this help message"
    echo
    echo "Example:"
    echo "  $0 --all      # Run complete installation"
    echo "  $0 --system   # Only perform system hardening"
    echo
}

# Main execution
main() {
    # Parse command line arguments
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi
    
    # Process arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --system)
                check_prerequisites
                setup_system_hardening
                shift
                ;;
            --docker)
                check_prerequisites
                setup_docker
                shift
                ;;
            --structure)
                check_prerequisites
                setup_project_structure
                shift
                ;;
            --services)
                check_prerequisites
                setup_services
                shift
                ;;
            --deploy)
                check_prerequisites
                deploy_services
                shift
                ;;
            --all)
                check_prerequisites
                setup_system_hardening
                setup_docker
                setup_project_structure
                run_database_setup
                setup_services
                deploy_services
                success "Complete platform installation finished successfully"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Acquire lock and run main function
acquire_lock
main "$@"
exit 0
