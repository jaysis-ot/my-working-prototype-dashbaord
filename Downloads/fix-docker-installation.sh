#!/bin/bash
# fix-docker-installation.sh
# Script to fix Docker installation issues on Ubuntu 24.04
# Version: 1.0.0
# Date: 2025-08-04

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging configuration
LOG_FILE="/var/log/docker-installation-fix-$(date +%Y%m%d-%H%M%S).log"

# Logging functions
log_info() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${BLUE}INFO:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] INFO: $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${GREEN}SUCCESS:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] SUCCESS: $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${YELLOW}WARNING:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] WARNING: $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${RED}ERROR:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ERROR: $1" >> "$LOG_FILE"
}

# Error handling
handle_error() {
    log_error "An error occurred on line $1"
    exit 1
}

trap 'handle_error $LINENO' ERR

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    log_error "This script must be run as root!"
    exit 1
fi

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

# Display header
echo "==============================================="
echo "  Docker Installation Fix for Ubuntu 24.04     "
echo "==============================================="
echo ""
log_info "Starting Docker installation fix"

# Step 1: Clean up any previous Docker installations
log_info "Cleaning up any previous Docker installations"
apt-get remove -y docker docker-engine docker.io containerd runc || true
apt-get autoremove -y
apt-get clean

# Remove any Docker repository files
log_info "Removing any existing Docker repository files"
rm -f /etc/apt/sources.list.d/docker.list
rm -f /usr/share/keyrings/docker-archive-keyring.gpg

# Step 2: Update package lists
log_info "Updating package lists"
apt-get update
if [ $? -ne 0 ]; then
    log_warning "APT update encountered issues, fixing..."
    # Fix common APT issues
    apt-get clean
    rm -rf /var/lib/apt/lists/*
    apt-get update
fi

# Step 3: Install prerequisites
log_info "Installing prerequisites"
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release software-properties-common

# Step 4: Add Docker's official GPG key - Ubuntu 24.04 specific method
log_info "Adding Docker's official GPG key using Ubuntu 24.04 specific method"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Step 5: Add Docker repository - Ubuntu 24.04 specific method
log_info "Setting up Docker repository for Ubuntu 24.04"
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Step 6: Update package lists again
log_info "Updating package lists with Docker repository"
apt-get update
if [ $? -ne 0 ]; then
    log_error "Failed to update package lists with Docker repository. Fixing..."
    # Try to fix repository issues
    sed -i 's/noble/jammy/g' /etc/apt/sources.list.d/docker.list
    log_info "Temporarily using 'jammy' repository for Docker (Ubuntu 22.04 LTS)"
    apt-get update
fi

# Step 7: Install Docker
log_info "Installing Docker packages"
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Step 8: Verify Docker installation
log_info "Verifying Docker installation"
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    log_success "Docker installed successfully: $docker_version"
else
    log_error "Docker installation failed. Attempting alternative method..."
    # Alternative installation method using snap
    log_info "Trying to install Docker using snap"
    apt-get install -y snapd
    snap install docker
    
    if command -v docker &> /dev/null; then
        docker_version=$(docker --version)
        log_success "Docker installed successfully via snap: $docker_version"
    else
        log_error "All Docker installation methods failed"
        exit 1
    fi
fi

# Step 9: Start and enable Docker service
log_info "Starting and enabling Docker service"
systemctl start docker
systemctl enable docker

# Step 10: Fix SSH service name issue
log_info "Fixing SSH service name issue"
if systemctl list-unit-files | grep -q "ssh.service"; then
    log_info "Using ssh.service (Ubuntu 24.04 standard)"
    SSH_SERVICE="ssh"
elif systemctl list-unit-files | grep -q "sshd.service"; then
    log_info "Using sshd.service"
    SSH_SERVICE="sshd"
else
    log_warning "Neither ssh.service nor sshd.service found. SSH service may not be installed."
    # Install SSH server if not present
    apt-get install -y openssh-server
    SSH_SERVICE="ssh"
fi

# Restart SSH service with correct name
log_info "Restarting $SSH_SERVICE service"
systemctl restart $SSH_SERVICE

# Step 11: Install Docker Compose
log_info "Installing Docker Compose"
if ! command -v docker-compose &> /dev/null; then
    # Check if Docker Compose plugin is installed
    if docker compose version &> /dev/null; then
        log_success "Docker Compose plugin is installed"
    else
        log_info "Installing Docker Compose standalone binary"
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        
        if command -v docker-compose &> /dev/null; then
            log_success "Docker Compose installed successfully: $(docker-compose --version)"
        else
            log_warning "Docker Compose installation failed, but Docker Compose plugin might be available"
        fi
    fi
else
    log_success "Docker Compose is already installed: $(docker-compose --version)"
fi

# Step 12: Add current user to docker group
if [ -n "$SUDO_USER" ]; then
    log_info "Adding user $SUDO_USER to docker group"
    usermod -aG docker $SUDO_USER
    log_success "User $SUDO_USER added to docker group"
else
    log_info "Adding current user to docker group"
    usermod -aG docker $USER
    log_success "Current user added to docker group"
fi

# Step 13: Test Docker with hello-world container
log_info "Testing Docker with hello-world container"
if docker run --rm hello-world; then
    log_success "Docker test successful! Hello-world container ran correctly."
else
    log_error "Docker test failed. Please check Docker installation."
    exit 1
fi

# Step 14: Create docker-compose.yml test file
log_info "Testing Docker Compose functionality"
TEST_DIR="/tmp/docker-compose-test"
mkdir -p $TEST_DIR

cat > $TEST_DIR/docker-compose.yml <<EOF
version: '3'
services:
  hello:
    image: hello-world
EOF

# Test docker-compose
cd $TEST_DIR
if docker-compose up; then
    log_success "Docker Compose test successful!"
else
    # Try with docker compose plugin format
    if docker compose up; then
        log_success "Docker Compose plugin test successful!"
    else
        log_warning "Docker Compose test failed, but Docker is working. You may need to use 'docker compose' instead of 'docker-compose'."
    fi
fi

# Clean up test files
rm -rf $TEST_DIR

# Step 15: Create a symlink for docker compose plugin if needed
if ! command -v docker-compose &> /dev/null && docker compose version &> /dev/null; then
    log_info "Creating symlink for docker compose plugin"
    ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose
    log_success "Symlink created for docker-compose"
fi

# Final summary
echo ""
echo "==============================================="
echo "  Docker Installation Fix Complete!            "
echo "==============================================="
echo ""
log_success "Docker has been successfully installed and tested!"
echo ""
echo "Docker Version: $(docker --version)"
if command -v docker-compose &> /dev/null; then
    echo "Docker Compose Version: $(docker-compose --version)"
else
    echo "Docker Compose Plugin Version: $(docker compose version 2>/dev/null || echo 'Not available')"
fi
echo ""
echo "You may need to log out and log back in for group changes to take effect."
echo "Alternatively, run: newgrp docker"
echo ""
echo "To verify Docker is working correctly, run:"
echo "docker run hello-world"
echo ""
echo "Log file: $LOG_FILE"
echo ""

log_info "Docker installation fix completed"
