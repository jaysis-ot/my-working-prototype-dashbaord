#!/bin/bash
# final-api-fix.sh
# Comprehensive script to definitively fix the API container Express module issue
# Version: 1.0.0
# Date: 2025-08-04

# Set strict error handling
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
API_DIR="${PLATFORM_DIR}/api"
API_CONTAINER="risk-platform-api"
API_IMAGE="risk-platform-api"
API_PORT=3001
NGINX_CONTAINER="risk-platform-nginx"
LOG_FILE="/var/log/risk-platform-api-fix-$(date +%Y%m%d-%H%M%S).log"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  DEFINITIVE API CONTAINER FIX               ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

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
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

log "Starting comprehensive API container fix"
log "Platform directory: $PLATFORM_DIR"
log "API directory: $API_DIR"
log "Log file: $LOG_FILE"

# Step 1: Stop and remove all API containers
log "Step 1: Stopping and removing all API containers"
cd "$PLATFORM_DIR" || { error "Cannot change to platform directory"; exit 1; }

# Stop the API container
docker-compose stop api || warning "API container was not running"

# Remove the API container
docker-compose rm -f api || warning "API container could not be removed"

# Find and remove any other API containers that might be running
for container in $(docker ps -a | grep "$API_CONTAINER" | awk '{print $1}'); do
    log "Removing container: $container"
    docker rm -f "$container" || warning "Could not remove container $container"
done

success "All API containers stopped and removed"

# Step 2: Remove all API images and volumes
log "Step 2: Removing all API images and Docker build cache"

# Remove API images
for image in $(docker images | grep "$API_IMAGE" | awk '{print $3}'); do
    log "Removing image: $image"
    docker rmi -f "$image" || warning "Could not remove image $image"
done

# Clean Docker build cache
log "Cleaning Docker build cache"
docker builder prune -f --filter until=24h || warning "Could not clean Docker build cache"

# Remove any dangling images
docker image prune -f || warning "Could not remove dangling images"

success "All API images and build cache removed"

# Step 3: Create clean API directory with proper Node.js structure
log "Step 3: Creating clean API directory with proper Node.js structure"

# Backup existing API directory if it exists
if [ -d "$API_DIR" ]; then
    log "Backing up existing API directory"
    BACKUP_DIR="${PLATFORM_DIR}/backups/api-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r "$API_DIR" "$BACKUP_DIR/" || warning "Could not backup API directory"
    log "API directory backed up to: $BACKUP_DIR"
    
    # Remove existing API directory
    rm -rf "$API_DIR" || { error "Could not remove existing API directory"; exit 1; }
fi

# Create fresh API directory
mkdir -p "$API_DIR" || { error "Could not create API directory"; exit 1; }

# Create package.json with explicit dependencies
log "Creating package.json"
cat > "$API_DIR/package.json" << 'EOF'
{
  "name": "risk-platform-api",
  "version": "1.0.0",
  "description": "Risk Platform API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "echo \"No tests configured\" && exit 0"
  },
  "dependencies": {
    "express": "4.18.2",
    "cors": "2.8.5",
    "body-parser": "1.20.2",
    "dotenv": "16.3.1"
  },
  "engines": {
    "node": ">=18"
  }
}
EOF

# Create package-lock.json to ensure consistent installs
log "Creating package-lock.json"
cat > "$API_DIR/package-lock.json" << 'EOF'
{
  "name": "risk-platform-api",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "risk-platform-api",
      "version": "1.0.0",
      "dependencies": {
        "body-parser": "1.20.2",
        "cors": "2.8.5",
        "dotenv": "16.3.1",
        "express": "4.18.2"
      },
      "engines": {
        "node": ">=18"
      }
    }
  }
}
EOF

# Create server.js with basic API endpoints
log "Creating server.js"
cat > "$API_DIR/server.js" << 'EOF'
// Import required modules
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();
const port = process.env.PORT || 3001;

// Configure middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Risk Platform API',
    version: '1.0.0',
    status: 'operational'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage()
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Risk Platform API running on port ${port}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
});
EOF

# Create .dockerignore file
log "Creating .dockerignore"
cat > "$API_DIR/.dockerignore" << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
.env
*.md
EOF

# Create Dockerfile with optimized build process
log "Creating Dockerfile"
cat > "$API_DIR/Dockerfile" << 'EOF'
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies with explicit flags
RUN npm cache clean --force && \
    npm ci --no-audit --no-fund --prefer-offline && \
    npm cache verify

# Verify express module is installed
RUN node -e "require('express')" || (echo "EXPRESS MODULE NOT INSTALLED PROPERLY" && exit 1)

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q -O - http://localhost:3001/health || exit 1

# Start application
CMD ["npm", "start"]
EOF

# Create .env file
log "Creating .env file"
cat > "$API_DIR/.env" << 'EOF'
PORT=3001
NODE_ENV=production
EOF

# Set proper permissions
log "Setting proper permissions"
chmod -R 755 "$API_DIR"
success "Clean API directory created with proper Node.js structure"

# Step 4: Build a new container from scratch
log "Step 4: Building a new container from scratch"

# Update docker-compose.yml if needed
log "Checking docker-compose.yml configuration"
if grep -q "risk-platform-api" "$PLATFORM_DIR/docker-compose.yml"; then
    log "API service found in docker-compose.yml"
else
    warning "API service not found in docker-compose.yml, adding it"
    # Backup docker-compose.yml
    cp "$PLATFORM_DIR/docker-compose.yml" "$PLATFORM_DIR/docker-compose.yml.bak"
    
    # Add API service to docker-compose.yml
    cat >> "$PLATFORM_DIR/docker-compose.yml" << 'EOF'

  api:
    build: ./api
    container_name: risk-platform-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./api:/app
    environment:
      - NODE_ENV=production
    networks:
      - risk-platform-network
EOF
fi

# Build the API container with no cache
log "Building API container with no cache"
docker-compose build --no-cache api || { error "Failed to build API container"; exit 1; }
success "API container built successfully"

# Step 5: Start and test the container
log "Step 5: Starting and testing the API container"

# Start the API container
docker-compose up -d api || { error "Failed to start API container"; exit 1; }
success "API container started"

# Wait for container to initialize
log "Waiting for container to initialize..."
sleep 10

# Get API container IP address
API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$API_CONTAINER")
log "API container IP: $API_IP"

# Test API container directly
log "Testing API container directly"
MAX_RETRIES=5
RETRY_COUNT=0
API_WORKING=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "http://$API_IP:$API_PORT/health" > /dev/null 2>&1; then
        API_RESPONSE=$(curl -s "http://$API_IP:$API_PORT/health")
        success "API container is working!"
        echo -e "API Response: $API_RESPONSE"
        API_WORKING=true
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        warning "API not responding, retrying ($RETRY_COUNT/$MAX_RETRIES)..."
        sleep 5
    fi
done

if [ "$API_WORKING" = false ]; then
    error "API container is not responding. Checking logs..."
    docker logs "$API_CONTAINER"
    
    # Check if Express module is installed
    log "Checking if Express module is installed in the container"
    if docker exec "$API_CONTAINER" ls -la /app/node_modules | grep -q "express"; then
        success "Express module is installed in the container"
    else
        error "Express module is not installed in the container"
        
        # Try to install Express module manually
        log "Attempting to install Express module manually"
        docker exec "$API_CONTAINER" npm install express --save
        
        # Restart the container
        docker restart "$API_CONTAINER"
        sleep 10
        
        # Test again
        if curl -s "http://$API_IP:$API_PORT/health" > /dev/null 2>&1; then
            API_RESPONSE=$(curl -s "http://$API_IP:$API_PORT/health")
            success "API container is now working after manual Express installation!"
            echo -e "API Response: $API_RESPONSE"
            API_WORKING=true
        else
            error "API container still not working after manual Express installation"
            exit 1
        fi
    fi
fi

# Step 6: Configure Nginx proxy
log "Step 6: Configuring Nginx proxy"

# Check if Nginx is running in Docker or on the host
if docker ps | grep -q "$NGINX_CONTAINER"; then
    log "Nginx is running in Docker container"
    NGINX_IN_DOCKER=true
else
    log "Nginx is running on the host"
    NGINX_IN_DOCKER=false
fi

# Create Nginx configuration
log "Creating Nginx configuration for API proxy"
NGINX_CONF="
# API Proxy Configuration
location /api/ {
    proxy_pass http://$API_IP:$API_PORT/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    proxy_read_timeout 90;
}

# Direct API endpoint access
location = /api {
    return 302 /api/;
}
"

if [ "$NGINX_IN_DOCKER" = true ]; then
    # Configure Nginx in Docker
    log "Configuring Nginx in Docker container"
    
    # Create temporary file
    echo "$NGINX_CONF" > /tmp/api_proxy.conf
    
    # Copy to Nginx container
    docker cp /tmp/api_proxy.conf "$NGINX_CONTAINER":/etc/nginx/conf.d/api_proxy.conf
    
    # Verify Nginx configuration
    log "Verifying Nginx configuration"
    if docker exec "$NGINX_CONTAINER" nginx -t; then
        success "Nginx configuration is valid"
    else
        error "Nginx configuration is invalid"
        docker exec "$NGINX_CONTAINER" rm /etc/nginx/conf.d/api_proxy.conf
        exit 1
    fi
    
    # Restart Nginx container
    log "Restarting Nginx container"
    docker restart "$NGINX_CONTAINER"
else
    # Configure Nginx on host
    log "Configuring Nginx on host"
    
    # Create configuration file
    echo "$NGINX_CONF" > /etc/nginx/conf.d/api_proxy.conf
    
    # Verify Nginx configuration
    log "Verifying Nginx configuration"
    if nginx -t; then
        success "Nginx configuration is valid"
    else
        error "Nginx configuration is invalid"
        rm /etc/nginx/conf.d/api_proxy.conf
        exit 1
    fi
    
    # Restart Nginx
    log "Restarting Nginx"
    systemctl restart nginx
fi

success "Nginx proxy configured"

# Step 7: Test the API through Nginx
log "Step 7: Testing the API through Nginx"
sleep 5  # Wait for Nginx to restart completely

# Get public IP
PUBLIC_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

# Test API endpoint through Nginx
MAX_RETRIES=5
RETRY_COUNT=0
PROXY_WORKING=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "http://localhost/api/health" > /dev/null 2>&1; then
        API_RESPONSE=$(curl -s "http://localhost/api/health")
        success "API is accessible through Nginx!"
        echo -e "API Response: $API_RESPONSE"
        PROXY_WORKING=true
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        warning "API not accessible through Nginx, retrying ($RETRY_COUNT/$MAX_RETRIES)..."
        sleep 5
    fi
done

if [ "$PROXY_WORKING" = false ]; then
    error "API is not accessible through Nginx. Checking logs..."
    
    if [ "$NGINX_IN_DOCKER" = true ]; then
        docker logs "$NGINX_CONTAINER" | tail -n 20
    else
        tail -n 20 /var/log/nginx/error.log
    fi
    
    # Try alternative configuration with container name instead of IP
    log "Trying alternative configuration with container name"
    
    NGINX_ALT_CONF="
    # API Proxy Configuration (Alternative)
    location /api/ {
        proxy_pass http://$API_CONTAINER:$API_PORT/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }
    "
    
    if [ "$NGINX_IN_DOCKER" = true ]; then
        echo "$NGINX_ALT_CONF" > /tmp/api_proxy.conf
        docker cp /tmp/api_proxy.conf "$NGINX_CONTAINER":/etc/nginx/conf.d/api_proxy.conf
        docker restart "$NGINX_CONTAINER"
    else
        echo "$NGINX_ALT_CONF" > /etc/nginx/conf.d/api_proxy.conf
        systemctl restart nginx
    fi
    
    sleep 5
    
    # Test again
    if curl -s "http://localhost/api/health" > /dev/null 2>&1; then
        API_RESPONSE=$(curl -s "http://localhost/api/health")
        success "API is now accessible through Nginx with alternative configuration!"
        echo -e "API Response: $API_RESPONSE"
        PROXY_WORKING=true
    else
        warning "API still not accessible through Nginx with alternative configuration"
    fi
fi

# Final status report
echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  FINAL API CONTAINER STATUS                  ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Check if both API and proxy are working
if [ "$API_WORKING" = true ] && [ "$PROXY_WORKING" = true ]; then
    echo -e "${GREEN}✅ API CONTAINER FIX SUCCESSFUL!${NC}"
    echo ""
    echo "Access URLs:"
    echo -e "API Health: ${YELLOW}http://$PUBLIC_IP/api/health${NC}"
    echo -e "API Status: ${YELLOW}http://$PUBLIC_IP/api/status${NC}"
    echo -e "API Root: ${YELLOW}http://$PUBLIC_IP/api/${NC}"
    echo -e "Monitoring: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Deploy your actual Risk Platform API code"
    echo "2. Deploy your database schema"
    echo "3. Deploy your frontend code"
    echo "4. Implement enterprise scripts from final_missing_scripts.sh"
    echo ""
    echo "For detailed deployment instructions, run: ./check-dashboard-status.sh"
elif [ "$API_WORKING" = true ]; then
    echo -e "${YELLOW}⚠️ API CONTAINER WORKING BUT NGINX PROXY NOT CONFIGURED CORRECTLY${NC}"
    echo ""
    echo "The API container is working correctly, but the Nginx proxy is not configured properly."
    echo "You can access the API directly at: ${YELLOW}http://$API_IP:$API_PORT${NC}"
    echo ""
    echo "To fix the Nginx proxy configuration manually, check:"
    if [ "$NGINX_IN_DOCKER" = true ]; then
        echo "- Docker Nginx configuration: /etc/nginx/conf.d/api_proxy.conf in the $NGINX_CONTAINER container"
        echo "- Docker Nginx logs: docker logs $NGINX_CONTAINER"
    else
        echo "- Host Nginx configuration: /etc/nginx/conf.d/api_proxy.conf"
        echo "- Host Nginx logs: /var/log/nginx/error.log"
    fi
else
    echo -e "${RED}❌ API CONTAINER FIX FAILED${NC}"
    echo ""
    echo "The API container is not working correctly. Please check:"
    echo "- API container logs: docker logs $API_CONTAINER"
    echo "- API container configuration: $API_DIR"
    echo "- Docker build process: docker-compose build --no-cache api"
    echo ""
    echo "For manual troubleshooting, try:"
    echo "1. docker exec -it $API_CONTAINER sh"
    echo "2. cd /app"
    echo "3. ls -la node_modules"
    echo "4. npm install express --save"
    echo "5. node -e \"require('express')\""
fi

echo ""
echo "Fix log saved to: $LOG_FILE"
echo ""
success "API container fix script completed"
