#!/bin/bash
# simple-api-fix.sh
# Simple script to fix the API container Express module issue
# Version: 1.0.0
# Date: 2025-08-04

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_DIR="/opt/risk-platform"
API_DIR="${PLATFORM_DIR}/api"
API_CONTAINER="risk-platform-api"
NGINX_CONTAINER="risk-platform-nginx"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  SIMPLE API CONTAINER FIX                    ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Step 1: Stop and remove API container
echo -e "${YELLOW}Step 1: Stopping and removing API container${NC}"
cd "$PLATFORM_DIR" || { echo -e "${RED}Cannot change to platform directory${NC}"; exit 1; }

# Stop the API container
docker-compose stop api || echo -e "${YELLOW}API container was not running${NC}"

# Remove the API container
docker-compose rm -f api || echo -e "${YELLOW}API container could not be removed${NC}"

# Remove API image
echo -e "${YELLOW}Removing API image${NC}"
docker rmi $(docker images | grep risk-platform-api | awk '{print $3}') --force 2>/dev/null || true
echo -e "${GREEN}API container and image removed${NC}"

# Step 2: Create clean API directory
echo -e "${YELLOW}Step 2: Creating clean API directory${NC}"

# Backup existing API directory if it exists
if [ -d "$API_DIR" ]; then
    echo -e "${YELLOW}Backing up existing API directory${NC}"
    mkdir -p "${PLATFORM_DIR}/backups"
    cp -r "$API_DIR" "${PLATFORM_DIR}/backups/api-$(date +%Y%m%d-%H%M%S)" || true
    
    # Remove existing API directory
    rm -rf "$API_DIR" || { echo -e "${RED}Could not remove existing API directory${NC}"; exit 1; }
fi

# Create fresh API directory
mkdir -p "$API_DIR" || { echo -e "${RED}Could not create API directory${NC}"; exit 1; }

# Create package.json
echo -e "${YELLOW}Creating package.json${NC}"
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
    "express": "4.18.2",
    "cors": "2.8.5",
    "body-parser": "1.20.2"
  }
}
EOF

# Create server.js
echo -e "${YELLOW}Creating server.js${NC}"
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
    timestamp: new Date().toISOString()
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Risk Platform API running on port ${port}`);
});
EOF

# Create Dockerfile
echo -e "${YELLOW}Creating Dockerfile${NC}"
cat > "$API_DIR/Dockerfile" << 'EOF'
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json .

# Install dependencies with standard npm install
RUN npm cache clean --force && \
    npm install

# Verify express module is installed
RUN ls -la node_modules | grep express

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
EOF

# Set proper permissions
echo -e "${YELLOW}Setting proper permissions${NC}"
chmod -R 755 "$API_DIR"
echo -e "${GREEN}Clean API directory created${NC}"

# Step 3: Build the API container
echo -e "${YELLOW}Step 3: Building API container without cache${NC}"
docker-compose build --no-cache api || { echo -e "${RED}Failed to build API container${NC}"; exit 1; }
echo -e "${GREEN}API container built successfully${NC}"

# Step 4: Start the API container
echo -e "${YELLOW}Step 4: Starting API container${NC}"
docker-compose up -d api || { echo -e "${RED}Failed to start API container${NC}"; exit 1; }
echo -e "${GREEN}API container started${NC}"

# Step 5: Wait for container to initialize
echo -e "${YELLOW}Step 5: Waiting for container to initialize...${NC}"
sleep 10

# Step 6: Get API container IP
echo -e "${YELLOW}Step 6: Getting API container IP${NC}"
API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$API_CONTAINER")
echo -e "API container IP: ${GREEN}$API_IP${NC}"

# Step 7: Test API container directly
echo -e "${YELLOW}Step 7: Testing API container directly${NC}"
MAX_RETRIES=5
RETRY_COUNT=0
API_WORKING=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s "http://$API_IP:3001/health" > /dev/null 2>&1; then
        API_RESPONSE=$(curl -s "http://$API_IP:3001/health")
        echo -e "${GREEN}API container is working!${NC}"
        echo -e "API Response: $API_RESPONSE"
        API_WORKING=true
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -e "${YELLOW}API not responding, retrying ($RETRY_COUNT/$MAX_RETRIES)...${NC}"
        sleep 5
    fi
done

if [ "$API_WORKING" = false ]; then
    echo -e "${RED}API container is not responding. Checking logs...${NC}"
    docker logs "$API_CONTAINER"
    exit 1
fi

# Step 8: Configure Nginx proxy
echo -e "${YELLOW}Step 8: Configuring Nginx proxy${NC}"

# Create Nginx configuration
echo -e "${YELLOW}Creating Nginx configuration for API proxy${NC}"
NGINX_CONF="
# API Proxy Configuration
location /api/ {
    proxy_pass http://$API_IP:3001/;
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

# Check if Nginx is running in Docker or on the host
if docker ps | grep -q "$NGINX_CONTAINER"; then
    echo -e "${YELLOW}Nginx is running in Docker container${NC}"
    
    # Create temporary file
    echo "$NGINX_CONF" > /tmp/api_proxy.conf
    
    # Copy to Nginx container
    docker cp /tmp/api_proxy.conf "$NGINX_CONTAINER":/etc/nginx/conf.d/api_proxy.conf
    
    # Restart Nginx container
    echo -e "${YELLOW}Restarting Nginx container${NC}"
    docker restart "$NGINX_CONTAINER"
else
    echo -e "${YELLOW}Nginx is running on the host${NC}"
    
    # Create configuration file
    echo "$NGINX_CONF" > /etc/nginx/conf.d/api_proxy.conf
    
    # Restart Nginx
    echo -e "${YELLOW}Restarting Nginx${NC}"
    systemctl restart nginx
fi

echo -e "${GREEN}Nginx proxy configured${NC}"

# Step 9: Test the API through Nginx
echo -e "${YELLOW}Step 9: Testing API through Nginx${NC}"
sleep 5  # Wait for Nginx to restart completely

# Test API endpoint through Nginx
if curl -s "http://localhost/api/health" > /dev/null 2>&1; then
    API_RESPONSE=$(curl -s "http://localhost/api/health")
    echo -e "${GREEN}API is accessible through Nginx!${NC}"
    echo -e "API Response: $API_RESPONSE"
else
    echo -e "${YELLOW}API not accessible through Nginx, trying alternative configuration...${NC}"
    
    # Try alternative configuration with container name instead of IP
    NGINX_ALT_CONF="
    # API Proxy Configuration (Alternative)
    location /api/ {
        proxy_pass http://$API_CONTAINER:3001/;
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
    
    if docker ps | grep -q "$NGINX_CONTAINER"; then
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
        echo -e "${GREEN}API is now accessible through Nginx with alternative configuration!${NC}"
        echo -e "API Response: $API_RESPONSE"
    else
        echo -e "${RED}API still not accessible through Nginx. Please check Nginx configuration manually.${NC}"
    fi
fi

# Final status
echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  API CONTAINER STATUS                        ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Get public IP
PUBLIC_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

if docker ps | grep -q "$API_CONTAINER"; then
    echo -e "${GREEN}API container is running!${NC}"
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
else
    echo -e "${RED}API container is not running.${NC}"
    echo "Please check the logs and try again."
fi

echo ""
echo -e "${GREEN}API container fix completed${NC}"
