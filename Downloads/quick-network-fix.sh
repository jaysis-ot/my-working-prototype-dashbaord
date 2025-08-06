#!/bin/bash
# quick-network-fix.sh
# Simple script to fix Docker network conflict and complete deployment
# Version: 1.0.0
# Date: 2025-08-04

# Set error handling
set -e
trap 'echo "Error on line $LINENO. Fix failed."; exit 1' ERR

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DOCKER_COMPOSE_DIR="/opt/risk-platform/docker"
DOCKER_NETWORK="risk-platform-network"
PUBLIC_IP=$(hostname -I | awk '{print $1}')

# Container names
NGINX_CONTAINER="risk-platform-nginx"
POSTGRES_CONTAINER="risk-platform-postgres"
GRAFANA_CONTAINER="risk-platform-grafana"
PROMETHEUS_CONTAINER="risk-platform-prometheus"
ALERTMANAGER_CONTAINER="risk-platform-alertmanager"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  QUICK NETWORK FIX FOR RISK PLATFORM         ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Step 1: Fix Docker network
echo -e "${BLUE}[$(date +"%H:%M:%S")]${NC} Stopping any existing containers..."
docker rm -f "$NGINX_CONTAINER" "$POSTGRES_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER" 2>/dev/null || true

echo -e "${BLUE}[$(date +"%H:%M:%S")]${NC} Removing existing Docker network..."
docker network rm "$DOCKER_NETWORK" 2>/dev/null || true
echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Network cleanup completed"

# Step 2: Deploy containers with Docker Compose
echo -e "${BLUE}[$(date +"%H:%M:%S")]${NC} Starting containers with Docker Compose..."
cd "$DOCKER_COMPOSE_DIR"
docker compose down -v 2>/dev/null || true
docker compose up -d

# Step 3: Wait for containers to start
echo -e "${BLUE}[$(date +"%H:%M:%S")]${NC} Waiting for containers to start..."
sleep 10

# Step 4: Check container status
echo -e "${BLUE}[$(date +"%H:%M:%S")]${NC} Checking container status..."
CONTAINERS_RUNNING=true

for container in "$POSTGRES_CONTAINER" "$NGINX_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
    if ! docker ps | grep -q "$container"; then
        echo -e "${YELLOW}[$(date +"%H:%M:%S")]${NC} Container $container is not running"
        CONTAINERS_RUNNING=false
    else
        echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Container $container is running"
    fi
done

if [ "$CONTAINERS_RUNNING" = false ]; then
    echo -e "${YELLOW}[$(date +"%H:%M:%S")]${NC} Not all containers are running. Showing logs:"
    for container in "$POSTGRES_CONTAINER" "$NGINX_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
        if ! docker ps | grep -q "$container"; then
            echo -e "${YELLOW}[$(date +"%H:%M:%S")]${NC} Logs for $container:"
            docker logs "$container" 2>/dev/null || echo "No logs available"
            echo ""
        fi
    done
fi

# Step 5: Test dashboard access
echo -e "${BLUE}[$(date +"%H:%M:%S")]${NC} Testing dashboard access..."
if curl -s "http://localhost" | grep -q "Risk Platform Dashboard"; then
    echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Dashboard is accessible via HTTP"
else
    echo -e "${YELLOW}[$(date +"%H:%M:%S")]${NC} Dashboard is not accessible via HTTP"
fi

if curl -s "http://localhost/monitoring" | grep -q "Grafana"; then
    echo -e "${GREEN}[$(date +"%H:%M:%S")]${NC} Monitoring is accessible via HTTP"
else
    echo -e "${YELLOW}[$(date +"%H:%M:%S")]${NC} Monitoring is not accessible via HTTP"
fi

# Final status
echo ""
echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}  DEPLOYMENT STATUS                           ${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""
echo "Access URLs:"
echo -e "Dashboard: ${YELLOW}http://$PUBLIC_IP/${NC}"
echo -e "Monitoring: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
echo ""
echo "Login Credentials:"
echo -e "Email: ${YELLOW}admin@risk-platform.local${NC}"
echo -e "Password: ${YELLOW}admin123${NC}"
echo ""

if [ "$CONTAINERS_RUNNING" = true ]; then
    echo -e "${GREEN}Network fix completed successfully!${NC}"
else
    echo -e "${YELLOW}Network fix completed with some containers not running.${NC}"
    echo -e "${YELLOW}Check the logs above for more information.${NC}"
fi
