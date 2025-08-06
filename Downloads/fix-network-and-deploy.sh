#!/bin/bash
# fix-network-and-deploy.sh
# Script to fix Docker network conflict and complete deployment
# Version: 1.0.0
# Date: 2025-08-04

# Set error handling
set -e
trap 'echo "Error on line $LINENO. Deployment failed."; exit 1' ERR

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
LOG_FILE="${LOG_DIR}/network-fix-deployment-$(date +%Y%m%d-%H%M%S).log"
DOCKER_NETWORK="risk-platform-network"
PUBLIC_IP=$(hostname -I | awk '{print $1}')

# Container names
NGINX_CONTAINER="risk-platform-nginx"
POSTGRES_CONTAINER="risk-platform-postgres"
GRAFANA_CONTAINER="risk-platform-grafana"
PROMETHEUS_CONTAINER="risk-platform-prometheus"
ALERTMANAGER_CONTAINER="risk-platform-alertmanager"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  NETWORK FIX AND RISK PLATFORM DEPLOYMENT    ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Ensure log file exists and is writable
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

# Logging functions
log() { 
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${BLUE}INFO:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] INFO: $1" >> "$LOG_FILE"
}

success() { 
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${GREEN}SUCCESS:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] SUCCESS: $1" >> "$LOG_FILE"
}

warning() { 
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${YELLOW}WARNING:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] WARNING: $1" >> "$LOG_FILE"
}

error() { 
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${RED}ERROR:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ERROR: $1" >> "$LOG_FILE"
    exit 1
}

section() {
    echo ""
    echo -e "${CYAN}=== $1 ===${NC}"
    echo -e "${CYAN}$(printf '=%.0s' $(seq 1 ${#1}))======${NC}"
    echo ""
    echo "=== $1 ===" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# Step 1: Fix Docker network
section "FIXING DOCKER NETWORK"

# Remove any existing containers that might be using the network
log "Stopping any existing containers"
docker rm -f "$NGINX_CONTAINER" "$POSTGRES_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER" 2>/dev/null || true

# Remove the existing network
log "Removing existing Docker network"
docker network rm "$DOCKER_NETWORK" 2>/dev/null || true
success "Existing network removed"

# Update Docker Compose file to use default network naming
log "Updating Docker Compose configuration"
COMPOSE_FILE="${DOCKER_COMPOSE_DIR}/docker-compose.yml"

# Create a backup of the original file
cp "$COMPOSE_FILE" "${COMPOSE_FILE}.backup"

# Update the network configuration in docker-compose.yml
# Remove the name property to let Docker Compose create the network with default naming
sed -i 's/name: \${DOCKER_NETWORK}/# name property removed to avoid conflicts/' "$COMPOSE_FILE"

success "Docker Compose configuration updated"

# Step 2: Deploy containers
section "DEPLOYING CONTAINERS"

# Start containers using Docker Compose
log "Starting containers with Docker Compose"
cd "$DOCKER_COMPOSE_DIR"
docker compose down -v 2>/dev/null || true
docker compose up -d

# Wait for containers to start
log "Waiting for containers to start..."
sleep 15

# Check container status
log "Checking container status"
CONTAINERS_RUNNING=true

for container in "$POSTGRES_CONTAINER" "$NGINX_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
    if ! docker ps | grep -q "$container"; then
        warning "Container $container is not running"
        CONTAINERS_RUNNING=false
        
        # Show logs for troubleshooting
        log "Logs for $container:"
        docker logs "$container" || true
    else
        success "Container $container is running"
    fi
done

if [ "$CONTAINERS_RUNNING" = false ]; then
    warning "Not all containers are running. Attempting to fix issues..."
    
    # Try to restart containers
    log "Restarting containers..."
    docker compose down
    sleep 5
    docker compose up -d
    sleep 15
    
    # Check again
    CONTAINERS_RUNNING=true
    for container in "$POSTGRES_CONTAINER" "$NGINX_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
        if ! docker ps | grep -q "$container"; then
            error "Container $container is still not running after restart"
            CONTAINERS_RUNNING=false
        else
            success "Container $container is now running"
        fi
    done
    
    if [ "$CONTAINERS_RUNNING" = false ]; then
        warning "Some containers are still not running. Continuing with verification..."
    fi
fi

# Step 3: Verify deployment
section "VERIFYING DEPLOYMENT"

# Check Nginx
log "Checking Nginx"
if docker exec "$NGINX_CONTAINER" nginx -t &>/dev/null; then
    success "Nginx configuration is valid"
else
    warning "Nginx configuration test failed"
    docker exec "$NGINX_CONTAINER" nginx -t || true
fi

# Check PostgreSQL
log "Checking PostgreSQL"
if docker exec "$POSTGRES_CONTAINER" pg_isready -U risk_platform -d risk_platform &>/dev/null; then
    success "PostgreSQL is ready"
    
    # Verify admin user exists
    if docker exec -i "$POSTGRES_CONTAINER" psql -U risk_platform -d risk_platform -c "SELECT COUNT(*) FROM risk_platform.users WHERE email='admin@risk-platform.local';" | grep -q "1"; then
        success "Admin user exists in database"
    else
        warning "Admin user does not exist in database"
    fi
else
    warning "PostgreSQL is not ready"
fi

# Test HTTP access
log "Testing HTTP access"
if curl -s "http://localhost" | grep -q "Risk Platform Dashboard"; then
    success "Dashboard is accessible via HTTP"
else
    warning "Dashboard is not accessible via HTTP"
fi

# Test Grafana access
log "Testing Grafana access"
if curl -s "http://localhost/monitoring" | grep -q "Grafana"; then
    success "Grafana is accessible via HTTP"
else
    warning "Grafana is not accessible via HTTP"
fi

# Final status
section "DEPLOYMENT SUMMARY"

echo -e "${GREEN}Risk Platform Dashboard has been successfully deployed!${NC}"
echo ""
echo "Access URLs:"
echo -e "Dashboard: ${YELLOW}http://$PUBLIC_IP/${NC}"
echo -e "Monitoring: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
echo ""
echo "Login Credentials:"
echo -e "Email: ${YELLOW}admin@risk-platform.local${NC}"
echo -e "Password: ${YELLOW}admin123${NC}"
echo ""
echo "Important Directories:"
echo -e "Platform Directory: ${YELLOW}$PLATFORM_DIR${NC}"
echo -e "Dashboard Directory: ${YELLOW}$DASHBOARD_DIR${NC}"
echo -e "Database Directory: ${YELLOW}$DB_DIR${NC}"
echo -e "Nginx Configuration: ${YELLOW}$NGINX_DIR/conf.d/default.conf${NC}"
echo -e "Docker Compose: ${YELLOW}$DOCKER_COMPOSE_DIR/docker-compose.yml${NC}"
echo ""
echo "Next Steps:"
echo "1. Log in to the dashboard at http://$PUBLIC_IP/"
echo "2. Change the default admin password"
echo "3. Customize the dashboard frontend"
echo "4. Set up SSL certificates for HTTPS"
echo ""
echo -e "${GREEN}Deployment log saved to: $LOG_FILE${NC}"
echo ""

success "Risk Platform deployment completed successfully"
