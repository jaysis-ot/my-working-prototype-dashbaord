#!/bin/bash
# fix-api-container.sh
# Script to diagnose and fix issues with the API container
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
DOCKER_COMPOSE_FILE="${PLATFORM_DIR}/docker-compose.yml"
LOG_FILE="/var/log/risk-platform-api-fix-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="${PLATFORM_DIR}/backups/$(date +%Y%m%d-%H%M%S)"
MAX_WAIT_TIME=60 # Maximum time to wait for container in seconds

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

# Function to wait for a container to be healthy
wait_for_container() {
    local container=$1
    local max_attempts=$((MAX_WAIT_TIME / 5))
    local delay=5
    local attempt=1
    
    log_info "Waiting for $container to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if is_container_running "$container"; then
            # Check if container is stable (not restarting)
            local status=$(docker inspect --format='{{.State.Status}}' "$container")
            local restarts=$(docker inspect --format='{{.RestartCount}}' "$container" 2>/dev/null || echo "0")
            
            if [ "$status" = "running" ]; then
                # Wait a bit to ensure it's stable
                sleep 5
                
                # Check again to see if it's still running
                if is_container_running "$container"; then
                    local new_restarts=$(docker inspect --format='{{.RestartCount}}' "$container" 2>/dev/null || echo "0")
                    if [ "$new_restarts" = "$restarts" ]; then
                        log_success "$container is running stably"
                        return 0
                    else
                        log_warning "$container restarted during wait period"
                    fi
                fi
            fi
        fi
        
        log_info "Attempt $attempt/$max_attempts: $container is not ready yet, waiting ${delay}s..."
        sleep $delay
        attempt=$((attempt + 1))
    done
    
    log_error "$container did not become ready within the expected time"
    return 1
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

# Function to backup API files
backup_api_files() {
    log_section "Backing up API files"
    
    if [ -d "$API_DIR" ]; then
        log_info "Backing up API directory to $BACKUP_DIR/api"
        cp -r "$API_DIR" "$BACKUP_DIR/"
        log_success "API directory backed up successfully"
    else
        log_warning "API directory does not exist, nothing to backup"
    fi
}

# Function to check and fix API container logs
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
    
    # Check for common errors in logs
    log_info "Analyzing logs for common errors"
    
    # Check for missing modules
    if grep -q "Cannot find module" "$BACKUP_DIR/api_container.log"; then
        log_error "Found missing Node.js modules in logs"
        MISSING_MODULES=true
    fi
    
    # Check for port conflicts
    if grep -q "EADDRINUSE" "$BACKUP_DIR/api_container.log"; then
        log_error "Found port conflict in logs"
        PORT_CONFLICT=true
    fi
    
    # Check for permission issues
    if grep -q "EACCES" "$BACKUP_DIR/api_container.log"; then
        log_error "Found permission issues in logs"
        PERMISSION_ISSUES=true
    fi
    
    # Check for environment variable issues
    if grep -q "process.env" "$BACKUP_DIR/api_container.log" && grep -q "undefined" "$BACKUP_DIR/api_container.log"; then
        log_error "Found environment variable issues in logs"
        ENV_ISSUES=true
    fi
    
    # Check for syntax errors
    if grep -q "SyntaxError" "$BACKUP_DIR/api_container.log"; then
        log_error "Found JavaScript syntax errors in logs"
        SYNTAX_ERRORS=true
    fi
    
    # Check for database connection issues
    if grep -q "ECONNREFUSED" "$BACKUP_DIR/api_container.log" && grep -q "postgres\|pg\|database" "$BACKUP_DIR/api_container.log"; then
        log_error "Found database connection issues in logs"
        DB_CONNECTION_ISSUES=true
    fi
    
    # If no specific errors found, note it
    if [ -z "$MISSING_MODULES" ] && [ -z "$PORT_CONFLICT" ] && [ -z "$PERMISSION_ISSUES" ] && [ -z "$ENV_ISSUES" ] && [ -z "$SYNTAX_ERRORS" ] && [ -z "$DB_CONNECTION_ISSUES" ]; then
        log_info "No specific errors found in logs, will attempt general fixes"
    fi
}

# Function to check and fix package.json
check_and_fix_package_json() {
    log_section "Checking and Fixing package.json"
    
    # Check if package.json exists
    if [ ! -f "$API_DIR/package.json" ]; then
        log_error "package.json not found in $API_DIR"
        
        # Create a basic package.json
        log_info "Creating a basic package.json file"
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
    "dotenv": "^16.3.1",
    "morgan": "^1.10.0",
    "winston": "^3.10.0",
    "helmet": "^7.0.0"
  }
}
EOF
        log_success "Created basic package.json file"
    else
        log_info "package.json exists, checking for required dependencies"
        
        # Backup original package.json
        cp "$API_DIR/package.json" "$BACKUP_DIR/package.json.bak"
        
        # Check for essential dependencies
        local missing_deps=()
        for dep in "express" "cors" "body-parser" "pg" "dotenv"; do
            if ! grep -q "\"$dep\":" "$API_DIR/package.json"; then
                missing_deps+=("$dep")
            fi
        done
        
        # Add missing dependencies if any
        if [ ${#missing_deps[@]} -gt 0 ]; then
            log_warning "Missing dependencies: ${missing_deps[*]}"
            
            # Create temporary file with updated dependencies
            local temp_file=$(mktemp)
            jq '.dependencies = (.dependencies // {}) 
                | .dependencies["express"] = (.dependencies["express"] // "^4.18.2")
                | .dependencies["cors"] = (.dependencies["cors"] // "^2.8.5")
                | .dependencies["body-parser"] = (.dependencies["body-parser"] // "^1.20.2")
                | .dependencies["pg"] = (.dependencies["pg"] // "^8.11.3")
                | .dependencies["dotenv"] = (.dependencies["dotenv"] // "^16.3.1")' \
                "$API_DIR/package.json" > "$temp_file"
            
            # Check if jq command succeeded
            if [ $? -eq 0 ] && [ -s "$temp_file" ]; then
                mv "$temp_file" "$API_DIR/package.json"
                log_success "Updated package.json with missing dependencies"
            else
                log_error "Failed to update package.json with jq, using manual method"
                rm -f "$temp_file"
                
                # Manual method as fallback
                for dep in "${missing_deps[@]}"; do
                    case "$dep" in
                        "express") 
                            sed -i '/"dependencies":/a \    "express": "^4.18.2",' "$API_DIR/package.json"
                            ;;
                        "cors") 
                            sed -i '/"dependencies":/a \    "cors": "^2.8.5",' "$API_DIR/package.json"
                            ;;
                        "body-parser") 
                            sed -i '/"dependencies":/a \    "body-parser": "^1.20.2",' "$API_DIR/package.json"
                            ;;
                        "pg") 
                            sed -i '/"dependencies":/a \    "pg": "^8.11.3",' "$API_DIR/package.json"
                            ;;
                        "dotenv") 
                            sed -i '/"dependencies":/a \    "dotenv": "^16.3.1",' "$API_DIR/package.json"
                            ;;
                    esac
                done
                
                # Fix JSON syntax (commas)
                sed -i 's/",\s*}/"}/' "$API_DIR/package.json"
                sed -i 's/",\s*"/",\n    "/g' "$API_DIR/package.json"
                
                log_success "Manually updated package.json with missing dependencies"
            fi
        else
            log_success "All essential dependencies are present in package.json"
        fi
    fi
    
    # Check if start script is defined
    if ! grep -q '"start"' "$API_DIR/package.json"; then
        log_warning "No start script defined in package.json"
        
        # Try to use jq to add start script
        if command -v jq > /dev/null; then
            local temp_file=$(mktemp)
            jq '.scripts = (.scripts // {}) | .scripts.start = "node server.js"' "$API_DIR/package.json" > "$temp_file"
            
            if [ $? -eq 0 ] && [ -s "$temp_file" ]; then
                mv "$temp_file" "$API_DIR/package.json"
                log_success "Added start script to package.json"
            else
                log_error "Failed to update package.json with jq, using manual method"
                rm -f "$temp_file"
                
                # Manual method as fallback
                if grep -q '"scripts"' "$API_DIR/package.json"; then
                    sed -i '/"scripts":/a \    "start": "node server.js",' "$API_DIR/package.json"
                else
                    sed -i '/"dependencies":/i \  "scripts": {\n    "start": "node server.js"\n  },\n' "$API_DIR/package.json"
                fi
                
                # Fix JSON syntax (commas)
                sed -i 's/",\s*}/"}/' "$API_DIR/package.json"
                sed -i 's/",\s*"/",\n    "/g' "$API_DIR/package.json"
                
                log_success "Manually added start script to package.json"
            fi
        else
            # Manual method if jq is not available
            if grep -q '"scripts"' "$API_DIR/package.json"; then
                sed -i '/"scripts":/a \    "start": "node server.js",' "$API_DIR/package.json"
            else
                sed -i '/"dependencies":/i \  "scripts": {\n    "start": "node server.js"\n  },\n' "$API_DIR/package.json"
            fi
            
            # Fix JSON syntax (commas)
            sed -i 's/",\s*}/"}/' "$API_DIR/package.json"
            sed -i 's/",\s*"/",\n    "/g' "$API_DIR/package.json"
            
            log_success "Manually added start script to package.json"
        fi
    else
        log_success "Start script is defined in package.json"
    fi
}

# Function to check and fix server.js
check_and_fix_server_js() {
    log_section "Checking and Fixing server.js"
    
    # Check if server.js exists
    if [ ! -f "$API_DIR/server.js" ]; then
        log_error "server.js not found in $API_DIR"
        
        # Create a basic server.js
        log_info "Creating a basic server.js file"
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

// Database status endpoint
app.get('/db-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message
    });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(\`API server running on port \${port}\`);
});
EOF
        log_success "Created basic server.js file"
    else
        log_info "server.js exists, checking for common issues"
        
        # Backup original server.js
        cp "$API_DIR/server.js" "$BACKUP_DIR/server.js.bak"
        
        # Check for port binding issues (make sure it binds to 0.0.0.0)
        if grep -q "app.listen(.*port" "$API_DIR/server.js" && ! grep -q "app.listen(.*port.*0.0.0.0" "$API_DIR/server.js"; then
            log_warning "server.js might have port binding issues (not binding to 0.0.0.0)"
            
            # Try to fix the port binding
            sed -i 's/app.listen(\([^)]*\))/app.listen(\1, '\''0.0.0.0'\'')/g' "$API_DIR/server.js"
            
            # Check if the fix was applied
            if grep -q "app.listen(.*port.*0.0.0.0" "$API_DIR/server.js"; then
                log_success "Fixed port binding in server.js"
            else
                log_warning "Could not automatically fix port binding, manual review needed"
            fi
        else
            log_success "Port binding in server.js looks good"
        fi
        
        # Check for database connection issues
        if grep -q "pg\|postgres\|Pool" "$API_DIR/server.js"; then
            log_info "Found database connection code in server.js"
            
            # Check if environment variables are used with fallbacks
            if ! grep -q "process.env.DB_HOST.*||.*'postgres'" "$API_DIR/server.js" && ! grep -q "process.env.DB_USER.*||.*'risk_platform'" "$API_DIR/server.js"; then
                log_warning "Database connection might not have proper fallbacks for environment variables"
                
                # This is complex to fix automatically, just warn the user
                log_info "Consider adding fallbacks for database environment variables"
            else
                log_success "Database connection has proper fallbacks for environment variables"
            fi
        else
            log_warning "No database connection code found in server.js"
        fi
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f "$API_DIR/.env" ]; then
        log_warning ".env file not found, creating one with default values"
        
        cat > "$API_DIR/.env" <<EOF
PORT=3001
DB_USER=risk_platform
DB_PASSWORD=risk_platform_password
DB_HOST=postgres
DB_PORT=5432
DB_NAME=risk_platform
NODE_ENV=development
EOF
        log_success "Created .env file with default values"
    else
        log_success ".env file exists"
    fi
}

# Function to check and fix Docker-related issues
check_and_fix_docker_issues() {
    log_section "Checking and Fixing Docker-related Issues"
    
    # Check if Docker Compose file exists
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found at $DOCKER_COMPOSE_FILE"
        return 1
    fi
    
    # Backup original Docker Compose file
    cp "$DOCKER_COMPOSE_FILE" "$BACKUP_DIR/docker-compose.yml.bak"
    
    # Check API service definition in Docker Compose
    if ! grep -q "api:" "$DOCKER_COMPOSE_FILE"; then
        log_error "API service not defined in Docker Compose file"
        return 1
    fi
    
    # Check for port mapping issues
    if grep -q "api:" -A 20 "$DOCKER_COMPOSE_FILE" | grep -q "3001:3001"; then
        log_warning "API service might have port mapping issues"
        
        # Check if port 3001 is already in use on the host
        if netstat -tuln | grep -q ":3001 "; then
            log_error "Port 3001 is already in use on the host"
            
            # Modify port mapping to use 3002 instead
            log_info "Changing API port mapping from 3001 to 3002"
            sed -i 's/3001:3001/3002:3001/g' "$DOCKER_COMPOSE_FILE"
            
            # Update Nginx configuration if it exists
            if [ -f "$PLATFORM_DIR/config/nginx/conf.d/default.conf" ]; then
                log_info "Updating Nginx configuration to use new API port"
                sed -i 's/proxy_pass http:\/\/api:3001/proxy_pass http:\/\/api:3002/g' "$PLATFORM_DIR/config/nginx/conf.d/default.conf"
            fi
            
            log_success "Updated port mapping in Docker Compose file"
            PORT_CHANGED=true
        else
            log_success "Port 3001 is available"
        fi
    fi
    
    # Check for volume mapping issues
    if ! grep -q "api:" -A 20 "$DOCKER_COMPOSE_FILE" | grep -q "volumes:"; then
        log_warning "API service might not have proper volume mapping"
        
        # This is complex to fix automatically, just warn the user
        log_info "Consider adding proper volume mapping for the API service"
    fi
    
    # Check for environment variables
    if ! grep -q "api:" -A 20 "$DOCKER_COMPOSE_FILE" | grep -q "environment:"; then
        log_warning "API service might not have environment variables defined"
        
        # Find where to insert environment variables
        local line_num=$(grep -n "api:" "$DOCKER_COMPOSE_FILE" | cut -d: -f1)
        if [ -n "$line_num" ]; then
            line_num=$((line_num + 1))
            
            # Insert environment variables after the service definition
            sed -i "${line_num}a\\    environment:\\      - PORT=3001\\      - DB_USER=risk_platform\\      - DB_PASSWORD=risk_platform_password\\      - DB_HOST=postgres\\      - DB_PORT=5432\\      - DB_NAME=risk_platform\\      - NODE_ENV=development" "$DOCKER_COMPOSE_FILE"
            
            log_success "Added environment variables to API service in Docker Compose file"
        else
            log_error "Could not find API service definition in Docker Compose file"
        fi
    fi
}

# Function to rebuild and restart API container
rebuild_and_restart_api() {
    log_section "Rebuilding and Restarting API Container"
    
    # Stop the API container
    log_info "Stopping API container"
    cd "$PLATFORM_DIR"
    docker-compose stop api
    
    # Install Node.js dependencies
    log_info "Installing Node.js dependencies"
    if [ -d "$API_DIR/node_modules" ]; then
        log_info "Backing up existing node_modules"
        mv "$API_DIR/node_modules" "$BACKUP_DIR/node_modules"
    fi
    
    # Create a temporary Dockerfile for npm install
    log_info "Creating temporary Dockerfile for npm install"
    cat > "$API_DIR/Dockerfile.temp" <<EOF
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
EOF
    
    # Build a temporary image to install dependencies
    log_info "Building temporary image to install dependencies"
    docker build -t risk-platform-api-temp -f "$API_DIR/Dockerfile.temp" "$API_DIR"
    
    # Extract node_modules from the temporary container
    log_info "Extracting node_modules from temporary container"
    docker create --name temp-api-container risk-platform-api-temp
    docker cp temp-api-container:/app/node_modules "$API_DIR/"
    docker rm temp-api-container
    
    # Remove temporary Dockerfile and image
    rm "$API_DIR/Dockerfile.temp"
    docker rmi risk-platform-api-temp
    
    # Set proper permissions
    log_info "Setting proper permissions on API directory"
    chown -R 1000:1000 "$API_DIR"
    chmod -R 755 "$API_DIR"
    
    # Rebuild API container
    log_info "Rebuilding API container"
    docker-compose build api
    
    # Start API container
    log_info "Starting API container"
    docker-compose up -d api
    
    # Wait for API container to be ready
    wait_for_container "$API_CONTAINER" 12
    
    # Check if API container is running
    if is_container_running "$API_CONTAINER"; then
        log_success "API container is now running"
        
        # Check API endpoint
        sleep 5 # Give it a moment to fully initialize
        if [ -n "$PORT_CHANGED" ]; then
            check_api_endpoint "http://localhost:3002/api/status"
        else
            check_api_endpoint "http://localhost/api/status"
        fi
        
        return 0
    else
        log_error "API container is still not running"
        return 1
    fi
}

# Function to fix Nginx configuration for API
fix_nginx_config() {
    log_section "Fixing Nginx Configuration for API"
    
    # Check if Nginx configuration directory exists
    if [ ! -d "$PLATFORM_DIR/config/nginx/conf.d" ]; then
        log_error "Nginx configuration directory not found"
        return 1
    fi
    
    # Check if default.conf exists
    if [ ! -f "$PLATFORM_DIR/config/nginx/conf.d/default.conf" ]; then
        log_error "Nginx default.conf not found"
        return 1
    fi
    
    # Backup original Nginx configuration
    cp "$PLATFORM_DIR/config/nginx/conf.d/default.conf" "$BACKUP_DIR/default.conf.bak"
    
    # Check for API proxy configuration
    if ! grep -q "location /api/" "$PLATFORM_DIR/config/nginx/conf.d/default.conf"; then
        log_warning "API proxy configuration not found in Nginx config"
        
        # Add API proxy configuration
        log_info "Adding API proxy configuration to Nginx"
        cat >> "$PLATFORM_DIR/config/nginx/conf.d/default.conf" <<EOF

    # API proxy
    location /api/ {
        proxy_pass http://api:3001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
EOF
        log_success "Added API proxy configuration to Nginx"
    else
        log_info "API proxy configuration found in Nginx config"
        
        # Check if port was changed
        if [ -n "$PORT_CHANGED" ]; then
            log_info "Updating API port in Nginx configuration"
            sed -i 's/proxy_pass http:\/\/api:3001/proxy_pass http:\/\/api:3002/g' "$PLATFORM_DIR/config/nginx/conf.d/default.conf"
            log_success "Updated API port in Nginx configuration"
        fi
    fi
    
    # Restart Nginx
    log_info "Restarting Nginx"
    docker-compose restart nginx
    
    # Check if Nginx is running
    if docker ps | grep -q "risk-platform-nginx"; then
        log_success "Nginx restarted successfully"
        return 0
    else
        log_error "Nginx failed to restart"
        return 1
    fi
}

# Function to display final status and instructions
display_final_status() {
    log_section "Final Status"
    
    # Check if API container is running
    if is_container_running "$API_CONTAINER"; then
        echo -e "${GREEN}API container is now running!${NC}"
        
        # Get public IP
        PUBLIC_IP=$(curl -s https://api.ipify.org)
        if [ -z "$PUBLIC_IP" ]; then
            PUBLIC_IP=$(hostname -I | awk '{print $1}')
        fi
        
        echo ""
        echo -e "${CYAN}Access URLs:${NC}"
        if [ -n "$PORT_CHANGED" ]; then
            echo -e "API Status: ${YELLOW}http://$PUBLIC_IP:3002/api/status${NC}"
        else
            echo -e "API Status: ${YELLOW}http://$PUBLIC_IP/api/status${NC}"
        fi
        
        echo ""
        echo -e "${CYAN}Next Steps:${NC}"
        echo -e "1. ${YELLOW}Deploy your actual Risk Platform API code${NC}"
        echo -e "2. ${YELLOW}Deploy your database schema${NC}"
        echo -e "3. ${YELLOW}Deploy your frontend code${NC}"
        
        echo ""
        echo -e "For detailed deployment instructions, run: ${YELLOW}./check-dashboard-status.sh${NC}"
    else
        echo -e "${RED}API container is still not running.${NC}"
        echo -e "Please check the logs for more details: ${YELLOW}$LOG_FILE${NC}"
        echo -e "You can also check individual container logs with: ${YELLOW}docker logs $API_CONTAINER${NC}"
    fi
    
    echo ""
    echo -e "Fix log saved to: ${YELLOW}$LOG_FILE${NC}"
    echo ""
}

# Main function
main() {
    # Display header
    echo "==============================================="
    echo "  Risk Platform API Container Fix Tool         "
    echo "==============================================="
    echo ""
    log_info "Starting API container fix"
    
    # Navigate to platform directory
    log_info "Navigating to platform directory: $PLATFORM_DIR"
    if [ ! -d "$PLATFORM_DIR" ]; then
        log_error "Platform directory not found: $PLATFORM_DIR"
        exit 1
    fi
    cd "$PLATFORM_DIR"
    
    # Backup API files
    backup_api_files
    
    # Check API logs for errors
    check_api_logs
    
    # Check and fix package.json
    check_and_fix_package_json
    
    # Check and fix server.js
    check_and_fix_server_js
    
    # Check and fix Docker-related issues
    check_and_fix_docker_issues
    
    # Fix Nginx configuration for API
    fix_nginx_config
    
    # Rebuild and restart API container
    rebuild_and_restart_api
    
    # Display final status and instructions
    display_final_status
    
    log_success "API container fix completed"
}

# Run main function
main
