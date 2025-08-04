#!/bin/bash
# fix-nginx-proxy.sh
# Script to fix Nginx proxy configuration for the API container
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
NGINX_CONF_DIR="/etc/nginx"
API_CONTAINER="risk-platform-api"
API_PORT=3001
NGINX_CONTAINER="risk-platform-nginx"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  Nginx Proxy Configuration Fix               ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Step 1: Check if API container is running
echo -e "${YELLOW}Step 1: Checking API container status${NC}"
if docker ps | grep -q "$API_CONTAINER"; then
    echo -e "${GREEN}API container is running${NC}"
    
    # Get API container IP address
    API_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$API_CONTAINER")
    echo -e "API container IP: ${GREEN}$API_IP${NC}"
    
    # Test direct connection to API
    echo -e "${YELLOW}Testing direct connection to API container...${NC}"
    if curl -s "http://$API_IP:$API_PORT/health" > /dev/null 2>&1; then
        API_RESPONSE=$(curl -s "http://$API_IP:$API_PORT/health")
        echo -e "${GREEN}Direct API connection successful!${NC}"
        echo -e "API Response: $API_RESPONSE"
    else
        echo -e "${RED}Cannot connect directly to API container. Checking logs...${NC}"
        docker logs "$API_CONTAINER" | tail -n 20
        echo -e "${YELLOW}Attempting to fix API container issues...${NC}"
        
        # Check if Express module is installed
        if docker exec "$API_CONTAINER" ls -la /app/node_modules | grep -q "express"; then
            echo -e "${GREEN}Express module is installed${NC}"
        else
            echo -e "${RED}Express module is not installed. Reinstalling...${NC}"
            docker exec "$API_CONTAINER" npm install express --save
        fi
        
        # Restart API container
        docker restart "$API_CONTAINER"
        sleep 5
        
        # Test direct connection again
        if curl -s "http://$API_IP:$API_PORT/health" > /dev/null 2>&1; then
            API_RESPONSE=$(curl -s "http://$API_IP:$API_PORT/health")
            echo -e "${GREEN}Direct API connection successful after restart!${NC}"
            echo -e "API Response: $API_RESPONSE"
        else
            echo -e "${RED}Still cannot connect directly to API container.${NC}"
            echo -e "${RED}Please check API container logs and fix any issues before continuing.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${RED}API container is not running. Please start it first.${NC}"
    exit 1
fi

# Step 2: Update Nginx configuration
echo -e "${YELLOW}Step 2: Updating Nginx configuration${NC}"

# Check if we're using Docker Compose for Nginx
if docker ps | grep -q "$NGINX_CONTAINER"; then
    echo -e "${GREEN}Found Nginx running in Docker container${NC}"
    
    # Create new Nginx configuration
    echo -e "${YELLOW}Creating updated Nginx configuration...${NC}"
    
    # Create a temporary configuration file
    cat > /tmp/api_proxy.conf << EOF
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
EOF
    
    # Copy the configuration to the Nginx container
    docker cp /tmp/api_proxy.conf "$NGINX_CONTAINER":/etc/nginx/conf.d/api_proxy.conf
    
    # Verify Nginx configuration
    echo -e "${YELLOW}Verifying Nginx configuration...${NC}"
    if docker exec "$NGINX_CONTAINER" nginx -t; then
        echo -e "${GREEN}Nginx configuration is valid${NC}"
    else
        echo -e "${RED}Nginx configuration is invalid. Rolling back...${NC}"
        docker exec "$NGINX_CONTAINER" rm /etc/nginx/conf.d/api_proxy.conf
        echo -e "${RED}Configuration rolled back. Please check the Nginx configuration manually.${NC}"
        exit 1
    fi
    
    # Restart Nginx container
    echo -e "${YELLOW}Restarting Nginx container...${NC}"
    docker restart "$NGINX_CONTAINER"
    echo -e "${GREEN}Nginx container restarted${NC}"
else
    echo -e "${YELLOW}Using host Nginx installation${NC}"
    
    # Create new Nginx configuration
    echo -e "${YELLOW}Creating updated Nginx configuration...${NC}"
    
    # Create a temporary configuration file
    cat > /tmp/api_proxy.conf << EOF
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
EOF
    
    # Copy the configuration to the Nginx sites
    cp /tmp/api_proxy.conf "$NGINX_CONF_DIR/conf.d/api_proxy.conf"
    
    # Verify Nginx configuration
    echo -e "${YELLOW}Verifying Nginx configuration...${NC}"
    if nginx -t; then
        echo -e "${GREEN}Nginx configuration is valid${NC}"
    else
        echo -e "${RED}Nginx configuration is invalid. Rolling back...${NC}"
        rm "$NGINX_CONF_DIR/conf.d/api_proxy.conf"
        echo -e "${RED}Configuration rolled back. Please check the Nginx configuration manually.${NC}"
        exit 1
    fi
    
    # Restart Nginx
    echo -e "${YELLOW}Restarting Nginx...${NC}"
    systemctl restart nginx
    echo -e "${GREEN}Nginx restarted${NC}"
fi

# Step 3: Test the proxy connection
echo -e "${YELLOW}Step 3: Testing proxy connection${NC}"
sleep 5  # Wait for Nginx to restart completely

# Get public IP
PUBLIC_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

# Test API endpoint through Nginx
echo -e "${YELLOW}Testing API endpoint through Nginx...${NC}"
if curl -s "http://localhost/api/health" > /dev/null 2>&1; then
    API_RESPONSE=$(curl -s "http://localhost/api/health")
    echo -e "${GREEN}API proxy connection successful!${NC}"
    echo -e "API Response: $API_RESPONSE"
else
    echo -e "${RED}Cannot connect to API through Nginx proxy.${NC}"
    
    # Check Nginx logs
    echo -e "${YELLOW}Checking Nginx logs...${NC}"
    if docker ps | grep -q "$NGINX_CONTAINER"; then
        docker logs "$NGINX_CONTAINER" | tail -n 20
    else
        tail -n 20 /var/log/nginx/error.log
    fi
    
    # Try alternative proxy configuration
    echo -e "${YELLOW}Trying alternative proxy configuration...${NC}"
    
    # Create alternative configuration
    if docker ps | grep -q "$NGINX_CONTAINER"; then
        # For Docker Nginx
        cat > /tmp/api_proxy_alt.conf << EOF
# Alternative API Proxy Configuration
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
EOF
        docker cp /tmp/api_proxy_alt.conf "$NGINX_CONTAINER":/etc/nginx/conf.d/api_proxy.conf
        docker restart "$NGINX_CONTAINER"
    else
        # For host Nginx
        cat > "$NGINX_CONF_DIR/conf.d/api_proxy.conf" << EOF
# Alternative API Proxy Configuration
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
EOF
        systemctl restart nginx
    fi
    
    sleep 5
    
    # Test again
    if curl -s "http://localhost/api/health" > /dev/null 2>&1; then
        API_RESPONSE=$(curl -s "http://localhost/api/health")
        echo -e "${GREEN}API proxy connection successful with alternative configuration!${NC}"
        echo -e "API Response: $API_RESPONSE"
    else
        echo -e "${RED}Still cannot connect to API through Nginx proxy.${NC}"
        echo -e "${RED}Please check Nginx and API container configurations manually.${NC}"
        exit 1
    fi
fi

# Final status
echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  Nginx Proxy Configuration Status            ${NC}"
echo -e "${BLUE}===============================================${NC}"

if curl -s "http://localhost/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}Nginx proxy configuration fixed successfully!${NC}"
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
    echo ""
    echo "For detailed deployment instructions, run: ./check-dashboard-status.sh"
else
    echo -e "${RED}Nginx proxy configuration fix failed.${NC}"
    echo "Please check the logs and try again."
fi

echo ""
echo -e "${GREEN}Nginx proxy configuration fix completed${NC}"
