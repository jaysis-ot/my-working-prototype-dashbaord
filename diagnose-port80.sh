#!/bin/bash
#
# diagnose-port80.sh - Comprehensive Port 80 Binding Diagnostic Tool
# 
# This script performs a thorough diagnosis of why port 80 might not be binding
# in a Docker environment running nginx. It checks container status, port bindings,
# network configuration, nginx config validation, logs, firewalls, conflicting
# services, and more.
#
# Usage: bash diagnose-port80.sh
#

# Text formatting
BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${BOLD}${BLUE}==== $1 ====${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print info messages
print_info() {
    echo -e "ℹ $1"
}

# Check if script is run as root
if [ "$(id -u)" -ne 0 ]; then
    print_warning "This script should be run as root for complete diagnostics."
    print_warning "Some checks may fail or provide incomplete information."
    print_warning "Consider running with: sudo bash $(basename "$0")"
    echo ""
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_header "SYSTEM INFORMATION"
echo "Hostname: $(hostname)"
echo "Kernel: $(uname -r)"
echo "OS: $(grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d \")"
echo "Date: $(date)"
echo "Uptime: $(uptime -p)"

# 1. Check Docker status
print_header "1. DOCKER STATUS"
if command -v docker &> /dev/null; then
    print_success "Docker is installed"
    
    if systemctl is-active --quiet docker; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
        print_info "Try: sudo systemctl start docker"
    fi
    
    echo -e "\nDocker version:"
    docker version --format '{{.Server.Version}}' || echo "Failed to get Docker version"
    
    echo -e "\nDocker info:"
    docker info --format '{{.ServerVersion}} | {{.OperatingSystem}} | Containers: {{.Containers}}' || echo "Failed to get Docker info"
else
    print_error "Docker is not installed"
    exit 1
fi

# 2. Check Docker Compose
print_header "2. DOCKER COMPOSE STATUS"
if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose is installed (standalone)"
    echo "Version: $(docker-compose version --short)"
elif docker compose version &> /dev/null; then
    print_success "Docker Compose plugin is installed"
    echo "Version: $(docker compose version --short)"
else
    print_error "Docker Compose is not installed"
fi

# 3. Check running containers
print_header "3. RUNNING CONTAINERS"
echo "All running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "Failed to list containers"

echo -e "\nNginx containers specifically:"
docker ps --filter "name=nginx" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "No nginx containers found"

# 4. Check port bindings
print_header "4. PORT BINDINGS"
echo "Checking what's using port 80..."

if command -v netstat &> /dev/null; then
    NETSTAT_OUTPUT=$(netstat -tulpn 2>/dev/null | grep ":80 ")
    if [ -n "$NETSTAT_OUTPUT" ]; then
        print_info "Found processes using port 80:"
        echo "$NETSTAT_OUTPUT"
        
        # Extract PID and get process name
        PIDS=$(echo "$NETSTAT_OUTPUT" | grep -oP '(?<=LISTEN\s)\d+(?=/|$)' | sort -u)
        if [ -n "$PIDS" ]; then
            for PID in $PIDS; do
                if [ -e "/proc/$PID" ]; then
                    PROCESS_NAME=$(ps -p "$PID" -o comm=)
                    print_warning "Process using port 80: $PROCESS_NAME (PID: $PID)"
                fi
            done
        fi
    else
        print_success "No processes found using port 80"
    fi
else
    if command -v ss &> /dev/null; then
        SS_OUTPUT=$(ss -tulpn 2>/dev/null | grep ":80 ")
        if [ -n "$SS_OUTPUT" ]; then
            print_info "Found processes using port 80:"
            echo "$SS_OUTPUT"
        else
            print_success "No processes found using port 80"
        fi
    else
        print_warning "Neither netstat nor ss commands found. Cannot check port usage."
    fi
fi

# 5. Check Docker network configuration
print_header "5. DOCKER NETWORK CONFIGURATION"
echo "Docker networks:"
docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}" || echo "Failed to list networks"

echo -e "\nDetailed network inspection for frontend networks:"
docker network ls --filter "name=frontend" --format "{{.Name}}" | while read -r network; do
    echo -e "\nNetwork: $network"
    docker network inspect "$network" --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}' || echo "Failed to inspect network"
done

# 6. Check Nginx configuration
print_header "6. NGINX CONFIGURATION VALIDATION"
echo "Checking if nginx configuration is valid..."

# Find nginx containers
NGINX_CONTAINERS=$(docker ps --filter "name=nginx" --format "{{.Names}}")
if [ -z "$NGINX_CONTAINERS" ]; then
    print_error "No nginx containers found running"
else
    for container in $NGINX_CONTAINERS; do
        echo -e "\nValidating nginx config in container: $container"
        docker exec "$container" nginx -t 2>&1 || print_error "Nginx configuration test failed"
        
        echo -e "\nNginx configuration files in container:"
        docker exec "$container" find /etc/nginx -type f -name "*.conf" | while read -r config; do
            echo "File: $config"
            docker exec "$container" cat "$config" | grep -E 'listen|server_name|location|proxy_pass' | grep -v '#' | sed 's/^/  /'
        done
    done
fi

# 7. Check container logs for errors
print_header "7. CONTAINER LOGS"
echo "Checking nginx container logs for errors..."

if [ -n "$NGINX_CONTAINERS" ]; then
    for container in $NGINX_CONTAINERS; do
        echo -e "\nLast 20 log entries for container: $container"
        docker logs --tail 20 "$container" 2>&1 | grep -E 'error|warn|emerg|crit' --color=always || echo "No error logs found"
    done
else
    print_error "No nginx containers to check logs for"
fi

# 8. Check firewall and iptables rules
print_header "8. FIREWALL STATUS"
echo "Checking firewall status..."

if command -v ufw &> /dev/null; then
    echo "UFW status:"
    ufw status | grep 80 || echo "No port 80 rules found in UFW"
fi

if command -v firewall-cmd &> /dev/null; then
    echo -e "\nFirewalld status:"
    firewall-cmd --list-all | grep 80 || echo "No port 80 rules found in firewalld"
fi

echo -e "\nIPTables rules for port 80:"
iptables -L -n | grep -E '(:80|dpt:80)' || echo "No explicit port 80 rules found in iptables"

# 9. Check for conflicting services
print_header "9. CONFLICTING SERVICES"
echo "Checking for services that might be using port 80..."

POTENTIAL_CONFLICTS=("apache2" "httpd" "nginx" "lighttpd" "caddy")
for service in "${POTENTIAL_CONFLICTS[@]}"; do
    if systemctl list-unit-files --type=service | grep -q "$service"; then
        STATUS=$(systemctl is-active "$service" 2>/dev/null)
        if [ "$STATUS" = "active" ]; then
            print_error "Service $service is running and might be using port 80"
            print_info "Try: sudo systemctl stop $service"
        else
            print_success "Service $service is installed but not running"
        fi
    fi
done

# 10. Check Docker daemon status
print_header "10. DOCKER DAEMON STATUS"
echo "Checking Docker daemon status and logs..."

if systemctl is-active --quiet docker; then
    print_success "Docker daemon is active"
    
    echo -e "\nDocker daemon settings:"
    if [ -f /etc/docker/daemon.json ]; then
        cat /etc/docker/daemon.json || echo "Cannot read daemon.json"
    else
        echo "No custom daemon.json file found"
    fi
    
    echo -e "\nLast 10 Docker daemon logs:"
    journalctl -u docker --no-pager -n 10 || echo "Cannot access Docker daemon logs"
else
    print_error "Docker daemon is not active"
fi

# 11. Check file permissions and mounts
print_header "11. FILE PERMISSIONS AND MOUNTS"
echo "Checking file permissions and mounts for nginx configuration..."

# Find the directory where nginx.conf is located
if [ -d "./nginx" ]; then
    print_success "Found nginx directory in current path"
    
    echo -e "\nPermissions for nginx directory:"
    ls -la ./nginx/
    
    if [ -d "./nginx/conf.d" ]; then
        echo -e "\nPermissions for nginx/conf.d directory:"
        ls -la ./nginx/conf.d/
        
        if [ -f "./nginx/conf.d/default.conf" ]; then
            print_success "Found default.conf file"
            echo "File permissions: $(stat -c '%A %U:%G' ./nginx/conf.d/default.conf)"
        else
            print_error "default.conf file not found in nginx/conf.d/"
        fi
    else
        print_error "nginx/conf.d directory not found"
    fi
else
    print_warning "nginx directory not found in current path"
    
    # Check if there's a nginx.conf in the current directory
    if [ -f "./nginx.conf" ]; then
        print_warning "Found nginx.conf in current directory, but it should be in nginx/conf.d/"
        print_info "Try: mkdir -p nginx/conf.d && cp nginx.conf nginx/conf.d/default.conf"
    fi
fi

# 12. Docker volume mounts
print_header "12. DOCKER VOLUME MOUNTS"
echo "Checking Docker volume mounts..."

if [ -n "$NGINX_CONTAINERS" ]; then
    for container in $NGINX_CONTAINERS; do
        echo -e "\nVolume mounts for container: $container"
        docker inspect --format '{{range .Mounts}}{{.Type}} mount: {{.Source}} -> {{.Destination}}{{println}}{{end}}' "$container" || echo "Failed to inspect mounts"
    done
else
    print_error "No nginx containers to check mounts for"
fi

# 13. SELinux status (if applicable)
print_header "13. SELINUX STATUS"
if command -v getenforce &> /dev/null; then
    SELINUX_STATUS=$(getenforce)
    echo "SELinux status: $SELINUX_STATUS"
    
    if [ "$SELINUX_STATUS" = "Enforcing" ]; then
        print_warning "SELinux is enforcing and might be blocking port bindings"
        print_info "Check SELinux audit logs: sudo ausearch -m avc -ts recent"
        print_info "Temporary solution: sudo setenforce 0"
    fi
else
    echo "SELinux not detected on this system"
fi

# 14. Check docker-compose.yml
print_header "14. DOCKER-COMPOSE.YML ANALYSIS"
echo "Analyzing docker-compose.yml for nginx service configuration..."

if [ -f "docker-compose.yml" ]; then
    print_success "Found docker-compose.yml"
    
    # Extract nginx service configuration
    echo -e "\nNginx service configuration in docker-compose.yml:"
    grep -A 50 "nginx:" docker-compose.yml | grep -B 50 -m 1 "^[a-z]" | grep -v "^[a-z]" || echo "Nginx service not found in docker-compose.yml"
    
    # Check port mappings
    echo -e "\nPort mappings in docker-compose.yml:"
    grep -A 5 "ports:" docker-compose.yml | grep -E "\"[0-9]+:[0-9]+\"" || echo "No port mappings found"
    
    # Check volume mappings for nginx
    echo -e "\nVolume mappings for nginx in docker-compose.yml:"
    grep -A 10 "nginx:" docker-compose.yml | grep -A 10 "volumes:" | grep -v "^[a-z]" | grep -v "volumes:" || echo "No volume mappings found for nginx"
else
    print_error "docker-compose.yml not found in current directory"
fi

# 15. Detailed nginx startup process
print_header "15. NGINX STARTUP PROCESS"
echo "Analyzing nginx startup process..."

if [ -n "$NGINX_CONTAINERS" ]; then
    for container in $NGINX_CONTAINERS; do
        echo -e "\nStartup command for container: $container"
        docker inspect --format '{{.Path}} {{range .Args}}{{.}} {{end}}' "$container" || echo "Failed to get startup command"
        
        echo -e "\nEnvironment variables:"
        docker inspect --format '{{range .Config.Env}}{{.}}{{println}}{{end}}' "$container" || echo "Failed to get environment variables"
        
        echo -e "\nEntrypoint script (if accessible):"
        docker exec "$container" cat /docker-entrypoint.sh 2>/dev/null | head -20 || echo "Cannot access entrypoint script"
    done
else
    print_error "No nginx containers to analyze startup process"
fi

# 16. Summary and recommendations
print_header "16. SUMMARY AND RECOMMENDATIONS"
echo "Based on the diagnostics, here are potential issues and solutions:"

# Check if anything is using port 80
if netstat -tulpn 2>/dev/null | grep -q ":80 " || ss -tulpn 2>/dev/null | grep -q ":80 "; then
    print_error "Port 80 is already in use by another process"
    print_info "Solution: Stop the conflicting service or change the port mapping in docker-compose.yml"
fi

# Check if nginx config is valid
if [ -n "$NGINX_CONTAINERS" ]; then
    for container in $NGINX_CONTAINERS; do
        if ! docker exec "$container" nginx -t &>/dev/null; then
            print_error "Nginx configuration in container $container is invalid"
            print_info "Solution: Fix the configuration errors and restart the container"
        fi
    done
fi

# Check if nginx.conf is in the right location
if [ ! -f "./nginx/conf.d/default.conf" ] && [ -f "./nginx.conf" ]; then
    print_error "nginx.conf is in the wrong location"
    print_info "Solution: mkdir -p nginx/conf.d && cp nginx.conf nginx/conf.d/default.conf"
fi

# Check for API dependency in nginx config
if [ -f "./nginx/conf.d/default.conf" ] && grep -q "proxy_pass http://api" "./nginx/conf.d/default.conf"; then
    print_error "Nginx configuration has dependency on API service that might not be available"
    print_info "Solution: Modify the API location block to return a 404 instead of proxy_pass"
    print_info "Example: Replace 'proxy_pass http://api:3000/;' with 'return 404 '{\"error\": \"API not available\"}';'"
fi

# Check for port mismatch
if [ -f "./nginx/conf.d/default.conf" ] && grep -q "listen 8080" "./nginx/conf.d/default.conf" ]; then
    print_error "Nginx is configured to listen on port 8080 but docker-compose maps to port 80"
    print_info "Solution: Change 'listen 8080;' to 'listen 80;' in nginx/conf.d/default.conf"
fi

echo -e "\nFinal recommendations:"
echo "1. Ensure no other services are using port 80"
echo "2. Make sure nginx configuration is in nginx/conf.d/default.conf"
echo "3. Ensure nginx is configured to listen on the same port that's mapped in docker-compose.yml"
echo "4. Check for API dependencies in nginx configuration"
echo "5. Verify volume mounts are correct in docker-compose.yml"
echo "6. Check Docker logs for specific errors"

print_header "TROUBLESHOOTING COMMANDS"
echo "Here are some useful commands for further troubleshooting:"
echo "- Stop all containers: docker compose down"
echo "- Remove orphaned containers: docker system prune -f"
echo "- Validate nginx config: docker exec <nginx-container> nginx -t"
echo "- Check detailed logs: docker logs <container-name>"
echo "- Restart single service: docker compose up -d --force-recreate nginx"
echo "- Test nginx directly: docker run -p 80:80 -v \$(pwd)/nginx/conf.d:/etc/nginx/conf.d nginx:stable-alpine"

print_header "DIAGNOSTIC COMPLETE"
echo "Diagnostic completed at $(date)"
echo "For more help, please share the output of this script."
