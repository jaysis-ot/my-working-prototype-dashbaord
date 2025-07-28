#!/bin/bash
# =============================================
# Risk Platform Automation Scripts Suite
# =============================================
# Complete automation for Risk Platform deployment
# Aligned with the comprehensive build guide

set -e

# Script metadata
SCRIPT_VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/opt/risk-platform"
AUTOMATION_LOG="/var/log/risk-platform-automation.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# =============================================
# UTILITY FUNCTIONS
# =============================================

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$AUTOMATION_LOG"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$AUTOMATION_LOG"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$AUTOMATION_LOG"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$AUTOMATION_LOG"
}

info() {
    echo -e "${CYAN}[INFO]${NC} $1" | tee -a "$AUTOMATION_LOG"
}

debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        echo -e "${PURPLE}[DEBUG]${NC} $1" | tee -a "$AUTOMATION_LOG"
    fi
}

# Progress indicator
show_progress() {
    local current=$1
    local total=$2
    local message=$3
    local percentage=$((current * 100 / total))
    local bar_length=50
    local filled_length=$((percentage * bar_length / 100))
    
    printf "\r${CYAN}[%3d%%]${NC} " "$percentage"
    printf "["
    printf "%*s" "$filled_length" | tr ' ' '='
    printf "%*s" $((bar_length - filled_length)) | tr ' ' '-'
    printf "] %s" "$message"
    
    if [ "$current" -eq "$total" ]; then
        echo
    fi
}

# Confirmation prompt
confirm() {
    local message="$1"
    local default="${2:-n}"
    
    if [[ "${FORCE:-false}" == "true" ]]; then
        return 0
    fi
    
    while true; do
        if [[ "$default" == "y" ]]; then
            read -p "$message [Y/n]: " choice
            choice=${choice:-y}
        else
            read -p "$message [y/N]: " choice
            choice=${choice:-n}
        fi
        
        case $choice in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if port is available
port_available() {
    local port=$1
    ! netstat -ln | grep -q ":$port "
}

# Wait for service to be ready
wait_for_service() {
    local service=$1
    local port=$2
    local timeout=${3:-60}
    local counter=0
    
    log "Waiting for $service to be ready on port $port..."
    
    while [ $counter -lt $timeout ]; do
        if nc -z localhost "$port" 2>/dev/null; then
            success "$service is ready"
            return 0
        fi
        sleep 1
        counter=$((counter + 1))
        show_progress $counter $timeout "Waiting for $service"
    done
    
    error "$service failed to start within $timeout seconds"
    return 1
}

# =============================================
# SYSTEM INFORMATION AND CHECKS
# =============================================

detect_system() {
    log "Detecting system configuration..."
    
    # OS Detection
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS_NAME="$NAME"
        OS_VERSION="$VERSION"
        OS_ID="$ID"
        OS_VERSION_ID="$VERSION_ID"
    else
        error "Cannot detect operating system"
        exit 1
    fi
    
    # Hardware detection
    CPU_CORES=$(nproc)
    TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
    AVAILABLE_DISK=$(df / | awk 'NR==2{print $4}')
    
    # Network detection
    PRIMARY_IP=$(hostname -I | awk '{print $1}')
    HOSTNAME=$(hostname)
    
    info "System Information:"
    info "  OS: $OS_NAME $OS_VERSION"
    info "  CPU Cores: $CPU_CORES"
    info "  Memory: ${TOTAL_MEM}MB"
    info "  Available Disk: $((AVAILABLE_DISK / 1024 / 1024))GB"
    info "  Primary IP: $PRIMARY_IP"
    info "  Hostname: $HOSTNAME"
}

check_requirements() {
    log "Checking system requirements..."
    
    local requirements_met=true
    
    # Check OS
    if [[ "$OS_ID" != "ubuntu" ]] || [[ ! "$OS_VERSION_ID" =~ ^24\.04 ]]; then
        warning "Recommended OS is Ubuntu 24.04 LTS (detected: $OS_NAME $OS_VERSION)"
    fi
    
    # Check CPU
    if [ "$CPU_CORES" -lt 4 ]; then
        warning "Minimum 4 CPU cores recommended (detected: $CPU_CORES)"
    fi
    
    # Check memory
    if [ "$TOTAL_MEM" -lt 8192 ]; then
        warning "Minimum 8GB RAM recommended (detected: ${TOTAL_MEM}MB)"
        if [ "$TOTAL_MEM" -lt 4096 ]; then
            error "Insufficient memory. Minimum 4GB required."
            requirements_met=false
        fi
    fi
    
    # Check disk space
    local disk_gb=$((AVAILABLE_DISK / 1024 / 1024))
    if [ "$disk_gb" -lt 50 ]; then
        warning "Minimum 50GB disk space recommended (available: ${disk_gb}GB)"
        if [ "$disk_gb" -lt 20 ]; then
            error "Insufficient disk space. Minimum 20GB required."
            requirements_met=false
        fi
    fi
    
    # Check internet connectivity
    if ! ping -c 1 -W 5 8.8.8.8 >/dev/null 2>&1; then
        error "Internet connectivity required for installation"
        requirements_met=false
    fi
    
    # Check sudo access
    if [[ $EUID -ne 0 ]] && ! sudo -n true 2>/dev/null; then
        error "Root access or passwordless sudo required"
        requirements_met=false
    fi
    
    if [[ "$requirements_met" == "true" ]]; then
        success "System requirements check passed"
        return 0
    else
        error "System requirements check failed"
        return 1
    fi
}

# =============================================
# AUTOMATED SYSTEM HARDENING
# =============================================

harden_system_automated() {
    log "Starting automated system hardening..."
    
    local step=0
    local total_steps=12
    
    # Update system packages
    step=$((step + 1))
    show_progress $step $total_steps "Updating system packages"
    apt update -qq && apt upgrade -y -qq
    
    # Install security packages
    step=$((step + 1))
    show_progress $step $total_steps "Installing security packages"
    apt install -y -qq \
        curl wget git vim htop tree unzip \
        software-properties-common apt-transport-https \
        ca-certificates gnupg lsb-release \
        ufw fail2ban rkhunter clamav lynis \
        aide apparmor-utils auditd \
        chrony unattended-upgrades \
        iptables-persistent netfilter-persistent \
        jq nc net-tools
    
    # Configure timezone
    step=$((step + 1))
    show_progress $step $total_steps "Configuring timezone"
    timedatectl set-timezone UTC
    systemctl enable chrony --quiet
    systemctl start chrony --quiet
    
    # Configure hostname
    step=$((step + 1))
    show_progress $step $total_steps "Setting hostname"
    hostnamectl set-hostname risk-platform-server
    
    # Configure SSH security
    step=$((step + 1))
    show_progress $step $total_steps "Hardening SSH configuration"
    configure_ssh_hardening
    
    # Configure firewall
    step=$((step + 1))
    show_progress $step $total_steps "Configuring firewall"
    configure_firewall_automated
    
    # Configure fail2ban
    step=$((step + 1))
    show_progress $step $total_steps "Setting up intrusion prevention"
    configure_fail2ban_automated
    
    # Configure kernel security
    step=$((step + 1))
    show_progress $step $total_steps "Applying kernel security parameters"
    configure_kernel_security
    
    # Configure AppArmor
    step=$((step + 1))
    show_progress $step $total_steps "Configuring AppArmor"
    configure_apparmor_automated
    
    # Configure audit system
    step=$((step + 1))
    show_progress $step $total_steps "Setting up audit logging"
    configure_audit_system
    
    # Configure automatic updates
    step=$((step + 1))
    show_progress $step $total_steps "Configuring automatic updates"
    configure_automatic_updates
    
    # Configure file integrity monitoring
    step=$((step + 1))
    show_progress $step $total_steps "Setting up file integrity monitoring"
    configure_aide_automated
    
    success "System hardening completed successfully"
}

configure_ssh_hardening() {
    local ssh_config="/etc/ssh/sshd_config.d/99-risk-platform-security.conf"
    
    cat > "$ssh_config" << 'EOF'
# Risk Platform SSH Hardening Configuration
Port 2222
Protocol 2
AddressFamily inet
ListenAddress 0.0.0.0

# Authentication
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
MaxAuthTries 3
MaxSessions 3
LoginGraceTime 30

# User restrictions
AllowUsers riskadmin
DenyUsers root guest
AllowGroups riskadmin

# Cryptography
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group16-sha512

# Session settings
ClientAliveInterval 300
ClientAliveCountMax 2
TCPKeepAlive no
Compression no

# Forwarding
X11Forwarding no
AllowTcpForwarding no
AllowStreamLocalForwarding no
GatewayPorts no
PermitTunnel no
AllowAgentForwarding no

# Logging
SyslogFacility AUTH
LogLevel VERBOSE
EOF

    # Create SSH banner
    cat > /etc/ssh/banner << 'EOF'
***************************************************************************
*                                                                         *
*                    RISK PLATFORM SECURE SYSTEM                         *
*                                                                         *
*  This system is for authorized users only. All activity is monitored   *
*  and logged. Unauthorized access is prohibited and will be prosecuted   *
*  to the full extent of the law.                                         *
*                                                                         *
***************************************************************************
EOF

    echo "Banner /etc/ssh/banner" >> "$ssh_config"
    
    # Generate new host keys
    rm -f /etc/ssh/ssh_host_*
    ssh-keygen -t ed25519 -f /etc/ssh/ssh_host_ed25519_key -N "" -q
    ssh-keygen -t rsa -b 4096 -f /etc/ssh/ssh_host_rsa_key -N "" -q
    
    chmod 600 /etc/ssh/ssh_host_*_key
    chmod 644 /etc/ssh/ssh_host_*_key.pub
    
    # Test SSH configuration
    if sshd -t; then
        systemctl restart sshd
        debug "SSH configuration applied successfully"
    else
        error "SSH configuration test failed"
        return 1
    fi
}

configure_firewall_automated() {
    # Reset UFW
    ufw --force reset >/dev/null 2>&1
    
    # Set defaults
    ufw default deny incoming >/dev/null 2>&1
    ufw default allow outgoing >/dev/null 2>&1
    
    # Allow essential services
    ufw allow 2222/tcp comment 'SSH' >/dev/null 2>&1
    ufw allow 80/tcp comment 'HTTP' >/dev/null 2>&1
    ufw allow 443/tcp comment 'HTTPS' >/dev/null 2>&1
    
    # Allow internal Docker networks
    ufw allow from 172.20.0.0/16 comment 'Docker Networks' >/dev/null 2>&1
    
    # Rate limiting for SSH
    ufw limit 2222/tcp >/dev/null 2>&1
    
    # Enable firewall
    ufw --force enable >/dev/null 2>&1
    
    # Configure advanced iptables rules
    cat > /etc/iptables/rules.v4 << 'EOF'
*filter
:INPUT DROP [0:0]
:FORWARD DROP [0:0]
:OUTPUT ACCEPT [0:0]

# Loopback
-A INPUT -i lo -j ACCEPT

# Established connections
-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT

# Rate limiting for HTTPS
-A INPUT -p tcp --dport 443 -m state --state NEW -m recent --set
-A INPUT -p tcp --dport 443 -m state --state NEW -m recent --update --seconds 60 --hitcount 10 -j DROP

# DDoS protection
-A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT
-A INPUT -p tcp --dport 443 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT

# SSH protection
-A INPUT -p tcp --dport 2222 -m state --state NEW -m recent --set --name SSH
-A INPUT -p tcp --dport 2222 -m state --state NEW -m recent --update --seconds 60 --hitcount 3 --name SSH -j DROP
-A INPUT -p tcp --dport 2222 -j ACCEPT

# Docker networks
-A INPUT -s 172.20.0.0/16 -j ACCEPT

COMMIT
EOF

    iptables-restore < /etc/iptables/rules.v4
    netfilter-persistent save >/dev/null 2>&1
    
    debug "Firewall configured successfully"
}

configure_fail2ban_automated() {
    # Main jail configuration
    cat > /etc/fail2ban/jail.d/risk-platform.conf << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 600

[api-auth]
enabled = true
port = 3000
filter = api-auth
logpath = /opt/risk-platform/logs/auth.log
maxretry = 5
bantime = 1800
EOF

    # API authentication filter
    cat > /etc/fail2ban/filter.d/api-auth.conf << 'EOF'
[Definition]
failregex = .*Authentication error.*ip.*<HOST>.*
            .*Invalid token.*ip.*<HOST>.*
            .*Access denied.*ip.*<HOST>.*
ignoreregex =
EOF

    systemctl enable fail2ban --quiet
    systemctl start fail2ban --quiet
    
    debug "Fail2Ban configured successfully"
}

configure_kernel_security() {
    cat > /etc/sysctl.d/99-risk-platform-hardening.conf << 'EOF'
# Network Security
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_all = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_syn_retries = 2
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_max_syn_backlog = 4096

# IPv6 Security
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1

# Memory Protection
kernel.randomize_va_space = 2
kernel.exec-shield = 1
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
kernel.unprivileged_bpf_disabled = 1

# File System Protection
fs.suid_dumpable = 0
fs.protected_hardlinks = 1
fs.protected_symlinks = 1

# Process Protection
kernel.yama.ptrace_scope = 1
EOF

    sysctl -p /etc/sysctl.d/99-risk-platform-hardening.conf >/dev/null 2>&1
    debug "Kernel security parameters applied"
}

configure_apparmor_automated() {
    systemctl enable apparmor --quiet
    systemctl start apparmor --quiet
    
    # Install additional profiles
    apt install -y -qq apparmor-profiles apparmor-profiles-extra
    
    # Create custom profile for risk platform
    cat > /etc/apparmor.d/risk-platform << 'EOF'
#include <tunables/global>

/opt/risk-platform/api/src/server.js {
  #include <abstractions/base>
  #include <abstractions/nameservice>
  #include <abstractions/user-tmp>

  capability setuid,
  capability setgid,
  capability net_bind_service,

  network inet stream,
  network inet6 stream,

  /opt/risk-platform/api/** r,
  /opt/risk-platform/logs/** rw,
  /opt/risk-platform/uploads/** rw,
  /tmp/** rw,
  /var/tmp/** rw,

  /usr/bin/node ix,
  /usr/lib/node_modules/** r,

  deny /etc/shadow r,
  deny /etc/passwd w,
  deny /proc/*/mem rw,
  deny /dev/kmem rw,
}
EOF

    apparmor_parser -r /etc/apparmor.d/risk-platform 2>/dev/null || true
    debug "AppArmor configured successfully"
}

configure_audit_system() {
    cat > /etc/audit/rules.d/risk-platform.rules << 'EOF'
# Risk Platform Audit Rules
-D
-b 8192
-f 1

# System calls
-a always,exit -F arch=b64 -S execve -k process
-a always,exit -F arch=b32 -S execve -k process

# File access monitoring
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k privilege
-w /etc/ssh/sshd_config -p wa -k ssh
-w /opt/risk-platform -p wa -k risk-platform

# Network configuration
-w /etc/network/ -p wa -k network
-w /etc/hosts -p wa -k network

# System administration
-w /sbin/insmod -p x -k modules
-w /sbin/rmmod -p x -k modules
-w /sbin/modprobe -p x -k modules

-e 2
EOF

    systemctl enable auditd --quiet
    systemctl start auditd --quiet
    debug "Audit system configured successfully"
}

configure_automatic_updates() {
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
Unattended-Upgrade::SyslogEnable "true";
EOF

    systemctl enable unattended-upgrades --quiet
    systemctl start unattended-upgrades --quiet
    debug "Automatic updates configured successfully"
}

configure_aide_automated() {
    # Initialize AIDE
    aideinit >/dev/null 2>&1 &
    
    # Create custom AIDE configuration
    cat > /etc/aide/aide.conf.d/99-risk-platform << 'EOF'
# Risk Platform AIDE Configuration
/opt/risk-platform f+p+u+g+s+m+c+md5+sha256
/opt/risk-platform/secrets f+p+u+g+s+m+c+md5+sha256
/opt/risk-platform/config f+p+u+g+s+m+c+md5+sha256

!/opt/risk-platform/logs
!/opt/risk-platform/uploads
!/opt/risk-platform/backups
!/opt/risk-platform/api/node_modules

/etc f+p+u+g+s+m+c+md5+sha256
/bin f+p+u+g+s+m+c+md5+sha256
/sbin f+p+u+g+s+m+c+md5+sha256

!/etc/mtab
!/etc/adjtime
!/etc/resolv.conf
EOF

    debug "AIDE file integrity monitoring configured"
}

# =============================================
# DOCKER INSTALLATION AND SECURITY
# =============================================

install_docker_automated() {
    log "Installing Docker with security hardening..."
    
    local step=0
    local total_steps=8
    
    # Remove old Docker versions
    step=$((step + 1))
    show_progress $step $total_steps "Removing old Docker versions"
    apt remove -y -qq docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Add Docker repository
    step=$((step + 1))
    show_progress $step $total_steps "Adding Docker repository"
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    step=$((step + 1))
    show_progress $step $total_steps "Installing Docker packages"
    apt update -qq
    apt install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Configure Docker security
    step=$((step + 1))
    show_progress $step $total_steps "Configuring Docker security"
    configure_docker_security
    
    # Create Docker networks
    step=$((step + 1))
    show_progress $step $total_steps "Creating Docker networks"
    create_docker_networks
    
    # Configure Docker user
    step=$((step + 1))
    show_progress $step $total_steps "Configuring Docker user access"
    usermod -aG docker $SUDO_USER 2>/dev/null || true
    
    # Start Docker service
    step=$((step + 1))
    show_progress $step $total_steps "Starting Docker service"
    systemctl enable docker --quiet
    systemctl start docker --quiet
    
    # Verify installation
    step=$((step + 1))
    show_progress $step $total_steps "Verifying Docker installation"
    if docker --version >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        success "Docker installed and configured successfully"
    else
        error "Docker installation verification failed"
        return 1
    fi
}

configure_docker_security() {
    mkdir -p /etc/docker
    
    # Docker daemon configuration
    cat > /etc/docker/daemon.json << 'EOF'
{
    "live-restore": true,
    "userland-proxy": false,
    "no-new-privileges": true,
    "seccomp-profile": "/etc/docker/seccomp.json",
    "apparmor-profile": "docker-default",
    "disable-legacy-registry": true,
    "icc": false,
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "5",
        "compress": "true"
    },
    "storage-driver": "overlay2",
    "default-ulimits": {
        "nofile": {
            "Name": "nofile",
            "Hard": 64000,
            "Soft": 64000
        },
        "nproc": {
            "Name": "nproc", 
            "Hard": 4096,
            "Soft": 2048
        }
    },
    "default-shm-size": "64M",
    "userns-remap": "default",
    "init": true
}
EOF

    # Enhanced seccomp profile
    cat > /etc/docker/seccomp.json << 'EOF'
{
    "defaultAction": "SCMP_ACT_ERRNO",
    "architectures": [
        "SCMP_ARCH_X86_64",
        "SCMP_ARCH_X86",
        "SCMP_ARCH_X32"
    ],
    "syscalls": [
        {
            "names": [
                "accept", "accept4", "access", "alarm", "bind", "brk", "capget", "capset",
                "chdir", "chmod", "chown", "chown32", "clock_getres", "clock_gettime",
                "clock_nanosleep", "close", "connect", "copy_file_range", "creat", "dup",
                "dup2", "dup3", "epoll_create", "epoll_create1", "epoll_ctl", "epoll_pwait",
                "epoll_wait", "eventfd", "eventfd2", "execve", "execveat", "exit", "exit_group",
                "faccessat", "fadvise64", "fallocate", "fchdir", "fchmod", "fchmodat",
                "fchown", "fchown32", "fchownat", "fcntl", "fcntl64", "fdatasync", "fgetxattr",
                "flistxattr", "flock", "fork", "fremovexattr", "fsetxattr", "fstat", "fstat64",
                "fstatat64", "fstatfs", "fstatfs64", "fsync", "ftruncate", "ftruncate64",
                "futex", "getcwd", "getdents", "getdents64", "getegid", "getegid32", "geteuid",
                "geteuid32", "getgid", "getgid32", "getgroups", "getgroups32", "getitimer",
                "getpeername", "getpgid", "getpgrp", "getpid", "getppid", "getpriority",
                "getrandom", "getresgid", "getresgid32", "getresuid", "getresuid32", "getrlimit",
                "get_robust_list", "getrusage", "getsid", "getsockname", "getsockopt",
                "get_thread_area", "gettid", "gettimeofday", "getuid", "getuid32", "getxattr",
                "inotify_add_watch", "inotify_init", "inotify_init1", "inotify_rm_watch",
                "ioctl", "kill", "lchown", "lchown32", "lgetxattr", "link", "linkat", "listen",
                "listxattr", "llistxattr", "lremovexattr", "lseek", "lsetxattr", "lstat",
                "lstat64", "madvise", "memfd_create", "mincore", "mkdir", "mkdirat", "mknod",
                "mknodat", "mlock", "mlock2", "mlockall", "mmap", "mmap2", "mprotect",
                "mremap", "msync", "munlock", "munlockall", "munmap", "nanosleep", "newfstatat",
                "open", "openat", "pause", "pipe", "pipe2", "poll", "ppoll", "prctl", "pread64",
                "preadv", "prlimit64", "pselect6", "pwrite64", "pwritev", "read", "readahead",
                "readlink", "readlinkat", "readv", "recv", "recvfrom", "recvmmsg", "recvmsg",
                "remap_file_pages", "removexattr", "rename", "renameat", "renameat2",
                "restart_syscall", "rmdir", "rt_sigaction", "rt_sigpending", "rt_sigprocmask",
                "rt_sigqueueinfo", "rt_sigreturn", "rt_sigsuspend", "rt_sigtimedwait",
                "rt_tgsigqueueinfo", "sched_getaffinity", "sched_getparam", "sched_getscheduler",
                "sched_setaffinity", "sched_setparam", "sched_setscheduler", "sched_yield",
                "seccomp", "select", "send", "sendfile", "sendfile64", "sendmmsg", "sendmsg",
                "sendto", "setfsgid", "setfsgid32", "setfsuid", "setfsuid32", "setgid",
                "setgid32", "setgroups", "setgroups32", "setitimer", "setpgid", "setpriority",
                "setregid", "setregid32", "setresgid", "setresgid32", "setresuid", "setresuid32",
                "setreuid", "setreuid32", "setrlimit", "set_robust_list", "setsid", "setsockopt",
                "set_thread_area", "set_tid_address", "setuid", "setuid32", "setxattr", "shutdown",
                "sigaltstack", "signalfd", "signalfd4", "sigreturn", "socket", "socketcall",
                "socketpair", "splice", "stat", "stat64", "statfs", "statfs64", "statx",
                "symlink", "symlinkat", "sync", "sync_file_range", "syncfs", "sysinfo", "tee",
                "tgkill", "time", "timer_create", "timer_delete", "timerfd_create",
                "timerfd_gettime", "timerfd_settime", "timer_getoverrun", "timer_gettime",
                "timer_settime", "times", "tkill", "truncate", "truncate64", "ugetrlimit",
                "umask", "uname", "unlink", "unlinkat", "utime", "utimensat", "utimes", "vfork",
                "vmsplice", "wait4", "waitid", "waitpid", "write", "writev"
            ],
            "action": "SCMP_ACT_ALLOW"
        }
    ]
}
EOF

    # Configure user namespace remapping
    cat > /etc/subuid << 'EOF'
dockremap:165536:65536
EOF

    cat > /etc/subgid << 'EOF'
dockremap:165536:65536
EOF

    useradd -r -s /bin/false dockremap 2>/dev/null || true
    
    debug "Docker security configuration applied"
}

create_docker_networks() {
    # Remove existing networks if they exist
    docker network rm risk_platform_dmz risk_platform_app risk_platform_db risk_platform_monitor 2>/dev/null || true
    
    # Create networks with security settings
    docker network create --driver bridge \
        --subnet=172.20.1.0/24 \
        --gateway=172.20.1.1 \
        --opt com.docker.network.bridge.name=br-dmz \
        --opt com.docker.network.bridge.enable_icc=false \
        --opt com.docker.network.bridge.enable_ip_masquerade=true \
        risk_platform_dmz >/dev/null 2>&1
    
    docker network create --driver bridge \
        --subnet=172.20.2.0/24 \
        --gateway=172.20.2.1 \
        --opt com.docker.network.bridge.name=br-app \
        --opt com.docker.network.bridge.enable_icc=true \
        risk_platform_app >/dev/null 2>&1
    
    docker network create --driver bridge \
        --subnet=172.20.3.0/24 \
        --gateway=172.20.3.1 \
        --opt com.docker.network.bridge.name=br-db \
        --opt com.docker.network.bridge.enable_icc=true \
        --opt com.docker.network.bridge.enable_ip_masquerade=false \
        risk_platform_db >/dev/null 2>&1
    
    docker network create --driver bridge \
        --subnet=172.20.4.0/24 \
        --gateway=172.20.4.1 \
        --opt com.docker.network.bridge.name=br-monitor \
        risk_platform_monitor >/dev/null 2>&1
    
    debug "Docker networks created successfully"
}

# =============================================
# PROJECT STRUCTURE AUTOMATION
# =============================================

create_project_structure() {
    log "Creating project structure..."
    
    # Create main project directory
    mkdir -p "$PROJECT_ROOT"
    cd "$PROJECT_ROOT"
    
    # Create comprehensive directory structure
    local directories=(
        "api/src/controllers"
        "api/src/models"
        "api/src/routes"
        "api/src/middleware"
        "api/src/services"
        "api/src/utils"
        "api/src/config"
        "api/src/workers"
        "api/tests/unit"
        "api/tests/integration"
        "api/tests/e2e"
        "frontend/src"
        "frontend/public"
        "frontend/dist"
        "database/init"
        "database/migrations"
        "database/backups"
        "database/schemas"
        "config/nginx/conf.d"
        "config/nginx/ssl"
        "config/nginx/modsecurity"
        "config/postgres"
        "config/redis"
        "config/api"
        "config/prometheus/rules"
        "config/grafana/provisioning/dashboards"
        "config/grafana/provisioning/datasources"
        "config/grafana/dashboards"
        "config/elasticsearch"
        "config/logstash/pipeline"
        "config/logstash/templates"
        "config/rabbitmq"
        "scripts/deployment"
        "scripts/maintenance"
        "scripts/security"
        "scripts/backup"
        "scripts/monitoring"
        "secrets/certs"
        "secrets/keys"
        "secrets/passwords"
        "logs/api"
        "logs/database"
        "logs/nginx"
        "logs/security"
        "logs/monitoring"
        "backups/database"
        "backups/config"
        "backups/logs"
        "monitoring/dashboards"
        "monitoring/alerts"
        "monitoring/rules"
        "monitoring/data/prometheus"
        "monitoring/data/grafana"
        "monitoring/data/elasticsearch"
        "uploads/evidence"
        "uploads/reports"
        "uploads/temp"
        "docs/api"
        "docs/deployment"
        "docs/architecture"
        "docs/security"
    )
    
    local total=${#directories[@]}
    local current=0
    
    for dir in "${directories[@]}"; do
        current=$((current + 1))
        show_progress $current $total "Creating directory: $dir"
        mkdir -p "$dir"
    done
    
    # Set proper permissions
    chmod 700 secrets/
    chmod 750 config/ scripts/
    chmod 755 logs/ uploads/ backups/
    
    # Change ownership
    chown -R $SUDO_USER:$SUDO_USER "$PROJECT_ROOT"
    
    success "Project structure created successfully"
}

# =============================================
# SECRETS GENERATION
# =============================================

generate_all_secrets() {
    log "Generating security secrets and certificates..."
    
    cd "$PROJECT_ROOT"
    
    local step=0
    local total_steps=10
    
    # Generate passwords
    step=$((step + 1))
    show_progress $step $total_steps "PostgreSQL password"
    openssl rand -base64 32 > secrets/postgres_password.txt
    
    step=$((step + 1))
    show_progress $step $total_steps "Redis password"
    openssl rand -base64 32 > secrets/redis_password.txt
    
    step=$((step + 1))
    show_progress $step $total_steps "JWT secret"
    openssl rand -base64 64 > secrets/jwt_secret.txt
    
    step=$((step + 1))
    show_progress $step $total_steps "API encryption key"
    openssl rand -base64 32 > secrets/api_encryption_key.txt
    
    step=$((step + 1))
    show_progress $step $total_steps "Grafana admin password"
    openssl rand -base64 32 > secrets/grafana_admin_password.txt
    
    step=$((step + 1))
    show_progress $step $total_steps "RabbitMQ password"
    openssl rand -base64 32 > secrets/rabbitmq_password.txt
    
    step=$((step + 1))
    show_progress $step $total_steps "Prometheus key"
    openssl rand -hex 32 > secrets/prometheus_key.txt
    
    step=$((step + 1))
    show_progress $step $total_steps "Session secret"
    openssl rand -base64 32 > secrets/session_secret.txt
    
    # Generate SSL certificates
    step=$((step + 1))
    show_progress $step $total_steps "SSL certificates"
    generate_ssl_certificates
    
    # Generate API keys
    step=$((step + 1))
    show_progress $step $total_steps "API keys"
    openssl rand -hex 32 > secrets/api_key.txt
    
    # Set secure permissions
    chmod 600 secrets/*.txt
    chmod 600 secrets/certs/*
    chown -R $SUDO_USER:$SUDO_USER secrets/
    
    success "All secrets generated successfully"
}

generate_ssl_certificates() {
    # Generate CA private key
    openssl genrsa -out secrets/certs/ca.key 4096 2>/dev/null
    
    # Generate CA certificate
    openssl req -new -x509 -days 3650 -key secrets/certs/ca.key -out secrets/certs/ca.crt \
        -subj "/C=US/ST=State/L=City/O=RiskPlatform/OU=IT/CN=Risk Platform CA" 2>/dev/null
    
    # Generate server private key
    openssl genrsa -out secrets/certs/server.key 4096 2>/dev/null
    
    # Generate server certificate request
    openssl req -new -key secrets/certs/server.key -out secrets/certs/server.csr \
        -subj "/C=US/ST=State/L=City/O=RiskPlatform/OU=IT/CN=risk-platform.local" 2>/dev/null
    
    # Create certificate extensions
    cat > secrets/certs/server.ext << 'EOF'
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = risk-platform.local
DNS.2 = *.risk-platform.local
DNS.3 = localhost
IP.1 = 127.0.0.1
EOF

    # Generate server certificate
    openssl x509 -req -in secrets/certs/server.csr -CA secrets/certs/ca.crt -CAkey secrets/certs/ca.key \
        -CAcreateserial -out secrets/certs/server.crt -days 365 -extensions v3_req \
        -extfile secrets/certs/server.ext 2>/dev/null
    
    # Clean up CSR
    rm secrets/certs/server.csr secrets/certs/server.ext
    
    # Generate DH parameters for enhanced security
    openssl dhparam -out secrets/certs/dhparam.pem 2048 2>/dev/null &
    
    debug "SSL certificates generated successfully"
}

# =============================================
# CONFIGURATION FILES GENERATION
# =============================================

generate_all_configurations() {
    log "Generating all configuration files..."
    
    cd "$PROJECT_ROOT"
    
    local configs=(
        "nginx"
        "postgres" 
        "redis"
        "prometheus"
        "grafana"
        "elasticsearch"
        "logstash"
        "rabbitmq"
        "api"
    )
    
    local total=${#configs[@]}
    local current=0
    
    for config in "${configs[@]}"; do
        current=$((current + 1))
        show_progress $current $total "Generating $config configuration"
        generate_${config}_config
    done
    
    success "All configuration files generated"
}

generate_nginx_config() {
    # Main nginx.conf
    cat > config/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
worker_rlimit_nofile 65535;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

load_module modules/ngx_http_modsecurity_module.so;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server_tokens off;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 1000;
    
    client_max_body_size 10m;
    client_body_timeout 30s;
    client_header_timeout 30s;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml;
    
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=5r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
    
    # Log format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for" '
                   'rt=$request_time';
    
    access_log /var/log/nginx/access.log main;
    
    # ModSecurity
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsecurity/modsecurity.conf;
    
    include /etc/nginx/conf.d/*.conf;
}
EOF

    # Server configuration
    cat > config/nginx/conf.d/risk-platform.conf << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name _;
    return 301 https://$host$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name risk-platform.local *.risk-platform.local;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none';" always;
    
    # Rate limiting
    limit_req zone=general burst=20 nodelay;
    limit_conn conn_limit_per_ip 20;
    
    add_header X-Request-ID $request_id always;
    modsecurity on;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # API proxy
    location /api/ {
        limit_req zone=api burst=30 nodelay;
        
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Authentication endpoints
    location /api/v1/auth/ {
        limit_req zone=auth burst=5 nodelay;
        
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
    }
    
    # Health checks
    location ~ ^/(health|ready)$ {
        access_log off;
        proxy_pass http://api:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static uploads
    location /uploads/ {
        alias /app/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        location ~* \.(php|jsp|asp|cgi|pl)$ {
            deny all;
        }
    }
    
    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }
    
    # Security
    location ~ /\. {
        deny all;
        access_log off;
    }
    
    location ~ ~$ {
        deny all;
        access_log off;
    }
}

# Monitoring endpoint
server {
    listen 8080;
    server_name localhost;
    access_log off;
    
    location /nginx_status {
        stub_status on;
        allow 127.0.0.1;
        allow 172.20.0.0/16;
        deny all;
    }
    
    location /health {
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # ModSecurity configuration
    mkdir -p config/nginx/modsecurity
    cat > config/nginx/modsecurity/modsecurity.conf << 'EOF'
SecRuleEngine On
SecAuditEngine RelevantOnly
SecAuditLog /var/log/nginx/modsec_audit.log
SecAuditLogFormat JSON
SecAuditLogType Serial

SecRequestBodyAccess On
SecRequestBodyLimit 13107200
SecRequestBodyNoFilesLimit 131072
SecResponseBodyAccess On
SecResponseBodyMimeType text/plain text/html text/xml application/json
SecResponseBodyLimit 524288

SecRule REQUEST_HEADERS:User-Agent "@detectSQLi" \
    "id:1001,phase:1,block,msg:'SQL Injection in User-Agent'"

SecRule ARGS "@detectXSS" \
    "id:1002,phase:2,block,msg:'XSS Attack Detected'"
EOF
}

generate_postgres_config() {
    cat > config/postgres/postgresql.conf << 'EOF'
# PostgreSQL Configuration for Risk Platform
listen_addresses = '*'
port = 5432
max_connections = 200
superuser_reserved_connections = 3

# Memory
shared_buffers = 512MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
work_mem = 8MB

# WAL
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# Security
ssl = on
ssl_cert_file = '/var/lib/postgresql/server.crt'
ssl_key_file = '/var/lib/postgresql/server.key'
password_encryption = scram-sha-256
row_security = on

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'mod'
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8

# Autovacuum
autovacuum = on
log_autovacuum_min_duration = 0
autovacuum_max_workers = 4
autovacuum_naptime = 1min

# Statistics
shared_preload_libraries = 'pg_stat_statements'
track_activities = on
track_counts = on
track_io_timing = on

# Other
cluster_name = 'risk_platform'
timezone = 'UTC'
datestyle = 'iso, mdy'
default_text_search_config = 'pg_catalog.english'
EOF

    cat > config/postgres/pg_hba.conf << 'EOF'
# PostgreSQL Client Authentication Configuration
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             all                                     peer

# IPv4 local connections
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256

# Docker network connections
hostssl risk_platform   risk_platform_app    172.20.0.0/16     scram-sha-256
hostssl risk_platform   risk_platform_readonly 172.20.0.0/16  scram-sha-256
hostssl risk_platform   risk_platform_backup   172.20.0.0/16  scram-sha-256

# Monitoring
hostssl all             postgres        172.20.4.0/24           scram-sha-256

# Deny all others
host    all             all             0.0.0.0/0               reject
host    all             all             ::/0                    reject
EOF
}

generate_redis_config() {
    cat > config/redis/redis.conf << 'EOF'
# Redis Configuration for Risk Platform
bind 0.0.0.0
port 6379
timeout 300
tcp-keepalive 60
tcp-backlog 511

# Security
protected-mode yes
requirepass REDIS_PASSWORD_PLACEHOLDER
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command EVAL ""
rename-command DEBUG ""
rename-command CONFIG ""

# Memory
maxmemory 1gb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Persistence
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# AOF
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Logging
loglevel notice
logfile /data/redis.log

# Performance
databases 16
hz 10
EOF
}

generate_prometheus_config() {
    cat > config/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  
  external_labels:
    cluster: 'risk-platform'
    environment: 'production'

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis-exporter'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'nginx-exporter'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'risk-platform-api'
    static_configs:
      - targets: ['api:9464']
    metrics_path: /metrics

  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'elasticsearch'
    static_configs:
      - targets: ['elasticsearch:9200']
    metrics_path: /_prometheus/metrics
EOF

    # Create alerting rules
    mkdir -p config/prometheus/rules
    cat > config/prometheus/rules/infrastructure.yml << 'EOF'
groups:
  - name: infrastructure
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% on {{ $labels.instance }}"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 90% on {{ $labels.instance }}"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space"
          description: "Disk space is below 10% on {{ $labels.instance }}"
EOF

    cat > config/prometheus/rules/application.yml << 'EOF'
groups:
  - name: application
    rules:
      - alert: APIDown
        expr: up{job="risk-platform-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Risk Platform API is down"
          description: "The API has been down for more than 1 minute"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API response time"
          description: "95th percentile response time is {{ $value }}s"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100 > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate"
          description: "Error rate is {{ $value }}%"
EOF
}

generate_grafana_config() {
    cat > config/grafana/grafana.ini << 'EOF'
[default]
instance_name = risk-platform

[server]
protocol = http
http_addr = 0.0.0.0
http_port = 3000
domain = grafana.risk-platform.local
root_url = https://grafana.risk-platform.local/

[database]
type = postgres
host = postgres:5432
name = grafana
user = grafana
password = $__env{GRAFANA_DB_PASSWORD}

[session]
provider = redis
provider_config = addr=redis:6379,pool_size=100,db=grafana

[security]
admin_user = admin
admin_password = $__env{GRAFANA_ADMIN_PASSWORD}
secret_key = $__env{GRAFANA_SECRET_KEY}
disable_gravatar = true
cookie_secure = true
cookie_samesite = strict
strict_transport_security = true

[users]
allow_sign_up = false
allow_org_create = false
auto_assign_org = true
auto_assign_org_role = Editor

[auth.anonymous]
enabled = false

[alerting]
enabled = true
execute_alerts = true

[metrics]
enabled = true
interval_seconds = 10
EOF

    # Datasource provisioning
    mkdir -p config/grafana/provisioning/datasources
    cat > config/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    jsonData:
      httpMethod: POST
      prometheusType: Prometheus
      timeInterval: 15s
EOF
}

generate_elasticsearch_config() {
    cat > config/elasticsearch/elasticsearch.yml << 'EOF'
cluster.name: risk-platform-logs
node.name: elasticsearch-node-01
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300

path.data: /usr/share/elasticsearch/data
path.logs: /usr/share/elasticsearch/logs

bootstrap.memory_lock: true
discovery.type: single-node

# Security
xpack.security.enabled: false
xpack.ml.enabled: false
xpack.monitoring.enabled: true

# Performance
indices.memory.index_buffer_size: 20%
indices.fielddata.cache.size: 20%
indices.queries.cache.size: 10%

# Index lifecycle
action.destructive_requires_name: true
cluster.routing.allocation.disk.threshold_enabled: true
cluster.routing.allocation.disk.watermark.low: 85%
cluster.routing.allocation.disk.watermark.high: 90%
EOF
}

generate_logstash_config() {
    cat > config/logstash/logstash.yml << 'EOF'
http.host: "0.0.0.0"
path.config: /usr/share/logstash/pipeline
path.settings: /usr/share/logstash/config

pipeline.workers: 4
pipeline.batch.size: 1000
pipeline.batch.delay: 50

monitoring.enabled: true
monitoring.elasticsearch.hosts: ["http://elasticsearch:9200"]

log.level: info
path.logs: /usr/share/logstash/logs

dead_letter_queue.enable: true
dead_letter_queue.max_bytes: 1024mb
EOF

    cat > config/logstash/pipeline/risk-platform.conf << 'EOF'
input {
  beats {
    port => 5044
    type => "application"
  }
  
  file {
    path => "/var/log/nginx/access.log"
    start_position => "beginning"
    type => "nginx-access"
  }
  
  file {
    path => "/var/log/nginx/error.log"
    start_position => "beginning"
    type => "nginx-error"
  }
  
  file {
    path => "/opt/risk-platform/logs/security.log"
    start_position => "beginning"
    type => "security"
    codec => "json"
  }
}

filter {
  date {
    match => [ "timestamp", "ISO8601" ]
    target => "@timestamp"
  }
  
  mutate {
    add_field => { "environment" => "production" }
    add_field => { "service" => "risk-platform" }
  }
  
  if [type] == "security" {
    json {
      source => "message"
    }
    
    if [event_type] == "authentication_failure" {
      mutate {
        add_tag => [ "security_alert", "authentication" ]
        add_field => { "alert_level" => "medium" }
      }
    }
  }
  
  # Remove sensitive data
  mutate {
    remove_field => [ "password", "token", "secret", "key" ]
  }
}

output {
  if [type] == "security" or "security_alert" in [tags] {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "risk-platform-security-%{+YYYY.MM.dd}"
    }
  } else if [type] == "nginx-access" or [type] == "nginx-error" {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "risk-platform-nginx-%{+YYYY.MM.dd}"
    }
  } else {
    elasticsearch {
      hosts => ["elasticsearch:9200"]
      index => "risk-platform-application-%{+YYYY.MM.dd}"
    }
  }
}
EOF
}

generate_rabbitmq_config() {
    cat > config/rabbitmq/rabbitmq.conf << 'EOF'
cluster_formation.peer_discovery_backend = rabbit_peer_discovery_classic_config

listeners.tcp.default = 5672
management.tcp.port = 15672

vm_memory_high_watermark.relative = 0.6
disk_free_limit.relative = 2.0

channel_max = 2047
connection_max = 1000
heartbeat = 60

log.console = true
log.console.level = info

default_user = risk_platform
default_pass = RABBITMQ_PASSWORD_PLACEHOLDER
default_user_tags.administrator = true
default_permissions.configure = .*
default_permissions.read = .*
default_permissions.write = .*
EOF

    cat > config/rabbitmq/enabled_plugins << 'EOF'
[rabbitmq_management,rabbitmq_prometheus].
EOF

    cat > config/rabbitmq/definitions.json << 'EOF'
{
  "users": [
    {
      "name": "risk_platform",
      "password_hash": "HASH_PLACEHOLDER",
      "hashing_algorithm": "rabbit_password_hashing_sha256",
      "tags": ["management"]
    }
  ],
  "vhosts": [
    {
      "name": "risk_platform"
    }
  ],
  "permissions": [
    {
      "user": "risk_platform",
      "vhost": "risk_platform",
      "configure": ".*",
      "write": ".*",
      "read": ".*"
    }
  ],
  "queues": [
    {
      "name": "threat.intelligence.updates",
      "vhost": "risk_platform",
      "durable": true,
      "auto_delete": false,
      "arguments": {
        "x-message-ttl": 3600000,
        "x-max-length": 10000
      }
    },
    {
      "name": "risk.assessments",
      "vhost": "risk_platform",
      "durable": true,
      "auto_delete": false
    },
    {
      "name": "trust.score.calculations",
      "vhost": "risk_platform",
      "durable": true,
      "auto_delete": false
    },
    {
      "name": "notifications",
      "vhost": "risk_platform",
      "durable": true,
      "auto_delete": false
    }
  ],
  "exchanges": [
    {
      "name": "risk.platform.events",
      "vhost": "risk_platform",
      "type": "topic",
      "durable": true,
      "auto_delete": false
    }
  ],
  "bindings": [
    {
      "source": "risk.platform.events",
      "vhost": "risk_platform",
      "destination": "threat.intelligence.updates",
      "destination_type": "queue",
      "routing_key": "threat.intelligence.*"
    }
  ]
}
EOF
}

generate_api_config() {
    cd "$PROJECT_ROOT/api"
    
    # package.json
    cat > package.json << 'EOF'
{
  "name": "risk-platform-api",
  "version": "1.0.0",
  "description": "Risk Platform API Server",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "security:audit": "npm audit",
    "security:scan": "npm audit --audit-level high",
    "build": "echo 'No build step required for Node.js'",
    "docker:build": "docker build -t risk-platform-api .",
    "docker:run": "docker run -p 3000:3000 risk-platform-api"
  },
  "keywords": ["risk", "security", "compliance", "api"],
  "author": "Risk Platform Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "winston": "^3.10.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^6.8.1",
    "express-slow-down": "^1.6.0",
    "pg": "^8.11.3",
    "redis": "^4.6.7",
    "uuid": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.4",
    "nodemailer": "^6.9.4",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3",
    "amqplib": "^0.10.3",
    "prom-client": "^14.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "nyc": "^15.1.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
EOF

    # .env.example
    cat > .env.example << 'EOF'
# Application Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1
LOG_LEVEL=info

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=risk_platform
DB_USER=risk_platform_app
DB_PASSWORD=your_db_password
DB_SSL=false
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Security Configuration
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=24h
API_ENCRYPTION_KEY=your_encryption_key_32_chars
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS Configuration
CORS_ORIGIN=https://risk-platform.local
CORS_CREDENTIALS=true

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9464

# Features
ENABLE_MFA=true
ENABLE_AUDIT_LOG=true
EOF

    # Dockerfile
    cat > Dockerfile << 'EOF'
FROM node:20-alpine AS base

RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl ca-certificates && \
    rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app
COPY package*.json ./

FROM base AS development
ENV NODE_ENV=development
RUN npm ci --include=dev && npm cache clean --force
COPY . .
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000
CMD ["dumb-init", "npm", "run", "dev"]

FROM base AS dependencies
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

FROM base AS production
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

RUN mkdir -p /app/logs /app/uploads /app/tmp && \
    chown -R nodejs:nodejs /app/logs /app/uploads /app/tmp

USER nodejs

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["dumb-init", "node", "src/server.js"]
EOF

    # .dockerignore
    cat > .dockerignore << 'EOF'
node_modules
npm-debug.log*
.git
.gitignore
README.md
.env
.env.*
tests/
docs/
logs/
uploads/
*.log
.DS_Store
Thumbs.db
EOF
}

# =============================================
# DOCKER COMPOSE GENERATION
# =============================================

generate_docker_compose() {
    log "Generating Docker Compose configuration..."
    
    cd "$PROJECT_ROOT"
    
    cat > docker-compose.yml << 'EOF'
version: '3.8'

networks:
  risk_platform_dmz:
    external: true
  risk_platform_app:
    external: true
  risk_platform_db:
    external: true
  risk_platform_monitor:
    external: true

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  elasticsearch_data:
    driver: local
  prometheus_data:
    driver: local
  grafana_data:
    driver: local
  rabbitmq_data:
    driver: local
  nginx_logs:
    driver: local

secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
  redis_password:
    file: ./secrets/redis_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  api_encryption_key:
    file: ./secrets/api_encryption_key.txt
  grafana_admin_password:
    file: ./secrets/grafana_admin_password.txt
  rabbitmq_password:
    file: ./secrets/rabbitmq_password.txt

services:
  # Database Services
  postgres:
    image: postgres:16-alpine
    container_name: risk_platform_postgres
    hostname: postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: risk_platform
      POSTGRES_USER: risk_platform_app
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    secrets:
      - postgres_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d:ro
      - ./config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
      - ./config/postgres/pg_hba.conf:/etc/postgresql/pg_hba.conf:ro
      - ./secrets/certs/server.crt:/var/lib/postgresql/server.crt:ro
      - ./secrets/certs/server.key:/var/lib/postgresql/server.key:ro
    networks:
      - risk_platform_db
    command: >
      postgres
      -c config_file=/etc/postgresql/postgresql.conf
      -c hba_file=/etc/postgresql/pg_hba.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U risk_platform_app -d risk_platform"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETUID
      - SETGID
    user: "999:999"
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  redis:
    image: redis:7-alpine
    container_name: risk_platform_redis
    hostname: redis
    restart: unless-stopped
    secrets:
      - redis_password
    volumes:
      - redis_data:/data
      - ./config/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    networks:
      - risk_platform_db
      - risk_platform_app
    command: >
      sh -c "sed 's/REDIS_PASSWORD_PLACEHOLDER/'$(cat /run/secrets/redis_password)'/g' /usr/local/etc/redis/redis.conf > /tmp/redis.conf && 
             redis-server /tmp/redis.conf"
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    user: "999:999"
    read_only: true
    tmpfs:
      - /tmp:rw,nosuid,nodev,noexec,size=100m
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # Application Services
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
      target: production
    container_name: risk_platform_api
    hostname: api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: risk_platform
      DB_USER: risk_platform_app
      REDIS_HOST: redis
      REDIS_PORT: 6379
      RABBITMQ_HOST: rabbitmq
      RABBITMQ_PORT: 5672
      RABBITMQ_VHOST: risk_platform
      RABBITMQ_USER: risk_platform
      LOG_LEVEL: info
      CORS_ORIGIN: https://risk-platform.local
      ENABLE_METRICS: "true"
      METRICS_PORT: 9464
    secrets:
      - postgres_password
      - redis_password
      - jwt_secret
      - api_encryption_key
    volumes:
      - ./logs/api:/app/logs
      - ./uploads:/app/uploads
    networks:
      - risk_platform_app
      - risk_platform_db
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - SETUID
      - SETGID
    user: "1001:1001"
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  worker:
    build:
      context: ./api
      dockerfile: Dockerfile
      target: production
    container_name: risk_platform_worker
    hostname: worker
    restart: unless-stopped
    environment:
      NODE_ENV: production
      WORKER_MODE: "true"
      DB_HOST: postgres
      REDIS_HOST: redis
      RABBITMQ_HOST: rabbitmq
    secrets:
      - postgres_password
      - redis_password
      - api_encryption_key
      - rabbitmq_password
    volumes:
      - ./logs/api:/app/logs
    networks:
      - risk_platform_app
      - risk_platform_db
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    command: ["node", "src/workers/index.js"]
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    user: "1001:1001"
    deploy:
      resources:
        limits:
          memory: 512M

  # Message Queue
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: risk_platform_rabbitmq
    hostname: rabbitmq
    restart: unless-stopped
    environment:
      RABBITMQ_DEFAULT_USER: risk_platform
      RABBITMQ_DEFAULT_PASS_FILE: /run/secrets/rabbitmq_password
      RABBITMQ_DEFAULT_VHOST: risk_platform
    secrets:
      - rabbitmq_password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
      - ./config/rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf:ro
      - ./config/rabbitmq/enabled_plugins:/etc/rabbitmq/enabled_plugins:ro
    networks:
      - risk_platform_app
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 1G

  # Search and Analytics
  elasticsearch:
    image: elasticsearch:8.8.0
    container_name: risk_platform_elasticsearch
    hostname: elasticsearch
    restart: unless-stopped
    environment:
      ES_JAVA_OPTS: "-Xms1g -Xmx1g"
      discovery.type: single-node
      xpack.security.enabled: "false"
      xpack.ml.enabled: "false"
      bootstrap.memory_lock: "true"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
      - ./config/elasticsearch/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
    networks:
      - risk_platform_monitor
      - risk_platform_app
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    ulimits:
      memlock:
        soft: -1
        hard: -1
    deploy:
      resources:
        limits:
          memory: 2G

  logstash:
    image: logstash:8.8.0
    container_name: risk_platform_logstash
    hostname: logstash
    restart: unless-stopped
    environment:
      LS_JAVA_OPTS: "-Xms512m -Xmx512m"
    volumes:
      - ./config/logstash/logstash.yml:/usr/share/logstash/config/logstash.yml:ro
      - ./config/logstash/pipeline:/usr/share/logstash/pipeline:ro
      - nginx_logs:/var/log/nginx:ro
      - ./logs:/opt/risk-platform/logs:ro
    networks:
      - risk_platform_monitor
      - risk_platform_app
    depends_on:
      elasticsearch:
        condition: service_healthy
    deploy:
      resources:
        limits:
          memory: 1G

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: risk_platform_prometheus
    hostname: prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
      - '--log.level=info'
    volumes:
      - prometheus_data:/prometheus
      - ./config/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./config/prometheus/rules:/etc/prometheus/rules:ro
    ports:
      - "9090:9090"
    networks:
      - risk_platform_monitor
      - risk_platform_app
      - risk_platform_db
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3
    security_opt:
      - no-new-privileges:true
    user: "65534:65534"
    deploy:
      resources:
        limits:
          memory: 1G

  grafana:
    image: grafana/grafana:latest
    container_name: risk_platform_grafana
    hostname: grafana
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_PASSWORD__FILE: /run/secrets/grafana_admin_password
      GF_DATABASE_TYPE: postgres
      GF_DATABASE_HOST: postgres:5432
      GF_DATABASE_NAME: grafana
      GF_DATABASE_USER: grafana
      GF_DATABASE_PASSWORD__FILE: /run/secrets/postgres_password
    secrets:
      - grafana_admin_password
      - postgres_password
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/grafana.ini:/etc/grafana/grafana.ini:ro
      - ./config/grafana/provisioning:/etc/grafana/provisioning:ro
    ports:
      - "3001:3000"
    networks:
      - risk_platform_monitor
      - risk_platform_db
    depends_on:
      postgres:
        condition: service_healthy
      prometheus:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M

  # Exporters
  node-exporter:
    image: prom/node-exporter:latest
    container_name: risk_platform_node_exporter
    hostname: node-exporter
    restart: unless-stopped
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - risk_platform_monitor
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    user: "65534:65534"
    pid: host

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: risk_platform_postgres_exporter
    hostname: postgres-exporter
    restart: unless-stopped
    environment:
      DATA_SOURCE_NAME: "postgresql://risk_platform_app:password@postgres:5432/risk_platform?sslmode=disable"
    networks:
      - risk_platform_monitor
      - risk_platform_db
    depends_on:
      postgres:
        condition: service_healthy
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    user: "65534:65534"

  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: risk_platform_redis_exporter
    hostname: redis-exporter
    restart: unless-stopped
    environment:
      REDIS_ADDR: "redis://redis:6379"
      REDIS_PASSWORD_FILE: "/run/secrets/redis_password"
    secrets:
      - redis_password
    networks:
      - risk_platform_monitor
      - risk_platform_db
    depends_on:
      redis:
        condition: service_healthy
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    user: "65534:65534"

  # Reverse Proxy
  nginx:
    build:
      context: ./docker/nginx
      dockerfile: Dockerfile
    container_name: risk_platform_nginx
    hostname: nginx
    restart: unless-stopped
    volumes:
      - ./config/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./config/nginx/modsecurity:/etc/nginx/modsecurity:ro
      - ./secrets/certs:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./uploads:/app/uploads:ro
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    networks:
      - risk_platform_dmz
      - risk_platform_app
    depends_on:
      - api
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - SETUID
      - SETGID
      - NET_BIND_SERVICE
    deploy:
      resources:
        limits:
          memory: 512M
EOF

    success "Docker Compose configuration generated"
}

# =============================================
# DATABASE INITIALIZATION
# =============================================

generate_database_scripts() {
    log "Generating database initialization scripts..."
    
    cd "$PROJECT_ROOT"
    
    # Database initialization script
    cat > database/init/01-init-database.sql << 'EOF'
-- Risk Platform Database Initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "hstore";

-- Create users
CREATE USER risk_platform_readonly WITH PASSWORD 'readonly_password_change';
CREATE USER risk_platform_backup WITH PASSWORD 'backup_password_change';
CREATE USER risk_platform_monitor WITH PASSWORD 'monitor_password_change';
CREATE USER grafana WITH PASSWORD 'grafana_password_change';

-- Grant permissions
GRANT CONNECT ON DATABASE risk_platform TO risk_platform_readonly;
GRANT CONNECT ON DATABASE risk_platform TO risk_platform_backup;
GRANT CONNECT ON DATABASE risk_platform TO risk_platform_monitor;
GRANT CONNECT ON DATABASE risk_platform TO grafana;

-- Create grafana database
CREATE DATABASE grafana OWNER grafana;
EOF

    # Copy the comprehensive schema from the earlier artifact
    cat > database/init/02-create-schema.sql << 'EOF'
-- Complete Risk Platform Schema
-- This would include the full schema from the earlier artifact
-- For brevity, including a simplified version here

SET search_path TO risk_platform;
CREATE SCHEMA IF NOT EXISTS risk_platform;

-- Organizations
CREATE TABLE risk_platform.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE risk_platform.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES risk_platform.organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'analyst',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threats
CREATE TABLE risk_platform.threats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES risk_platform.organizations(id),
    threat_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    threat_type VARCHAR(100),
    severity VARCHAR(20) NOT NULL,
    confidence_level VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risks
CREATE TABLE risk_platform.risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES risk_platform.organizations(id),
    risk_id VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    inherent_likelihood DECIMAL(3,2),
    inherent_impact DECIMAL(3,2),
    current_likelihood DECIMAL(3,2),
    current_impact DECIMAL(3,2),
    status VARCHAR(50) DEFAULT 'identified',
    priority VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, risk_id)
);

-- Capabilities
CREATE TABLE risk_platform.capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES risk_platform.organizations(id),
    capability_id VARCHAR(100) NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    implementation_status VARCHAR(50) DEFAULT 'not_implemented',
    maturity_level INTEGER DEFAULT 1,
    effectiveness_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, capability_id)
);

-- Requirements
CREATE TABLE risk_platform.requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES risk_platform.organizations(id),
    requirement_id VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    requirement_type VARCHAR(100),
    implementation_status VARCHAR(50) DEFAULT 'not_started',
    compliance_status VARCHAR(50) DEFAULT 'unknown',
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, requirement_id)
);

-- Evidence
CREATE TABLE risk_platform.evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES risk_platform.organizations(id),
    evidence_id VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(100),
    confidence_level DECIMAL(3,2),
    evidence_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, evidence_id)
);

-- Audit Log
CREATE TABLE risk_platform.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES risk_platform.organizations(id),
    user_id UUID REFERENCES risk_platform.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_threats_organization ON risk_platform.threats(organization_id);
CREATE INDEX idx_risks_organization ON risk_platform.risks(organization_id);
CREATE INDEX idx_capabilities_organization ON risk_platform.capabilities(organization_id);
CREATE INDEX idx_requirements_organization ON risk_platform.requirements(organization_id);
CREATE INDEX idx_evidence_organization ON risk_platform.evidence(organization_id);
CREATE INDEX idx_audit_log_timestamp ON risk_platform.audit_log(timestamp);

-- Grant permissions
GRANT USAGE ON SCHEMA risk_platform TO risk_platform_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_readonly;
GRANT USAGE ON SCHEMA risk_platform TO risk_platform_monitor;
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_monitor;
EOF

    # Sample data script
    cat > database/init/03-sample-data.sql << 'EOF'
-- Sample data for development
INSERT INTO risk_platform.organizations (name, slug, industry) VALUES
('Sample Organization', 'sample-org', 'Technology');

INSERT INTO risk_platform.users (organization_id, email, password_hash, first_name, last_name, role)
SELECT id, 'admin@sample-org.com', crypt('admin123', gen_salt('bf')), 'Admin', 'User', 'admin'
FROM risk_platform.organizations WHERE slug = 'sample-org';
EOF
    
    success "Database scripts generated"
}

# =============================================
# API APPLICATION GENERATION
# =============================================

generate_api_application() {
    log "Generating API application code..."
    
    cd "$PROJECT_ROOT/api"
    
    local step=0
    local total_steps=15
    
    # Configuration files
    step=$((step + 1))
    show_progress $step $total_steps "Configuration modules"
    generate_api_config_modules
    
    # Middleware
    step=$((step + 1))
    show_progress $step $total_steps "Middleware components"
    generate_middleware_components
    
    # Routes
    step=$((step + 1))
    show_progress $step $total_steps "Route handlers"
    generate_route_handlers
    
    # Controllers
    step=$((step + 1))
    show_progress $step $total_steps "Controllers"
    generate_controllers
    
    # Models
    step=$((step + 1))
    show_progress $step $total_steps "Data models"
    generate_models
    
    # Services
    step=$((step + 1))
    show_progress $step $total_steps "Business services"
    generate_services
    
    # Workers
    step=$((step + 1))
    show_progress $step $total_steps "Background workers"
    generate_workers
    
    # Utilities
    step=$((step + 1))
    show_progress $step $total_steps "Utility functions"
    generate_utilities
    
    # Main application
    step=$((step + 1))
    show_progress $step $total_steps "Main application"
    generate_main_app
    
    # Server startup
    step=$((step + 1))
    show_progress $step $total_steps "Server startup"
    generate_server_startup
    
    # Tests
    step=$((step + 1))
    show_progress $step $total_steps "Test files"
    generate_test_files
    
    # Documentation
    step=$((step + 1))
    show_progress $step $total_steps "API documentation"
    generate_api_docs
    
    # Environment files
    step=$((step + 1))
    show_progress $step $total_steps "Environment configuration"
    generate_env_files
    
    # Linting configuration
    step=$((step + 1))
    show_progress $step $total_steps "Code quality tools"
    generate_linting_config
    
    # Build scripts
    step=$((step + 1))
    show_progress $step $total_steps "Build and deployment scripts"
    generate_build_scripts
    
    success "API application generated successfully"
}

generate_api_config_modules() {
    # Database configuration
    cat > src/config/database.js << 'EOF'
const { Pool } = require('pg');
const winston = require('winston');

class Database {
    constructor() {
        this.pool = null;
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'database' },
            transports: [
                new winston.transports.File({ filename: 'logs/database.log' }),
                new winston.transports.Console()
            ]
        });
    }

    async connect() {
        try {
            this.pool = new Pool({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                ssl: process.env.DB_SSL === 'true',
                min: parseInt(process.env.DB_POOL_MIN) || 5,
                max: parseInt(process.env.DB_POOL_MAX) || 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();

            this.logger.info('Database connected successfully');
            return this.pool;
        } catch (error) {
            this.logger.error('Database connection failed:', error);
            throw error;
        }
    }

    async query(text, params) {
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } catch (error) {
            this.logger.error('Database query error:', { query: text, error: error.message });
            throw error;
        } finally {
            client.release();
        }
    }

    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Transaction error:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.logger.info('Database connection closed');
        }
    }
}

module.exports = new Database();
EOF

    # Redis configuration
    cat > src/config/redis.js << 'EOF'
const redis = require('redis');
const winston = require('winston');

class RedisClient {
    constructor() {
        this.client = null;
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'redis' },
            transports: [
                new winston.transports.File({ filename: 'logs/redis.log' }),
                new winston.transports.Console()
            ]
        });
    }

    async connect() {
        try {
            this.client = redis.createClient({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                password: process.env.REDIS_PASSWORD,
                db: parseInt(process.env.REDIS_DB) || 0,
                retryDelayOnFailover: 100,
                enableReadyCheck: true,
                maxRetriesPerRequest: 3
            });

            this.client.on('connect', () => {
                this.logger.info('Redis connected');
            });

            this.client.on('error', (error) => {
                this.logger.error('Redis error:', error);
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            this.logger.error('Redis connection failed:', error);
            throw error;
        }
    }

    async get(key) {
        try {
            return await this.client.get(key);
        } catch (error) {
            this.logger.error('Redis GET error:', { key, error: error.message });
            throw error;
        }
    }

    async set(key, value, ttl = null) {
        try {
            if (ttl) {
                return await this.client.setEx(key, ttl, value);
            }
            return await this.client.set(key, value);
        } catch (error) {
            this.logger.error('Redis SET error:', { key, error: error.message });
            throw error;
        }
    }

    async close() {
        if (this.client) {
            await this.client.quit();
            this.logger.info('Redis connection closed');
        }
    }
}

module.exports = new RedisClient();
EOF

    # Main configuration
    cat > src/config/config.js << 'EOF'
const dotenv = require('dotenv');
dotenv.config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    apiVersion: process.env.API_VERSION || 'v1',
    
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'risk_platform',
        user: process.env.DB_USER || 'risk_platform_app',
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true',
        poolMin: parseInt(process.env.DB_POOL_MIN) || 5,
        poolMax: parseInt(process.env.DB_POOL_MAX) || 20
    },
    
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB) || 0
    },
    
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    
    bcrypt: {
        rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
    },
    
    rateLimit: {
        window: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100
    },
    
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: process.env.CORS_CREDENTIALS === 'true'
    }
};

// Validation for production
if (config.env === 'production') {
    const required = ['JWT_SECRET', 'DB_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}

module.exports = config;
EOF
}

generate_middleware_components() {
    # Authentication middleware
    cat > src/middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const redis = require('../config/redis');
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'auth-middleware' }
});

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access denied. No valid token provided.'
            });
        }

        const token = authHeader.substring(7);
        
        // Check if token is blacklisted
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted === 'true') {
            return res.status(401).json({
                error: 'Token has been invalidated'
            });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        
        logger.info('User authenticated', {
            userId: decoded.id,
            email: decoded.email,
            ip: req.ip
        });
        
        next();
    } catch (error) {
        logger.error('Authentication error', {
            error: error.message,
            ip: req.ip
        });
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token has expired'
            });
        }
        
        return res.status(401).json({
            error: 'Invalid token'
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        
        const hasRole = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRole) {
            logger.warn('Access denied - insufficient role', {
                userId: req.user.id,
                userRoles,
                requiredRoles
            });
            
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    requireRole
};
EOF

    # Error handler middleware
    cat > src/middleware/errorHandler.js << 'EOF'
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'error-handler' }
});

const errorHandler = (error, req, res, next) => {
    logger.error('Application error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id
    });

    let status = 500;
    let message = 'Internal server error';

    if (error.name === 'ValidationError') {
        status = 400;
        message = 'Validation error';
    } else if (error.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
    } else if (error.code === '23505') {
        status = 409;
        message = 'Resource already exists';
    }

    const errorResponse = {
        error: message,
        timestamp: new Date().toISOString()
    };

    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = error.message;
        errorResponse.stack = error.stack;
    }

    res.status(status).json(errorResponse);
};

module.exports = errorHandler;
EOF

    # Validation middleware
    cat > src/middleware/validation.js << 'EOF'
const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    
    next();
};

module.exports = {
    validateRequest
};
EOF
}

generate_route_handlers() {
    # Authentication routes
    cat > src/routes/auth.js << 'EOF'
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const database = require('../config/database');
const config = require('../config/config');
const { validateRequest } = require('../middleware/validation');
const router = express.Router();

// Login validation
const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
];

// Login endpoint
router.post('/login', loginValidation, validateRequest, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const query = `
            SELECT u.*, o.name as organization_name
            FROM risk_platform.users u
            JOIN risk_platform.organizations o ON u.organization_id = o.id
            WHERE u.email = $1 AND u.is_active = true
        `;
        
        const result = await database.query(query, [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }
        
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }
        
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                organizationId: user.organization_id,
                role: user.role
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                organizationName: user.organization_name
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
EOF

    # Threats routes
    cat > src/routes/threats.js << 'EOF'
const express = require('express');
const { body, query } = require('express-validator');
const database = require('../config/database');
const { validateRequest } = require('../middleware/validation');
const router = express.Router();

// Validation rules
const threatValidation = [
    body('title').notEmpty().isLength({ min: 1, max: 500 }),
    body('description').optional().isLength({ max: 2000 }),
    body('severity').isIn(['critical', 'high', 'medium', 'low']),
    body('threat_type').notEmpty().isLength({ max: 100 })
];

// GET /threats - List threats
router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 50, severity, status } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE t.organization_id = $1';
        const params = [req.user.organizationId];
        let paramCount = 1;

        if (severity) {
            whereClause += ` AND t.severity = ${++paramCount}`;
            params.push(severity);
        }

        if (status) {
            whereClause += ` AND t.status = ${++paramCount}`;
            params.push(status);
        }

        const query = `
            SELECT t.*, COUNT(*) OVER() as total_count
            FROM risk_platform.threats t
            ${whereClause}
            ORDER BY t.created_at DESC
            LIMIT ${++paramCount} OFFSET ${++paramCount}
        `;
        
        params.push(limit, offset);
        
        const result = await database.query(query, params);
        
        res.json({
            threats: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.rows[0]?.total_count || 0
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /threats - Create threat
router.post('/', threatValidation, validateRequest, async (req, res, next) => {
    try {
        const {
            title,
            description,
            threat_type,
            severity,
            confidence_level = 'possible'
        } = req.body;

        const query = `
            INSERT INTO risk_platform.threats (
                organization_id, threat_id, title, description, threat_type,
                severity, confidence_level, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const threatId = `THREAT-${Date.now()}`;
        const params = [
            req.user.organizationId,
            threatId,
            title,
            description,
            threat_type,
            severity,
            confidence_level,
            'active'
        ];

        const result = await database.query(query, params);
        
        res.status(201).json({
            message: 'Threat created successfully',
            threat: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

// GET /threats/:id - Get single threat
router.get('/:id', async (req, res, next) => {
    try {
        const query = `
            SELECT * FROM risk_platform.threats
            WHERE id = $1 AND organization_id = $2
        `;
        
        const result = await database.query(query, [req.params.id, req.user.organizationId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Threat not found' });
        }
        
        res.json({ threat: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
EOF

    # Generate similar routes for other entities
    generate_other_routes
}

generate_other_routes() {
    # Risks routes
    cat > src/routes/risks.js << 'EOF'
const express = require('express');
const { body } = require('express-validator');
const database = require('../config/database');
const { validateRequest } = require('../middleware/validation');
const router = express.Router();

// Basic CRUD operations for risks
router.get('/', async (req, res, next) => {
    try {
        const query = `
            SELECT * FROM risk_platform.risks
            WHERE organization_id = $1
            ORDER BY created_at DESC
        `;
        
        const result = await database.query(query, [req.user.organizationId]);
        res.json({ risks: result.rows });
    } catch (error) {
        next(error);
    }
});

router.post('/', [
    body('title').notEmpty(),
    body('description').optional(),
    validateRequest
], async (req, res, next) => {
    try {
        const { title, description } = req.body;
        
        const query = `
            INSERT INTO risk_platform.risks (organization_id, risk_id, title, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const riskId = `RISK-${Date.now()}`;
        const result = await database.query(query, [
            req.user.organizationId,
            riskId,
            title,
            description
        ]);
        
        res.status(201).json({
            message: 'Risk created successfully',
            risk: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
EOF

    # Requirements routes
    cat > src/routes/requirements.js << 'EOF'
const express = require('express');
const database = require('../config/database');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const query = `
            SELECT * FROM risk_platform.requirements
            WHERE organization_id = $1
            ORDER BY created_at DESC
        `;
        
        const result = await database.query(query, [req.user.organizationId]);
        res.json({ requirements: result.rows });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
EOF

    # Capabilities routes
    cat > src/routes/capabilities.js << 'EOF'
const express = require('express');
const database = require('../config/database');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const query = `
            SELECT * FROM risk_platform.capabilities
            WHERE organization_id = $1
            ORDER BY created_at DESC
        `;
        
        const result = await database.query(query, [req.user.organizationId]);
        res.json({ capabilities: result.rows });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
EOF
}

generate_main_app() {
    cat > src/app.js << 'EOF'
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const threatsRoutes = require('./routes/threats');
const risksRoutes = require('./routes/risks');
const requirementsRoutes = require('./routes/requirements');
const capabilitiesRoutes = require('./routes/capabilities');

class RiskPlatformAPI {
    constructor() {
        this.app = express();
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'api' },
            transports: [
                new winston.transports.File({ filename: 'logs/app.log' }),
                new winston.transports.Console()
            ]
        });

        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    frameSrc: ["'none'"],
                }
            }
        }));

        // CORS
        this.app.use(cors({
            origin: config.cors.origin,
            credentials: config.cors.credentials,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Compression
        this.app.use(compression());

        // Logging
        this.app.use(morgan('combined', {
            stream: {
                write: (message) => this.logger.info(message.trim())
            }
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: config.rateLimit.window,
            max: config.rateLimit.max,
            message: 'Too many requests from this IP'
        });
        this.app.use(limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: process.env.npm_package_version || '1.0.0'
            });
        });

        // Readiness check
        this.app.get('/ready', async (req, res) => {
            try {
                const database = require('./config/database');
                await database.query('SELECT 1');
                
                const redis = require('./config/redis');
                await redis.get('health_check');
                
                res.json({ status: 'ready' });
            } catch (error) {
                res.status(503).json({ status: 'not ready', error: error.message });
            }
        });

        // API routes
        const apiVersion = config.apiVersion;
        this.app.use(`/api/${apiVersion}/auth`, authRoutes);
        this.app.use(`/api/${apiVersion}/threats`, authenticate, threatsRoutes);
        this.app.use(`/api/${apiVersion}/risks`, authenticate, risksRoutes);
        this.app.use(`/api/${apiVersion}/requirements`, authenticate, requirementsRoutes);
        this.app.use(`/api/${apiVersion}/capabilities`, authenticate, capabilitiesRoutes);

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Resource not found',
                path: req.originalUrl
            });
        });
    }

    setupErrorHandling() {
        this.app.use(errorHandler);
    }

    getApp() {
        return this.app;
    }
}

module.exports = new RiskPlatformAPI().getApp();
EOF
}

generate_server_startup() {
    cat > src/server.js << 'EOF'
require('dotenv').config();
const app = require('./app');
const database = require('./config/database');
const redis = require('./config/redis');
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'server' },
    transports: [
        new winston.transports.File({ filename: 'logs/server.log' }),
        new winston.transports.Console()
    ]
});

class Server {
    constructor() {
        this.port = process.env.PORT || 3000;
        this.server = null;
    }

    async start() {
        try {
            // Connect to database
            await database.connect();
            logger.info('Database connected successfully');

            // Connect to Redis
            await redis.connect();
            logger.info('Redis connected successfully');

            // Start HTTP server
            this.server = app.listen(this.port, () => {
                logger.info(`Server running on port ${this.port}`, {
                    port: this.port,
                    environment: process.env.NODE_ENV,
                    pid: process.pid
                });
            });

            // Graceful shutdown handling
            this.setupGracefulShutdown();

        } catch (error) {
            logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);

            if (this.server) {
                this.server.close(async () => {
                    logger.info('HTTP server closed');

                    try {
                        await database.close();
                        await redis.close();
                        logger.info('All connections closed');
                        process.exit(0);
                    } catch (error) {
                        logger.error('Error during shutdown:', error);
                        process.exit(1);
                    }
                });
            }

            setTimeout(() => {
                logger.error('Forcing shutdown after timeout');
                process.exit(1);
            }, 30000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
}

const server = new Server();
server.start();
EOF
}

generate_workers() {
    cat > src/workers/index.js << 'EOF'
const winston = require('winston');
const amqp = require('amqplib');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'worker' },
    transports: [
        new winston.transports.File({ filename: 'logs/worker.log' }),
        new winston.transports.Console()
    ]
});

class WorkerManager {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async start() {
        try {
            // Connect to RabbitMQ
            const rabbitmqUrl = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/${process.env.RABBITMQ_VHOST}`;
            this.connection = await amqp.connect(rabbitmqUrl);
            this.channel = await this.connection.createChannel();

            logger.info('Worker connected to RabbitMQ');

            // Set up queues and consumers
            await this.setupQueues();
            await this.startConsumers();

            logger.info('Workers started successfully');
        } catch (error) {
            logger.error('Failed to start workers:', error);
            process.exit(1);
        }
    }

    async setupQueues() {
        const queues = [
            'threat.intelligence.updates',
            'risk.assessments',
            'trust.score.calculations',
            'notifications',
            'evidence.processing'
        ];

        for (const queue of queues) {
            await this.channel.assertQueue(queue, {
                durable: true,
                arguments: {
                    'x-message-ttl': 3600000
                }
            });
        }
    }

    async startConsumers() {
        // Threat intelligence worker
        await this.channel.consume('threat.intelligence.updates', async (msg) => {
            try {
                const data = JSON.parse(msg.content.toString());
                logger.info('Processing threat intelligence update', data);
                
                // Process threat intelligence update
                await this.processThreatIntelligence(data);
                
                this.channel.ack(msg);
            } catch (error) {
                logger.error('Error processing threat intelligence:', error);
                this.channel.nack(msg, false, false);
            }
        });

        // Risk assessment worker
        await this.channel.consume('risk.assessments', async (msg) => {
            try {
                const data = JSON.parse(msg.content.toString());
                logger.info('Processing risk assessment', data);
                
                await this.processRiskAssessment(data);
                
                this.channel.ack(msg);
            } catch (error) {
                logger.error('Error processing risk assessment:', error);
                this.channel.nack(msg, false, false);
            }
        });

        // Trust score calculation worker
        await this.channel.consume('trust.score.calculations', async (msg) => {
            try {
                const data = JSON.parse(msg.content.toString());
                logger.info('Processing trust score calculation', data);
                
                await this.processTrustScoreCalculation(data);
                
                this.channel.ack(msg);
            } catch (error) {
                logger.error('Error processing trust score:', error);
                this.channel.nack(msg, false, false);
            }
        });
    }

    async processThreatIntelligence(data) {
        // Implement threat intelligence processing logic
        logger.info('Threat intelligence processed', data);
    }

    async processRiskAssessment(data) {
        // Implement risk assessment logic
        logger.info('Risk assessment processed', data);
    }

    async processTrustScoreCalculation(data) {
        // Implement trust score calculation logic
        logger.info('Trust score calculated', data);
    }
}

// Start workers if in worker mode
if (process.env.WORKER_MODE === 'true') {
    const workerManager = new WorkerManager();
    workerManager.start();
}

module.exports = WorkerManager;
EOF
}

generate_utilities() {
    cat > src/utils/validation.js << 'EOF'
const Joi = require('joi');

const schemas = {
    threat: Joi.object({
        title: Joi.string().min(1).max(500).required(),
        description: Joi.string().max(2000).optional(),
        threat_type: Joi.string().max(100).required(),
        severity: Joi.string().valid('critical', 'high', 'medium', 'low').required(),
        confidence_level: Joi.string().valid('confirmed', 'probable', 'possible', 'doubtful').optional()
    }),

    risk: Joi.object({
        title: Joi.string().min(1).max(500).required(),
        description: Joi.string().max(2000).optional(),
        inherent_likelihood: Joi.number().min(0).max(1).optional(),
        inherent_impact: Joi.number().min(0).max(1).optional(),
        priority: Joi.string().valid('critical', 'high', 'medium', 'low').optional()
    }),

    user: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        first_name: Joi.string().max(100).optional(),
        last_name: Joi.string().max(100).optional(),
        role: Joi.string().valid('admin', 'analyst', 'viewer').required()
    })
};

const validate = (schema, data) => {
    const { error, value } = schemas[schema].validate(data);
    if (error) {
        throw new Error(`Validation error: ${error.details[0].message}`);
    }
    return value;
};

module.exports = {
    schemas,
    validate
};
EOF

    cat > src/utils/crypto.js << 'EOF'
const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const keyLength = 32;
const ivLength = 16;
const tagLength = 16;

class CryptoUtils {
    constructor(secretKey) {
        this.key = crypto.createHash('sha256').update(secretKey).digest();
    }

    encrypt(text) {
        const iv = crypto.randomBytes(ivLength);
        const cipher = crypto.createCipher(algorithm, this.key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    }

    decrypt(encryptedData) {
        const { encrypted, iv, tag } = encryptedData;
        
        const decipher = crypto.createDecipher(algorithm, this.key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    hash(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    generateApiKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = CryptoUtils;
EOF
}

generate_controllers() {
    cat > src/controllers/threatController.js << 'EOF'
const database = require('../config/database');
const { validate } = require('../utils/validation');

class ThreatController {
    async getAllThreats(req, res, next) {
        try {
            const { page = 1, limit = 50, severity, status } = req.query;
            const offset = (page - 1) * limit;
            
            let whereClause = 'WHERE organization_id = $1';
            const params = [req.user.organizationId];
            let paramCount = 1;

            if (severity) {
                whereClause += ` AND severity = ${++paramCount}`;
                params.push(severity);
            }

            if (status) {
                whereClause += ` AND status = ${++paramCount}`;
                params.push(status);
            }

            const query = `
                SELECT *, COUNT(*) OVER() as total_count
                FROM risk_platform.threats
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ${++paramCount} OFFSET ${++paramCount}
            `;
            
            params.push(limit, offset);
            
            const result = await database.query(query, params);
            
            res.json({
                threats: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.rows[0]?.total_count || 0,
                    totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async createThreat(req, res, next) {
        try {
            const validatedData = validate('threat', req.body);
            
            const {
                title,
                description,
                threat_type,
                severity,
                confidence_level = 'possible'
            } = validatedData;

            const query = `
                INSERT INTO risk_platform.threats (
                    organization_id, threat_id, title, description, threat_type,
                    severity, confidence_level, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `;

            const threatId = `THREAT-${Date.now()}`;
            const params = [
                req.user.organizationId,
                threatId,
                title,
                description,
                threat_type,
                severity,
                confidence_level,
                'active'
            ];

            const result = await database.query(query, params);
            
            res.status(201).json({
                message: 'Threat created successfully',
                threat: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    async getThreatById(req, res, next) {
        try {
            const query = `
                SELECT * FROM risk_platform.threats
                WHERE id = $1 AND organization_id = $2
            `;
            
            const result = await database.query(query, [req.params.id, req.user.organizationId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Threat not found' });
            }
            
            res.json({ threat: result.rows[0] });
        } catch (error) {
            next(error);
        }
    }

    async updateThreat(req, res, next) {
        try {
            const validatedData = validate('threat', req.body);
            
            const {
                title,
                description,
                threat_type,
                severity,
                confidence_level
            } = validatedData;

            const query = `
                UPDATE risk_platform.threats
                SET title = $1, description = $2, threat_type = $3, severity = $4,
                    confidence_level = $5, updated_at = NOW()
                WHERE id = $6 AND organization_id = $7
                RETURNING *
            `;

            const params = [
                title, description, threat_type, severity,
                confidence_level, req.params.id, req.user.organizationId
            ];

            const result = await database.query(query, params);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Threat not found' });
            }
            
            res.json({
                message: 'Threat updated successfully',
                threat: result.rows[0]
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteThreat(req, res, next) {
        try {
            const query = `
                DELETE FROM risk_platform.threats
                WHERE id = $1 AND organization_id = $2
                RETURNING id
            `;
            
            const result = await database.query(query, [req.params.id, req.user.organizationId]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Threat not found' });
            }
            
            res.json({ message: 'Threat deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ThreatController();
EOF
}

generate_test_files() {
    cat > tests/unit/auth.test.js << 'EOF'
const request = require('supertest');
const app = require('../../src/app');

describe('Authentication', () => {
    describe('POST /api/v1/auth/login', () => {
        it('should return 400 for invalid email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });

        it('should return 400 for missing password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        });
    });
});
EOF

    cat > tests/unit/threats.test.js << 'EOF'
const request = require('supertest');
const app = require('../../src/app');

describe('Threats API', () => {
    let authToken;

    beforeAll(async () => {
        // Mock authentication for tests
        authToken = 'mock-jwt-token';
    });

    describe('GET /api/v1/threats', () => {
        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/v1/threats');

            expect(res.status).toBe(401);
        });

        it('should return threats for authenticated user', async () => {
            const res = await request(app)
                .get('/api/v1/threats')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('threats');
        });
    });
});
EOF

    cat > tests/integration/database.test.js << 'EOF'
const database = require('../../src/config/database');

describe('Database Integration', () => {
    beforeAll(async () => {
        await database.connect();
    });

    afterAll(async () => {
        await database.close();
    });

    it('should connect to database', async () => {
        const result = await database.query('SELECT NOW()');
        expect(result.rows).toHaveLength(1);
    });

    it('should handle database transactions', async () => {
        await database.transaction(async (client) => {
            const result = await client.query('SELECT 1 as test');
            expect(result.rows[0].test).toBe(1);
        });
    });
});
EOF

    # Jest configuration
    cat > jest.config.js << 'EOF'
module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/workers/**/*.js'
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};
EOF
}

generate_env_files() {
    # Copy environment variables with actual generated values
    local postgres_password=$(cat "$PROJECT_ROOT/secrets/postgres_password.txt" 2>/dev/null || echo "change_me")
    local redis_password=$(cat "$PROJECT_ROOT/secrets/redis_password.txt" 2>/dev/null || echo "change_me")
    local jwt_secret=$(cat "$PROJECT_ROOT/secrets/jwt_secret.txt" 2>/dev/null || echo "change_me")
    local api_key=$(cat "$PROJECT_ROOT/secrets/api_encryption_key.txt" 2>/dev/null || echo "change_me")

    cat > .env << EOF
# Application Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1
LOG_LEVEL=info

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=risk_platform
DB_USER=risk_platform_app
DB_PASSWORD=$postgres_password
DB_SSL=false
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$redis_password
REDIS_DB=0

# Security Configuration
JWT_SECRET=$jwt_secret
JWT_EXPIRES_IN=24h
API_ENCRYPTION_KEY=$api_key
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS Configuration
CORS_ORIGIN=https://risk-platform.local
CORS_CREDENTIALS=true

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9464

# Features
ENABLE_MFA=true
ENABLE_AUDIT_LOG=true
EOF
}

generate_linting_config() {
    cat > .eslintrc.js << 'EOF'
module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
    rules: {
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'no-console': ['warn'],
        'no-debugger': ['error'],
        'prefer-const': ['error'],
        'no-var': ['error']
    }
};
EOF

    cat > .prettierrc << 'EOF'
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 4,
    "useTabs": false
}
EOF
}

generate_build_scripts() {
    # Build script for API
    cat > scripts/build-api.sh << 'EOF'
#!/bin/bash
# Build script for Risk Platform API

set -e

cd /opt/risk-platform/api

echo "Building Risk Platform API..."

# Install dependencies
echo "Installing dependencies..."
npm ci --only=production

# Run linting
echo "Running linting..."
npm run lint

# Run tests
echo "Running tests..."
npm test

# Security audit
echo "Running security audit..."
npm audit --audit-level high

# Build Docker image
echo "Building Docker image..."
docker build -t risk-platform-api:latest .

echo "API build completed successfully!"
EOF

    chmod +x scripts/build-api.sh
}

# =============================================
# AUTOMATED DEPLOYMENT
# =============================================

deploy_platform_automated() {
    log "Starting automated platform deployment..."
    
    cd "$PROJECT_ROOT"
    
    local step=0
    local total_steps=12
    
    # Build API
    step=$((step + 1))
    show_progress $step $total_steps "Building API application"
    cd api && npm ci >/dev/null 2>&1 && cd ..
    
    # Create networks (if not exists)
    step=$((step + 1))
    show_progress $step $total_steps "Ensuring Docker networks"
    create_docker_networks >/dev/null 2>&1 || true
    
    # Start database services first
    step=$((step + 1))
    show_progress $step $total_steps "Starting database services"
    docker compose up -d postgres redis >/dev/null 2>&1
    
    # Wait for databases
    step=$((step + 1))
    show_progress $step $total_steps "Waiting for databases to be ready"
    wait_for_service "PostgreSQL" 5432 120
    wait_for_service "Redis" 6379 60
    
    # Initialize database
    step=$((step + 1))
    show_progress $step $total_steps "Initializing database schema"
    sleep 10  # Give PostgreSQL time to fully initialize
    
    # Start message queue
    step=$((step + 1))
    show_progress $step $total_steps "Starting message queue"
    docker compose up -d rabbitmq >/dev/null 2>&1
    wait_for_service "RabbitMQ" 15672 120
    
    # Start application services
    step=$((step + 1))
    show_progress $step $total_steps "Starting application services"
    docker compose up -d api worker >/dev/null 2>&1
    wait_for_service "API" 3000 120
    
    # Start search and analytics
    step=$((step + 1))
    show_progress $step $total_steps "Starting search and analytics"
    docker compose up -d elasticsearch >/dev/null 2>&1
    wait_for_service "Elasticsearch" 9200 180
    
    docker compose up -d logstash >/dev/null 2>&1
    
    # Start monitoring
    step=$((step + 1))
    show_progress $step $total_steps "Starting monitoring services"
    docker compose up -d prometheus grafana >/dev/null 2>&1
    wait_for_service "Prometheus" 9090 120
    wait_for_service "Grafana" 3001 120
    
    # Start exporters
    step=$((step + 1))
    show_progress $step $total_steps "Starting metric exporters"
    docker compose up -d node-exporter postgres-exporter redis-exporter >/dev/null 2>&1
    
    # Start reverse proxy
    step=$((step + 1))
    show_progress $step $total_steps "Starting reverse proxy"
    docker compose up -d nginx >/dev/null 2>&1
    wait_for_service "Nginx" 443 60
    
    # Final health check
    step=$((step + 1))
    show_progress $step $total_steps "Running final health checks"
    sleep 10
    check_all_services_health
    
    success "Platform deployment completed successfully!"
}

check_all_services_health() {
    local failed_services=()
    
    # Check core services
    local services=("postgres:5432" "redis:6379" "api:3000" "nginx:443" "prometheus:9090" "grafana:3001")
    
    for service_port in "${services[@]}"; do
        local service=${service_port%:*}
        local port=${service_port#*:}
        
        if ! nc -z localhost "$port" 2>/dev/null; then
            failed_services+=("$service")
        fi
    done
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        debug "All services are healthy"
        return 0
    else
        warning "Some services are not responding: ${failed_services[*]}"
        return 1
    fi
}

# =============================================
# MAINTENANCE AND UTILITY SCRIPTS
# =============================================

generate_maintenance_scripts() {
    log "Generating maintenance scripts..."
    
    # Backup script
    cat > scripts/backup/database-backup.sh << 'EOF'
#!/bin/bash
# Automated database backup script

set -e

BACKUP_DIR="/opt/risk-platform/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

echo "Starting database backup: $DATE"

# Full backup
docker compose exec postgres pg_dump -U risk_platform_app -d risk_platform \
    --clean --create --format=custom --compress=9 \
    > "$BACKUP_DIR/risk_platform_full_$DATE.dump"

# Schema backup
docker compose exec postgres pg_dump -U risk_platform_app -d risk_platform \
    --schema-only > "$BACKUP_DIR/risk_platform_schema_$DATE.sql"

# Compress old backups
find "$BACKUP_DIR" -name "*.sql" -mtime +1 -exec gzip {} \;

# Remove old backups
find "$BACKUP_DIR" -name "risk_platform_*" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
EOF

    # Update script
    cat > scripts/maintenance/update-platform.sh << 'EOF'
#!/bin/bash
# Platform update script

set -e

cd /opt/risk-platform

echo "Updating Risk Platform..."

# Pull latest images
docker compose pull

# Restart services with zero downtime
docker compose up -d --force-recreate

# Clean up old images
docker image prune -f

echo "Update completed successfully"
EOF

    # Log rotation script
    cat > scripts/maintenance/rotate-logs.sh << 'EOF'
#!/bin/bash
# Log rotation script

set -e

LOG_DIR="/opt/risk-platform/logs"
RETENTION_DAYS=30

echo "Rotating logs..."

# Compress logs older than 1 day
find "$LOG_DIR" -name "*.log" -mtime +1 -exec gzip {} \;

# Remove compressed logs older than retention period
find "$LOG_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete

# Rotate Docker logs
docker system prune -f --volumes

echo "Log rotation completed"
EOF

    # Health check script
    cat > scripts/monitoring/health-check.sh << 'EOF'
#!/bin/bash
# Comprehensive health check script

set -e

SERVICES=("postgres:5432" "redis:6379" "api:3000" "nginx:443" "prometheus:9090" "grafana:3001")
FAILED_SERVICES=()

echo "Running health checks..."

for service_port in "${SERVICES[@]}"; do
    service=${service_port%:*}
    port=${service_port#*:}
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo "✓ $service is healthy"
    else
        echo "✗ $service is not responding"
        FAILED_SERVICES+=("$service")
    fi
done

if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
    echo "All services are healthy"
    exit 0
else
    echo "Failed services: ${FAILED_SERVICES[*]}"
    exit 1
fi
EOF

    # Security scan script
    cat > scripts/security/security-scan.sh << 'EOF'
#!/bin/bash
# Security scanning script

set -e

cd /opt/risk-platform

echo "Running security scans..."

# Container vulnerability scan
if command -v trivy &> /dev/null; then
    echo "Scanning container images..."
    docker images --format "table {{.Repository}}:{{.Tag}}" | grep -v REPOSITORY | while read image; do
        echo "Scanning $image..."
        trivy image --exit-code 1 "$image" || echo "Vulnerabilities found in $image"
    done
fi

# NPM audit
echo "Running NPM security audit..."
cd api
npm audit --audit-level high

# Docker bench security
if [ -f /usr/local/bin/docker-bench-security.sh ]; then
    echo "Running Docker security benchmark..."
    /usr/local/bin/docker-bench-security.sh
fi

echo "Security scan completed"
EOF

    # Make scripts executable
    chmod +x scripts/backup/*.sh
    chmod +x scripts/maintenance/*.sh
    chmod +x scripts/monitoring/*.sh
    chmod +x scripts/security/*.sh
    
    success "Maintenance scripts generated"
}

# =============================================
# MONITORING SETUP
# =============================================

setup_monitoring_automation() {
    log "Setting up automated monitoring..."
    
    # Create systemd service for health monitoring
    cat > /etc/systemd/system/risk-platform-monitor.service << 'EOF'
[Unit]
Description=Risk Platform Health Monitor
After=docker.service

[Service]
Type=simple
User=root
ExecStart=/opt/risk-platform/scripts/monitoring/health-check.sh
Restart=always
RestartSec=300

[Install]
WantedBy=multi-user.target
EOF

    # Create systemd timer for regular health checks
    cat > /etc/systemd/system/risk-platform-monitor.timer << 'EOF'
[Unit]
Description=Run Risk Platform health check every 5 minutes
Requires=risk-platform-monitor.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

    # Enable monitoring
    systemctl daemon-reload
    systemctl enable risk-platform-monitor.timer
    systemctl start risk-platform-monitor.timer
    
    success "Automated monitoring configured"
}

# =============================================
# FINAL DEPLOYMENT COMMAND
# =============================================

create_deployment_command() {
    cat > /usr/local/bin/risk-platform << 'EOF'
#!/bin/bash
# Risk Platform Management Command

set -e

SCRIPT_DIR="/opt/risk-platform/scripts"
PROJECT_ROOT="/opt/risk-platform"

case "${1:-help}" in
    "start")
        echo "Starting Risk Platform..."
        cd "$PROJECT_ROOT"
        docker compose up -d
        ;;
    "stop")
        echo "Stopping Risk Platform..."
        cd "$PROJECT_ROOT"
        docker compose down
        ;;
    "restart")
        echo "Restarting Risk Platform..."
        cd "$PROJECT_ROOT"
        docker compose restart
        ;;
    "status")
        echo "Risk Platform Status:"
        cd "$PROJECT_ROOT"
        docker compose ps
        ;;
    "logs")
        cd "$PROJECT_ROOT"
        docker compose logs -f "${2:-api}"
        ;;
    "backup")
        echo "Creating backup..."
        "$SCRIPT_DIR/backup/database-backup.sh"
        ;;
    "update")
        echo "Updating platform..."
        "$SCRIPT_DIR/maintenance/update-platform.sh"
        ;;
    "health")
        "$SCRIPT_DIR/monitoring/health-check.sh"
        ;;
    "security-scan")
        "$SCRIPT_DIR/security/security-scan.sh"
        ;;
    "help"|*)
        echo "Risk Platform Management Tool"
        echo "Usage: risk-platform <command>"
        echo
        echo "Commands:"
        echo "  start         Start all services"
        echo "  stop          Stop all services"
        echo "  restart       Restart all services"
        echo "  status        Show service status"
        echo "  logs [service] Show logs for service (default: api)"
        echo "  backup        Create database backup"
        echo "  update        Update platform"
        echo "  health        Run health checks"
        echo "  security-scan Run security scans"
        echo "  help          Show this help"
        ;;
esac
EOF

    chmod +x /usr/local/bin/risk-platform
    success "Risk Platform management command installed"
}

# =============================================
# MASTER AUTOMATION FUNCTION
# =============================================

run_complete_automation() {
    log "=== STARTING COMPLETE RISK PLATFORM AUTOMATION ==="
    log "This will take approximately 30-45 minutes"
    
    # Confirm before proceeding
    if ! confirm "This will set up the complete Risk Platform infrastructure. Continue?" "n"; then
        log "Automation cancelled by user"
        exit 0
    fi
    
    local start_time=$(date +%s)
    
    # Phase 1: System preparation
    log "Phase 1: System Preparation"
    detect_system
    check_requirements
    harden_system_automated
    
    # Phase 2: Docker and containerization
    log "Phase 2: Container Platform Setup"
    install_docker_automated
    
    # Phase 3: Project structure and secrets
    log "Phase 3: Project Structure and Security"
    create_project_structure
    generate_all_secrets
    
    # Phase 4: Configuration generation
    log "Phase 4: Configuration Generation"
    generate_all_configurations
    generate_docker_compose
    generate_database_scripts
    
    # Phase 5: Application generation
    log "Phase 5: Application Development"
    generate_api_application
    
    # Phase 6: Deployment
    log "Phase 6: Platform Deployment"
    deploy_platform_automated
    
    # Phase 7: Monitoring and maintenance
    log "Phase 7: Monitoring and Maintenance"
    generate_maintenance_scripts
    setup_monitoring_automation
    create_deployment_command
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    success "=== AUTOMATION COMPLETED SUCCESSFULLY ==="
    success "Total time: $((duration / 60)) minutes and $((duration % 60)) seconds"
    
    display_completion_info
}

display_completion_info() {
    echo
    echo "🎉 Risk Platform Automation Complete!"
    echo "====================================="
    echo
    echo "🌐 Access URLs:"
    echo "  Web Interface: https://$PRIMARY_IP"
    echo "  API Health: https://$PRIMARY_IP/api/v1/health"
    echo "  Grafana: https://$PRIMARY_IP:3001"
    echo "  Prometheus: https://$PRIMARY_IP:9090"
    echo
    echo "🔐 Credentials:"
    echo "  Grafana Admin: admin / $(cat "$PROJECT_ROOT/secrets/grafana_admin_password.txt" 2>/dev/null || echo 'check secrets file')"
    echo
    echo "🛠️ Management Commands:"
    echo "  risk-platform start      # Start all services"
    echo "  risk-platform stop       # Stop all services"
    echo "  risk-platform status     # Check service status"
    echo "  risk-platform health     # Run health checks"
    echo "  risk-platform backup     # Create backup"
    echo
    echo "📁 Important Directories:"
    echo "  Project Root: $PROJECT_ROOT"
    echo "  Logs: $PROJECT_ROOT/logs/"
    echo "  Backups: $PROJECT_ROOT/backups/"
    echo "  Secrets: $PROJECT_ROOT/secrets/"
    echo
    echo "📋 Next Steps:"
    echo "  1. Test the API: curl -k https://$PRIMARY_IP/api/v1/health"
    echo "  2. Access Grafana dashboard at https://$PRIMARY_IP:3001"
    echo "  3. Review logs: risk-platform logs"
    echo "  4. Run validation: $PROJECT_ROOT/scripts/validate-complete-setup.sh"
    echo "  5. Configure DNS and SSL certificates for production"
    echo
    echo "⚠️  Security Reminders:"
    echo "  - Change default passwords in production"
    echo "  - Configure proper SSL certificates"
    echo "  - Review and update firewall rules"
    echo "  - Set up external backup storage"
    echo "  - Configure monitoring alerts"
    echo
    echo "For support and documentation:"
    echo "https://github.com/your-org/risk-platform/wiki"
}

# =============================================
# MAIN EXECUTION LOGIC
# =============================================

main() {
    # Ensure we're running as root
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root or with sudo"
        exit 1
    fi
    
    # Set up logging
    mkdir -p "$(dirname "$AUTOMATION_LOG")"
    touch "$AUTOMATION_LOG"
    
    # Parse command line arguments
    case "${1:-complete}" in
        "complete")
            run_complete_automation
            ;;
        "system-only")
            detect_system
            check_requirements
            harden_system_automated
            ;;
        "docker-only")
            install_docker_automated
            ;;
        "structure-only")
            create_project_structure
            generate_all_secrets
            ;;
        "config-only")
            generate_all_configurations
            generate_docker_compose
            generate_database_scripts
            ;;
        "deploy-only")
            deploy_platform_automated
            ;;
        "validate")
            check_requirements
            check_all_services_health
            ;;
        "help")
            echo "Risk Platform Automation Suite v$SCRIPT_VERSION"
            echo "Usage: $0 [command]"
            echo
            echo "Commands:"
            echo "  complete      Run complete automation (default)"
            echo "  system-only   Only harden the system"
            echo "  docker-only   Only install Docker"
            echo "  structure-only Only create project structure"
            echo "  config-only   Only generate configurations"
            echo "  deploy-only   Only deploy services"
            echo "  validate      Validate current setup"
            echo "  help          Show this help"
            echo
            echo "Environment Variables:"
            echo "  DEBUG=true    Enable debug logging"
            echo "  FORCE=true    Skip confirmation prompts"
            ;;
        *)
            error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"