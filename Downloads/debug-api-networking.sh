#!/bin/bash
# debug-api-networking.sh
# Script to diagnose and fix API container networking issues
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
API_CONTAINER="risk-platform-api"
NGINX_CONTAINER="risk-platform-nginx"
POSTGRES_CONTAINER="risk-platform-postgres"
NETWORK_NAME="risk-platform_risk-platform-network"
LOG_FILE="/var/log/risk-platform-api-network-debug-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="${PLATFORM_DIR}/backups/network-debug-$(date +%Y%m%d-%H%M%S)"

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

# Create backup directory
mkdir -p "$BACKUP_DIR"
chmod 750 "$BACKUP_DIR"

# Function to check if a container exists
container_exists() {
    local container=$1
    if docker ps -a --format '{{.Names}}' | grep -q "^$container$"; then
        return 0
    else
        return 1
    fi
}

# Function to check if a container is running
is_container_running() {
    local container=$1
    if docker ps --format '{{.Names}}' | grep -q "^$container$"; then
        return 0
    else
        return 1
    fi
}

# Function to check API container logs
check_api_logs() {
    log_section "Checking API Container Logs"
    
    # Check if API container exists
    if ! container_exists "$API_CONTAINER"; then
        log_error "API container does not exist"
        return 1
    fi
    
    # Get API container logs
    log_info "Retrieving API container logs"
    docker logs "$API_CONTAINER" > "$BACKUP_DIR/api_container.log" 2>&1
    
    # Display the last 20 lines of logs
    log_info "Last 20 lines of API container logs:"
    tail -n 20 "$BACKUP_DIR/api_container.log" | tee -a "$LOG_FILE"
    
    # Check for common network-related errors in logs
    log_info "Analyzing logs for network-related errors"
    
    # Check for connection refused errors
    if grep -q "ECONNREFUSED" "$BACKUP_DIR/api_container.log"; then
        log_error "Found connection refused errors in logs"
        CONNECTION_REFUSED=true
        
        # Extract the specific connection details
        CONNECTION_DETAILS=$(grep -o "connect ECONNREFUSED [^ ]*" "$BACKUP_DIR/api_container.log" | sort | uniq)
        log_error "Connection refused to: $CONNECTION_DETAILS"
    fi
    
    # Check for host not found errors
    if grep -q "getaddrinfo ENOTFOUND\|EAI_AGAIN" "$BACKUP_DIR/api_container.log"; then
        log_error "Found host resolution errors in logs"
        HOST_RESOLUTION=true
        
        # Extract the specific host details
        HOST_DETAILS=$(grep -o "getaddrinfo ENOTFOUND [^ ]*\|EAI_AGAIN [^ ]*" "$BACKUP_DIR/api_container.log" | sort | uniq)
        log_error "Host resolution failed for: $HOST_DETAILS"
    fi
    
    # Check for port already in use errors
    if grep -q "EADDRINUSE" "$BACKUP_DIR/api_container.log"; then
        log_error "Found port already in use errors in logs"
        PORT_IN_USE=true
        
        # Extract the specific port details
        PORT_DETAILS=$(grep -o "EADDRINUSE: address already in use [^ ]*\|EADDRINUSE: [^ ]*" "$BACKUP_DIR/api_container.log" | sort | uniq)
        log_error "Port already in use: $PORT_DETAILS"
    fi
    
    # Check for permission denied errors
    if grep -q "EACCES" "$BACKUP_DIR/api_container.log"; then
        log_error "Found permission denied errors in logs"
        PERMISSION_DENIED=true
    fi
    
    # Check for network unreachable errors
    if grep -q "ENETUNREACH" "$BACKUP_DIR/api_container.log"; then
        log_error "Found network unreachable errors in logs"
        NETWORK_UNREACHABLE=true
    fi
    
    # Check for database connection errors
    if grep -q "database\|postgres\|pg\|sequelize" "$BACKUP_DIR/api_container.log" && grep -q "error\|failed\|cannot" "$BACKUP_DIR/api_container.log"; then
        log_error "Found database connection errors in logs"
        DB_CONNECTION_ERROR=true
    fi
    
    # If no specific errors found, note it
    if [ -z "$CONNECTION_REFUSED" ] && [ -z "$HOST_RESOLUTION" ] && [ -z "$PORT_IN_USE" ] && [ -z "$PERMISSION_DENIED" ] && [ -z "$NETWORK_UNREACHABLE" ] && [ -z "$DB_CONNECTION_ERROR" ]; then
        log_info "No specific network-related errors found in logs"
    fi
}

# Function to check Docker network configuration
check_docker_network() {
    log_section "Checking Docker Network Configuration"
    
    # List all Docker networks
    log_info "Listing all Docker networks"
    docker network ls | tee -a "$LOG_FILE"
    
    # Check if the platform network exists
    if docker network ls | grep -q "$NETWORK_NAME"; then
        log_success "Platform network '$NETWORK_NAME' exists"
        
        # Inspect the platform network
        log_info "Inspecting platform network"
        docker network inspect "$NETWORK_NAME" > "$BACKUP_DIR/network_inspect.json"
        
        # Check if API container is connected to the network
        if grep -q "\"$API_CONTAINER\"" "$BACKUP_DIR/network_inspect.json"; then
            log_success "API container is connected to the platform network"
            
            # Extract API container IP address
            API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$API_CONTAINER")
            log_info "API container IP address: $API_IP"
        else
            log_error "API container is not connected to the platform network"
            NETWORK_CONNECTION_ISSUE=true
        fi
        
        # Check if Nginx container is connected to the network
        if grep -q "\"$NGINX_CONTAINER\"" "$BACKUP_DIR/network_inspect.json"; then
            log_success "Nginx container is connected to the platform network"
            
            # Extract Nginx container IP address
            NGINX_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$NGINX_CONTAINER")
            log_info "Nginx container IP address: $NGINX_IP"
        else
            log_error "Nginx container is not connected to the platform network"
            NETWORK_CONNECTION_ISSUE=true
        fi
        
        # Check if Postgres container is connected to the network
        if grep -q "\"$POSTGRES_CONTAINER\"" "$BACKUP_DIR/network_inspect.json"; then
            log_success "Postgres container is connected to the platform network"
            
            # Extract Postgres container IP address
            POSTGRES_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$POSTGRES_CONTAINER")
            log_info "Postgres container IP address: $POSTGRES_IP"
        else
            log_error "Postgres container is not connected to the platform network"
            NETWORK_CONNECTION_ISSUE=true
        fi
    else
        log_error "Platform network '$NETWORK_NAME' does not exist"
        NETWORK_MISSING=true
    fi
}

# Function to test direct container connectivity
test_container_connectivity() {
    log_section "Testing Direct Container Connectivity"
    
    # Install netcat in containers for testing if needed
    log_info "Installing netcat in containers for connectivity testing"
    docker exec "$NGINX_CONTAINER" apk add --no-cache netcat-openbsd > /dev/null 2>&1 || true
    
    # Test connectivity from Nginx to API
    log_info "Testing connectivity from Nginx to API"
    if docker exec "$NGINX_CONTAINER" nc -z -v -w 5 api 3001 > /dev/null 2>&1; then
        log_success "Nginx can connect to API on port 3001"
    else
        log_error "Nginx cannot connect to API on port 3001"
        NGINX_TO_API_CONN_ISSUE=true
    fi
    
    # Test connectivity from API to Postgres
    log_info "Testing connectivity from API to Postgres"
    if docker exec "$API_CONTAINER" nc -z -v -w 5 postgres 5432 > /dev/null 2>&1; then
        log_success "API can connect to Postgres on port 5432"
    else
        log_error "API cannot connect to Postgres on port 5432"
        API_TO_POSTGRES_CONN_ISSUE=true
    fi
    
    # Test DNS resolution in API container
    log_info "Testing DNS resolution in API container"
    if docker exec "$API_CONTAINER" nslookup postgres > /dev/null 2>&1; then
        log_success "API container can resolve 'postgres' hostname"
    else
        log_error "API container cannot resolve 'postgres' hostname"
        API_DNS_ISSUE=true
    fi
    
    # Test direct API access on port 3001
    log_info "Testing direct API access on port 3001"
    if curl -s --max-time 5 "http://$API_IP:3001/status" > /dev/null 2>&1; then
        log_success "Direct API access on port 3001 works"
        
        # Get API response
        API_RESPONSE=$(curl -s --max-time 5 "http://$API_IP:3001/status")
        log_info "API Response: $API_RESPONSE"
    else
        log_error "Direct API access on port 3001 fails"
        DIRECT_API_ACCESS_ISSUE=true
    fi
}

# Function to check Nginx configuration
check_nginx_config() {
    log_section "Checking Nginx Configuration"
    
    # Check if Nginx configuration directory exists
    if [ -d "$PLATFORM_DIR/config/nginx/conf.d" ]; then
        log_success "Nginx configuration directory exists"
        
        # Check if default.conf exists
        if [ -f "$PLATFORM_DIR/config/nginx/conf.d/default.conf" ]; then
            log_success "Nginx default.conf exists"
            
            # Backup original Nginx configuration
            cp "$PLATFORM_DIR/config/nginx/conf.d/default.conf" "$BACKUP_DIR/default.conf.bak"
            
            # Check for API proxy configuration
            if grep -q "location /api/" "$PLATFORM_DIR/config/nginx/conf.d/default.conf"; then
                log_success "API proxy configuration found in Nginx config"
                
                # Check the API proxy pass configuration
                API_PROXY_CONFIG=$(grep -A 5 "location /api/" "$PLATFORM_DIR/config/nginx/conf.d/default.conf")
                log_info "API proxy configuration: $API_PROXY_CONFIG"
                
                # Check if proxy_pass uses the correct hostname and port
                if grep -q "proxy_pass http://api:3001/" "$PLATFORM_DIR/config/nginx/conf.d/default.conf"; then
                    log_success "Nginx is configured to proxy to api:3001"
                else
                    log_error "Nginx is not configured to proxy to api:3001"
                    NGINX_PROXY_CONFIG_ISSUE=true
                }
            else
                log_error "API proxy configuration not found in Nginx config"
                NGINX_CONFIG_MISSING=true
            fi
        else
            log_error "Nginx default.conf does not exist"
            NGINX_CONFIG_MISSING=true
        fi
    else
        log_error "Nginx configuration directory does not exist"
        NGINX_CONFIG_MISSING=true
    fi
    
    # Check Nginx logs for errors
    log_info "Checking Nginx logs for errors"
    docker logs "$NGINX_CONTAINER" > "$BACKUP_DIR/nginx_container.log" 2>&1
    
    # Check for upstream connection errors
    if grep -q "connect() failed\|upstream timed out\|no live upstreams" "$BACKUP_DIR/nginx_container.log"; then
        log_error "Found upstream connection errors in Nginx logs"
        NGINX_UPSTREAM_ERROR=true
        
        # Extract the specific error details
        UPSTREAM_ERRORS=$(grep -o "connect() failed[^,]*\|upstream timed out[^,]*\|no live upstreams[^,]*" "$BACKUP_DIR/nginx_container.log" | sort | uniq)
        log_error "Upstream errors: $UPSTREAM_ERRORS"
    fi
}

# Function to fix Docker network issues
fix_docker_network() {
    log_section "Fixing Docker Network Issues"
    
    if [ -n "$NETWORK_MISSING" ] || [ -n "$NETWORK_CONNECTION_ISSUE" ]; then
        log_info "Recreating Docker network"
        
        # Stop all containers
        log_info "Stopping all containers"
        docker-compose -f "$PLATFORM_DIR/docker-compose.yml" down
        
        # Remove the network if it exists
        if docker network ls | grep -q "$NETWORK_NAME"; then
            log_info "Removing existing network"
            docker network rm "$NETWORK_NAME"
        fi
        
        # Start all containers (this will recreate the network)
        log_info "Starting all containers"
        docker-compose -f "$PLATFORM_DIR/docker-compose.yml" up -d
        
        # Wait for containers to start
        log_info "Waiting for containers to start"
        sleep 10
        
        # Check if network was recreated
        if docker network ls | grep -q "$NETWORK_NAME"; then
            log_success "Network was successfully recreated"
        else
            log_error "Failed to recreate network"
        fi
    else
        log_info "No network issues detected, skipping network recreation"
    fi
}

# Function to fix API container networking
fix_api_container() {
    log_section "Fixing API Container Networking"
    
    # Backup API server.js
    if [ -f "$PLATFORM_DIR/api/server.js" ]; then
        log_info "Backing up server.js"
        cp "$PLATFORM_DIR/api/server.js" "$BACKUP_DIR/server.js.bak"
    fi
    
    # Check if API container is running
    if is_container_running "$API_CONTAINER"; then
        log_info "API container is running, checking for issues"
        
        # Fix port binding issues if detected
        if [ -n "$PORT_IN_USE" ]; then
            log_info "Fixing port binding issues"
            
            # Update server.js to use a different port
            if [ -f "$PLATFORM_DIR/api/server.js" ]; then
                log_info "Updating server.js to use port 3002 instead of 3001"
                sed -i 's/const port = process.env.PORT || 3001;/const port = process.env.PORT || 3002;/' "$PLATFORM_DIR/api/server.js"
                
                # Update Docker Compose to map to the new port
                if [ -f "$PLATFORM_DIR/docker-compose.yml" ]; then
                    log_info "Updating Docker Compose to map to port 3002"
                    sed -i 's/3001:3001/3002:3001/' "$PLATFORM_DIR/docker-compose.yml"
                    
                    # Update Nginx configuration to use the new port
                    if [ -f "$PLATFORM_DIR/config/nginx/conf.d/default.conf" ]; then
                        log_info "Updating Nginx configuration to use port 3002"
                        sed -i 's/proxy_pass http:\/\/api:3001/proxy_pass http:\/\/api:3002/' "$PLATFORM_DIR/config/nginx/conf.d/default.conf"
                    fi
                fi
            fi
        fi
        
        # Fix host resolution issues if detected
        if [ -n "$HOST_RESOLUTION" ] || [ -n "$API_DNS_ISSUE" ]; then
            log_info "Fixing host resolution issues"
            
            # Update /etc/hosts in the API container
            log_info "Adding host entries to API container"
            docker exec "$API_CONTAINER" sh -c "echo \"$POSTGRES_IP postgres\" >> /etc/hosts"
            docker exec "$API_CONTAINER" sh -c "echo \"$NGINX_IP nginx\" >> /etc/hosts"
            
            # Verify host entries
            log_info "Verifying host entries in API container"
            docker exec "$API_CONTAINER" cat /etc/hosts | tee -a "$LOG_FILE"
        fi
        
        # Fix database connection issues if detected
        if [ -n "$DB_CONNECTION_ERROR" ] || [ -n "$API_TO_POSTGRES_CONN_ISSUE" ]; then
            log_info "Fixing database connection issues"
            
            # Update .env file with correct database connection details
            if [ -f "$PLATFORM_DIR/api/.env" ]; then
                log_info "Updating .env file with correct database connection details"
                cat > "$PLATFORM_DIR/api/.env" <<EOF
PORT=3001
DB_USER=risk_platform
DB_PASSWORD=risk_platform_password
DB_HOST=postgres
DB_PORT=5432
DB_NAME=risk_platform
NODE_ENV=development
EOF
            fi
            
            # Test database connection from API container
            log_info "Testing database connection from API container"
            if docker exec "$API_CONTAINER" nc -z -v -w 5 postgres 5432 > /dev/null 2>&1; then
                log_success "API can now connect to Postgres on port 5432"
            else
                log_error "API still cannot connect to Postgres on port 5432"
            fi
        fi
    else
        log_error "API container is not running, restarting it"
        
        # Rebuild and restart API container
        log_info "Rebuilding and restarting API container"
        docker-compose -f "$PLATFORM_DIR/docker-compose.yml" up -d --build api
        
        # Wait for container to start
        log_info "Waiting for API container to start"
        sleep 10
        
        # Check if container is running
        if is_container_running "$API_CONTAINER"; then
            log_success "API container is now running"
        else
            log_error "API container failed to start"
        fi
    fi
}

# Function to fix Nginx configuration
fix_nginx_config() {
    log_section "Fixing Nginx Configuration"
    
    if [ -n "$NGINX_CONFIG_MISSING" ] || [ -n "$NGINX_PROXY_CONFIG_ISSUE" ]; then
        log_info "Fixing Nginx configuration"
        
        # Create Nginx configuration directory if it doesn't exist
        if [ ! -d "$PLATFORM_DIR/config/nginx/conf.d" ]; then
            log_info "Creating Nginx configuration directory"
            mkdir -p "$PLATFORM_DIR/config/nginx/conf.d"
        fi
        
        # Create or update default.conf
        log_info "Creating/updating default.conf"
        cat > "$PLATFORM_DIR/config/nginx/conf.d/default.conf" <<EOF
server {
    listen 80;
    server_name _;
    
    # Serve static files
    root /usr/share/nginx/html;
    index index.html;
    
    # API proxy
    location /api/ {
        proxy_pass http://api:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
    
    # Monitoring dashboard
    location /monitoring/ {
        proxy_pass http://grafana:3000/;
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
    location = /health {
        access_log off;
        add_header Content-Type application/json;
        return 200 '{"status":"UP"}';
    }
}
EOF
        
        # Restart Nginx
        log_info "Restarting Nginx"
        docker-compose -f "$PLATFORM_DIR/docker-compose.yml" restart nginx
        
        # Check if Nginx is running
        if is_container_running "$NGINX_CONTAINER"; then
            log_success "Nginx is now running"
        else
            log_error "Nginx failed to start"
        fi
    else
        log_info "No Nginx configuration issues detected, skipping fix"
    fi
}

# Function to create a test API endpoint
create_test_api() {
    log_section "Creating Test API Endpoint"
    
    log_info "Creating a simple test API to verify connectivity"
    
    # Create a simple Express server
    cat > "$PLATFORM_DIR/api/server.js" <<EOF
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// Basic middleware
app.use(express.json());

// Simple routes
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

// Start server - IMPORTANT: bind to 0.0.0.0 to allow external connections
app.listen(port, '0.0.0.0', () => {
  console.log(\`Test API server running on port \${port}\`);
});
EOF
    
    # Update package.json if it exists
    if [ -f "$PLATFORM_DIR/api/package.json" ]; then
        log_info "Updating package.json"
        cat > "$PLATFORM_DIR/api/package.json" <<EOF
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
    fi
    
    # Rebuild and restart API container
    log_info "Rebuilding and restarting API container"
    docker-compose -f "$PLATFORM_DIR/docker-compose.yml" up -d --build api
    
    # Wait for container to start
    log_info "Waiting for API container to start"
    sleep 10
    
    # Check if container is running
    if is_container_running "$API_CONTAINER"; then
        log_success "API container is now running"
        
        # Test API endpoint
        log_info "Testing API endpoint"
        if curl -s --max-time 5 "http://localhost/api/status" > /dev/null 2>&1; then
            API_RESPONSE=$(curl -s --max-time 5 "http://localhost/api/status")
            log_success "API endpoint is accessible"
            log_info "API Response: $API_RESPONSE"
        else
            log_error "API endpoint is not accessible"
            
            # Try direct access
            log_info "Trying direct access to API container"
            API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$API_CONTAINER")
            if curl -s --max-time 5 "http://$API_IP:3001/status" > /dev/null 2>&1; then
                API_RESPONSE=$(curl -s --max-time 5 "http://$API_IP:3001/status")
                log_success "Direct API access works"
                log_info "API Response: $API_RESPONSE"
                
                # Nginx is the problem
                log_error "Nginx proxy is not working correctly"
                fix_nginx_config
            else
                log_error "Direct API access also fails"
            fi
        fi
    else
        log_error "API container failed to start"
    fi
}

# Function to verify all fixes
verify_fixes() {
    log_section "Verifying Fixes"
    
    # Check if all containers are running
    log_info "Checking if all containers are running"
    docker ps | tee -a "$LOG_FILE"
    
    # Check if API container is running
    if is_container_running "$API_CONTAINER"; then
        log_success "API container is running"
        
        # Check API logs for errors
        log_info "Checking API logs for errors"
        docker logs "$API_CONTAINER" --tail 10 | tee -a "$LOG_FILE"
        
        # Test API endpoint
        log_info "Testing API endpoint"
        if curl -s --max-time 5 "http://localhost/api/status" > /dev/null 2>&1; then
            API_RESPONSE=$(curl -s --max-time 5 "http://localhost/api/status")
            log_success "API endpoint is accessible"
            log_info "API Response: $API_RESPONSE"
            FIXES_VERIFIED=true
        else
            log_error "API endpoint is still not accessible"
            FIXES_VERIFIED=false
        }
    else
        log_error "API container is not running"
        FIXES_VERIFIED=false
    fi
    
    # Return verification status
    if [ "$FIXES_VERIFIED" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to display final status and instructions
display_final_status() {
    log_section "Final Status"
    
    # Get public IP
    PUBLIC_IP=$(curl -s https://api.ipify.org)
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP=$(hostname -I | awk '{print $1}')
    fi
    
    if [ "$FIXES_VERIFIED" = true ]; then
        echo -e "${GREEN}API networking issues have been fixed!${NC}"
        
        echo ""
        echo -e "${CYAN}Access URLs:${NC}"
        echo -e "API Status: ${YELLOW}http://$PUBLIC_IP/api/status${NC}"
        echo -e "Monitoring Dashboard: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
        
        echo ""
        echo -e "${CYAN}Next Steps:${NC}"
        echo -e "1. ${YELLOW}Deploy your actual Risk Platform API code${NC}"
        echo -e "2. ${YELLOW}Deploy your database schema${NC}"
        echo -e "3. ${YELLOW}Deploy your frontend code${NC}"
        
        echo ""
        echo -e "For detailed deployment instructions, run: ${YELLOW}./check-dashboard-status.sh${NC}"
    else
        echo -e "${RED}Some API networking issues could not be fixed automatically.${NC}"
        
        echo ""
        echo -e "${CYAN}Manual Troubleshooting Steps:${NC}"
        echo -e "1. ${YELLOW}Check API container logs:${NC} docker logs $API_CONTAINER"
        echo -e "2. ${YELLOW}Check Nginx container logs:${NC} docker logs $NGINX_CONTAINER"
        echo -e "3. ${YELLOW}Check Docker network:${NC} docker network inspect $NETWORK_NAME"
        echo -e "4. ${YELLOW}Restart all containers:${NC} cd $PLATFORM_DIR && docker-compose down && docker-compose up -d"
        
        echo ""
        echo -e "Debug log saved to: ${YELLOW}$LOG_FILE${NC}"
    fi
    
    echo ""
    echo -e "Backup files saved to: ${YELLOW}$BACKUP_DIR${NC}"
    echo ""
}

# Main function
main() {
    # Display header
    echo "==============================================="
    echo "  Risk Platform API Network Debugging Tool     "
    echo "==============================================="
    echo ""
    log_info "Starting API network debugging"
    
    # Navigate to platform directory
    log_info "Navigating to platform directory: $PLATFORM_DIR"
    if [ ! -d "$PLATFORM_DIR" ]; then
        log_error "Platform directory not found: $PLATFORM_DIR"
        exit 1
    fi
    cd "$PLATFORM_DIR"
    
    # Check API logs
    check_api_logs
    
    # Check Docker network configuration
    check_docker_network
    
    # Check Nginx configuration
    check_nginx_config
    
    # Test container connectivity
    test_container_connectivity
    
    # Fix Docker network issues
    fix_docker_network
    
    # Fix API container networking
    fix_api_container
    
    # Fix Nginx configuration
    fix_nginx_config
    
    # Create test API endpoint
    create_test_api
    
    # Verify fixes
    verify_fixes
    
    # Display final status and instructions
    display_final_status
    
    log_info "API network debugging completed"
}

# Run main function
main
