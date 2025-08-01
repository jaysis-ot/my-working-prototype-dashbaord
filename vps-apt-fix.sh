#!/bin/bash
# vps-apt-fix.sh - APT and Package Conflict Resolution Script for Ubuntu 24.04
# Version: 1.0.0
# Date: 2025-07-31
#
# This script fixes:
# - Duplicate APT sources in ubuntu-mirrors.list
# - Package conflicts between iptables-persistent and ufw
# - Ensures RDP access is preserved (port 3389)
# - Sets up essential security with ufw instead of iptables-persistent

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="/var/log/vps-apt-fix-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="/root/apt-backups"
STATE_FILE="/root/.apt_fix_state"

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

# Save state function
save_state() {
    echo "$1" > "$STATE_FILE"
    log_info "Automation state saved: $1"
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    log_error "This script must be run as root!"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Start script
log_info "Starting VPS APT Fix Script for Ubuntu 24.04"
save_state "started"

# 1. Fix duplicate APT sources
log_info "Fixing duplicate APT sources..."

# Backup original sources files
TIMESTAMP=$(date +%Y%m%d%H%M%S)
if [ -f /etc/apt/sources.list.d/ubuntu-mirrors.list ]; then
    cp /etc/apt/sources.list.d/ubuntu-mirrors.list "$BACKUP_DIR/ubuntu-mirrors.list.$TIMESTAMP.bak"
    log_success "APT sources backup created at $BACKUP_DIR/ubuntu-mirrors.list.$TIMESTAMP.bak"
fi

# Clean up duplicate entries by creating a new clean file
if [ -f /etc/apt/sources.list.d/ubuntu-mirrors.list ]; then
    log_info "Cleaning up duplicate entries in ubuntu-mirrors.list"
    
    # Create a clean version with unique entries only
    cat > /etc/apt/sources.list.d/ubuntu-mirrors.list.new << EOF
# Ubuntu mirrors - cleaned on $(date)
deb http://mirror.server.net/ubuntu noble main restricted universe multiverse
deb http://mirror.server.net/ubuntu noble-updates main restricted universe multiverse
deb http://mirror.server.net/ubuntu noble-security main restricted universe multiverse
deb http://mirror.server.net/ubuntu noble-backports main restricted universe multiverse
EOF

    # Replace the old file with the new one
    mv /etc/apt/sources.list.d/ubuntu-mirrors.list.new /etc/apt/sources.list.d/ubuntu-mirrors.list
    log_success "Cleaned up duplicate APT sources"
fi

# Update APT after fixing sources
log_info "Updating APT sources..."
apt-get update
log_success "APT sources updated"

save_state "apt_sources_fixed"

# 2. Resolve package conflicts
log_info "Resolving package conflicts..."

# Check if iptables-persistent is installed and remove it if it conflicts with ufw
if dpkg -l | grep -q iptables-persistent; then
    log_info "Removing iptables-persistent to resolve conflict with ufw"
    apt-get remove -y iptables-persistent
    log_success "Removed iptables-persistent"
fi

# Make sure ufw is installed and configured
log_info "Configuring ufw firewall (preserving RDP access)..."

# Backup existing ufw rules
if [ -f /etc/ufw/user.rules ]; then
    cp /etc/ufw/user.rules "$BACKUP_DIR/ufw-rules.$TIMESTAMP.bak"
    log_success "UFW rules backup created"
fi

# Reset ufw to default
ufw --force reset

# Configure basic rules
log_info "Setting up basic firewall rules with ufw"

# Allow SSH (port 22)
ufw allow 22/tcp comment 'SSH access'

# Allow HTTP and HTTPS (ports 80, 443)
ufw allow 80/tcp comment 'HTTP access'
ufw allow 443/tcp comment 'HTTPS access'

# Allow RDP (port 3389)
ufw allow 3389/tcp comment 'RDP access'

# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Enable ufw
echo "y" | ufw enable
ufw status verbose

log_success "Firewall configured with ufw (RDP access preserved)"
save_state "firewall_configured"

# 3. Install essential security packages
log_info "Installing essential security packages..."

# Install security packages (avoiding the problematic ones)
apt-get install -y fail2ban apparmor apparmor-utils unattended-upgrades net-tools tcpdump rsyslog

# Configure fail2ban for SSH protection
if [ -f /etc/fail2ban/jail.conf ]; then
    cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    sed -i 's/bantime  = 10m/bantime  = 1h/' /etc/fail2ban/jail.local
    sed -i 's/maxretry = 5/maxretry = 3/' /etc/fail2ban/jail.local
    systemctl restart fail2ban
    log_success "Fail2ban configured with stricter settings"
fi

# Configure unattended upgrades for security updates
if [ -f /etc/apt/apt.conf.d/50unattended-upgrades ]; then
    sed -i 's|//Unattended-Upgrade::Remove-Unused-Dependencies "false";|Unattended-Upgrade::Remove-Unused-Dependencies "true";|' /etc/apt/apt.conf.d/50unattended-upgrades
    sed -i 's|//Unattended-Upgrade::Automatic-Reboot "false";|Unattended-Upgrade::Automatic-Reboot "true";|' /etc/apt/apt.conf.d/50unattended-upgrades
    log_success "Unattended upgrades configured for automatic security updates"
fi

# Create network restore script in case of lockout
cat > /root/restore-network.sh << 'EOF'
#!/bin/bash
# Emergency network restore script
# Run this if you get locked out of your server

# Disable ufw
ufw disable

# Allow all incoming connections
iptables -P INPUT ACCEPT
iptables -P FORWARD ACCEPT
iptables -P OUTPUT ACCEPT

# Flush all rules
iptables -F
iptables -X

echo "Network reset complete. All ports are now open."
echo "IMPORTANT: Re-secure your server as soon as possible!"
EOF

chmod +x /root/restore-network.sh
log_success "Created emergency network restore script at /root/restore-network.sh"

# 4. Harden SSH configuration
log_info "Hardening SSH configuration..."

# Backup SSH config
cp /etc/ssh/sshd_config "$BACKUP_DIR/sshd_config.$TIMESTAMP.bak"

# Harden SSH
sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/X11Forwarding yes/X11Forwarding no/' /etc/ssh/sshd_config
sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config

# Only restart SSH if we're not connected via SSH (to prevent lockout)
if ! ps -p $$ -o comm= | grep -q "sshd"; then
    systemctl restart sshd
    log_success "SSH hardened and restarted"
else
    log_warning "SSH hardening applied but service not restarted to prevent lockout"
    log_warning "Please restart SSH manually with: systemctl restart sshd"
fi

save_state "ssh_hardened"

# 5. System hardening
log_info "Applying system hardening..."

# Set secure permissions on system files
chmod 0700 /root
chmod 0600 /etc/shadow
chmod 0640 /etc/gshadow
chmod 0644 /etc/passwd
chmod 0644 /etc/group

# Update kernel parameters for security
cat > /etc/sysctl.d/99-security.conf << EOF
# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP broadcast requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Block SYN attacks
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Log Martians
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Increase system file descriptor limit
fs.file-max = 65535
EOF

# Apply sysctl settings
sysctl -p /etc/sysctl.d/99-security.conf

# Set up login.defs password policies
sed -i 's/PASS_MAX_DAYS\t99999/PASS_MAX_DAYS\t90/' /etc/login.defs
sed -i 's/PASS_MIN_DAYS\t0/PASS_MIN_DAYS\t1/' /etc/login.defs
sed -i 's/PASS_WARN_AGE\t7/PASS_WARN_AGE\t14/' /etc/login.defs

log_success "System hardening applied"
save_state "system_hardened"

# Final message
log_success "VPS APT Fix Script completed successfully!"
log_info "The following fixes were applied:"
log_info "- Duplicate APT sources cleaned up"
log_info "- Package conflicts resolved (using ufw instead of iptables-persistent)"
log_info "- Firewall configured with RDP access preserved (port 3389)"
log_info "- Essential security packages installed"
log_info "- SSH hardened"
log_info "- System hardening applied"
log_info ""
log_info "Log file saved to: $LOG_FILE"
log_info "Backups saved to: $BACKUP_DIR"
log_info "Emergency network restore script: /root/restore-network.sh"

save_state "completed"
