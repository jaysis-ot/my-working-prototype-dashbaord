#!/bin/bash
# continue-vps-deployment.sh - Risk Platform VPS Deployment Continuation Script
# Version: 1.0.0
# Date: 2025-07-31
#
# This script continues the VPS deployment after APT fixes have been applied.
# It assumes vps-apt-fix.sh has been run successfully and the system is ready
# for the next phase of deployment.
#
# The script will:
# 1. Install Docker and Docker Compose
# 2. Create the project structure for the Risk Platform
# 3. Set up the API and monitoring services
# 4. Prepare for the actual platform deployment
# 5. Include validation steps to ensure everything is ready
# 6. Add proper error handling and logging

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
PROJECT_DIR="/opt/risk-platform"
DATA_DIR="$PROJECT_DIR/data"
CONFIG_DIR="$PROJECT_DIR/config"
LOG_DIR="$PROJECT_DIR/logs"
BACKUP_DIR="$PROJECT_DIR/backups"
SCRIPTS_DIR="$PROJECT_DIR/scripts"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
ENV_FILE="$PROJECT_DIR/.env"
LOG_FILE="/var/log/risk-platform-deploy-$(date +%Y%m%d-%H%M%S).log"
STATE_FILE="$PROJECT_DIR/.deployment_state"
DOCKER_VERSION="24.0.6"
DOCKER_COMPOSE_VERSION="2.23.3"
DOMAIN=""
ADMIN_EMAIL=""
TIMEZONE="UTC"
MONITORING_ENABLED=true
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"  # 2 AM daily
DOCKER_REGISTRY="docker.io"
PLATFORM_VERSION="latest"

# Trap errors
trap 'handle_error $? $LINENO' ERR

# Error handler
handle_error() {
    local exit_code=$1
    local line_number=$2
    log_error "Error on line $line_number: Command exited with status $exit_code"
    log_error "Deployment failed! Check the log file for details: $LOG_FILE"
    exit $exit_code
}

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

# Save state function
save_state() {
    mkdir -p "$(dirname "$STATE_FILE")"
    echo "$1" > "$STATE_FILE"
    log_info "Deployment state saved: $1"
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    log_error "This script must be run as root!"
    exit 1
fi

# Function to install Docker and Docker Compose
install_docker() {
    log_info "Installing Docker and Docker Compose..."
    
    # Check if Docker is already installed
    if command -v docker &> /dev/null; then
        log_warning "Docker is already installed. Skipping Docker installation."
    else
        # Install prerequisites
        apt-get update
        apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        
        # Add Docker's official GPG key
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        
        # Set up the Docker repository
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker Engine
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Enable and start Docker service
        systemctl enable docker
        systemctl start docker
        
        log_success "Docker installed successfully"
    fi
    
    # Check if Docker Compose is already installed
    if command -v docker compose &> /dev/null; then
        log_warning "Docker Compose plugin is already installed. Skipping installation."
    else
        # Install Docker Compose as a plugin
        apt-get update
        apt-get install -y docker-compose-plugin
        
        log_success "Docker Compose plugin installed successfully"
    fi
    
    # Verify Docker installation
    docker --version
    docker compose version
    
    # Test Docker functionality
    docker run --rm hello-world
    
    log_success "Docker and Docker Compose installation verified"
    save_state "docker_installed"
}

# Function to create project structure
create_project_structure() {
    log_info "Creating project structure..."
    
    # Create main project directory
    mkdir -p "$PROJECT_DIR"
    
    # Create subdirectories
    mkdir -p "$DATA_DIR"
    mkdir -p "$CONFIG_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$SCRIPTS_DIR"
    
    # Create specific data subdirectories
    mkdir -p "$DATA_DIR/db"
    mkdir -p "$DATA_DIR/elasticsearch"
    mkdir -p "$DATA_DIR/grafana"
    mkdir -p "$DATA_DIR/prometheus"
    mkdir -p "$DATA_DIR/redis"
    mkdir -p "$DATA_DIR/uploads"
    
    # Create specific config subdirectories
    mkdir -p "$CONFIG_DIR/nginx"
    mkdir -p "$CONFIG_DIR/api"
    mkdir -p "$CONFIG_DIR/db"
    mkdir -p "$CONFIG_DIR/monitoring"
    
    # Set proper permissions
    chown -R root:root "$PROJECT_DIR"
    chmod -R 750 "$PROJECT_DIR"
    chmod -R 770 "$DATA_DIR"
    chmod -R 770 "$LOG_DIR"
    
    log_success "Project structure created at $PROJECT_DIR"
    save_state "project_structure_created"
}

# Function to create environment file
create_env_file() {
    log_info "Creating environment configuration file..."
    
    # Generate random passwords and secrets
    DB_PASSWORD=$(openssl rand -base64 16)
    REDIS_PASSWORD=$(openssl rand -base64 16)
    API_SECRET_KEY=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Create .env file
    cat > "$ENV_FILE" << EOF
# Risk Platform Environment Configuration
# Generated on $(date)

# General settings
PLATFORM_VERSION=${PLATFORM_VERSION}
TZ=${TIMEZONE}
DOMAIN=${DOMAIN}
ADMIN_EMAIL=${ADMIN_EMAIL}

# Database settings
DB_HOST=db
DB_PORT=5432
DB_NAME=riskplatform
DB_USER=riskadmin
DB_PASSWORD=${DB_PASSWORD}

# Redis settings
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# API settings
API_PORT=8000
API_SECRET_KEY=${API_SECRET_KEY}
JWT_SECRET=${JWT_SECRET}
LOG_LEVEL=info

# Monitoring settings
MONITORING_ENABLED=${MONITORING_ENABLED}
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# Backup settings
BACKUP_ENABLED=${BACKUP_ENABLED}
BACKUP_SCHEDULE="${BACKUP_SCHEDULE}"
BACKUP_RETENTION_DAYS=7
EOF
    
    # Secure the .env file
    chmod 600 "$ENV_FILE"
    
    log_success "Environment configuration file created at $ENV_FILE"
}

# Function to create Docker Compose file
create_docker_compose() {
    log_info "Creating Docker Compose configuration..."
    
    cat > "$DOCKER_COMPOSE_FILE" << 'EOF'
version: '3.8'

services:
  nginx:
    image: ${DOCKER_REGISTRY}/nginx:alpine
    container_name: risk-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx:/etc/nginx/conf.d
      - ./data/certbot/conf:/etc/letsencrypt
      - ./data/certbot/www:/var/www/certbot
    depends_on:
      - api
    networks:
      - risk-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  api:
    image: ${DOCKER_REGISTRY}/risk-platform/api:${PLATFORM_VERSION}
    container_name: risk-api
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data/uploads:/app/uploads
      - ./logs/api:/app/logs
    depends_on:
      - db
      - redis
    networks:
      - risk-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    image: ${DOCKER_REGISTRY}/postgres:14-alpine
    container_name: risk-db
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - ./data/db:/var/lib/postgresql/data
      - ./config/db:/docker-entrypoint-initdb.d
    networks:
      - risk-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    image: ${DOCKER_REGISTRY}/redis:alpine
    container_name: risk-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - ./data/redis:/data
    networks:
      - risk-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  prometheus:
    image: ${DOCKER_REGISTRY}/prom/prometheus:latest
    container_name: risk-prometheus
    restart: unless-stopped
    volumes:
      - ./config/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./data/prometheus:/prometheus
    networks:
      - risk-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  grafana:
    image: ${DOCKER_REGISTRY}/grafana/grafana:latest
    container_name: risk-grafana
    restart: unless-stopped
    volumes:
      - ./data/grafana:/var/lib/grafana
      - ./config/monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
    depends_on:
      - prometheus
    networks:
      - risk-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  backup:
    image: ${DOCKER_REGISTRY}/risk-platform/backup:${PLATFORM_VERSION}
    container_name: risk-backup
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./data:/data
      - ./backups:/backups
    networks:
      - risk-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  risk-network:
    driver: bridge
EOF
    
    log_success "Docker Compose configuration created at $DOCKER_COMPOSE_FILE"
}

# Function to create Nginx configuration
create_nginx_config() {
    log_info "Creating Nginx configuration..."
    
    # Create default.conf for HTTP -> HTTPS redirect
    cat > "$CONFIG_DIR/nginx/default.conf" << EOF
server {
    listen 80;
    server_name _;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF
    
    # Create app.conf for the main application
    if [ -n "$DOMAIN" ]; then
        cat > "$CONFIG_DIR/nginx/app.conf" << EOF
server {
    listen 443 ssl;
    server_name ${DOMAIN};
    
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Other security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';";
    
    # API proxy
    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location / {
        root /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    else
        # Create a generic config without SSL for development/testing
        cat > "$CONFIG_DIR/nginx/app.conf" << EOF
server {
    listen 443;
    server_name _;
    
    # API proxy
    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files
    location / {
        root /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    fi
    
    log_success "Nginx configuration created"
}

# Function to create Prometheus configuration
create_prometheus_config() {
    log_info "Creating Prometheus configuration..."
    
    mkdir -p "$CONFIG_DIR/monitoring"
    
    cat > "$CONFIG_DIR/monitoring/prometheus.yml" << EOF
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
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'api'
    static_configs:
      - targets: ['api:8000']
EOF
    
    log_success "Prometheus configuration created"
}

# Function to create Grafana configuration
create_grafana_config() {
    log_info "Creating Grafana configuration..."
    
    mkdir -p "$CONFIG_DIR/monitoring/grafana/provisioning/datasources"
    mkdir -p "$CONFIG_DIR/monitoring/grafana/provisioning/dashboards"
    
    # Create datasource configuration
    cat > "$CONFIG_DIR/monitoring/grafana/provisioning/datasources/datasource.yml" << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
EOF
    
    # Create dashboard configuration
    cat > "$CONFIG_DIR/monitoring/grafana/provisioning/dashboards/dashboard.yml" << EOF
apiVersion: 1

providers:
  - name: 'Default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
EOF
    
    log_success "Grafana configuration created"
}

# Function to create backup script
create_backup_script() {
    log_info "Creating backup script..."
    
    mkdir -p "$SCRIPTS_DIR"
    
    cat > "$SCRIPTS_DIR/backup.sh" << 'EOF'
#!/bin/bash
# Backup script for Risk Platform

BACKUP_DIR="/opt/risk-platform/backups"
DATA_DIR="/opt/risk-platform/data"
CONFIG_DIR="/opt/risk-platform/config"
ENV_FILE="/opt/risk-platform/.env"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/risk-platform-backup-$TIMESTAMP.tar.gz"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Stop services for consistent backup
echo "Stopping services for consistent backup..."
cd /opt/risk-platform
docker compose stop db redis

# Create backup
echo "Creating backup..."
tar -czf "$BACKUP_FILE" -C /opt/risk-platform data config .env

# Start services again
echo "Starting services again..."
cd /opt/risk-platform
docker compose start db redis

# Remove old backups
echo "Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "risk-platform-backup-*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_FILE"
EOF
    
    chmod +x "$SCRIPTS_DIR/backup.sh"
    
    # Create cron job for automatic backups
    if [ "$BACKUP_ENABLED" = true ]; then
        echo "$BACKUP_SCHEDULE root $SCRIPTS_DIR/backup.sh > /var/log/risk-platform-backup.log 2>&1" > /etc/cron.d/risk-platform-backup
        chmod 644 /etc/cron.d/risk-platform-backup
        log_success "Automatic backup scheduled: $BACKUP_SCHEDULE"
    fi
    
    log_success "Backup script created"
}

# Function to create restore script
create_restore_script() {
    log_info "Creating restore script..."
    
    cat > "$SCRIPTS_DIR/restore.sh" << 'EOF'
#!/bin/bash
# Restore script for Risk Platform

if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE=$1
PROJECT_DIR="/opt/risk-platform"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Stop all services
echo "Stopping all services..."
cd "$PROJECT_DIR"
docker compose down

# Backup current data
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CURRENT_BACKUP="$PROJECT_DIR/backups/pre-restore-backup-$TIMESTAMP.tar.gz"
echo "Creating backup of current state: $CURRENT_BACKUP"
mkdir -p "$PROJECT_DIR/backups"
tar -czf "$CURRENT_BACKUP" -C "$PROJECT_DIR" data config .env

# Remove current data
echo "Removing current data..."
rm -rf "$PROJECT_DIR/data"
rm -rf "$PROJECT_DIR/config"
rm -f "$PROJECT_DIR/.env"

# Extract backup
echo "Extracting backup: $BACKUP_FILE"
tar -xzf "$BACKUP_FILE" -C "$PROJECT_DIR"

# Start services
echo "Starting services..."
cd "$PROJECT_DIR"
docker compose up -d

echo "Restore completed successfully!"
EOF
    
    chmod +x "$SCRIPTS_DIR/restore.sh"
    log_success "Restore script created"
}

# Function to create platform validation script
create_validation_script() {
    log_info "Creating validation script..."
    
    cat > "$SCRIPTS_DIR/validate.sh" << 'EOF'
#!/bin/bash
# Validation script for Risk Platform

PROJECT_DIR="/opt/risk-platform"
ENV_FILE="$PROJECT_DIR/.env"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
LOG_FILE="/var/log/risk-platform-validation-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" >> "$LOG_FILE"
}

# Check if Docker is running
log "${BLUE}Checking if Docker is running...${NC}"
if systemctl is-active --quiet docker; then
    log "${GREEN}Docker is running${NC}"
else
    log "${RED}Docker is not running!${NC}"
    log "${YELLOW}Attempting to start Docker...${NC}"
    systemctl start docker
    if systemctl is-active --quiet docker; then
        log "${GREEN}Docker started successfully${NC}"
    else
        log "${RED}Failed to start Docker!${NC}"
        exit 1
    fi
fi

# Check if Docker Compose file exists
log "${BLUE}Checking if Docker Compose file exists...${NC}"
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
    log "${GREEN}Docker Compose file exists${NC}"
else
    log "${RED}Docker Compose file not found!${NC}"
    exit 1
fi

# Check if environment file exists
log "${BLUE}Checking if environment file exists...${NC}"
if [ -f "$ENV_FILE" ]; then
    log "${GREEN}Environment file exists${NC}"
else
    log "${RED}Environment file not found!${NC}"
    exit 1
fi

# Check if required directories exist
log "${BLUE}Checking if required directories exist...${NC}"
REQUIRED_DIRS=("$PROJECT_DIR/data" "$PROJECT_DIR/config" "$PROJECT_DIR/logs" "$PROJECT_DIR/backups")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log "${GREEN}Directory exists: $dir${NC}"
    else
        log "${RED}Directory not found: $dir${NC}"
        log "${YELLOW}Creating directory: $dir${NC}"
        mkdir -p "$dir"
    fi
done

# Check if Nginx configuration exists
log "${BLUE}Checking if Nginx configuration exists...${NC}"
if [ -f "$PROJECT_DIR/config/nginx/default.conf" ] && [ -f "$PROJECT_DIR/config/nginx/app.conf" ]; then
    log "${GREEN}Nginx configuration exists${NC}"
else
    log "${RED}Nginx configuration not found!${NC}"
    exit 1
fi

# Check if monitoring configuration exists
log "${BLUE}Checking if monitoring configuration exists...${NC}"
if [ -f "$PROJECT_DIR/config/monitoring/prometheus.yml" ]; then
    log "${GREEN}Prometheus configuration exists${NC}"
else
    log "${RED}Prometheus configuration not found!${NC}"
    exit 1
fi

# Check if required Docker images are available
log "${BLUE}Checking if required Docker images are available...${NC}"
source "$ENV_FILE"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-docker.io}
PLATFORM_VERSION=${PLATFORM_VERSION:-latest}

REQUIRED_IMAGES=(
    "nginx:alpine"
    "postgres:14-alpine"
    "redis:alpine"
    "prom/prometheus:latest"
    "grafana/grafana:latest"
)

for image in "${REQUIRED_IMAGES[@]}"; do
    log "${BLUE}Checking image: $DOCKER_REGISTRY/$image${NC}"
    if docker pull "$DOCKER_REGISTRY/$image" &>/dev/null; then
        log "${GREEN}Image available: $DOCKER_REGISTRY/$image${NC}"
    else
        log "${RED}Failed to pull image: $DOCKER_REGISTRY/$image${NC}"
        log "${YELLOW}This might cause issues during deployment${NC}"
    fi
done

# Check if ports are available
log "${BLUE}Checking if required ports are available...${NC}"
REQUIRED_PORTS=(80 443 5432 6379 8000 9090 3000)

for port in "${REQUIRED_PORTS[@]}"; do
    if netstat -tuln | grep -q ":$port "; then
        log "${RED}Port $port is already in use!${NC}"
        log "${YELLOW}This might cause conflicts during deployment${NC}"
    else
        log "${GREEN}Port $port is available${NC}"
    fi
done

# Check disk space
log "${BLUE}Checking available disk space...${NC}"
AVAILABLE_SPACE=$(df -h / | awk 'NR==2 {print $4}')
log "${GREEN}Available disk space: $AVAILABLE_SPACE${NC}"

# Check memory
log "${BLUE}Checking available memory...${NC}"
AVAILABLE_MEMORY=$(free -h | awk 'NR==2 {print $7}')
log "${GREEN}Available memory: $AVAILABLE_MEMORY${NC}"

# Check CPU
log "${BLUE}Checking CPU information...${NC}"
CPU_CORES=$(nproc)
log "${GREEN}CPU cores: $CPU_CORES${NC}"

# Final validation
log "${BLUE}Running Docker Compose validation...${NC}"
cd "$PROJECT_DIR"
if docker compose config &>/dev/null; then
    log "${GREEN}Docker Compose configuration is valid${NC}"
    log "${GREEN}All validation checks passed!${NC}"
    log "${GREEN}The system is ready for deployment${NC}"
    exit 0
else
    log "${RED}Docker Compose configuration is invalid!${NC}"
    log "${RED}Please check the Docker Compose file and try again${NC}"
    exit 1
fi
EOF
    
    chmod +x "$SCRIPTS_DIR/validate.sh"
    log_success "Validation script created"
}

# Function to set up API and monitoring services
setup_services() {
    log_info "Setting up API and monitoring services..."
    
    # Create Nginx configuration
    create_nginx_config
    
    # Create Prometheus configuration
    create_prometheus_config
    
    # Create Grafana configuration
    create_grafana_config
    
    # Create backup and restore scripts
    create_backup_script
    create_restore_script
    
    # Create validation script
    create_validation_script
    
    log_success "API and monitoring services configured"
    save_state "services_configured"
}

# Function to prepare for deployment
prepare_deployment() {
    log_info "Preparing for platform deployment..."
    
    # Create a README file with deployment instructions
    cat > "$PROJECT_DIR/README.md" << EOF
# Risk Platform Deployment

This directory contains the Risk Platform deployment configuration.

## Directory Structure

- \`config/\`: Configuration files for services
- \`data/\`: Persistent data storage
- \`logs/\`: Log files
- \`backups/\`: Backup files
- \`scripts/\`: Utility scripts

## Deployment

To deploy the platform, run:

\`\`\`bash
cd $PROJECT_DIR
docker compose up -d
\`\`\`

## Validation

To validate the deployment, run:

\`\`\`bash
$SCRIPTS_DIR/validate.sh
\`\`\`

## Backup and Restore

To create a manual backup, run:

\`\`\`bash
$SCRIPTS_DIR/backup.sh
\`\`\`

To restore from a backup, run:

\`\`\`bash
$SCRIPTS_DIR/restore.sh /path/to/backup/file.tar.gz
\`\`\`

## Monitoring

- Grafana: http://your-server-ip:3000 (default credentials: admin/admin)
- Prometheus: http://your-server-ip:9090

## Configuration

Environment variables are stored in \`.env\` file.
EOF
    
    # Create a deployment script
    cat > "$SCRIPTS_DIR/deploy.sh" << 'EOF'
#!/bin/bash
# Deployment script for Risk Platform

PROJECT_DIR="/opt/risk-platform"
LOG_FILE="/var/log/risk-platform-deploy-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" >> "$LOG_FILE"
}

# Validate deployment
log "${BLUE}Validating deployment...${NC}"
if ! "$PROJECT_DIR/scripts/validate.sh"; then
    log "${RED}Validation failed!${NC}"
    log "${RED}Please fix the issues and try again${NC}"
    exit 1
fi

# Create backup before deployment
log "${BLUE}Creating backup before deployment...${NC}"
"$PROJECT_DIR/scripts/backup.sh"

# Pull latest images
log "${BLUE}Pulling latest images...${NC}"
cd "$PROJECT_DIR"
docker compose pull

# Deploy
log "${BLUE}Deploying platform...${NC}"
cd "$PROJECT_DIR"
docker compose up -d

# Check if all containers are running
log "${BLUE}Checking container status...${NC}"
if docker compose ps | grep -q "Exit"; then
    log "${RED}Some containers failed to start!${NC}"
    docker compose logs
    log "${RED}Deployment failed!${NC}"
    exit 1
else
    log "${GREEN}All containers are running${NC}"
    log "${GREEN}Deployment completed successfully!${NC}"
fi

# Show container status
docker compose ps

log "${GREEN}Platform is now available at:${NC}"
log "${GREEN}- Web UI: http://$(hostname -I | awk '{print $1}')${NC}"
log "${GREEN}- API: http://$(hostname -I | awk '{print $1}'):8000${NC}"
log "${GREEN}- Grafana: http://$(hostname -I | awk '{print $1}'):3000${NC}"
log "${GREEN}- Prometheus: http://$(hostname -I | awk '{print $1}'):9090${NC}"
EOF
    
    chmod +x "$SCRIPTS_DIR/deploy.sh"
    
    log_success "Deployment preparation completed"
    save_state "deployment_prepared"
}

# Function to run validation
run_validation() {
    log_info "Running final validation..."
    
    # Check if all required files exist
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found: $ENV_FILE"
        exit 1
    fi
    
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    if [ ! -f "$CONFIG_DIR/nginx/default.conf" ]; then
        log_error "Nginx configuration not found: $CONFIG_DIR/nginx/default.conf"
        exit 1
    fi
    
    if [ ! -f "$CONFIG_DIR/monitoring/prometheus.yml" ]; then
        log_error "Prometheus configuration not found: $CONFIG_DIR/monitoring/prometheus.yml"
        exit 1
    }
    
    # Check if Docker is running
    if ! systemctl is-active --quiet docker; then
        log_error "Docker is not running!"
        exit 1
    fi
    
    # Validate Docker Compose file
    cd "$PROJECT_DIR"
    if ! docker compose config &>/dev/null; then
        log_error "Docker Compose configuration is invalid!"
        exit 1
    fi
    
    log_success "Validation completed successfully"
    save_state "validation_completed"
}

# Main function
main() {
    log_info "Starting Risk Platform VPS Deployment Continuation Script"
    
    # Create main project directory
    mkdir -p "$PROJECT_DIR"
    
    # Install Docker and Docker Compose
    install_docker
    
    # Create project structure
    create_project_structure
    
    # Create environment file
    create_env_file
    
    # Create Docker Compose file
    create_docker_compose
    
    # Set up API and monitoring services
    setup_services
    
    # Prepare for deployment
    prepare_deployment
    
    # Run validation
    run_validation
    
    log_success "Deployment continuation script completed successfully!"
    log_info "The Risk Platform is now ready for deployment"
    log_info "To deploy the platform, run: $SCRIPTS_DIR/deploy.sh"
    log_info "Log file: $LOG_FILE"
    
    save_state "completed"
}

# Run main function
main
