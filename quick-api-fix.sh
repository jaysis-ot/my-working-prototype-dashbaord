#!/bin/bash
# quick-api-fix.sh
# Simple script to fix API container restart issues
# Version: 1.0.0
# Date: 2025-08-04

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "==============================================="
echo "  Quick API Container Fix Tool                 "
echo "==============================================="

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo -e "${RED}This script must be run as root!${NC}"
    exit 1
fi

# Configuration
PLATFORM_DIR="/opt/risk-platform"
API_DIR="${PLATFORM_DIR}/api"
API_CONTAINER="risk-platform-api"

# Step 1: Navigate to platform directory
echo -e "${BLUE}[1/5] Navigating to platform directory${NC}"
cd "$PLATFORM_DIR" || { echo -e "${RED}Platform directory not found!${NC}"; exit 1; }

# Step 2: Check API logs
echo -e "${BLUE}[2/5] Checking API container logs${NC}"
mkdir -p /tmp/api-fix
docker logs "$API_CONTAINER" > /tmp/api-fix/api_logs.txt 2>&1
echo "Last 10 lines of API logs:"
tail -n 10 /tmp/api-fix/api_logs.txt

# Step 3: Stop API container
echo -e "${BLUE}[3/5] Stopping API container${NC}"
docker-compose stop api
echo -e "${GREEN}API container stopped${NC}"

# Step 4: Create minimal working API
echo -e "${BLUE}[4/5] Creating minimal working API${NC}"

# Backup existing files
if [ -d "$API_DIR" ]; then
    echo "Backing up existing API files"
    mkdir -p "$PLATFORM_DIR/backups"
    cp -r "$API_DIR" "$PLATFORM_DIR/backups/api-backup-$(date +%Y%m%d-%H%M%S)"
fi

# Create API directory if it doesn't exist
mkdir -p "$API_DIR"

# Create package.json
echo "Creating package.json"
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
    "express": "^4.18.2"
  }
}
EOF

# Create server.js
echo "Creating server.js"
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
  console.log(`Test API server running on port ${port}`);
});
EOF

# Create Dockerfile
echo "Creating Dockerfile"
cat > "$API_DIR/Dockerfile" << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
EOF

# Set proper permissions
echo "Setting permissions"
chown -R 1000:1000 "$API_DIR"
chmod -R 755 "$API_DIR"

# Step 5: Rebuild and restart API
echo -e "${BLUE}[5/5] Rebuilding and restarting API container${NC}"
docker-compose build api
docker-compose up -d api

# Wait for container to start
echo "Waiting for API container to start..."
sleep 10

# Check if container is running
if docker ps | grep -q "$API_CONTAINER"; then
    echo -e "${GREEN}API container is now running!${NC}"
else
    echo -e "${RED}API container failed to start. Checking logs:${NC}"
    docker logs "$API_CONTAINER" | tail -n 20
fi

# Update Nginx configuration
echo "Updating Nginx configuration"
mkdir -p "$PLATFORM_DIR/config/nginx/conf.d"
cat > "$PLATFORM_DIR/config/nginx/conf.d/default.conf" << 'EOF'
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
    
    # Monitoring dashboard
    location /monitoring/ {
        proxy_pass http://grafana:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Restart Nginx
echo "Restarting Nginx"
docker-compose restart nginx

# Test API endpoint
echo "Testing API endpoint"
sleep 5
if curl -s "http://localhost/api/status" > /dev/null 2>&1; then
    echo -e "${GREEN}API endpoint is accessible!${NC}"
    echo "Response: $(curl -s http://localhost/api/status)"
else
    echo -e "${YELLOW}API endpoint is not accessible through Nginx, trying direct access...${NC}"
    API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$API_CONTAINER")
    if [ -n "$API_IP" ] && curl -s "http://$API_IP:3001/status" > /dev/null 2>&1; then
        echo -e "${GREEN}Direct API access works!${NC}"
        echo "Response: $(curl -s http://$API_IP:3001/status)"
        echo -e "${YELLOW}Nginx proxy needs fixing. Restarting all containers...${NC}"
        docker-compose down
        docker-compose up -d
    else
        echo -e "${RED}API is not accessible directly either. Container logs:${NC}"
        docker logs "$API_CONTAINER" | tail -n 20
    fi
fi

# Final status
echo ""
echo "==============================================="
echo "  API Fix Status                               "
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
echo "Fix completed!"
