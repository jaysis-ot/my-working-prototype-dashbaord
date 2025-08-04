#!/bin/bash
# diagnose-and-fix-services.sh
# Script to diagnose and fix failing services in Risk Platform deployment
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
CONFIG_DIR="${PLATFORM_DIR}/config"
DATA_DIR="${PLATFORM_DIR}/data"
LOGS_DIR="${PLATFORM_DIR}/logs"
LOG_FILE="/var/log/risk-platform-fix-$(date +%Y%m%d-%H%M%S).log"
MAX_WAIT_TIME=30 # Maximum time to wait for services in seconds

# Service names
API_CONTAINER="risk-platform-api"
NGINX_CONTAINER="risk-platform-nginx"
PROMETHEUS_CONTAINER="risk-platform-prometheus"
GRAFANA_CONTAINER="risk-platform-grafana"
POSTGRES_CONTAINER="risk-platform-postgres"
ALERTMANAGER_CONTAINER="risk-platform-alertmanager"

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

# Display header
echo "==============================================="
echo "  Risk Platform Service Diagnosis & Fix Tool   "
echo "==============================================="
echo ""
log_info "Starting service diagnosis and fix"

# Function to check if a container is running
is_container_running() {
    local container=$1
    if docker ps --format '{{.Names}}' | grep -q "^$container$"; then
        return 0
    else
        return 1
    fi
}

# Function to check if a container exists
container_exists() {
    local container=$1
    if docker ps -a --format '{{.Names}}' | grep -q "^$container$"; then
        return 0
    else
        return 1
    fi
}

# Function to wait for a container to be healthy
wait_for_container() {
    local container=$1
    local max_attempts=$2
    local delay=5
    local attempt=1
    
    log_info "Waiting for $container to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if is_container_running "$container"; then
            log_success "$container is running"
            return 0
        fi
        
        log_info "Attempt $attempt/$max_attempts: $container is not ready yet, waiting ${delay}s..."
        sleep $delay
        attempt=$((attempt + 1))
    done
    
    log_error "$container did not become ready within the expected time"
    return 1
}

# Function to check network connectivity between containers
check_network_connectivity() {
    local source_container=$1
    local target_container=$2
    local target_port=$3
    
    log_info "Checking network connectivity from $source_container to $target_container:$target_port"
    
    if docker exec "$source_container" ping -c 2 "$target_container" > /dev/null 2>&1; then
        log_success "Network connectivity confirmed between $source_container and $target_container"
        
        if [ -n "$target_port" ]; then
            if docker exec "$source_container" nc -z "$target_container" "$target_port" > /dev/null 2>&1; then
                log_success "Port connectivity confirmed to $target_container:$target_port"
                return 0
            else
                log_error "Cannot connect to $target_container:$target_port"
                return 1
            fi
        fi
        
        return 0
    else
        log_error "Network connectivity failed between $source_container and $target_container"
        return 1
    fi
}

# Function to fix Docker Compose version attribute
fix_docker_compose_file() {
    log_info "Fixing Docker Compose file format"
    
    # Check if version attribute exists and remove it
    if grep -q "^version:" "$PLATFORM_DIR/docker-compose.yml"; then
        log_info "Removing obsolete 'version' attribute from docker-compose.yml"
        sed -i '/^version:/d' "$PLATFORM_DIR/docker-compose.yml"
        log_success "Removed obsolete 'version' attribute"
    else
        log_info "No obsolete 'version' attribute found in docker-compose.yml"
    fi
}

# Function to diagnose and fix API container
diagnose_and_fix_api() {
    log_section "Diagnosing API Container"
    
    # Check if API container exists
    if ! container_exists "$API_CONTAINER"; then
        log_error "API container does not exist"
        return 1
    fi
    
    # Get API container logs
    log_info "Checking API container logs"
    docker logs "$API_CONTAINER" > "$LOGS_DIR/api_container.log" 2>&1
    
    # Check for common issues in logs
    if grep -q "Cannot find module" "$LOGS_DIR/api_container.log"; then
        log_error "API container has missing Node.js modules"
        
        log_info "Rebuilding API container with proper Node.js modules"
        cd "$PLATFORM_DIR/api"
        
        # Check if package.json exists
        if [ ! -f "package.json" ]; then
            log_error "package.json not found in $PLATFORM_DIR/api"
            
            # Create a basic package.json
            log_info "Creating a basic package.json file"
            cat > "package.json" <<EOF
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
        
        # Check if server.js exists
        if [ ! -f "server.js" ]; then
            log_error "server.js not found in $PLATFORM_DIR/api"
            
            # Create a basic server.js
            log_info "Creating a basic server.js file"
            cat > "server.js" <<EOF
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
        fi
        
        # Rebuild and restart API container
        log_info "Rebuilding API container"
        cd "$PLATFORM_DIR"
        docker-compose build api
        docker-compose up -d api
        
        # Wait for API container to be ready
        wait_for_container "$API_CONTAINER" 6
    elif grep -q "EADDRINUSE" "$LOGS_DIR/api_container.log"; then
        log_error "API container port is already in use"
        
        # Check what's using port 3001
        log_info "Checking what's using port 3001"
        netstat -tulpn | grep 3001
        
        # Modify API port in docker-compose.yml
        log_info "Modifying API port in docker-compose.yml"
        sed -i 's/127.0.0.1:3001:3001/127.0.0.1:3002:3001/' "$PLATFORM_DIR/docker-compose.yml"
        
        # Update Nginx configuration to use new port
        if [ -f "$CONFIG_DIR/nginx/conf.d/default.conf" ]; then
            log_info "Updating Nginx configuration to use new API port"
            sed -i 's/proxy_pass http:\/\/api:3001/proxy_pass http:\/\/api:3002/' "$CONFIG_DIR/nginx/conf.d/default.conf"
        fi
        
        # Restart API and Nginx containers
        log_info "Restarting API and Nginx containers"
        docker-compose restart api nginx
        
        # Wait for API container to be ready
        wait_for_container "$API_CONTAINER" 6
    else
        log_info "No specific API issues found in logs, attempting general fix"
        
        # Restart API container
        log_info "Restarting API container"
        docker-compose restart api
        
        # Wait for API container to be ready
        wait_for_container "$API_CONTAINER" 6
    fi
    
    # Verify API container is running
    if is_container_running "$API_CONTAINER"; then
        log_success "API container is now running"
        return 0
    else
        log_error "API container is still not running"
        return 1
    fi
}

# Function to diagnose and fix Nginx container
diagnose_and_fix_nginx() {
    log_section "Diagnosing Nginx Container"
    
    # Check if Nginx container exists
    if ! container_exists "$NGINX_CONTAINER"; then
        log_error "Nginx container does not exist"
        return 1
    fi
    
    # Get Nginx container logs
    log_info "Checking Nginx container logs"
    docker logs "$NGINX_CONTAINER" > "$LOGS_DIR/nginx_container.log" 2>&1
    
    # Check for common issues in logs
    if grep -q "no such file or directory" "$LOGS_DIR/nginx_container.log" || grep -q "failed to open" "$LOGS_DIR/nginx_container.log"; then
        log_error "Nginx container has missing configuration files"
        
        # Create Nginx configuration directory if it doesn't exist
        log_info "Creating Nginx configuration directories"
        mkdir -p "$CONFIG_DIR/nginx/conf.d"
        mkdir -p "$DATA_DIR/nginx/html"
        
        # Create main nginx.conf if it doesn't exist
        if [ ! -f "$CONFIG_DIR/nginx/nginx.conf" ]; then
            log_info "Creating main nginx.conf"
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
        fi
        
        # Create default site configuration if it doesn't exist
        if [ ! -f "$CONFIG_DIR/nginx/conf.d/default.conf" ]; then
            log_info "Creating default.conf"
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
        proxy_pass http://prometheus:9090/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Alertmanager (protected)
    location /alertmanager/ {
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
    }
}
EOF
        fi
        
        # Create default HTML page if it doesn't exist
        if [ ! -f "$DATA_DIR/nginx/html/index.html" ]; then
            log_info "Creating default index.html"
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
        fi
        
        # Set proper permissions
        log_info "Setting proper permissions on Nginx files"
        chmod -R 755 "$CONFIG_DIR/nginx"
        chmod -R 755 "$DATA_DIR/nginx"
        
        # Restart Nginx container
        log_info "Restarting Nginx container"
        docker-compose restart nginx
        
        # Wait for Nginx container to be ready
        wait_for_container "$NGINX_CONTAINER" 6
    elif grep -q "host not found in upstream" "$LOGS_DIR/nginx_container.log"; then
        log_error "Nginx container cannot resolve upstream hosts"
        
        # Check Docker network
        log_info "Checking Docker network"
        docker network ls
        docker network inspect risk-platform_risk-platform-network
        
        # Restart Docker network
        log_info "Restarting Docker network"
        docker-compose down
        docker-compose up -d
        
        # Wait for Nginx container to be ready
        wait_for_container "$NGINX_CONTAINER" 6
    else
        log_info "No specific Nginx issues found in logs, attempting general fix"
        
        # Restart Nginx container
        log_info "Restarting Nginx container"
        docker-compose restart nginx
        
        # Wait for Nginx container to be ready
        wait_for_container "$NGINX_CONTAINER" 6
    fi
    
    # Verify Nginx container is running
    if is_container_running "$NGINX_CONTAINER"; then
        log_success "Nginx container is now running"
        return 0
    else
        log_error "Nginx container is still not running"
        return 1
    fi
}

# Function to diagnose and fix Prometheus container
diagnose_and_fix_prometheus() {
    log_section "Diagnosing Prometheus Container"
    
    # Check if Prometheus container exists
    if ! container_exists "$PROMETHEUS_CONTAINER"; then
        log_error "Prometheus container does not exist"
        return 1
    fi
    
    # Get Prometheus container logs
    log_info "Checking Prometheus container logs"
    docker logs "$PROMETHEUS_CONTAINER" > "$LOGS_DIR/prometheus_container.log" 2>&1
    
    # Check for common issues in logs
    if grep -q "no such file or directory" "$LOGS_DIR/prometheus_container.log" || grep -q "couldn't load configuration" "$LOGS_DIR/prometheus_container.log"; then
        log_error "Prometheus container has missing configuration files"
        
        # Create Prometheus configuration directory if it doesn't exist
        log_info "Creating Prometheus configuration directory"
        mkdir -p "$CONFIG_DIR/prometheus"
        mkdir -p "$CONFIG_DIR/prometheus/rules"
        
        # Create prometheus.yml if it doesn't exist
        if [ ! -f "$CONFIG_DIR/prometheus/prometheus.yml" ]; then
            log_info "Creating prometheus.yml"
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
      - targets: ["localhost:9100"]
EOF
        fi
        
        # Create a basic alert rule if rules directory is empty
        if [ ! -f "$CONFIG_DIR/prometheus/rules/alerts.yml" ]; then
            log_info "Creating basic alert rules"
            mkdir -p "$CONFIG_DIR/prometheus/rules"
            cat > "$CONFIG_DIR/prometheus/rules/alerts.yml" <<EOF
groups:
- name: example
  rules:
  - alert: InstanceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Instance {{ \$labels.instance }} down"
      description: "{{ \$labels.instance }} of job {{ \$labels.job }} has been down for more than 1 minute."
EOF
        fi
        
        # Set proper permissions
        log_info "Setting proper permissions on Prometheus files"
        chmod -R 755 "$CONFIG_DIR/prometheus"
        chown -R 65534:65534 "$DATA_DIR/monitoring/prometheus" # nobody:nobody for Prometheus
        
        # Restart Prometheus container
        log_info "Restarting Prometheus container"
        docker-compose restart prometheus
        
        # Wait for Prometheus container to be ready
        wait_for_container "$PROMETHEUS_CONTAINER" 6
    elif grep -q "permission denied" "$LOGS_DIR/prometheus_container.log"; then
        log_error "Prometheus container has permission issues"
        
        # Fix permissions
        log_info "Fixing Prometheus data directory permissions"
        mkdir -p "$DATA_DIR/monitoring/prometheus"
        chown -R 65534:65534 "$DATA_DIR/monitoring/prometheus" # nobody:nobody for Prometheus
        chmod -R 755 "$DATA_DIR/monitoring/prometheus"
        
        # Restart Prometheus container
        log_info "Restarting Prometheus container"
        docker-compose restart prometheus
        
        # Wait for Prometheus container to be ready
        wait_for_container "$PROMETHEUS_CONTAINER" 6
    else
        log_info "No specific Prometheus issues found in logs, attempting general fix"
        
        # Restart Prometheus container
        log_info "Restarting Prometheus container"
        docker-compose restart prometheus
        
        # Wait for Prometheus container to be ready
        wait_for_container "$PROMETHEUS_CONTAINER" 6
    fi
    
    # Verify Prometheus container is running
    if is_container_running "$PROMETHEUS_CONTAINER"; then
        log_success "Prometheus container is now running"
        return 0
    else
        log_error "Prometheus container is still not running"
        return 1
    fi
}

# Function to validate all services
validate_services() {
    log_section "Validating All Services"
    
    # Check if all containers are running
    log_info "Checking if all containers are running"
    
    local all_running=true
    
    for container in "$API_CONTAINER" "$NGINX_CONTAINER" "$PROMETHEUS_CONTAINER" "$GRAFANA_CONTAINER" "$POSTGRES_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
        if is_container_running "$container"; then
            log_success "$container is running"
        else
            log_error "$container is not running"
            all_running=false
        fi
    done
    
    # Check network connectivity between containers
    log_info "Checking network connectivity between containers"
    
    # Install netcat in Nginx container for connectivity tests
    docker exec "$NGINX_CONTAINER" apk add --no-cache netcat-openbsd > /dev/null 2>&1 || true
    
    # Test connectivity from Nginx to other services
    check_network_connectivity "$NGINX_CONTAINER" "$API_CONTAINER" 3001
    check_network_connectivity "$NGINX_CONTAINER" "$GRAFANA_CONTAINER" 3000
    check_network_connectivity "$NGINX_CONTAINER" "$PROMETHEUS_CONTAINER" 9090
    
    # Test API endpoint
    log_info "Testing API endpoint"
    if curl -s "http://localhost/api/status" > /dev/null; then
        log_success "API endpoint is accessible"
    else
        log_warning "API endpoint is not accessible"
        all_running=false
    fi
    
    # Test Grafana endpoint
    log_info "Testing Grafana endpoint"
    if curl -s "http://localhost/monitoring" > /dev/null; then
        log_success "Grafana endpoint is accessible"
    else
        log_warning "Grafana endpoint is not accessible"
        all_running=false
    fi
    
    # Return overall status
    if [ "$all_running" = true ]; then
        log_success "All services validated successfully"
        return 0
    else
        log_warning "Some services failed validation"
        return 1
    fi
}

# Function to fix Grafana permissions
fix_grafana_permissions() {
    log_section "Fixing Grafana Permissions"
    
    # Check if Grafana container exists
    if ! container_exists "$GRAFANA_CONTAINER"; then
        log_error "Grafana container does not exist"
        return 1
    fi
    
    # Stop Grafana container
    log_info "Stopping Grafana container"
    docker-compose stop grafana
    
    # Fix permissions
    log_info "Setting Grafana directory permissions"
    mkdir -p "$DATA_DIR/monitoring/grafana"
    chown -R 472:0 "$DATA_DIR/monitoring/grafana"
    find "$DATA_DIR/monitoring/grafana" -type d -exec chmod 755 {} \;
    find "$DATA_DIR/monitoring/grafana" -type f -exec chmod 644 {} \;
    
    # Start Grafana container
    log_info "Starting Grafana container"
    docker-compose up -d grafana
    
    # Wait for Grafana container to be ready
    wait_for_container "$GRAFANA_CONTAINER" 6
    
    # Verify Grafana container is running
    if is_container_running "$GRAFANA_CONTAINER"; then
        log_success "Grafana container is now running"
        return 0
    else
        log_error "Grafana container is still not running"
        return 1
    fi
}

# Main function
main() {
    # Navigate to platform directory
    log_info "Navigating to platform directory: $PLATFORM_DIR"
    if [ ! -d "$PLATFORM_DIR" ]; then
        log_error "Platform directory not found: $PLATFORM_DIR"
        exit 1
    fi
    cd "$PLATFORM_DIR"
    
    # Fix Docker Compose file
    fix_docker_compose_file
    
    # Diagnose and fix services
    diagnose_and_fix_api
    diagnose_and_fix_nginx
    diagnose_and_fix_prometheus
    
    # Fix Grafana permissions
    fix_grafana_permissions
    
    # Validate all services
    validate_services
    
    # Final status
    log_section "Final Status"
    
    # Check if all containers are running
    local all_running=true
    
    for container in "$API_CONTAINER" "$NGINX_CONTAINER" "$PROMETHEUS_CONTAINER" "$GRAFANA_CONTAINER" "$POSTGRES_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
        if ! is_container_running "$container"; then
            all_running=false
            break
        fi
    done
    
    # Get public IP
    PUBLIC_IP=$(curl -s https://api.ipify.org)
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP="localhost"
        log_warning "Could not determine public IP, using localhost"
    else
        log_info "Public IP: $PUBLIC_IP"
    fi
    
    if [ "$all_running" = true ]; then
        echo -e "${GREEN}All services are now running!${NC}"
        
        echo ""
        echo -e "${CYAN}Access URLs:${NC}"
        echo -e "Main Platform: ${YELLOW}http://$PUBLIC_IP${NC}"
        echo -e "Monitoring Dashboard: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
        echo -e "API Status: ${YELLOW}http://$PUBLIC_IP/api/status${NC}"
        
        echo ""
        echo -e "${CYAN}Credentials:${NC}"
        echo -e "Grafana: ${YELLOW}Username: admin, Password: admin${NC}"
        echo -e "Database: ${YELLOW}Username: risk_platform, Password: risk_platform_password, Database: risk_platform${NC}"
    else
        echo -e "${YELLOW}Some services are still not running.${NC}"
        echo -e "Please check the logs for more details: ${YELLOW}$LOG_FILE${NC}"
        echo -e "You can also check individual container logs with: ${YELLOW}docker logs <container-name>${NC}"
    fi
    
    echo ""
    echo -e "Diagnosis and fix log saved to: ${YELLOW}$LOG_FILE${NC}"
    echo ""
    
    log_success "Service diagnosis and fix completed"
}

# Run main function
main
