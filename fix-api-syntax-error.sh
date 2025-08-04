#!/bin/bash
# fix-api-syntax-error.sh
# Quick fix script for API container issues
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
API_DIR="${PLATFORM_DIR}/api"
API_CONTAINER="risk-platform-api"
LOG_FILE="/var/log/risk-platform-api-quickfix-$(date +%Y%m%d-%H%M%S).log"

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

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    log_error "This script must be run as root!"
    exit 1
fi

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

# Function to check if a container is running
is_container_running() {
    local container=$1
    if docker ps --format '{{.Names}}' | grep -q "^$container$"; then
        return 0
    else
        return 1
    fi
}

# Function to create a basic package.json
create_package_json() {
    log_section "Creating package.json"
    
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
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1"
  }
}
EOF
    log_success "Created package.json file"
}

# Function to create a basic server.js
create_server_js() {
    log_section "Creating server.js"
    
    cat > "$API_DIR/server.js" <<EOF
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'risk_platform',
  host: process.env.DB_HOST || 'postgres',
  database: process.env.DB_NAME || 'risk_platform',
  password: process.env.DB_PASSWORD || 'risk_platform_password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

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
app.listen(port, '0.0.0.0', () => {
  console.log(\`API server running on port \${port}\`);
});
EOF
    log_success "Created server.js file"
}

# Function to create a basic .env file
create_env_file() {
    log_section "Creating .env file"
    
    cat > "$API_DIR/.env" <<EOF
PORT=3001
DB_USER=risk_platform
DB_PASSWORD=risk_platform_password
DB_HOST=postgres
DB_PORT=5432
DB_NAME=risk_platform
NODE_ENV=development
EOF
    log_success "Created .env file"
}

# Function to create a basic Dockerfile
create_dockerfile() {
    log_section "Creating Dockerfile"
    
    cat > "$API_DIR/Dockerfile" <<EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
EOF
    log_success "Created Dockerfile"
}

# Function to check API endpoint
check_api_endpoint() {
    local endpoint=${1:-"http://localhost/api/status"}
    local timeout=${2:-5}
    
    log_info "Checking API endpoint: $endpoint"
    
    if curl -s --max-time "$timeout" "$endpoint" > /dev/null; then
        local response=$(curl -s --max-time "$timeout" "$endpoint")
        log_success "API endpoint is accessible"
        echo "Response: $response"
        return 0
    else
        log_error "API endpoint is not accessible"
        return 1
    fi
}

# Main function
main() {
    # Display header
    echo "==============================================="
    echo "  Risk Platform API Quick Fix Tool             "
    echo "==============================================="
    echo ""
    log_info "Starting API quick fix"
    
    # Navigate to platform directory
    log_info "Navigating to platform directory: $PLATFORM_DIR"
    if [ ! -d "$PLATFORM_DIR" ]; then
        log_error "Platform directory not found: $PLATFORM_DIR"
        exit 1
    fi
    cd "$PLATFORM_DIR"
    
    # Stop API container
    log_section "Stopping API Container"
    log_info "Stopping API container"
    docker-compose stop api
    log_success "API container stopped"
    
    # Backup API directory
    log_section "Backing up API Directory"
    if [ -d "$API_DIR" ]; then
        log_info "Backing up API directory"
        mkdir -p "$PLATFORM_DIR/backups"
        cp -r "$API_DIR" "$PLATFORM_DIR/backups/api-backup-$(date +%Y%m%d-%H%M%S)"
        log_success "API directory backed up"
    fi
    
    # Create API directory if it doesn't exist
    if [ ! -d "$API_DIR" ]; then
        log_info "Creating API directory"
        mkdir -p "$API_DIR"
    fi
    
    # Create necessary files
    create_package_json
    create_server_js
    create_env_file
    create_dockerfile
    
    # Set proper permissions
    log_section "Setting Permissions"
    log_info "Setting proper permissions on API directory"
    chown -R 1000:1000 "$API_DIR"
    chmod -R 755 "$API_DIR"
    log_success "Permissions set"
    
    # Rebuild API container
    log_section "Rebuilding API Container"
    log_info "Rebuilding API container"
    docker-compose build api
    log_success "API container rebuilt"
    
    # Start API container
    log_section "Starting API Container"
    log_info "Starting API container"
    docker-compose up -d api
    log_success "API container started"
    
    # Wait for API container to be ready
    log_info "Waiting for API container to be ready..."
    sleep 10
    
    # Check if API container is running
    if is_container_running "$API_CONTAINER"; then
        log_success "API container is now running"
        
        # Check API endpoint
        sleep 5 # Give it a moment to fully initialize
        check_api_endpoint "http://localhost/api/status"
        
        # Restart Nginx to ensure it picks up any changes
        log_section "Restarting Nginx"
        log_info "Restarting Nginx to ensure it picks up API changes"
        docker-compose restart nginx
        log_success "Nginx restarted"
        
        # Final status
        log_section "Final Status"
        echo -e "${GREEN}API container fix completed successfully!${NC}"
        
        # Get public IP
        PUBLIC_IP=$(curl -s https://api.ipify.org)
        if [ -z "$PUBLIC_IP" ]; then
            PUBLIC_IP=$(hostname -I | awk '{print $1}')
        fi
        
        echo ""
        echo -e "${CYAN}Access URLs:${NC}"
        echo -e "API Status: ${YELLOW}http://$PUBLIC_IP/api/status${NC}"
        
        echo ""
        echo -e "${CYAN}Next Steps:${NC}"
        echo -e "1. ${YELLOW}Deploy your actual Risk Platform API code${NC}"
        echo -e "2. ${YELLOW}Deploy your database schema${NC}"
        echo -e "3. ${YELLOW}Deploy your frontend code${NC}"
        
        echo ""
        echo -e "For detailed deployment instructions, run: ${YELLOW}./check-dashboard-status.sh${NC}"
    else
        log_error "API container is still not running"
        log_info "Checking API container logs"
        docker logs "$API_CONTAINER"
        
        echo ""
        echo -e "${RED}API container fix failed.${NC}"
        echo -e "Please check the logs for more details: ${YELLOW}$LOG_FILE${NC}"
    fi
    
    echo ""
    echo -e "Fix log saved to: ${YELLOW}$LOG_FILE${NC}"
    echo ""
    
    log_info "API quick fix completed"
}

# Run main function
main
