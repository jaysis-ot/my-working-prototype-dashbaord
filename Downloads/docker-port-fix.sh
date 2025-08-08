#!/bin/bash
# Docker Port 80 Fix Script
# This script attempts to fix common port binding issues

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "Docker Port 80 Fix Script"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Function to stop conflicting services
stop_conflicting_services() {
    echo -e "${BLUE}Stopping potentially conflicting services...${NC}"
    
    for service in apache2 nginx httpd lighttpd; do
        if systemctl is-active --quiet $service; then
            echo "Stopping $service..."
            systemctl stop $service
            systemctl disable $service
            echo -e "${GREEN}$service stopped and disabled${NC}"
        fi
    done
}

# Function to clean up Docker
cleanup_docker() {
    echo -e "${BLUE}Cleaning up Docker containers and networks...${NC}"
    
    # Stop all containers
    docker stop $(docker ps -aq) 2>/dev/null || true
    
    # Remove all containers
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    # Prune system
    docker system prune -f
    
    echo -e "${GREEN}Docker cleanup complete${NC}"
}

# Function to fix firewall
fix_firewall() {
    echo -e "${BLUE}Configuring firewall...${NC}"
    
    # Enable UFW if not enabled
    ufw --force enable
    
    # Allow necessary ports
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    ufw allow 3000/tcp comment 'Grafana'
    ufw allow 9090/tcp comment 'Prometheus'
    
    # Reload UFW
    ufw reload
    
    echo -e "${GREEN}Firewall configured${NC}"
}

# Function to create minimal working setup
create_minimal_setup() {
    echo -e "${BLUE}Creating minimal working Docker setup...${NC}"
    
    # Create directory
    mkdir -p /opt/test-docker
    cd /opt/test-docker
    
    # Create simple docker-compose.yml
    cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  web:
    image: nginx:alpine
    container_name: test-nginx
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    restart: unless-stopped
EOF

    # Create simple HTML file
    mkdir -p html
    cat > html/index.html <<'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Docker Port Test</title>
</head>
<body>
    <h1>Docker Port 80 is Working!</h1>
    <p>If you can see this, port 80 is successfully bound to the Docker container.</p>
    <p>Server time: <script>document.write(new Date());</script></p>
</body>
</html>
EOF

    echo -e "${GREEN}Minimal setup created${NC}"
}

# Function to test the setup
test_setup() {
    echo -e "${BLUE}Testing Docker port binding...${NC}"
    
    cd /opt/test-docker
    
    # Start the container
    docker compose down 2>/dev/null || true
    docker compose up -d
    
    # Wait for container to start
    sleep 5
    
    # Test if port 80 is accessible
    if curl -s http://localhost > /dev/null; then
        echo -e "${GREEN}SUCCESS! Port 80 is working with Docker${NC}"
        echo "You can test from browser: http://$(hostname -I | awk '{print $1}')"
        return 0
    else
        echo -e "${RED}FAILED! Port 80 is still not accessible${NC}"
        return 1
    fi
}

# Main execution
echo "Step 1: Stopping conflicting services"
stop_conflicting_services
echo ""

echo "Step 2: Cleaning up Docker"
cleanup_docker
echo ""

echo "Step 3: Fixing firewall"
fix_firewall
echo ""

echo "Step 4: Creating minimal test setup"
create_minimal_setup
echo ""

echo "Step 5: Testing the setup"
if test_setup; then
    echo ""
    echo -e "${GREEN}=== Success! ===${NC}"
    echo "Docker is now properly binding to port 80."
    echo ""
    echo "Next steps:"
    echo "1. Test in your browser: http://$(hostname -I | awk '{print $1}')"
    echo "2. If working, you can now deploy your actual application"
    echo "3. Navigate to your project directory and run: docker compose up -d"
    echo ""
    echo "If you need to deploy the Risk Platform:"
    echo "  cd /opt/risk-platform"
    echo "  docker compose down"
    echo "  docker compose up -d"
else
    echo ""
    echo -e "${RED}=== Failed ===${NC}"
    echo "Port 80 is still not working. Check the diagnostic output above."
    echo ""
    echo "Additional debugging steps:"
    echo "1. Check Docker logs: docker logs test-nginx"
    echo "2. Check system logs: journalctl -xe"
    echo "3. Check if Docker daemon is running: systemctl status docker"
    echo "4. Try binding to a different port first (e.g., 8080)"
fi
