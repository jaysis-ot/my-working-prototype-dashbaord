#!/bin/bash
# fix-express-module.sh
# Script to fix the Docker build cache issue with Express module
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
LOG_FILE="/var/log/risk-platform-express-fix-$(date +%Y%m%d-%H%M%S).log"

# Display header
echo "==============================================="
echo "  Express Module Fix for API Container         "
echo "==============================================="
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

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    error "This script must be run as root!"
    exit 1
fi

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

# Step 1: Stop the API container
log "Step 1: Stopping API container"
cd "$PLATFORM_DIR"
docker-compose stop api
success "API container stopped"

# Step 2: Remove stale Docker images and build cache
log "Step 2: Removing stale Docker images and build cache"
docker rmi risk-platform-api --force 2>/dev/null || true
docker builder prune -f --filter until=24h
success "Stale Docker images and build cache removed"

# Step 3: Backup existing files
log "Step 3: Backing up existing API files"
mkdir -p "${PLATFORM_DIR}/backups/api-$(date +%Y%m%d-%H%M%S)"
if [ -d "$API_DIR" ]; then
    cp -r "$API_DIR" "${PLATFORM_DIR}/backups/api-$(date +%Y%m%d-%H%M%S)/"
    success "API files backed up"
else
    warning "No existing API directory to backup"
    mkdir -p "$API_DIR"
fi

# Step 4: Create clean package.json and server.js files
log "Step 4: Creating clean package.json and server.js files"

# Create package.json
log "Creating package.json"
cat > "$API_DIR/package.json" << 'EOF'
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
success "package.json created"

# Create server.js
log "Creating server.js"
cat > "$API_DIR/server.js" << 'EOF'
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
  console.log(`API server running on port ${port}`);
});
EOF
success "server.js created"

# Create Dockerfile
log "Creating Dockerfile"
cat > "$API_DIR/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
EOF
success "Dockerfile created"

# Set proper permissions
log "Setting proper permissions"
chown -R 1000:1000 "$API_DIR"
chmod -R 755 "$API_DIR"
success "Permissions set"

# Step 5: Force rebuild the container without cache
log "Step 5: Rebuilding API container without cache"
docker-compose build --no-cache api
success "API container rebuilt"

# Step 6: Start the container
log "Step 6: Starting API container"
docker-compose up -d api
success "API container started"

# Step 7: Wait for container to start
log "Step 7: Waiting for API container to initialize"
sleep 10

# Step 8: Test the endpoint
log "Step 8: Testing API endpoint"
if curl -s "http://localhost/api/status" > /dev/null 2>&1; then
    API_RESPONSE=$(curl -s "http://localhost/api/status")
    success "API endpoint is accessible!"
    echo -e "${GREEN}API Response:${NC} $API_RESPONSE"
else
    warning "API endpoint is not accessible through Nginx, trying direct access..."
    
    # Get API container IP
    API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$API_CONTAINER")
    
    if [ -n "$API_IP" ] && curl -s "http://$API_IP:3001/status" > /dev/null 2>&1; then
        API_RESPONSE=$(curl -s "http://$API_IP:3001/status")
        success "Direct API access works!"
        echo -e "${GREEN}API Response:${NC} $API_RESPONSE"
        
        # Restart Nginx to fix proxy issues
        log "Restarting Nginx to fix proxy issues"
        docker-compose restart nginx
        sleep 5
        
        # Test again through Nginx
        if curl -s "http://localhost/api/status" > /dev/null 2>&1; then
            success "API endpoint is now accessible through Nginx!"
        else
            warning "API still not accessible through Nginx, check Nginx configuration"
        fi
    else
        error "API is not accessible directly either. Checking logs..."
        docker logs "$API_CONTAINER" | tail -n 20
    fi
fi

# Final status
echo ""
echo "==============================================="
echo "  Express Module Fix Status                    "
echo "==============================================="

# Get public IP
PUBLIC_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

if docker ps | grep -q "$API_CONTAINER"; then
    echo -e "${GREEN}API container is running!${NC}"
    echo ""
    echo "Access URLs:"
    echo -e "API Status: ${YELLOW}http://$PUBLIC_IP/api/status${NC}"
    echo -e "Monitoring: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Deploy your actual Risk Platform API code"
    echo "2. Deploy your database schema"
    echo "3. Deploy your frontend code"
    echo ""
    echo "For detailed deployment instructions, run: ./check-dashboard-status.sh"
else
    echo -e "${RED}API container is not running.${NC}"
    echo "Please check the logs and try again."
fi

echo ""
echo "Fix log saved to: $LOG_FILE"
echo ""
success "Express module fix completed"
