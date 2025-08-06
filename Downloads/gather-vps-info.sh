#!/bin/bash
# gather-vps-info.sh
# Comprehensive VPS information gathering script
# Version: 1.0.0
# Date: 2025-08-04

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
OUTPUT_DIR="$HOME/vps-info"
LOG_FILE="$OUTPUT_DIR/vps-info-$(date +%Y%m%d-%H%M%S).log"
SUMMARY_FILE="$OUTPUT_DIR/vps-info-summary.txt"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  VPS SYSTEM INFORMATION GATHERING TOOL        ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""
echo -e "Results will be saved to: ${YELLOW}$LOG_FILE${NC}"
echo -e "Summary will be saved to: ${YELLOW}$SUMMARY_FILE${NC}"
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

section() {
    echo ""
    echo -e "${CYAN}=== $1 ===${NC}"
    echo -e "${CYAN}$(printf '=%.0s' $(seq 1 ${#1}))======${NC}"
    echo ""
    echo "=== $1 ===" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# Function to add to summary
add_to_summary() {
    echo "$1" >> "$SUMMARY_FILE"
}

# Initialize summary file
echo "VPS SYSTEM INFORMATION SUMMARY" > "$SUMMARY_FILE"
echo "Generated on: $(date)" >> "$SUMMARY_FILE"
echo "----------------------------------------" >> "$SUMMARY_FILE"
echo "" >> "$SUMMARY_FILE"

# Start main script
log "Starting VPS system information gathering"
log "Output directory: $OUTPUT_DIR"
log "Log file: $LOG_FILE"

# Step 1: Operating System Information
section "OPERATING SYSTEM INFORMATION"

log "Checking OS distribution and version"
OS_INFO=$(cat /etc/os-release 2>/dev/null || echo "OS release information not found")
echo "$OS_INFO" >> "$LOG_FILE"

# Extract key OS information
OS_NAME=$(grep -E "^NAME=" /etc/os-release 2>/dev/null | cut -d'"' -f2 || echo "Unknown")
OS_VERSION=$(grep -E "^VERSION=" /etc/os-release 2>/dev/null | cut -d'"' -f2 || echo "Unknown")
OS_ID=$(grep -E "^ID=" /etc/os-release 2>/dev/null | cut -d'=' -f2 || echo "unknown")

log "OS Name: $OS_NAME"
log "OS Version: $OS_VERSION"
log "OS ID: $OS_ID"

# Add to summary
add_to_summary "OPERATING SYSTEM:"
add_to_summary "- Name: $OS_NAME"
add_to_summary "- Version: $OS_VERSION"
add_to_summary "- ID: $OS_ID"
add_to_summary ""

# Kernel information
log "Checking kernel information"
KERNEL_INFO=$(uname -a)
echo "Kernel information: $KERNEL_INFO" >> "$LOG_FILE"
log "Kernel: $KERNEL_INFO"

# Add to summary
add_to_summary "KERNEL:"
add_to_summary "- Version: $(uname -r)"
add_to_summary ""

# Step 2: Docker Installation Status
section "DOCKER INSTALLATION STATUS"

log "Checking Docker installation"
if command -v docker &>/dev/null; then
    DOCKER_VERSION=$(docker --version 2>/dev/null || echo "Could not determine Docker version")
    success "Docker is installed: $DOCKER_VERSION"
    
    # Check Docker service status
    if systemctl is-active docker &>/dev/null; then
        success "Docker service is running"
        DOCKER_STATUS="Running"
    else
        warning "Docker is installed but service is not running"
        DOCKER_STATUS="Installed but not running"
    fi
    
    # Check Docker info
    log "Gathering Docker system information"
    DOCKER_INFO=$(docker info 2>/dev/null || echo "Could not retrieve Docker info")
    echo "Docker info:" >> "$LOG_FILE"
    echo "$DOCKER_INFO" >> "$LOG_FILE"
    
    # Check Docker root directory
    DOCKER_ROOT=$(docker info 2>/dev/null | grep "Docker Root Dir" | cut -d':' -f2 | tr -d ' ' || echo "Unknown")
    log "Docker root directory: $DOCKER_ROOT"
    
    # Check Docker configuration
    log "Checking Docker daemon configuration"
    if [ -f "/etc/docker/daemon.json" ]; then
        DOCKER_CONFIG=$(cat /etc/docker/daemon.json)
        echo "Docker daemon configuration:" >> "$LOG_FILE"
        echo "$DOCKER_CONFIG" >> "$LOG_FILE"
        success "Docker daemon configuration found"
    else
        warning "No Docker daemon configuration file found"
    fi
else
    error "Docker is not installed"
    DOCKER_VERSION="Not installed"
    DOCKER_STATUS="Not installed"
fi

# Add to summary
add_to_summary "DOCKER:"
add_to_summary "- Status: $DOCKER_STATUS"
add_to_summary "- Version: $DOCKER_VERSION"
if [ -n "$DOCKER_ROOT" ]; then
    add_to_summary "- Root Directory: $DOCKER_ROOT"
fi
add_to_summary ""

# Step 3: Docker Compose Availability
section "DOCKER COMPOSE AVAILABILITY"

log "Checking Docker Compose installation"
if command -v docker-compose &>/dev/null; then
    COMPOSE_VERSION=$(docker-compose --version 2>/dev/null || echo "Could not determine Docker Compose version")
    success "Docker Compose is installed: $COMPOSE_VERSION"
    COMPOSE_STATUS="Installed"
elif docker compose version &>/dev/null; then
    COMPOSE_VERSION=$(docker compose version 2>/dev/null || echo "Could not determine Docker Compose plugin version")
    success "Docker Compose plugin is installed: $COMPOSE_VERSION"
    COMPOSE_STATUS="Plugin installed"
else
    warning "Docker Compose is not installed"
    COMPOSE_STATUS="Not installed"
fi

# Add to summary
add_to_summary "DOCKER COMPOSE:"
add_to_summary "- Status: $COMPOSE_STATUS"
add_to_summary "- Version: $COMPOSE_VERSION"
add_to_summary ""

# Step 4: System Resources
section "SYSTEM RESOURCES"

# CPU information
log "Checking CPU information"
CPU_INFO=$(lscpu 2>/dev/null || echo "Could not retrieve CPU information")
echo "CPU information:" >> "$LOG_FILE"
echo "$CPU_INFO" >> "$LOG_FILE"

CPU_CORES=$(nproc --all 2>/dev/null || echo "Unknown")
log "CPU cores: $CPU_CORES"

# Memory information
log "Checking memory information"
MEM_INFO=$(free -h 2>/dev/null || echo "Could not retrieve memory information")
echo "Memory information:" >> "$LOG_FILE"
echo "$MEM_INFO" >> "$LOG_FILE"

TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}' 2>/dev/null || echo "Unknown")
log "Total memory: ${TOTAL_MEM}MB"

# Disk information
log "Checking disk information"
DISK_INFO=$(df -h 2>/dev/null || echo "Could not retrieve disk information")
echo "Disk information:" >> "$LOG_FILE"
echo "$DISK_INFO" >> "$LOG_FILE"

ROOT_DISK_SIZE=$(df -h / | awk 'NR==2 {print $2}' 2>/dev/null || echo "Unknown")
ROOT_DISK_USED=$(df -h / | awk 'NR==2 {print $3}' 2>/dev/null || echo "Unknown")
ROOT_DISK_AVAIL=$(df -h / | awk 'NR==2 {print $4}' 2>/dev/null || echo "Unknown")
ROOT_DISK_USE_PERCENT=$(df -h / | awk 'NR==2 {print $5}' 2>/dev/null || echo "Unknown")

log "Root disk size: $ROOT_DISK_SIZE"
log "Root disk used: $ROOT_DISK_USED"
log "Root disk available: $ROOT_DISK_AVAIL"
log "Root disk use percent: $ROOT_DISK_USE_PERCENT"

# Add to summary
add_to_summary "SYSTEM RESOURCES:"
add_to_summary "- CPU Cores: $CPU_CORES"
add_to_summary "- Total Memory: ${TOTAL_MEM}MB"
add_to_summary "- Root Disk Size: $ROOT_DISK_SIZE"
add_to_summary "- Root Disk Available: $ROOT_DISK_AVAIL ($ROOT_DISK_USE_PERCENT used)"
add_to_summary ""

# Step 5: Network Configuration
section "NETWORK CONFIGURATION"

# IP addresses
log "Checking network interfaces and IP addresses"
IP_INFO=$(ip addr 2>/dev/null || ifconfig 2>/dev/null || echo "Could not retrieve IP information")
echo "Network interface information:" >> "$LOG_FILE"
echo "$IP_INFO" >> "$LOG_FILE"

# Extract main IP address
MAIN_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "Unknown")
log "Main IP address: $MAIN_IP"

# DNS configuration
log "Checking DNS configuration"
DNS_INFO=$(cat /etc/resolv.conf 2>/dev/null || echo "Could not retrieve DNS information")
echo "DNS configuration:" >> "$LOG_FILE"
echo "$DNS_INFO" >> "$LOG_FILE"

# Open ports
log "Checking open ports"
if command -v netstat &>/dev/null; then
    OPEN_PORTS=$(netstat -tuln 2>/dev/null || echo "Could not retrieve open ports")
elif command -v ss &>/dev/null; then
    OPEN_PORTS=$(ss -tuln 2>/dev/null || echo "Could not retrieve open ports")
else
    OPEN_PORTS="Could not determine open ports (netstat/ss not available)"
fi
echo "Open ports:" >> "$LOG_FILE"
echo "$OPEN_PORTS" >> "$LOG_FILE"

# Extract listening ports
LISTENING_PORTS=$(echo "$OPEN_PORTS" | grep "LISTEN" | awk '{print $4}' | awk -F: '{print $NF}' | sort -n | uniq | tr '\n' ', ' | sed 's/,$//')
log "Listening ports: $LISTENING_PORTS"

# Check if common ports are open
HTTP_PORT_OPEN=$(echo "$OPEN_PORTS" | grep -E ":80 " | grep "LISTEN" | wc -l)
HTTPS_PORT_OPEN=$(echo "$OPEN_PORTS" | grep -E ":443 " | grep "LISTEN" | wc -l)
SSH_PORT_OPEN=$(echo "$OPEN_PORTS" | grep -E ":22 " | grep "LISTEN" | wc -l)
RDP_PORT_OPEN=$(echo "$OPEN_PORTS" | grep -E ":3389 " | grep "LISTEN" | wc -l)

if [ "$HTTP_PORT_OPEN" -gt 0 ]; then
    log "Port 80 (HTTP) is open"
fi
if [ "$HTTPS_PORT_OPEN" -gt 0 ]; then
    log "Port 443 (HTTPS) is open"
fi
if [ "$SSH_PORT_OPEN" -gt 0 ]; then
    log "Port 22 (SSH) is open"
fi
if [ "$RDP_PORT_OPEN" -gt 0 ]; then
    log "Port 3389 (RDP) is open"
fi

# Add to summary
add_to_summary "NETWORK CONFIGURATION:"
add_to_summary "- Main IP Address: $MAIN_IP"
add_to_summary "- Listening Ports: $LISTENING_PORTS"
add_to_summary "- HTTP (80) Open: $([ "$HTTP_PORT_OPEN" -gt 0 ] && echo "Yes" || echo "No")"
add_to_summary "- HTTPS (443) Open: $([ "$HTTPS_PORT_OPEN" -gt 0 ] && echo "Yes" || echo "No")"
add_to_summary "- SSH (22) Open: $([ "$SSH_PORT_OPEN" -gt 0 ] && echo "Yes" || echo "No")"
add_to_summary "- RDP (3389) Open: $([ "$RDP_PORT_OPEN" -gt 0 ] && echo "Yes" || echo "No")"
add_to_summary ""

# Step 6: Existing Services and Processes
section "EXISTING SERVICES AND PROCESSES"

# Check systemd services
log "Checking systemd services"
if command -v systemctl &>/dev/null; then
    SYSTEMD_SERVICES=$(systemctl list-units --type=service --all 2>/dev/null || echo "Could not retrieve systemd services")
    echo "Systemd services:" >> "$LOG_FILE"
    echo "$SYSTEMD_SERVICES" >> "$LOG_FILE"
    
    # Count running services
    RUNNING_SERVICES=$(systemctl list-units --type=service --state=running | grep -c ".service" || echo "0")
    log "Running systemd services: $RUNNING_SERVICES"
    
    # Check specific important services
    for service in docker nginx apache2 httpd postgresql mysql mariadb mongodb redis; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log "Service $service is running"
        elif systemctl is-enabled --quiet "$service" 2>/dev/null; then
            warning "Service $service is enabled but not running"
        elif systemctl list-unit-files | grep -q "$service"; then
            warning "Service $service is installed but not enabled"
        fi
    done
else
    warning "systemctl not available, cannot check services"
fi

# Check running processes
log "Checking running processes"
TOP_PROCESSES=$(ps aux --sort=-%cpu | head -11 2>/dev/null || echo "Could not retrieve process information")
echo "Top processes by CPU usage:" >> "$LOG_FILE"
echo "$TOP_PROCESSES" >> "$LOG_FILE"

# Add to summary
add_to_summary "SERVICES AND PROCESSES:"
add_to_summary "- Running Services: $RUNNING_SERVICES"
if command -v systemctl &>/dev/null; then
    for service in docker nginx apache2 httpd postgresql mysql mariadb mongodb redis; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            add_to_summary "- $service: Running"
        fi
    done
fi
add_to_summary ""

# Step 7: User Permissions and Sudo Access
section "USER PERMISSIONS AND SUDO ACCESS"

# Current user
CURRENT_USER=$(whoami)
log "Current user: $CURRENT_USER"

# Check sudo access
log "Checking sudo access"
if command -v sudo &>/dev/null; then
    if sudo -n true 2>/dev/null; then
        success "Current user has passwordless sudo access"
        SUDO_ACCESS="Passwordless"
    elif sudo -l 2>/dev/null; then
        success "Current user has sudo access (password required)"
        SUDO_ACCESS="Password required"
    else
        warning "Current user does not have sudo access"
        SUDO_ACCESS="No access"
    fi
else
    warning "sudo command not available"
    SUDO_ACCESS="sudo not available"
fi

# Check user groups
log "Checking user groups"
USER_GROUPS=$(groups 2>/dev/null || echo "Could not retrieve user groups")
echo "User groups: $USER_GROUPS" >> "$LOG_FILE"
log "User groups: $USER_GROUPS"

# Check if user is in docker group
if groups | grep -q "docker"; then
    success "Current user is in the docker group"
    DOCKER_GROUP="Yes"
else
    warning "Current user is not in the docker group"
    DOCKER_GROUP="No"
fi

# Add to summary
add_to_summary "USER PERMISSIONS:"
add_to_summary "- Current User: $CURRENT_USER"
add_to_summary "- Sudo Access: $SUDO_ACCESS"
add_to_summary "- In Docker Group: $DOCKER_GROUP"
add_to_summary ""

# Step 8: Package Manager and Available Packages
section "PACKAGE MANAGER AND AVAILABLE PACKAGES"

# Determine package manager
log "Checking package manager"
if command -v apt &>/dev/null; then
    PKG_MANAGER="apt"
    PKG_UPDATE_CMD="apt update"
    PKG_INSTALL_CMD="apt install"
    success "APT package manager detected"
elif command -v dnf &>/dev/null; then
    PKG_MANAGER="dnf"
    PKG_UPDATE_CMD="dnf check-update"
    PKG_INSTALL_CMD="dnf install"
    success "DNF package manager detected"
elif command -v yum &>/dev/null; then
    PKG_MANAGER="yum"
    PKG_UPDATE_CMD="yum check-update"
    PKG_INSTALL_CMD="yum install"
    success "YUM package manager detected"
elif command -v zypper &>/dev/null; then
    PKG_MANAGER="zypper"
    PKG_UPDATE_CMD="zypper refresh"
    PKG_INSTALL_CMD="zypper install"
    success "Zypper package manager detected"
elif command -v pacman &>/dev/null; then
    PKG_MANAGER="pacman"
    PKG_UPDATE_CMD="pacman -Sy"
    PKG_INSTALL_CMD="pacman -S"
    success "Pacman package manager detected"
else
    warning "Could not determine package manager"
    PKG_MANAGER="unknown"
    PKG_UPDATE_CMD="unknown"
    PKG_INSTALL_CMD="unknown"
fi

# Check for updates
log "Checking for available package updates"
if [ "$PKG_MANAGER" = "apt" ]; then
    if sudo -n true 2>/dev/null; then
        APT_UPDATES=$(sudo apt-get -s upgrade 2>/dev/null | grep -P '^\d+ upgraded' || echo "Could not check for updates")
        log "Available updates: $APT_UPDATES"
    else
        warning "Cannot check for updates (sudo access required)"
    fi
elif [ "$PKG_MANAGER" = "dnf" ] || [ "$PKG_MANAGER" = "yum" ]; then
    if sudo -n true 2>/dev/null; then
        YUM_UPDATES=$(sudo $PKG_MANAGER check-update -q 2>/dev/null | grep -v "^$" | wc -l || echo "Could not check for updates")
        log "Available updates: approximately $YUM_UPDATES"
    else
        warning "Cannot check for updates (sudo access required)"
    fi
fi

# Check for specific packages
log "Checking for specific packages"
PACKAGES_TO_CHECK="curl wget git python3 python-is-python3 build-essential nginx postgresql postgresql-client"
INSTALLED_PACKAGES=""

for pkg in $PACKAGES_TO_CHECK; do
    if [ "$PKG_MANAGER" = "apt" ]; then
        if dpkg -l | grep -q "ii  $pkg "; then
            INSTALLED_PACKAGES="$INSTALLED_PACKAGES $pkg"
        fi
    elif [ "$PKG_MANAGER" = "dnf" ] || [ "$PKG_MANAGER" = "yum" ]; then
        if rpm -q "$pkg" &>/dev/null; then
            INSTALLED_PACKAGES="$INSTALLED_PACKAGES $pkg"
        fi
    elif [ "$PKG_MANAGER" = "pacman" ]; then
        if pacman -Q "$pkg" &>/dev/null; then
            INSTALLED_PACKAGES="$INSTALLED_PACKAGES $pkg"
        fi
    fi
done

log "Installed packages: $INSTALLED_PACKAGES"

# Add to summary
add_to_summary "PACKAGE MANAGEMENT:"
add_to_summary "- Package Manager: $PKG_MANAGER"
add_to_summary "- Update Command: $PKG_UPDATE_CMD"
add_to_summary "- Install Command: $PKG_INSTALL_CMD"
add_to_summary "- Key Packages Installed: $INSTALLED_PACKAGES"
add_to_summary ""

# Step 9: Firewall Status and Rules
section "FIREWALL STATUS AND RULES"

# Check UFW
log "Checking UFW status"
if command -v ufw &>/dev/null; then
    if sudo -n true 2>/dev/null; then
        UFW_STATUS=$(sudo ufw status 2>/dev/null || echo "Could not retrieve UFW status")
        echo "UFW status:" >> "$LOG_FILE"
        echo "$UFW_STATUS" >> "$LOG_FILE"
        
        if echo "$UFW_STATUS" | grep -q "Status: active"; then
            success "UFW is active"
            FIREWALL_STATUS="UFW active"
            
            # Check for specific rules
            if echo "$UFW_STATUS" | grep -q "80/tcp"; then
                log "UFW has rule for HTTP (80/tcp)"
            fi
            if echo "$UFW_STATUS" | grep -q "443/tcp"; then
                log "UFW has rule for HTTPS (443/tcp)"
            fi
            if echo "$UFW_STATUS" | grep -q "22/tcp"; then
                log "UFW has rule for SSH (22/tcp)"
            fi
            if echo "$UFW_STATUS" | grep -q "3389/tcp"; then
                log "UFW has rule for RDP (3389/tcp)"
            fi
        else
            warning "UFW is installed but not active"
            FIREWALL_STATUS="UFW installed but not active"
        fi
    else
        warning "Cannot check UFW status (sudo access required)"
        FIREWALL_STATUS="UFW status unknown (sudo required)"
    fi
else
    log "UFW is not installed"
    FIREWALL_STATUS="No UFW"
fi

# Check firewalld
if [ "$FIREWALL_STATUS" = "No UFW" ]; then
    log "Checking firewalld status"
    if command -v firewall-cmd &>/dev/null; then
        if sudo -n true 2>/dev/null; then
            FIREWALLD_STATUS=$(sudo firewall-cmd --state 2>/dev/null || echo "Could not retrieve firewalld status")
            echo "Firewalld status: $FIREWALLD_STATUS" >> "$LOG_FILE"
            
            if [ "$FIREWALLD_STATUS" = "running" ]; then
                success "Firewalld is active"
                FIREWALL_STATUS="Firewalld active"
                
                # Check for specific rules
                FIREWALLD_ZONES=$(sudo firewall-cmd --list-all-zones 2>/dev/null || echo "")
                echo "Firewalld zones:" >> "$LOG_FILE"
                echo "$FIREWALLD_ZONES" >> "$LOG_FILE"
            else
                warning "Firewalld is installed but not active"
                FIREWALL_STATUS="Firewalld installed but not active"
            fi
        else
            warning "Cannot check firewalld status (sudo access required)"
            FIREWALL_STATUS="Firewalld status unknown (sudo required)"
        fi
    else
        log "Firewalld is not installed"
        FIREWALL_STATUS="No firewall detected"
    fi
fi

# Check iptables
if [ "$FIREWALL_STATUS" = "No firewall detected" ]; then
    log "Checking iptables rules"
    if command -v iptables &>/dev/null; then
        if sudo -n true 2>/dev/null; then
            IPTABLES_RULES=$(sudo iptables -L -n 2>/dev/null || echo "Could not retrieve iptables rules")
            echo "Iptables rules:" >> "$LOG_FILE"
            echo "$IPTABLES_RULES" >> "$LOG_FILE"
            
            if [ -n "$IPTABLES_RULES" ] && [ "$IPTABLES_RULES" != "Could not retrieve iptables rules" ]; then
                # Count rules
                RULE_COUNT=$(echo "$IPTABLES_RULES" | grep -c "^Chain " || echo "0")
                if [ "$RULE_COUNT" -gt 3 ]; then
                    success "Iptables has custom rules configured"
                    FIREWALL_STATUS="Iptables with custom rules"
                else
                    warning "Iptables has default configuration"
                    FIREWALL_STATUS="Iptables with default config"
                fi
            fi
        else
            warning "Cannot check iptables rules (sudo access required)"
            FIREWALL_STATUS="Iptables status unknown (sudo required)"
        fi
    else
        warning "No firewall detected"
        FIREWALL_STATUS="No firewall detected"
    fi
fi

# Add to summary
add_to_summary "FIREWALL STATUS:"
add_to_summary "- Status: $FIREWALL_STATUS"
if echo "$FIREWALL_STATUS" | grep -q "UFW active"; then
    for port in 80 443 22 3389; do
        if echo "$UFW_STATUS" | grep -q "$port/tcp"; then
            add_to_summary "- Port $port: Allowed"
        else
            add_to_summary "- Port $port: Not explicitly allowed"
        fi
    done
fi
add_to_summary ""

# Step 10: Directory Structure and Permissions
section "DIRECTORY STRUCTURE AND PERMISSIONS"

# Check common directories
log "Checking common directories"
DIRS_TO_CHECK="/opt /var/www /var/lib/docker /etc/docker /home/$CURRENT_USER"

for dir in $DIRS_TO_CHECK; do
    if [ -d "$dir" ]; then
        DIR_PERMS=$(ls -ld "$dir" 2>/dev/null | awk '{print $1, $3, $4}' || echo "Could not retrieve permissions")
        log "Directory $dir exists with permissions: $DIR_PERMS"
        
        # Check if writable by current user
        if [ -w "$dir" ]; then
            success "Directory $dir is writable by current user"
        else
            warning "Directory $dir is not writable by current user"
        fi
    else
        warning "Directory $dir does not exist"
    fi
done

# Check for Risk Platform directory
RISK_PLATFORM_DIR="/opt/risk-platform"
if [ -d "$RISK_PLATFORM_DIR" ]; then
    RISK_DIR_PERMS=$(ls -ld "$RISK_PLATFORM_DIR" 2>/dev/null | awk '{print $1, $3, $4}' || echo "Could not retrieve permissions")
    log "Risk Platform directory exists with permissions: $RISK_DIR_PERMS"
    
    # Check subdirectories
    for subdir in dashboard database nginx; do
        if [ -d "$RISK_PLATFORM_DIR/$subdir" ]; then
            SUBDIR_PERMS=$(ls -ld "$RISK_PLATFORM_DIR/$subdir" 2>/dev/null | awk '{print $1, $3, $4}' || echo "Could not retrieve permissions")
            log "Directory $RISK_PLATFORM_DIR/$subdir exists with permissions: $SUBDIR_PERMS"
        else
            log "Directory $RISK_PLATFORM_DIR/$subdir does not exist"
        fi
    done
else
    log "Risk Platform directory does not exist yet"
fi

# Add to summary
add_to_summary "DIRECTORY STRUCTURE:"
for dir in $DIRS_TO_CHECK; do
    if [ -d "$dir" ]; then
        DIR_PERMS=$(ls -ld "$dir" 2>/dev/null | awk '{print $1, $3, $4}' || echo "Unknown")
        add_to_summary "- $dir: Exists ($DIR_PERMS)"
    else
        add_to_summary "- $dir: Does not exist"
    fi
done
add_to_summary ""

# Final summary
section "SYSTEM INFORMATION SUMMARY"

# Display summary
echo -e "${CYAN}System Information Summary:${NC}"
cat "$SUMMARY_FILE"

# Final status
echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  VPS INFORMATION GATHERING COMPLETE          ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""
echo -e "${GREEN}VPS system information has been gathered successfully!${NC}"
echo ""
echo "Summary file: $SUMMARY_FILE"
echo "Detailed log: $LOG_FILE"
echo ""
echo "Next Steps:"
echo "1. Review the summary file for an overview of your system"
echo "2. Use this information to create an optimized deployment script"
echo "3. Ensure Docker is properly configured for your deployment"
echo ""
success "VPS information gathering completed successfully"
