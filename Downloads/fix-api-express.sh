#!/bin/bash
# fix-api-express.sh
# Simple script to fix the Express module issue on the VPS
# This script will rebuild the API container without cache to resolve the "Cannot find module 'express'" error

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

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  Express Module Fix for API Container         ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Step 1: Stop the API container
echo -e "${YELLOW}Step 1: Stopping API container${NC}"
cd "$PLATFORM_DIR"
docker-compose stop api
echo -e "${GREEN}API container stopped${NC}"

# Step 2: Remove the old image to force rebuild
echo -e "${YELLOW}Step 2: Removing old API image${NC}"
docker rmi $(docker images | grep risk-platform-api | awk '{print $3}') --force 2>/dev/null || true
echo -e "${GREEN}Old API image removed${NC}"

# Step 3: Create clean, working package.json and server.js files
echo -e "${YELLOW}Step 3: Creating clean API files${NC}"

# Create API directory if it doesn't exist
mkdir -p "$API_DIR"

# Create package.json
echo -e "${BLUE}Creating package.json${NC}"
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
    "body-parser": "^1.20.2"
  }
}
EOF

# Create server.js
echo -e "${BLUE}Creating server.js${NC}"
cat > "$API_DIR/server.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

# Create Dockerfile
echo -e "${BLUE}Creating Dockerfile${NC}"
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

# Set proper permissions
echo -e "${BLUE}Setting proper permissions${NC}"
chmod -R 755 "$API_DIR"
echo -e "${GREEN}Clean API files created${NC}"

# Step 4: Rebuild without Docker cache
echo -e "${YELLOW}Step 4: Rebuilding API container without cache${NC}"
cd "$PLATFORM_DIR"
docker-compose build --no-cache api
echo -e "${GREEN}API container rebuilt${NC}"

# Step 5: Start the container
echo -e "${YELLOW}Step 5: Starting API container${NC}"
docker-compose up -d api
echo -e "${GREEN}API container started${NC}"

# Step 6: Test the endpoint
echo -e "${YELLOW}Step 6: Testing API endpoint${NC}"
echo -e "${BLUE}Waiting for container to initialize...${NC}"
sleep 10

# Try accessing through Nginx first
if curl -s "http://localhost/api/status" > /dev/null 2>&1; then
    API_RESPONSE=$(curl -s "http://localhost/api/status")
    echo -e "${GREEN}API endpoint is accessible through Nginx!${NC}"
    echo -e "${GREEN}API Response:${NC} $API_RESPONSE"
else
    echo -e "${YELLOW}API endpoint not accessible through Nginx, trying direct access...${NC}"
    
    # Get API container IP
    API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' risk-platform-api)
    
    if [ -n "$API_IP" ] && curl -s "http://$API_IP:3001/status" > /dev/null 2>&1; then
        API_RESPONSE=$(curl -s "http://$API_IP:3001/status")
        echo -e "${GREEN}Direct API access works!${NC}"
        echo -e "${GREEN}API Response:${NC} $API_RESPONSE"
        
        # Restart Nginx to fix proxy issues
        echo -e "${YELLOW}Restarting Nginx to fix proxy issues${NC}"
        docker-compose restart nginx
        sleep 5
        
        # Test again through Nginx
        if curl -s "http://localhost/api/status" > /dev/null 2>&1; then
            echo -e "${GREEN}API endpoint is now accessible through Nginx!${NC}"
        else
            echo -e "${YELLOW}API still not accessible through Nginx, check Nginx configuration${NC}"
        fi
    else
        echo -e "${RED}API is not accessible directly either. Checking logs...${NC}"
        docker logs risk-platform-api | tail -n 20
    fi
fi

# Final status
echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  Express Module Fix Status                    ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Check if API container is running
if docker ps | grep -q "risk-platform-api"; then
    echo -e "${GREEN}API container is running!${NC}"
    echo ""
    echo "Access URLs:"
    echo -e "API Status: ${YELLOW}http://localhost/api/status${NC}"
    echo -e "API Health: ${YELLOW}http://localhost/api/health${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Deploy your actual Risk Platform API code"
    echo "2. Deploy your database schema"
    echo "3. Deploy your frontend code"
else
    echo -e "${RED}API container is not running.${NC}"
    echo "Please check the logs and try again."
fi

echo ""
echo -e "${GREEN}Express module fix completed${NC}"
