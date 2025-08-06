#!/bin/bash
# pre-docker-deployment.sh
# Comprehensive deployment script for environments with Docker pre-installed
# Version: 1.0.0
# Date: 2025-08-04

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_DIR="/opt/risk-platform"
DASHBOARD_DIR="${PLATFORM_DIR}/dashboard"
DB_DIR="${PLATFORM_DIR}/database"
NGINX_DIR="${PLATFORM_DIR}/nginx"
DOCKER_COMPOSE_DIR="${PLATFORM_DIR}/docker"
LOG_DIR="/var/log/risk-platform"
STATE_DIR="${PLATFORM_DIR}/.state"
STATE_FILE="${STATE_DIR}/deployment_state.json"
BACKUP_DIR="${PLATFORM_DIR}/backups"
LOG_FILE="${LOG_DIR}/deployment-$(date +%Y%m%d-%H%M%S).log"
DOCKER_NETWORK="risk-platform-network"

# Container names
NGINX_CONTAINER="risk-platform-nginx"
POSTGRES_CONTAINER="risk-platform-postgres"
API_CONTAINER="risk-platform-api"
GRAFANA_CONTAINER="risk-platform-grafana"
PROMETHEUS_CONTAINER="risk-platform-prometheus"
ALERTMANAGER_CONTAINER="risk-platform-alertmanager"

# Database configuration
DB_NAME="risk_platform"
DB_USER="risk_platform"
DB_PASSWORD="Risk_Platform_$(date +%s | sha256sum | base64 | head -c 12)"
DB_READONLY_USER="${DB_USER}_readonly"
DB_READONLY_PASSWORD="Readonly_$(date +%s | sha256sum | base64 | head -c 12)"

# Default options
SKIP_SYSTEM_HARDENING=false
SKIP_FIREWALL=false
SKIP_DOCKER_CONFIG=false
SKIP_MONITORING=false
SKIP_VALIDATION=false
FORCE_RECREATE=false
INTERACTIVE=false
VERBOSE=false
RESUME=false
DEPLOYMENT_ID=$(date +%Y%m%d%H%M%S)

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  RISK PLATFORM DEPLOYMENT (DOCKER PRE-INSTALLED)  ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Create directories
mkdir -p "$PLATFORM_DIR" "$DASHBOARD_DIR" "$DB_DIR" "$NGINX_DIR" "$DOCKER_COMPOSE_DIR" "$LOG_DIR" "$STATE_DIR" "$BACKUP_DIR"

# Ensure log file exists and is writable
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

# Logging functions
log() { 
    local level="INFO"
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${BLUE}${level}:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ${level}: $1" >> "$LOG_FILE"
}

success() { 
    local level="SUCCESS"
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${GREEN}${level}:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ${level}: $1" >> "$LOG_FILE"
}

warning() { 
    local level="WARNING"
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${YELLOW}${level}:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ${level}: $1" >> "$LOG_FILE"
}

error() { 
    local level="ERROR"
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${RED}${level}:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ${level}: $1" >> "$LOG_FILE"
}

section() {
    echo ""
    echo -e "${CYAN}=== $1 ===${NC}"
    echo -e "${CYAN}$(printf '=%.0s' $(seq 1 ${#1}))======${NC}"
    echo ""
    echo "=== $1 ===" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# State management functions
init_state() {
    # Create initial state file if it doesn't exist
    if [ ! -f "$STATE_FILE" ]; then
        cat > "$STATE_FILE" << EOF
{
    "deployment_id": "$DEPLOYMENT_ID",
    "start_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "last_updated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "status": "in_progress",
    "current_step": "init",
    "completed_steps": [],
    "failed_steps": [],
    "skipped_steps": [],
    "environment": {
        "os": "$(cat /etc/os-release | grep "^ID=" | cut -d'=' -f2 || echo "unknown")",
        "version": "$(cat /etc/os-release | grep "^VERSION_ID=" | cut -d'=' -f2 | tr -d '\"' || echo "unknown")",
        "docker_version": "$(docker --version 2>/dev/null | awk '{print $3}' | tr -d ',' || echo "unknown")",
        "docker_compose_version": "$(docker-compose --version 2>/dev/null | awk '{print $3}' || echo "unknown")"
    },
    "config": {
        "platform_dir": "$PLATFORM_DIR",
        "db_name": "$DB_NAME",
        "db_user": "$DB_USER",
        "nginx_container": "$NGINX_CONTAINER",
        "postgres_container": "$POSTGRES_CONTAINER",
        "api_container": "$API_CONTAINER",
        "grafana_container": "$GRAFANA_CONTAINER",
        "prometheus_container": "$PROMETHEUS_CONTAINER",
        "alertmanager_container": "$ALERTMANAGER_CONTAINER",
        "docker_network": "$DOCKER_NETWORK"
    }
}
EOF
        success "Deployment state initialized"
    else
        log "Using existing deployment state"
        if [ "$RESUME" = true ]; then
            log "Resuming previous deployment"
        else
            warning "Previous deployment state exists. Use --resume to continue or --force to start fresh."
            exit 1
        fi
    fi
}

update_state() {
    local step="$1"
    local status="$2"
    
    # Read current state
    local state=$(cat "$STATE_FILE")
    
    # Update state based on status
    if [ "$status" = "completed" ]; then
        # Add to completed steps if not already there
        if ! echo "$state" | grep -q "\"$step\"" | grep "completed_steps"; then
            state=$(echo "$state" | sed "s/\"completed_steps\": \[/\"completed_steps\": \[\"$step\", /")
        fi
        # Update current step
        state=$(echo "$state" | sed "s/\"current_step\": \"[^\"]*\"/\"current_step\": \"$step\"/" )
    elif [ "$status" = "failed" ]; then
        # Add to failed steps
        state=$(echo "$state" | sed "s/\"failed_steps\": \[/\"failed_steps\": \[\"$step\", /")
        # Update status
        state=$(echo "$state" | sed "s/\"status\": \"[^\"]*\"/\"status\": \"failed\"/" )
    elif [ "$status" = "skipped" ]; then
        # Add to skipped steps
        state=$(echo "$state" | sed "s/\"skipped_steps\": \[/\"skipped_steps\": \[\"$step\", /")
    fi
    
    # Update last_updated
    state=$(echo "$state" | sed "s/\"last_updated\": \"[^\"]*\"/\"last_updated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"/" )
    
    # Write updated state
    echo "$state" > "$STATE_FILE"
}

is_step_completed() {
    local step="$1"
    grep -q "\"$step\"" "$STATE_FILE" | grep "completed_steps" && return 0 || return 1
}

# Backup and rollback functions
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        local backup_file="${BACKUP_DIR}/$(basename "$file").$(date +%Y%m%d%H%M%S).bak"
        cp "$file" "$backup_file"
        log "Backed up $file to $backup_file"
    fi
}

rollback() {
    local step="$1"
    
    section "ROLLING BACK: $step"
    
    case "$step" in
        "docker_config")
            log "Rolling back Docker configuration"
            if [ -f "${BACKUP_DIR}/daemon.json.bak" ]; then
                cp "${BACKUP_DIR}/daemon.json.bak" "/etc/docker/daemon.json"
                systemctl restart docker
                log "Restored Docker configuration"
            fi
            ;;
        "firewall")
            log "Rolling back firewall configuration"
            if command -v ufw &>/dev/null; then
                ufw default allow
                ufw disable
                log "Disabled UFW firewall"
            fi
            ;;
        "docker_network")
            log "Rolling back Docker network"
            docker network rm "$DOCKER_NETWORK" 2>/dev/null || true
            log "Removed Docker network"
            ;;
        "containers")
            log "Rolling back containers"
            docker rm -f "$NGINX_CONTAINER" "$POSTGRES_CONTAINER" "$API_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER" 2>/dev/null || true
            log "Removed all containers"
            ;;
        "volumes")
            log "Rolling back volumes"
            docker volume prune -f
            log "Removed unused volumes"
            ;;
        *)
            log "No specific rollback procedure for $step"
            ;;
    esac
    
    update_state "$step" "failed"
    error "Deployment failed at step: $step. Rolled back changes."
}

# Helper functions
check_command() {
    local cmd="$1"
    if ! command -v "$cmd" &>/dev/null; then
        error "Required command not found: $cmd"
        return 1
    fi
    return 0
}

confirm() {
    if [ "$INTERACTIVE" = true ]; then
        read -p "$1 (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    return 0
}

# Function to check if a step should be executed based on resume state
should_execute_step() {
    local step="$1"
    
    if [ "$RESUME" = true ]; then
        if is_step_completed "$step"; then
            log "Skipping already completed step: $step"
            return 1
        fi
    fi
    
    return 0
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --skip-system-hardening)
                SKIP_SYSTEM_HARDENING=true
                shift
                ;;
            --skip-firewall)
                SKIP_FIREWALL=true
                shift
                ;;
            --skip-docker-config)
                SKIP_DOCKER_CONFIG=true
                shift
                ;;
            --skip-monitoring)
                SKIP_MONITORING=true
                shift
                ;;
            --skip-validation)
                SKIP_VALIDATION=true
                shift
                ;;
            --force)
                FORCE_RECREATE=true
                shift
                ;;
            --interactive)
                INTERACTIVE=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --resume)
                RESUME=true
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-system-hardening   Skip system hardening steps"
                echo "  --skip-firewall           Skip firewall configuration"
                echo "  --skip-docker-config      Skip Docker configuration"
                echo "  --skip-monitoring         Skip monitoring setup"
                echo "  --skip-validation         Skip validation steps"
                echo "  --force                   Force recreation of resources"
                echo "  --interactive             Run in interactive mode"
                echo "  --verbose                 Show verbose output"
                echo "  --resume                  Resume previous deployment"
                echo "  --help                    Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                echo "Use --help to see available options"
                exit 1
                ;;
        esac
    done
}

# Main deployment steps
validate_prerequisites() {
    section "VALIDATING PREREQUISITES"
    
    if ! should_execute_step "validate_prerequisites"; then
        return 0
    fi
    
    # Check for required commands
    log "Checking for required commands"
    for cmd in docker docker-compose curl wget jq; do
        if ! check_command "$cmd"; then
            if [ "$cmd" = "docker" ]; then
                error "Docker is not installed. This script requires a pre-installed Docker environment."
                exit 1
            elif [ "$cmd" = "docker-compose" ]; then
                warning "docker-compose not found, checking for Docker Compose plugin"
                if ! docker compose version &>/dev/null; then
                    error "Neither docker-compose nor Docker Compose plugin found. Please install Docker Compose."
                    exit 1
                else
                    success "Docker Compose plugin found"
                fi
            else
                warning "$cmd not found, will attempt to install"
                if command -v apt-get &>/dev/null; then
                    apt-get update && apt-get install -y "$cmd"
                elif command -v dnf &>/dev/null; then
                    dnf install -y "$cmd"
                elif command -v yum &>/dev/null; then
                    yum install -y "$cmd"
                else
                    error "Package manager not found. Please install $cmd manually."
                    exit 1
                fi
            fi
        else
            success "$cmd is installed"
        fi
    done
    
    # Check Docker version
    log "Checking Docker version"
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | tr -d ',')
    log "Docker version: $DOCKER_VERSION"
    
    # Check Docker Compose version
    log "Checking Docker Compose version"
    if command -v docker-compose &>/dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | awk '{print $3}')
        log "Docker Compose version: $COMPOSE_VERSION"
    else
        COMPOSE_VERSION=$(docker compose version --short)
        log "Docker Compose plugin version: $COMPOSE_VERSION"
    fi
    
    # Check Docker service status
    log "Checking Docker service status"
    if systemctl is-active --quiet docker; then
        success "Docker service is running"
    else
        error "Docker service is not running"
        log "Attempting to start Docker service"
        systemctl start docker
        if systemctl is-active --quiet docker; then
            success "Docker service started successfully"
        else
            error "Failed to start Docker service"
            exit 1
        fi
    fi
    
    # Check if current user can run Docker commands
    log "Checking Docker permissions"
    if docker info &>/dev/null; then
        success "Current user can run Docker commands"
    else
        warning "Current user cannot run Docker commands"
        
        # Check if user is in docker group
        if groups | grep -q docker; then
            warning "User is in docker group but cannot run Docker commands"
            log "This might be due to a recent group addition. Try logging out and back in."
            
            # Try to refresh group membership
            exec su -l $USER
            
            # Check again
            if docker info &>/dev/null; then
                success "Docker permissions fixed"
            else
                error "Still cannot run Docker commands. Please ensure Docker is properly installed and the user has appropriate permissions."
                exit 1
            fi
        else
            warning "User is not in docker group"
            log "Adding current user to docker group"
            usermod -aG docker $USER
            log "Please log out and log back in to apply group changes, then run this script again."
            exit 0
        fi
    fi
    
    # Check if Docker registry is accessible
    log "Checking Docker registry access"
    if docker pull hello-world &>/dev/null; then
        success "Docker registry is accessible"
        docker rmi hello-world &>/dev/null || true
    else
        warning "Cannot access Docker registry"
        log "Will use local images if available"
    fi
    
    # Check system resources
    log "Checking system resources"
    CPU_CORES=$(nproc --all)
    TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
    DISK_SPACE=$(df -h / | awk 'NR==2 {print $4}')
    
    log "CPU cores: $CPU_CORES"
    log "Total memory: ${TOTAL_MEM}MB"
    log "Available disk space: $DISK_SPACE"
    
    if [ "$CPU_CORES" -lt 2 ]; then
        warning "Low CPU resources detected (< 2 cores). Performance may be affected."
    fi
    
    if [ "$TOTAL_MEM" -lt 2048 ]; then
        warning "Low memory detected (< 2GB). Performance may be affected."
    fi
    
    # Check if ports are available
    log "Checking if required ports are available"
    for port in 80 443 5432 3000 9090 9093; do
        if netstat -tuln | grep -q ":$port "; then
            warning "Port $port is already in use"
        else
            success "Port $port is available"
        fi
    done
    
    update_state "validate_prerequisites" "completed"
}

configure_docker() {
    section "CONFIGURING DOCKER"
    
    if ! should_execute_step "configure_docker"; then
        return 0
    fi
    
    if [ "$SKIP_DOCKER_CONFIG" = true ]; then
        log "Skipping Docker configuration as requested"
        update_state "configure_docker" "skipped"
        return 0
    fi
    
    # Check if Docker daemon.json exists
    log "Checking Docker daemon configuration"
    if [ -f "/etc/docker/daemon.json" ]; then
        backup_file "/etc/docker/daemon.json"
        log "Existing Docker daemon configuration found"
        
        # Read current config
        DOCKER_CONFIG=$(cat /etc/docker/daemon.json)
        
        # Check if config needs to be updated
        if echo "$DOCKER_CONFIG" | grep -q "log-driver"; then
            log "Docker logging already configured"
        else
            log "Updating Docker daemon configuration"
            
            # Create updated config with proper logging and resource limits
            TMP_CONFIG=$(mktemp)
            
            # If existing config is empty or not valid JSON, create new one
            if [ -z "$DOCKER_CONFIG" ] || ! jq . <<< "$DOCKER_CONFIG" &>/dev/null; then
                cat > "$TMP_CONFIG" << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "name": "nofile",
      "hard": 64000,
      "soft": 64000
    }
  },
  "live-restore": true,
  "default-address-pools": [
    {
      "base": "172.18.0.0/16",
      "size": 24
    }
  ]
}
EOF
            else
                # Merge with existing config
                jq '. + {
                    "log-driver": "json-file",
                    "log-opts": {
                        "max-size": "100m",
                        "max-file": "3"
                    },
                    "default-ulimits": {
                        "nofile": {
                            "name": "nofile",
                            "hard": 64000,
                            "soft": 64000
                        }
                    },
                    "live-restore": true
                }' <<< "$DOCKER_CONFIG" > "$TMP_CONFIG"
            fi
            
            # Apply new config
            cp "$TMP_CONFIG" "/etc/docker/daemon.json"
            rm "$TMP_CONFIG"
            
            # Restart Docker to apply changes
            log "Restarting Docker service to apply configuration changes"
            systemctl restart docker
            
            # Wait for Docker to restart
            sleep 5
            
            # Verify Docker is running
            if systemctl is-active --quiet docker; then
                success "Docker service restarted successfully"
            else
                error "Failed to restart Docker service"
                rollback "docker_config"
                exit 1
            fi
        fi
    else
        log "No Docker daemon configuration found, creating one"
        
        # Create Docker config directory if it doesn't exist
        mkdir -p /etc/docker
        
        # Create daemon.json with proper logging and resource limits
        cat > "/etc/docker/daemon.json" << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "name": "nofile",
      "hard": 64000,
      "soft": 64000
    }
  },
  "live-restore": true,
  "default-address-pools": [
    {
      "base": "172.18.0.0/16",
      "size": 24
    }
  ]
}
EOF
        
        # Restart Docker to apply changes
        log "Restarting Docker service to apply configuration changes"
        systemctl restart docker
        
        # Wait for Docker to restart
        sleep 5
        
        # Verify Docker is running
        if systemctl is-active --quiet docker; then
            success "Docker service restarted successfully"
        else
            error "Failed to restart Docker service"
            rollback "docker_config"
            exit 1
        fi
    fi
    
    # Configure Docker Compose
    log "Configuring Docker Compose"
    
    # Create Docker Compose directory
    mkdir -p "$DOCKER_COMPOSE_DIR"
    
    # Create Docker Compose file
    cat > "$DOCKER_COMPOSE_DIR/docker-compose.yml" << EOF
version: '3.8'

services:
  postgres:
    container_name: ${POSTGRES_CONTAINER}
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - risk_platform_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    container_name: ${NGINX_CONTAINER}
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ${NGINX_DIR}/conf.d:/etc/nginx/conf.d
      - ${DASHBOARD_DIR}/public:/opt/risk-platform/dashboard/public
    networks:
      - risk_platform_network
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  grafana:
    container_name: ${GRAFANA_CONTAINER}
    image: grafana/grafana:latest
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_USERS_ALLOW_SIGN_UP: "false"
      GF_SERVER_ROOT_URL: "%(protocol)s://%(domain)s/monitoring"
      GF_SERVER_SERVE_FROM_SUB_PATH: "true"
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - risk_platform_network
    depends_on:
      - prometheus
    user: "472"

  prometheus:
    container_name: ${PROMETHEUS_CONTAINER}
    image: prom/prometheus:latest
    restart: unless-stopped
    volumes:
      - ${PLATFORM_DIR}/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - risk_platform_network

  alertmanager:
    container_name: ${ALERTMANAGER_CONTAINER}
    image: prom/alertmanager:latest
    restart: unless-stopped
    volumes:
      - ${PLATFORM_DIR}/alertmanager:/etc/alertmanager
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - risk_platform_network

networks:
  risk_platform_network:
    name: ${DOCKER_NETWORK}
    driver: bridge

volumes:
  postgres_data:
  grafana_data:
  prometheus_data:
  alertmanager_data:
EOF
    
    success "Docker Compose configuration created"
    update_state "configure_docker" "completed"
}

configure_system() {
    section "CONFIGURING SYSTEM"
    
    if ! should_execute_step "configure_system"; then
        return 0
    fi
    
    if [ "$SKIP_SYSTEM_HARDENING" = true ]; then
        log "Skipping system hardening as requested"
        update_state "configure_system" "skipped"
        return 0
    fi
    
    # Update system packages
    log "Updating system packages"
    if command -v apt-get &>/dev/null; then
        apt-get update
        DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
    elif command -v dnf &>/dev/null; then
        dnf upgrade -y
    elif command -v yum &>/dev/null; then
        yum update -y
    else
        warning "Unknown package manager, skipping system updates"
    fi
    
    # Set up swap if needed
    log "Checking swap configuration"
    SWAP_SIZE=$(free -m | awk '/^Swap:/ {print $2}')
    if [ "$SWAP_SIZE" -lt 1024 ]; then
        log "Swap size is less than 1GB, configuring swap"
        
        # Create swap file
        if [ ! -f /swapfile ]; then
            log "Creating swap file"
            fallocate -l 2G /swapfile
            chmod 600 /swapfile
            mkswap /swapfile
            swapon /swapfile
            echo '/swapfile none swap sw 0 0' >> /etc/fstab
            success "Swap file created and enabled"
        else
            log "Swap file already exists"
        fi
    else
        log "Swap size is adequate: ${SWAP_SIZE}MB"
    fi
    
    # Configure system limits
    log "Configuring system limits"
    
    # Increase file descriptor limits
    if [ ! -f /etc/security/limits.d/risk-platform.conf ]; then
        cat > /etc/security/limits.d/risk-platform.conf << EOF
*       soft    nofile  65536
*       hard    nofile  65536
*       soft    nproc   65536
*       hard    nproc   65536
EOF
        success "System limits configured"
    else
        log "System limits already configured"
    fi
    
    # Configure sysctl parameters
    log "Configuring sysctl parameters"
    
    if [ ! -f /etc/sysctl.d/99-risk-platform.conf ]; then
        cat > /etc/sysctl.d/99-risk-platform.conf << EOF
# Network optimizations
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 65536
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15

# File system optimizations
fs.file-max = 2097152

# VM optimizations
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2
EOF
        
        # Apply sysctl changes
        sysctl -p /etc/sysctl.d/99-risk-platform.conf
        success "Sysctl parameters configured"
    else
        log "Sysctl parameters already configured"
    fi
    
    # Create system user for the application if needed
    log "Checking system user"
    if ! id -u risk-platform &>/dev/null; then
        log "Creating system user for Risk Platform"
        useradd -r -s /bin/false -d /opt/risk-platform risk-platform
        success "System user created"
    else
        log "System user already exists"
    fi
    
    # Set proper ownership for platform directory
    log "Setting proper ownership for platform directory"
    chown -R risk-platform:risk-platform "$PLATFORM_DIR"
    success "Directory ownership set"
    
    update_state "configure_system" "completed"
}

configure_firewall() {
    section "CONFIGURING FIREWALL"
    
    if ! should_execute_step "configure_firewall"; then
        return 0
    fi
    
    if [ "$SKIP_FIREWALL" = true ]; then
        log "Skipping firewall configuration as requested"
        update_state "configure_firewall" "skipped"
        return 0
    fi
    
    # Check if UFW is installed
    if ! command -v ufw &>/dev/null; then
        log "UFW not found, installing"
        if command -v apt-get &>/dev/null; then
            apt-get update && apt-get install -y ufw
        elif command -v dnf &>/dev/null; then
            dnf install -y ufw
        elif command -v yum &>/dev/null; then
            yum install -y ufw
        else
            warning "Cannot install UFW, unknown package manager"
            update_state "configure_firewall" "skipped"
            return 0
        fi
    fi
    
    # Configure UFW
    log "Configuring UFW firewall"
    
    # Reset UFW to default
    log "Resetting UFW to default"
    ufw --force reset
    
    # Set default policies
    log "Setting default policies"
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (always allow SSH to prevent lockout)
    log "Allowing SSH access"
    ufw allow 22/tcp
    
    # Allow HTTP and HTTPS
    log "Allowing HTTP and HTTPS access"
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow RDP if needed
    log "Checking for RDP port"
    if netstat -tuln | grep -q ":3389 "; then
        log "RDP port detected, allowing RDP access"
        ufw allow 3389/tcp
    fi
    
    # Enable UFW
    log "Enabling UFW"
    echo "y" | ufw enable
    
    # Verify UFW status
    log "Verifying UFW status"
    UFW_STATUS=$(ufw status)
    echo "$UFW_STATUS" >> "$LOG_FILE"
    
    if echo "$UFW_STATUS" | grep -q "Status: active"; then
        success "UFW firewall configured and enabled"
    else
        warning "UFW firewall not active"
    fi
    
    update_state "configure_firewall" "completed"
}

setup_docker_network() {
    section "SETTING UP DOCKER NETWORK"
    
    if ! should_execute_step "setup_docker_network"; then
        return 0
    fi
    
    # Check if network already exists
    log "Checking if Docker network exists"
    if docker network ls | grep -q "$DOCKER_NETWORK"; then
        log "Docker network already exists"
        
        if [ "$FORCE_RECREATE" = true ]; then
            log "Force recreate enabled, removing existing network"
            docker network rm "$DOCKER_NETWORK" || true
        else
            success "Using existing Docker network"
            update_state "setup_docker_network" "completed"
            return 0
        fi
    fi
    
    # Create Docker network
    log "Creating Docker network"
    docker network create --driver bridge "$DOCKER_NETWORK"
    
    # Verify network creation
    if docker network ls | grep -q "$DOCKER_NETWORK"; then
        success "Docker network created successfully"
    else
        error "Failed to create Docker network"
        rollback "docker_network"
        exit 1
    fi
    
    update_state "setup_docker_network" "completed"
}

setup_nginx() {
    section "SETTING UP NGINX"
    
    if ! should_execute_step "setup_nginx"; then
        return 0
    fi
    
    # Create Nginx configuration directory
    log "Creating Nginx configuration directory"
    mkdir -p "${NGINX_DIR}/conf.d"
    
    # Create Nginx configuration
    log "Creating Nginx configuration"
    cat > "${NGINX_DIR}/conf.d/default.conf" << 'EOF'
# Dashboard Configuration
server {
    listen 80;
    server_name _;

    # Dashboard
    location / {
        root /opt/risk-platform/dashboard/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Monitoring
    location /monitoring {
        proxy_pass http://grafana:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        root /opt/risk-platform/dashboard/public;
        expires max;
        log_not_found off;
    }
}
EOF
    
    success "Nginx configuration created"
    update_state "setup_nginx" "completed"
}

create_dashboard_files() {
    section "CREATING DASHBOARD FILES"
    
    if ! should_execute_step "create_dashboard_files"; then
        return 0
    fi
    
    # Create dashboard directory
    log "Creating dashboard directory"
    mkdir -p "$DASHBOARD_DIR/public"
    
    # Create index.html
    log "Creating index.html"
    cat > "$DASHBOARD_DIR/public/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Platform Dashboard</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav id="sidebar" class="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
                <div class="position-sticky pt-3">
                    <div class="sidebar-header mb-4">
                        <h3 class="text-light">Risk Platform</h3>
                    </div>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active" href="#dashboard">
                                <i class="bi bi-speedometer2 me-2"></i>
                                Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#threats">
                                <i class="bi bi-shield-exclamation me-2"></i>
                                Threats
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#risks">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                Risks
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#capabilities">
                                <i class="bi bi-check-circle me-2"></i>
                                Capabilities
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#requirements">
                                <i class="bi bi-list-check me-2"></i>
                                Requirements
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#evidence">
                                <i class="bi bi-file-earmark-text me-2"></i>
                                Evidence
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#reports">
                                <i class="bi bi-graph-up me-2"></i>
                                Reports
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#settings">
                                <i class="bi bi-gear me-2"></i>
                                Settings
                            </a>
                        </li>
                    </ul>
                    <hr class="text-light">
                    <div class="dropdown pb-4">
                        <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="https://github.com/mdo.png" alt="User" width="32" height="32" class="rounded-circle me-2">
                            <span>Admin User</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                            <li><a class="dropdown-item" href="#profile">Profile</a></li>
                            <li><a class="dropdown-item" href="#settings">Settings</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#logout">Sign out</a></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <!-- Main content -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Dashboard</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group me-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle">
                            <i class="bi bi-calendar3"></i>
                            This week
                        </button>
                    </div>
                </div>

                <!-- Dashboard overview -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-white bg-primary mb-3">
                            <div class="card-header">Threats</div>
                            <div class="card-body">
                                <h5 class="card-title">15 Active Threats</h5>
                                <p class="card-text">3 Critical, 7 High, 5 Medium</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-danger mb-3">
                            <div class="card-header">Risks</div>
                            <div class="card-body">
                                <h5 class="card-title">12 Open Risks</h5>
                                <p class="card-text">2 Critical, 5 High, 5 Medium</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-success mb-3">
                            <div class="card-header">Capabilities</div>
                            <div class="card-body">
                                <h5 class="card-title">24 Capabilities</h5>
                                <p class="card-text">8 Mature, 12 Developing, 4 Initial</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-info mb-3">
                            <div class="card-header">Requirements</div>
                            <div class="card-body">
                                <h5 class="card-title">45 Requirements</h5>
                                <p class="card-text">32 Compliant, 8 Partial, 5 Non-Compliant</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Trust Score -->
                <div class="row mb-4">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Trust Score</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4 text-center">
                                        <div class="trust-score-circle">
                                            <h1>78%</h1>
                                            <p>Overall Trust Score</p>
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <canvas id="trustScoreChart" width="400" height="200"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <h2>Recent Activity</h2>
                <div class="table-responsive">
                    <table class="table table-striped table-sm">
                        <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">User</th>
                                <th scope="col">Action</th>
                                <th scope="col">Entity</th>
                                <th scope="col">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2025-08-04</td>
                                <td>Admin User</td>
                                <td>Created</td>
                                <td>Threat</td>
                                <td>Phishing Campaign (THR-001)</td>
                            </tr>
                            <tr>
                                <td>2025-08-03</td>
                                <td>John Doe</td>
                                <td>Updated</td>
                                <td>Risk</td>
                                <td>Data Breach Risk (RSK-002)</td>
                            </tr>
                            <tr>
                                <td>2025-08-02</td>
                                <td>Jane Smith</td>
                                <td>Added</td>
                                <td>Evidence</td>
                                <td>Security Awareness Training (EVD-005)</td>
                            </tr>
                            <tr>
                                <td>2025-08-01</td>
                                <td>Admin User</td>
                                <td>Created</td>
                                <td>Capability</td>
                                <td>Endpoint Protection (CAP-008)</td>
                            </tr>
                            <tr>
                                <td>2025-07-31</td>
                                <td>John Doe</td>
                                <td>Updated</td>
                                <td>Requirement</td>
                                <td>Access Control Policy (REQ-012)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="script.js"></script>
</body>
</html>
EOF
    
    # Create CSS file
    log "Creating styles.css"
    cat > "$DASHBOARD_DIR/public/styles.css" << 'EOF'
body {
    font-size: .875rem;
    background-color: #f8f9fa;
}

.feather {
    width: 16px;
    height: 16px;
    vertical-align: text-bottom;
}

/*
 * Sidebar
 */
.sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
    padding: 48px 0 0;
    box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
    height: 100vh;
}

.sidebar-sticky {
    position: relative;
    top: 0;
    height: calc(100vh - 48px);
    padding-top: .5rem;
    overflow-x: hidden;
    overflow-y: auto;
}

.sidebar .nav-link {
    font-weight: 500;
    color: #ccc;
}

.sidebar .nav-link.active {
    color: #fff;
    background-color: #0d6efd;
}

.sidebar .nav-link:hover {
    color: #fff;
}

.sidebar-header {
    padding: 0.5rem 1rem;
    text-align: center;
}

.sidebar hr {
    margin: 1rem 0;
}

/*
 * Navbar
 */
.navbar-brand {
    padding-top: .75rem;
    padding-bottom: .75rem;
    font-size: 1rem;
    background-color: rgba(0, 0, 0, .25);
    box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25);
}

/*
 * Content
 */
main {
    padding-top: 1.5rem;
}

.trust-score-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.trust-score-circle h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: bold;
}

.trust-score-circle p {
    margin: 0;
    font-size: 0.9rem;
}

.card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    margin-bottom: 1.5rem;
}

.card-header {
    background-color: rgba(0, 0, 0, 0.03);
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.table {
    font-size: 0.875rem;
}
EOF
    
    # Create JavaScript file
    log "Creating script.js"
    cat > "$DASHBOARD_DIR/public/script.js" << 'EOF'
document.addEventListener("DOMContentLoaded", function() {
    // Initialize trust score chart
    const ctx = document.getElementById("trustScoreChart").getContext("2d");
    const trustScoreChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Cyber", "Physical", "Operational", "Compliance", "Strategic"],
            datasets: [{
                label: "Trust Score by Category",
                data: [85, 72, 78, 90, 65],
                backgroundColor: [
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)"
                ],
                borderColor: [
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Handle sidebar navigation
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove("active"));
            
            // Add active class to clicked link
            this.classList.add("active");
            
            // Update main content based on the clicked link
            const target = this.getAttribute("href").substring(1);
            updateContent(target);
        });
    });

    // Function to update content based on navigation
    function updateContent(section) {
        const mainContent = document.querySelector("main");
        const pageTitle = document.querySelector("main h1");
        
        // Update page title
        pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
        
        // In a real application, this would load content from the server
        console.log(`Loading ${section} content...`);
    }

    // Simulate API data loading
    console.log("Loading dashboard data...");
    setTimeout(() => {
        console.log("Dashboard data loaded successfully");
    }, 1000);
});
EOF
    
    # Set proper permissions
    log "Setting proper permissions for dashboard files"
    chmod -R 755 "$DASHBOARD_DIR"
    chown -R risk-platform:risk-platform "$DASHBOARD_DIR"
    
    success "Dashboard files created successfully"
    update_state "create_dashboard_files" "completed"
}

setup_prometheus() {
    section "SETTING UP PROMETHEUS"
    
    if ! should_execute_step "setup_prometheus"; then
        return 0
    fi
    
    if [ "$SKIP_MONITORING" = true ]; then
        log "Skipping Prometheus setup as requested"
        update_state "setup_prometheus" "skipped"
        return 0
    fi
    
    # Create Prometheus configuration directory
    log "Creating Prometheus configuration directory"
    mkdir -p "${PLATFORM_DIR}/prometheus"
    
    # Create Prometheus configuration
    log "Creating Prometheus configuration"
    cat > "${PLATFORM_DIR}/prometheus/prometheus.yml" << EOF
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

  - job_name: 'node'
    static_configs:
      - targets: ['host.docker.internal:9100']

  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']
EOF
    
    # Create rules directory
    log "Creating Prometheus rules directory"
    mkdir -p "${PLATFORM_DIR}/prometheus/rules"
    
    # Create basic alert rules
    log "Creating basic alert rules"
    cat > "${PLATFORM_DIR}/prometheus/rules/alerts.yml" << EOF
groups:
  - name: basic_alerts
    rules:
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Instance {{ \$labels.instance }} down"
          description: "{{ \$labels.instance }} of job {{ \$labels.job }} has been down for more than 1 minute."

      - alert: HighCPULoad
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU load on {{ \$labels.instance }}"
          description: "CPU load on {{ \$labels.instance }} is above 80% for more than 5 minutes."

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ \$labels.instance }}"
          description: "Memory usage on {{ \$labels.instance }} is above 85% for more than 5 minutes."

      - alert: HighDiskUsage
        expr: 100 - ((node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100) > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High disk usage on {{ \$labels.instance }}"
          description: "Disk usage on {{ \$labels.instance }} is above 85% for more than 5 minutes."
EOF
    
    # Set proper permissions
    log "Setting proper permissions for Prometheus files"
    chmod -R 755 "${PLATFORM_DIR}/prometheus"
    chown -R risk-platform:risk-platform "${PLATFORM_DIR}/prometheus"
    
    success "Prometheus configuration created successfully"
    update_state "setup_prometheus" "completed"
}

setup_alertmanager() {
    section "SETTING UP ALERTMANAGER"
    
    if ! should_execute_step "setup_alertmanager"; then
        return 0
    fi
    
    if [ "$SKIP_MONITORING" = true ]; then
        log "Skipping Alertmanager setup as requested"
        update_state "setup_alertmanager" "skipped"
        return 0
    fi
    
    # Create Alertmanager configuration directory
    log "Creating Alertmanager configuration directory"
    mkdir -p "${PLATFORM_DIR}/alertmanager"
    
    # Create Alertmanager configuration
    log "Creating Alertmanager configuration"
    cat > "${PLATFORM_DIR}/alertmanager/alertmanager.yml" << EOF
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  receiver: 'email'

receivers:
  - name: 'email'
    email_configs:
      - to: 'alerts@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alertmanager@example.com'
        auth_password: 'password'
        require_tls: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
EOF
    
    # Set proper permissions
    log "Setting proper permissions for Alertmanager files"
    chmod -R 755 "${PLATFORM_DIR}/alertmanager"
    chown -R risk-platform:risk-platform "${PLATFORM_DIR}/alertmanager"
    
    success "Alertmanager configuration created successfully"
    update_state "setup_alertmanager" "completed"
}

setup_database() {
    section "SETTING UP DATABASE"
    
    if ! should_execute_step "setup_database"; then
        return 0
    fi
    
    # Create database initialization directory
    log "Creating database initialization directory"
    mkdir -p "${DB_DIR}/init"
    
    # Create database initialization script
    log "Creating database initialization script"
    cat > "${DB_DIR}/init/01-init.sql" << EOF
-- Create schema
CREATE SCHEMA IF NOT EXISTS risk_platform;

-- Set search path
SET search_path TO risk_platform;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    mfa_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Threats table
CREATE TABLE IF NOT EXISTS threats (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    severity VARCHAR(50),
    status VARCHAR(50),
    source VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    threat_id INTEGER REFERENCES threats(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    impact VARCHAR(50),
    likelihood VARCHAR(50),
    status VARCHAR(50),
    treatment_strategy VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Capabilities table
CREATE TABLE IF NOT EXISTS capabilities (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    maturity_level VARCHAR(50),
    status VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Requirements table
CREATE TABLE IF NOT EXISTS requirements (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    capability_id INTEGER REFERENCES capabilities(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    compliance_status VARCHAR(50),
    source VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    requirement_id INTEGER REFERENCES requirements(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    file_type VARCHAR(100),
    status VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create default organization
INSERT INTO organizations (name, slug, industry)
VALUES ('Default Organization', 'default', 'Technology')
ON CONFLICT (slug) DO NOTHING;

-- Create admin user
INSERT INTO users (
    organization_id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified_at
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'default'),
    'admin@risk-platform.local',
    MD5('admin123'),
    'Admin',
    'User',
    'admin',
    'active',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create read-only user for reporting
CREATE USER ${DB_READONLY_USER} WITH PASSWORD '${DB_READONLY_PASSWORD}';
GRANT CONNECT ON DATABASE risk_platform TO ${DB_READONLY_USER};
GRANT USAGE ON SCHEMA risk_platform TO ${DB_READONLY_USER};
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO ${DB_READONLY_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA risk_platform GRANT SELECT ON TABLES TO ${DB_READONLY_USER};
EOF
    
    # Create sample data script
    log "Creating sample data script"
    cat > "${DB_DIR}/init/02-sample-data.sql" << EOF
-- Set search path
SET search_path TO risk_platform;

-- Sample threats
INSERT INTO threats (organization_id, name, description, category, severity, status, source)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Phishing Campaign', 'Targeted phishing campaign against executives', 'Social Engineering', 'High', 'Active', 'External'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Ransomware', 'Potential ransomware attack through email attachments', 'Malware', 'Critical', 'Active', 'External'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Insider Threat', 'Disgruntled employee with access to sensitive data', 'Insider', 'Medium', 'Monitoring', 'Internal'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'DDoS Attack', 'Distributed denial of service attack against public services', 'Network', 'High', 'Active', 'External'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Zero-day Vulnerability', 'Unpatched zero-day vulnerability in web application', 'Application', 'Critical', 'Active', 'External');

-- Sample risks
INSERT INTO risks (organization_id, threat_id, name, description, category, impact, likelihood, status, treatment_strategy)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 1, 'Data Breach via Phishing', 'Unauthorized access to sensitive data through successful phishing', 'Data Protection', 'High', 'Medium', 'Open', 'Mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 2, 'Business Disruption', 'Critical systems unavailable due to ransomware', 'Business Continuity', 'Critical', 'Medium', 'Open', 'Mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 3, 'Data Exfiltration', 'Sensitive data stolen by insider', 'Data Protection', 'High', 'Low', 'Open', 'Mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 4, 'Service Unavailability', 'Customer-facing services unavailable during DDoS', 'Availability', 'Medium', 'High', 'Open', 'Transfer'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 5, 'Application Compromise', 'Web application compromised through zero-day', 'Application Security', 'High', 'Medium', 'Open', 'Mitigate');

-- Sample capabilities
INSERT INTO capabilities (organization_id, name, description, category, maturity_level, status)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Security Awareness', 'Employee security awareness training program', 'People', 'Managed', 'Active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Endpoint Protection', 'Endpoint detection and response solution', 'Technology', 'Defined', 'Active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Network Security', 'Firewall, IDS/IPS, and network monitoring', 'Technology', 'Managed', 'Active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Incident Response', 'Incident response plan and team', 'Process', 'Initial', 'Active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Vulnerability Management', 'Vulnerability scanning and patching process', 'Process', 'Defined', 'Active');

-- Sample requirements
INSERT INTO requirements (organization_id, capability_id, name, description, category, compliance_status, source)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 1, 'Annual Security Training', 'All employees must complete annual security awareness training', 'Training', 'Compliant', 'Internal Policy'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 2, 'EDR Deployment', 'EDR solution must be deployed on all endpoints', 'Endpoint Security', 'Partial', 'Internal Policy'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 3, 'Firewall Rules Review', 'Firewall rules must be reviewed quarterly', 'Network Security', 'Compliant', 'ISO 27001'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 4, 'Incident Response Testing', 'Incident response plan must be tested annually', 'Incident Management', 'Non-Compliant', 'NIST CSF'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 5, 'Monthly Vulnerability Scans', 'All systems must be scanned for vulnerabilities monthly', 'Vulnerability Management', 'Compliant', 'PCI DSS');

-- Sample evidence
INSERT INTO evidence (organization_id, requirement_id, name, description, file_path, file_type, status)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 1, 'Training Completion Records', 'Records of employee training completion', '/evidence/training_records.pdf', 'PDF', 'Verified'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 2, 'EDR Deployment Report', 'Report showing EDR deployment status', '/evidence/edr_report.xlsx', 'Excel', 'Pending Review'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 3, 'Firewall Rules Review', 'Documentation of firewall rules review', '/evidence/firewall_review.docx', 'Word', 'Verified'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 5, 'Vulnerability Scan Results', 'Latest vulnerability scan results', '/evidence/vuln_scan.pdf', 'PDF', 'Verified');
EOF
    
    # Set proper permissions
    log "Setting proper permissions for database files"
    chmod -R 755 "$DB_DIR"
    chown -R risk-platform:risk-platform "$DB_DIR"
    
    success "Database setup files created successfully"
    update_state "setup_database" "completed"
}

deploy_containers() {
    section "DEPLOYING CONTAINERS"
    
    if ! should_execute_step "deploy_containers"; then
        return 0
    fi
    
    # Pull required images
    log "Pulling required Docker images"
    docker pull postgres:15-alpine
    docker pull nginx:alpine
    docker pull grafana/grafana:latest
    docker pull prom/prometheus:latest
    docker pull prom/alertmanager:latest
    
    # Start containers using Docker Compose
    log "Starting containers with Docker Compose"
    cd "$DOCKER_COMPOSE_DIR"
    
    if command -v docker-compose &>/dev/null; then
        docker-compose up -d
    else
        docker compose up -d
    fi
    
    # Wait for containers to start
    log "Waiting for containers to start..."
    sleep 10
    
    # Check container status
    log "Checking container status"
    CONTAINERS_RUNNING=true
    
    for container in "$POSTGRES_CONTAINER" "$NGINX_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
        if ! docker ps | grep -q "$container"; then
            error "Container $container is not running"
            CONTAINERS_RUNNING=false
        else
            success "Container $container is running"
        fi
    done
    
    if [ "$CONTAINERS_RUNNING" = false ]; then
        error "Not all containers are running"
        
        # Check container logs for errors
        log "Checking container logs for errors"
        for container in "$POSTGRES_CONTAINER" "$NGINX_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
            if ! docker ps | grep -q "$container"; then
                log "Logs for $container:"
                docker logs "$container"
            fi
        done
        
        rollback "containers"
        exit 1
    fi
    
    success "All containers deployed successfully"
    update_state "deploy_containers" "completed"
}

configure_grafana() {
    section "CONFIGURING GRAFANA"
    
    if ! should_execute_step "configure_grafana"; then
        return 0
    fi
    
    if [ "$SKIP_MONITORING" = true ]; then
        log "Skipping Grafana configuration as requested"
        update_state "configure_grafana" "skipped"
        return 0
    fi
    
    # Wait for Grafana to start
    log "Waiting for Grafana to start..."
    sleep 10
    
    # Configure Grafana API key
    log "Configuring Grafana API key"
    GRAFANA_API_KEY=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"admin-api-key","role":"Admin"}' -u admin:admin http://localhost:3000/api/auth/keys | grep -o '"key":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$GRAFANA_API_KEY" ]; then
        warning "Failed to create Grafana API key"
    else
        success "Grafana API key created"
    fi
    
    # Add Prometheus data source
    log "Adding Prometheus data source"
    curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $GRAFANA_API_KEY" -d '{
        "name": "Prometheus",
        "type": "prometheus",
        "url": "http://prometheus:9090",
        "access": "proxy",
        "isDefault": true
    }' http://localhost:3000/api/datasources
    
    success "Prometheus data source added to Grafana"
    
    # Create basic dashboard
    log "Creating basic dashboard"
    curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $GRAFANA_API_KEY" -d '{
        "dashboard": {
            "id": null,
            "title": "System Overview",
            "tags": ["system", "overview"],
            "timezone": "browser",
            "schemaVersion": 16,
            "version": 0,
            "refresh": "5s",
            "panels": [
                {
                    "type": "graph",
                    "title": "CPU Usage",
                    "gridPos": {
                        "h": 8,
                        "w": 12,
                        "x": 0,
                        "y": 0
                    },
                    "id": 1,
                    "targets": [
                        {
                            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
                            "refId": "A"
                        }
                    ],
                    "yaxes": [
                        {
                            "format": "percent",
                            "label": null,
                            "logBase": 1,
                            "max": "100",
                            "min": "0",
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
                    ]
                },
                {
                    "type": "graph",
                    "title": "Memory Usage",
                    "gridPos": {
                        "h": 8,
                        "w": 12,
                        "x": 12,
                        "y": 0
                    },
                    "id": 2,
                    "targets": [
                        {
                            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
                            "refId": "A"
                        }
                    ],
                    "yaxes": [
                        {
                            "format": "percent",
                            "label": null,
                            "logBase": 1,
                            "max": "100",
                            "min": "0",
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
                    ]
                }
            ]
        },
        "folderId": 0,
        "overwrite": false
    }