#!/bin/bash
# fix-grafana-permissions.sh
# This script fixes Grafana Docker container permission issues
# Version: 1.0.0
# Date: 2025-08-01

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GRAFANA_CONTAINER="risk-platform-grafana"
GRAFANA_DATA_DIR="/opt/risk-platform/data/monitoring/grafana"
GRAFANA_USER_ID=472
GRAFANA_GROUP_ID=0
LOG_FILE="/var/log/grafana-fix-$(date +%Y%m%d-%H%M%S).log"

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
echo "  Grafana Docker Permissions Fix - Version 1.0.0  "
echo "==============================================="
echo ""
log_info "Starting Grafana permissions fix"

# Check if Grafana data directory exists
if [ ! -d "$GRAFANA_DATA_DIR" ]; then
    log_warning "Grafana data directory not found: $GRAFANA_DATA_DIR"
    log_info "Creating Grafana data directory"
    mkdir -p "$GRAFANA_DATA_DIR"
fi

# Stop Grafana container
log_info "Stopping Grafana container: $GRAFANA_CONTAINER"
if docker stop "$GRAFANA_CONTAINER" &>/dev/null; then
    log_success "Grafana container stopped"
else
    log_warning "Failed to stop Grafana container, it may not be running"
fi

# Fix permissions
log_info "Changing ownership of Grafana data directory to $GRAFANA_USER_ID:$GRAFANA_GROUP_ID"
chown -R $GRAFANA_USER_ID:$GRAFANA_GROUP_ID "$GRAFANA_DATA_DIR"

log_info "Setting proper permissions on Grafana data directory"
find "$GRAFANA_DATA_DIR" -type d -exec chmod 755 {} \;
find "$GRAFANA_DATA_DIR" -type f -exec chmod 644 {} \;

log_success "Permissions fixed"

# Restart Grafana container
log_info "Starting Grafana container"
if docker start "$GRAFANA_CONTAINER" &>/dev/null; then
    log_success "Grafana container started"
else
    log_error "Failed to start Grafana container"
    log_info "Trying to recreate the container with docker-compose"
    cd /opt/risk-platform
    docker-compose up -d "$GRAFANA_CONTAINER"
fi

# Verify Grafana is running
log_info "Waiting for Grafana to start (30 seconds)..."
sleep 30

if docker ps | grep -q "$GRAFANA_CONTAINER"; then
    log_success "Grafana container is running"
    
    # Check if Grafana is responding
    log_info "Checking if Grafana is responding"
    if curl -s http://localhost:3000 &>/dev/null; then
        log_success "Grafana is responding on http://localhost:3000"
    else
        log_warning "Grafana is not responding on http://localhost:3000"
        log_info "Please check the Grafana logs for more information:"
        log_info "docker logs $GRAFANA_CONTAINER"
    fi
else
    log_error "Grafana container is not running"
    log_info "Please check the Docker logs for more information:"
    log_info "docker logs $GRAFANA_CONTAINER"
fi

# Alternative solution using Docker user mapping
echo ""
echo "==============================================="
echo "  Alternative Solution - Docker User Mapping  "
echo "==============================================="
echo ""
echo "If the above solution doesn't work, you can try the following alternative:"
echo ""
echo "1. Edit your docker-compose.yml file and add the user mapping:"
echo ""
echo "   services:"
echo "     grafana:"
echo "       image: grafana/grafana-enterprise"
echo "       user: \"$GRAFANA_USER_ID:$GRAFANA_GROUP_ID\"  # Add this line"
echo "       # ... rest of your configuration"
echo ""
echo "2. Or update the Docker run command to include user mapping:"
echo ""
echo "   docker run -d -p 3000:3000 --name=grafana \\"
echo "     --user \"$GRAFANA_USER_ID:$GRAFANA_GROUP_ID\" \\"
echo "     --volume \"$GRAFANA_DATA_DIR:/var/lib/grafana\" \\"
echo "     grafana/grafana-enterprise"
echo ""
echo "3. Another option is to modify the Docker Compose file to use a named volume instead of a bind mount:"
echo ""
echo "   services:"
echo "     grafana:"
echo "       # ... other configuration"
echo "       volumes:"
echo "         - grafana-storage:/var/lib/grafana"
echo "   volumes:"
echo "     grafana-storage: {}"
echo ""

log_success "Grafana permissions fix completed"
echo ""
echo "You can now access Grafana at: http://YOUR_SERVER_IP:3000"
echo "Default login: admin/admin"
echo ""
echo "If you still experience issues, check the logs with:"
echo "docker logs $GRAFANA_CONTAINER"
echo ""
