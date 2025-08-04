#!/bin/bash
# complete-deployment.sh
# Script to complete Risk Platform deployment after Docker installation
# Version: 1.0.0
# Date: 2025-08-04

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_DIR="/opt/risk-platform"
LOG_FILE="/var/log/risk-platform-completion-$(date +%Y%m%d-%H%M%S).log"
MAX_WAIT_TIME=180 # Maximum time to wait for services in seconds

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

# Error handling
handle_error() {
    log_error "An error occurred on line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    log_error "This script must be run as root!"
    exit 1
fi

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

# Display header
echo "==============================================="
echo "  Risk Platform Deployment Completion          "
echo "==============================================="
echo ""
log_info "Starting Risk Platform deployment completion"

# Step 1: Verify Docker is running
log_info "Verifying Docker is running"
if ! systemctl is-active --quiet docker; then
    log_error "Docker is not running. Please start Docker first."
    exit 1
fi
log_success "Docker is running"

# Step 2: Navigate to platform directory
log_info "Navigating to platform directory: $PLATFORM_DIR"
if [ ! -d "$PLATFORM_DIR" ]; then
    log_error "Platform directory not found: $PLATFORM_DIR"
    exit 1
fi
cd "$PLATFORM_DIR"
log_success "Changed to platform directory"

# Step 3: Verify Docker Compose file exists
log_info "Verifying Docker Compose file exists"
if [ ! -f "docker-compose.yml" ]; then
    log_error "Docker Compose file not found: $PLATFORM_DIR/docker-compose.yml"
    exit 1
fi
log_success "Docker Compose file found"

# Step 4: Fix Grafana permissions
log_info "Setting Grafana directory permissions"
mkdir -p "$PLATFORM_DIR/data/monitoring/grafana"
chown -R 472:0 "$PLATFORM_DIR/data/monitoring/grafana"
chmod -R 755 "$PLATFORM_DIR/data/monitoring/grafana"
log_success "Grafana permissions set"

# Step 5: Build and start services
log_info "Building Docker services"
docker compose build

log_info "Starting Docker services"
docker compose up -d

# Step 6: Wait for services to be ready
log_info "Waiting for services to be ready (up to $MAX_WAIT_TIME seconds)"
start_time=$(date +%s)
services_ready=false

while [ $(($(date +%s) - start_time)) -lt $MAX_WAIT_TIME ]; do
    # Check if all containers are running
    if [ "$(docker compose ps --services --filter "status=running" | wc -l)" -eq "$(docker compose ps --services | wc -l)" ]; then
        services_ready=true
        break
    fi
    
    log_info "Services are starting... ($(docker compose ps --services --filter "status=running" | wc -l)/$(docker compose ps --services | wc -l) running)"
    sleep 10
done

if [ "$services_ready" = true ]; then
    log_success "All services are running"
else
    log_warning "Not all services started within the expected time"
    docker compose ps
fi

# Step 7: Test endpoints
log_info "Testing endpoints"

# Get public IP
PUBLIC_IP=$(curl -s https://api.ipify.org)
if [ -z "$PUBLIC_IP" ]; then
    PUBLIC_IP="localhost"
    log_warning "Could not determine public IP, using localhost"
else
    log_info "Public IP: $PUBLIC_IP"
fi

# Test API
log_info "Testing API endpoint"
if curl -s "http://localhost/api/status" > /dev/null; then
    log_success "API endpoint is accessible"
else
    log_warning "API endpoint is not accessible"
fi

# Test Grafana
log_info "Testing Grafana endpoint"
if curl -s "http://localhost/monitoring" > /dev/null; then
    log_success "Grafana endpoint is accessible"
else
    log_warning "Grafana endpoint is not accessible"
    
    # Check Grafana container logs
    log_info "Checking Grafana container logs"
    docker logs risk-platform-grafana --tail 20
    
    # Fix common Grafana issues
    log_info "Attempting to fix Grafana permissions"
    docker compose stop grafana
    chown -R 472:0 "$PLATFORM_DIR/data/monitoring/grafana"
    find "$PLATFORM_DIR/data/monitoring/grafana" -type d -exec chmod 755 {} \;
    find "$PLATFORM_DIR/data/monitoring/grafana" -type f -exec chmod 644 {} \;
    docker compose start grafana
    
    log_info "Waiting for Grafana to restart (30 seconds)"
    sleep 30
    
    if curl -s "http://localhost/monitoring" > /dev/null; then
        log_success "Grafana endpoint is now accessible after fix"
    else
        log_warning "Grafana endpoint is still not accessible after fix"
    fi
fi

# Step 8: Display deployment status
echo ""
echo "==============================================="
echo "  Risk Platform Deployment Status              "
echo "==============================================="
echo ""

# Check overall status
if docker compose ps --services --filter "status=running" | wc -l | grep -q "^0$"; then
    echo -e "${RED}Deployment Status: FAILED${NC}"
    echo -e "No services are running. Please check the logs for errors."
else
    echo -e "${GREEN}Deployment Status: SUCCESS${NC}"
    echo -e "Services running: $(docker compose ps --services --filter "status=running" | wc -l)/$(docker compose ps --services | wc -l)"
    
    echo ""
    echo -e "${CYAN}Access URLs:${NC}"
    echo -e "Main Platform: ${YELLOW}http://$PUBLIC_IP${NC}"
    echo -e "Monitoring Dashboard: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
    echo -e "API Status: ${YELLOW}http://$PUBLIC_IP/api/status${NC}"
    
    echo ""
    echo -e "${CYAN}Credentials:${NC}"
    echo -e "Grafana: ${YELLOW}Username: admin, Password: admin${NC}"
    echo -e "Database: ${YELLOW}Username: risk_platform, Password: risk_platform_password, Database: risk_platform${NC}"
    
    echo ""
    echo -e "${CYAN}Important Directories:${NC}"
    echo -e "Base Directory: ${YELLOW}$PLATFORM_DIR${NC}"
    echo -e "Configuration: ${YELLOW}$PLATFORM_DIR/config${NC}"
    echo -e "Data: ${YELLOW}$PLATFORM_DIR/data${NC}"
    echo -e "Logs: ${YELLOW}$PLATFORM_DIR/logs${NC}"
    
    echo ""
    echo -e "${CYAN}Docker Commands:${NC}"
    echo -e "View logs: ${YELLOW}docker compose logs${NC}"
    echo -e "Restart services: ${YELLOW}docker compose restart${NC}"
    echo -e "Stop services: ${YELLOW}docker compose down${NC}"
    
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo -e "1. ${YELLOW}Customize the API placeholder with your actual Risk Platform code${NC}"
    echo -e "2. ${YELLOW}Set up proper SSL certificates for HTTPS${NC}"
    echo -e "3. ${YELLOW}Configure monitoring alerts in Grafana${NC}"
    echo -e "4. ${YELLOW}Test backup/restore procedures${NC}"
fi

echo ""
echo -e "Completion log saved to: ${YELLOW}$LOG_FILE${NC}"
echo ""

log_success "Risk Platform deployment completion finished"
