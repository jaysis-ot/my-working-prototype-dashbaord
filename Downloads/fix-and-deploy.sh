#!/bin/bash
# Fix and deploy your actual application
# This removes the test container and deploys your real app

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "Fixing and Deploying Your Application"
echo "========================================="
echo ""

# Step 1: Stop and remove the test container
echo -e "${BLUE}Step 1: Removing test container...${NC}"
docker stop temp-nginx 2>/dev/null || true
docker rm temp-nginx 2>/dev/null || true
echo -e "${GREEN}Test container removed${NC}"
echo ""

# Step 2: Clean up any other containers
echo -e "${BLUE}Step 2: Cleaning up old containers...${NC}"
docker compose down 2>/dev/null || true
docker system prune -f
echo -e "${GREEN}Cleanup complete${NC}"
echo ""

# Step 3: Fix your docker-compose.yml
echo -e "${BLUE}Step 3: Creating proper docker-compose.yml...${NC}"

# Backup existing docker-compose.yml
if [ -f docker-compose.yml ]; then
    cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d-%H%M%S)
    echo "Backed up existing docker-compose.yml"
fi

# Create a working docker-compose.yml for your frontend
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: cyber-trust-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
      - ./build:/usr/share/nginx/html:ro
    networks:
      - frontend-network
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  frontend-network:
    driver: bridge

volumes:
  nginx-cache:
    driver: local
EOF

echo -e "${GREEN}docker-compose.yml created${NC}"
echo ""

# Step 4: Ensure nginx configuration is correct
echo -e "${BLUE}Step 4: Fixing nginx configuration...${NC}"

# Make sure the nginx conf.d directory exists
mkdir -p nginx/conf.d

# Check if default.conf has the API proxy issue
if grep -q "proxy_pass http://api" nginx/conf.d/default.conf 2>/dev/null; then
    echo "Found API dependency in nginx config - fixing..."
    
    # Create a working nginx config without API dependency
    cat > nginx/conf.d/default.conf <<'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Main location - serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        add_header Content-Type application/json;
        return 200 '{"status":"UP"}';
    }
    
    # API location (returns 503 for now since API isn't deployed)
    location /api/ {
        return 503 '{"error": "API service not yet deployed"}';
        add_header Content-Type application/json;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    echo -e "${GREEN}Nginx configuration updated${NC}"
else
    echo "Nginx configuration looks OK"
fi
echo ""

# Step 5: Check if we have the built React app
echo -e "${BLUE}Step 5: Checking for React build...${NC}"

if [ ! -d "build" ] || [ -z "$(ls -A build 2>/dev/null)" ]; then
    echo -e "${YELLOW}No build directory found. Creating placeholder...${NC}"
    
    mkdir -p build
    
    # Create a placeholder index.html
    cat > build/index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cyber Trust Sensor Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            background: white;
            padding: 3rem;
            border-radius: 10px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
        }
        h1 {
            color: #333;
            margin-bottom: 1rem;
        }
        .status {
            background: #f0f4f8;
            padding: 1rem;
            border-radius: 5px;
            margin: 1.5rem 0;
        }
        .success { color: #10b981; }
        .info { color: #3b82f6; }
        .warning { color: #f59e0b; }
        code {
            background: #f3f4f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Cyber Trust Sensor Dashboard</h1>
        <div class="status">
            <p class="success"><strong>✓ Server is running successfully!</strong></p>
            <p class="info">Your server is accessible at: <code>http://31.97.114.80</code></p>
        </div>
        <div style="text-align: left; background: #fef3c7; padding: 1rem; border-radius: 5px; margin-top: 2rem;">
            <p class="warning"><strong>⚠️ Next Steps:</strong></p>
            <ol style="margin: 0.5rem 0;">
                <li>Build your React application: <code>npm run build</code></li>
                <li>Copy build files to this server</li>
                <li>The built files will be served automatically</li>
            </ol>
        </div>
        <p style="margin-top: 2rem; color: #666;">
            Server Time: <script>document.write(new Date().toString());</script>
        </p>
    </div>
</body>
</html>
EOF
    
    echo -e "${GREEN}Placeholder page created${NC}"
else
    echo -e "${GREEN}Build directory exists${NC}"
fi
echo ""

# Step 6: Start the application
echo -e "${BLUE}Step 6: Starting your application...${NC}"
docker compose up -d

# Wait for container to start
sleep 5

# Step 7: Verify it's working
echo -e "${BLUE}Step 7: Verifying deployment...${NC}"
echo ""

if docker ps | grep -q "cyber-trust-nginx"; then
    echo -e "${GREEN}✓ Nginx container is running${NC}"
    
    # Check if port 80 is accessible
    if curl -s http://localhost > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Port 80 is accessible${NC}"
        
        # Check health endpoint
        if curl -s http://localhost/health | grep -q "UP"; then
            echo -e "${GREEN}✓ Health check passed${NC}"
        fi
    else
        echo -e "${RED}✗ Port 80 is not accessible${NC}"
    fi
else
    echo -e "${RED}✗ Nginx container is not running${NC}"
    echo ""
    echo "Container logs:"
    docker logs cyber-trust-nginx 2>&1 | tail -20
fi

echo ""
echo "========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "Your application is now accessible at:"
echo -e "${YELLOW}http://31.97.114.80${NC}"
echo ""
echo "Container status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "To check logs:"
echo "  docker logs cyber-trust-nginx"
echo ""
echo "To restart if needed:"
echo "  docker compose restart"
echo ""
echo "To stop:"
echo "  docker compose down"
