#!/bin/bash
# Docker Port Binding Diagnostic Script for Ubuntu VPS
# This script will help identify why port 80 isn't binding properly

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "Docker Port Binding Diagnostic Tool"
echo "========================================="
echo ""

# 1. System Information
echo -e "${BLUE}=== System Information ===${NC}"
echo "Hostname: $(hostname)"
echo "IP Address: $(hostname -I | awk '{print $1}')"
echo "Ubuntu Version: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo ""

# 2. Docker Status
echo -e "${BLUE}=== Docker Status ===${NC}"
if command -v docker &> /dev/null; then
    echo "Docker Version: $(docker --version)"
    echo "Docker Compose Version: $(docker compose version 2>/dev/null || docker-compose --version 2>/dev/null || echo 'Not found')"
    
    if systemctl is-active --quiet docker; then
        echo -e "${GREEN}Docker service is running${NC}"
    else
        echo -e "${RED}Docker service is NOT running${NC}"
    fi
else
    echo -e "${RED}Docker is not installed${NC}"
fi
echo ""

# 3. Check what's using port 80
echo -e "${BLUE}=== Port 80 Status ===${NC}"
echo "Checking what's using port 80..."
sudo netstat -tlnp | grep :80 || echo "Port 80 is not in use"
echo ""

# Alternative check with ss
echo "Alternative check with ss command:"
sudo ss -tlnp | grep :80 || echo "Port 80 is not in use (ss)"
echo ""

# Check if any process is binding to port 80
echo "Checking for processes binding to port 80:"
sudo lsof -i :80 || echo "No process found on port 80"
echo ""

# 4. Docker containers status
echo -e "${BLUE}=== Docker Containers ===${NC}"
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "No containers running"
echo ""

echo "All containers (including stopped):"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "No containers found"
echo ""

# 5. Docker networks
echo -e "${BLUE}=== Docker Networks ===${NC}"
docker network ls || echo "Cannot list Docker networks"
echo ""

# 6. Firewall status
echo -e "${BLUE}=== Firewall Status ===${NC}"
echo "UFW Status:"
sudo ufw status | head -20 || echo "UFW not installed or configured"
echo ""

echo "IPTables rules for port 80:"
sudo iptables -L -n | grep -E "80|http" || echo "No iptables rules for port 80"
echo ""

# 7. Check Docker daemon configuration
echo -e "${BLUE}=== Docker Daemon Configuration ===${NC}"
if [ -f /etc/docker/daemon.json ]; then
    echo "Docker daemon.json:"
    cat /etc/docker/daemon.json
else
    echo "No custom Docker daemon configuration found"
fi
echo ""

# 8. Check current directory and docker-compose files
echo -e "${BLUE}=== Docker Compose Files ===${NC}"
echo "Current directory: $(pwd)"
echo ""

echo "Docker Compose files in current directory:"
ls -la docker-compose*.yml 2>/dev/null || echo "No docker-compose files in current directory"
echo ""

# 9. Check for conflicting services
echo -e "${BLUE}=== Potentially Conflicting Services ===${NC}"
for service in apache2 nginx httpd lighttpd; do
    if systemctl list-units --full -all | grep -Fq "$service.service"; then
        echo "Service $service status:"
        systemctl status $service --no-pager | head -5
    fi
done
echo ""

# 10. Docker logs for nginx container (if exists)
echo -e "${BLUE}=== Recent Docker Logs ===${NC}"
if docker ps -a | grep -q nginx; then
    echo "Last 20 lines of nginx container logs:"
    docker logs $(docker ps -aq -f name=nginx) 2>&1 | tail -20
fi
echo ""

# 11. Check specific to your setup
echo -e "${BLUE}=== Risk Platform Specific Checks ===${NC}"
PLATFORM_DIR="/opt/risk-platform"
if [ -d "$PLATFORM_DIR" ]; then
    echo "Risk Platform directory exists at $PLATFORM_DIR"
    echo "Contents:"
    ls -la "$PLATFORM_DIR" | head -10
    
    if [ -f "$PLATFORM_DIR/docker-compose.yml" ]; then
        echo ""
        echo "Checking port mappings in docker-compose.yml:"
        grep -A2 -B2 "ports:" "$PLATFORM_DIR/docker-compose.yml" | head -20
    fi
else
    echo "Risk Platform directory not found at $PLATFORM_DIR"
fi
echo ""

# 12. Network interface check
echo -e "${BLUE}=== Network Interfaces ===${NC}"
ip addr show | grep -E "inet |^[0-9]:" 
echo ""

# 13. SELinux status (if applicable)
echo -e "${BLUE}=== SELinux Status ===${NC}"
if command -v getenforce &> /dev/null; then
    echo "SELinux status: $(getenforce)"
else
    echo "SELinux not installed"
fi
echo ""

# Summary and recommendations
echo -e "${BLUE}=== Diagnostic Summary ===${NC}"
echo "Diagnostic complete. Please review the output above and look for:"
echo "1. Any process already using port 80"
echo "2. Docker service status"
echo "3. Firewall rules blocking port 80"
echo "4. Container status and port mappings"
echo "5. Any error messages in logs"
echo ""
echo "Common fixes:"
echo "- If Apache/Nginx is running on host: sudo systemctl stop apache2 (or nginx)"
echo "- If firewall blocking: sudo ufw allow 80/tcp"
echo "- If container has wrong port mapping: docker-compose down && docker-compose up -d"
echo "- If permission issue: Check Docker daemon and user permissions"
