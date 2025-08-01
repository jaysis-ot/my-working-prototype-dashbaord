#!/bin/bash
# =========================================================================
# Risk Platform Master Deployment Script
# =========================================================================
# This script orchestrates the complete deployment of the Risk Platform
# with proper error handling, validation, state tracking, and rollback.
#
# Features:
# - Safe, idempotent execution
# - State tracking for resumable deployments
# - Validation gates between phases
# - Comprehensive rollback capabilities
# - Detailed logging and progress reporting
# - Interactive and automated modes
# - Production safety checks
#
# Usage: ./master_deploy.sh [OPTIONS]
#   Options:
#     --all                Execute all phases in sequence
#     --interactive        Run in interactive mode (select phases)
#     --resume             Resume from last successful phase
#     --phase [PHASE_NUM]  Run specific phase (1-10)
#     --rollback [PHASE]   Rollback specific phase
#     --validate-only      Run validation without deployment
#     --force              Skip confirmations (use with caution)
#     --help               Display this help message
#
# Version: 1.0.0
# Date: 2025-07-28
# =========================================================================

# Strict error handling
set -e

# =============================================
# CONFIGURATION
# =============================================

SCRIPT_VERSION="1.0.0"
PROJECT_ROOT="/opt/risk-platform"
SCRIPTS_DIR="${PROJECT_ROOT}/scripts"
AUTOMATION_DIR="${SCRIPTS_DIR}/automation"
VALIDATION_DIR="${SCRIPTS_DIR}/validation"
ROLLBACK_DIR="${SCRIPTS_DIR}/rollback"
DATABASE_DIR="${SCRIPTS_DIR}/database"
OPERATIONAL_DIR="${SCRIPTS_DIR}/operational"
SECURITY_DIR="${SCRIPTS_DIR}/security"

LOG_DIR="${PROJECT_ROOT}/logs"
DEPLOYMENT_LOG="${LOG_DIR}/deployment.log"
STATE_FILE="${PROJECT_ROOT}/.deployment_state"
LOCK_FILE="/var/lock/risk-platform-deployment.lock"
REPORT_FILE="${PROJECT_ROOT}/deployment_report.html"
TEMP_DIR="/tmp/risk-platform-deployment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Deployment phases
declare -a PHASES=(
    "System Hardening"
    "Docker Engine"
    "Project Structure"
    "Database Layer"
    "API & Monitoring"
    "Service Deployment"
    "Operational Tooling"
    "Advanced Tooling"
    "TLS & Integrations"
    "Production Hardening"
)

# Script paths
AUTOMATION_SCRIPT="${AUTOMATION_DIR}/refactored_automation_script.sh"
DATABASE_SCRIPT="${DATABASE_DIR}/database_setup_script.sh"
VALIDATE_DATABASE="${VALIDATION_DIR}/validate_database.sh"
VALIDATE_PLATFORM="${VALIDATION_DIR}/validate_platform.sh"
CREATE_ESSENTIAL="${OPERATIONAL_DIR}/create_essential_scripts.sh"
INSTALL_ESSENTIAL="${OPERATIONAL_DIR}/install_operational_scripts.sh"
CREATE_FINAL="${OPERATIONAL_DIR}/create_final_scripts.sh"
INSTALL_FINAL="${OPERATIONAL_DIR}/install_final_scripts.sh"
MANAGE_CERTS="${SECURITY_DIR}/manage_certificates.sh"

# Runtime variables
INTERACTIVE=false
RESUME=false
SPECIFIC_PHASE=""
ROLLBACK_PHASE=""
VALIDATE_ONLY=false
FORCE=false
START_TIME=$(date +%s)
DOMAIN_NAME="risk-platform.example.com"  # Default domain, can be overridden

# =============================================
# LOGGING FUNCTIONS
# =============================================

# Ensure log directory exists
mkdir -p "${LOG_DIR}"
mkdir -p "${TEMP_DIR}"

# Initialize log file
echo "===== RISK PLATFORM DEPLOYMENT $(date) =====" > "${DEPLOYMENT_LOG}"

log() {
    local level="INFO"
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${DEPLOYMENT_LOG}"
}

debug() {
    if [[ "${DEBUG:-false}" == "true" ]]; then
        local level="DEBUG"
        echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${DEPLOYMENT_LOG}"
    fi
}

info() {
    local level="INFO"
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${DEPLOYMENT_LOG}"
}

success() {
    local level="SUCCESS"
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${DEPLOYMENT_LOG}"
}

warning() {
    local level="WARNING"
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${DEPLOYMENT_LOG}"
}

error() {
    local level="ERROR"
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${DEPLOYMENT_LOG}"
}

critical() {
    local level="CRITICAL"
    echo -e "${RED}${BOLD}[$(date +'%Y-%m-%d %H:%M:%S')] ${level}: $1${NC}" | tee -a "${DEPLOYMENT_LOG}"
    exit 1
}

section() {
    echo -e "\n${BOLD}${MAGENTA}=== PHASE ${1}: ${PHASES[$1-1]} ===${NC}" | tee -a "${DEPLOYMENT_LOG}"
}

# =============================================
# UTILITY FUNCTIONS
# =============================================

show_progress() {
    local current=$1
    local total=$2
    local description=$3
    local percentage=$((current * 100 / total))
    local bar_length=40
    local filled_length=$((percentage * bar_length / 100))
    
    printf "\r["
    for ((i=0; i<filled_length; i++)); do printf "="; done
    for ((i=filled_length; i<bar_length; i++)); do printf " "; done
    printf "] %d%% %s" $percentage "${description}"
    
    if [[ $current -eq $total ]]; then
        echo
    fi
}

acquire_lock() {
    if [[ -e "${LOCK_FILE}" ]]; then
        local pid=$(cat "${LOCK_FILE}")
        if ps -p "${pid}" > /dev/null; then
            critical "Another instance of this script is already running (PID: ${pid}). Exiting."
        else
            warning "Found stale lock file. Removing."
            rm -f "${LOCK_FILE}"
        fi
    fi
    
    echo "$$" > "${LOCK_FILE}"
    trap release_lock EXIT
}

release_lock() {
    rm -f "${LOCK_FILE}"
}

save_state() {
    local phase=$1
    mkdir -p "$(dirname "${STATE_FILE}")"
    echo "${phase}" > "${STATE_FILE}"
    success "Deployment state saved: Phase ${phase}"
}

get_state() {
    if [[ -f "${STATE_FILE}" ]]; then
        cat "${STATE_FILE}"
    else
        echo "0"
    fi
}

confirm() {
    local message=$1
    local default=${2:-n}
    
    if [[ "${FORCE}" == "true" ]]; then
        return 0
    fi
    
    local prompt
    if [[ "${default}" == "y" ]]; then
        prompt="Y/n"
    else
        prompt="y/N"
    fi
    
    read -p "${message} [${prompt}]: " -n 1 -r response
    echo
    
    response=${response:-$default}
    if [[ "${response}" =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

is_production() {
    # Check if this is a production environment
    # This is a simple check - in production you'd have more sophisticated detection
    if [[ -f "${PROJECT_ROOT}/.env" ]] && grep -q "NODE_ENV=production" "${PROJECT_ROOT}/.env"; then
        return 0
    elif [[ -f "${PROJECT_ROOT}/config/environments/production.env" ]] && [[ -L "${PROJECT_ROOT}/.env" ]]; then
        return 0
    else
        return 1
    fi
}

check_script_exists() {
    local script_path=$1
    local script_name=$(basename "${script_path}")
    
    if [[ ! -f "${script_path}" ]]; then
        warning "Script not found: ${script_path}"
        
        # Create stub script
        mkdir -p "$(dirname "${script_path}")"
        cat > "${script_path}" << EOF
#!/bin/bash
echo "NOT IMPLEMENTED - ABORTING: ${script_name}"
exit 1
EOF
        chmod +x "${script_path}"
        warning "Created stub script for ${script_name}"
        return 1
    fi
    
    # Ensure script is executable
    if [[ ! -x "${script_path}" ]]; then
        chmod +x "${script_path}"
        info "Made script executable: ${script_path}"
    fi
    
    return 0
}

elapsed_time() {
    local end_time=$(date +%s)
    local elapsed=$((end_time - START_TIME))
    local hours=$((elapsed / 3600))
    local minutes=$(( (elapsed % 3600) / 60 ))
    local seconds=$((elapsed % 60))
    
    printf "%02d:%02d:%02d" $hours $minutes $seconds
}

# =============================================
# PREREQUISITE CHECKING
# =============================================

check_prerequisites() {
    log "Checking system prerequisites..."
    
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 ]]; then
        critical "This script must be run as root or with sudo"
    fi
    
    # Check Ubuntu version
    if [[ -f /etc/os-release ]]; then
        source /etc/os-release
        if [[ "$ID" != "ubuntu" ]]; then
            critical "This script requires Ubuntu OS. Found: $ID"
        fi
        
        if [[ "$VERSION_ID" != "24.04" ]]; then
            warning "This script is optimized for Ubuntu 24.04 LTS. Found: $VERSION_ID"
            if ! confirm "Continue with a non-standard Ubuntu version?" "n"; then
                exit 0
            fi
        fi
    else
        critical "Cannot detect operating system"
    fi
    
    # Check hardware requirements
    CPU_CORES=$(nproc)
    TOTAL_RAM=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    DISK_SPACE=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
    
    info "System resources: ${CPU_CORES} CPU cores, ${TOTAL_RAM}GB RAM, ${DISK_SPACE}GB disk"
    
    if [[ $CPU_CORES -lt 4 ]]; then
        warning "Insufficient CPU cores. Minimum: 4, Found: $CPU_CORES"
        if ! confirm "Continue with insufficient CPU resources?" "n"; then
            exit 0
        fi
    fi
    
    if [[ $TOTAL_RAM -lt 16 ]]; then
        warning "Insufficient RAM. Minimum: 16GB, Found: ${TOTAL_RAM}GB"
        if ! confirm "Continue with insufficient memory?" "n"; then
            exit 0
        fi
    fi
    
    if [[ $DISK_SPACE -lt 100 ]]; then
        warning "Insufficient disk space. Minimum: 100GB, Found: ${DISK_SPACE}GB"
        if ! confirm "Continue with insufficient disk space?" "n"; then
            exit 0
        fi
    fi
    
    # Check internet connectivity
    if ! curl -s --connect-timeout 5 https://github.com > /dev/null; then
        critical "Internet connectivity check failed. Please ensure you have internet access."
    fi
    
    # Check required directories
    mkdir -p "${PROJECT_ROOT}"
    mkdir -p "${SCRIPTS_DIR}"
    mkdir -p "${AUTOMATION_DIR}"
    mkdir -p "${VALIDATION_DIR}"
    mkdir -p "${ROLLBACK_DIR}"
    mkdir -p "${DATABASE_DIR}"
    mkdir -p "${OPERATIONAL_DIR}"
    mkdir -p "${SECURITY_DIR}"
    
    # Check for required scripts
    check_script_exists "${AUTOMATION_SCRIPT}" || warning "Automation script not found, created stub"
    check_script_exists "${DATABASE_SCRIPT}" || warning "Database script not found, created stub"
    check_script_exists "${VALIDATE_DATABASE}" || warning "Database validation script not found, created stub"
    check_script_exists "${VALIDATE_PLATFORM}" || warning "Platform validation script not found, created stub"
    
    success "Prerequisite checks completed"
}

# =============================================
# DEPLOYMENT PHASES
# =============================================

# Phase 1: System Hardening
deploy_phase_1() {
    section "1"
    log "Starting System Hardening..."
    
    if check_script_exists "${AUTOMATION_SCRIPT}"; then
        info "Executing system hardening..."
        if "${AUTOMATION_SCRIPT}" --system; then
            success "System hardening completed successfully"
            save_state "1"
            return 0
        else
            error "System hardening failed"
            return 1
        fi
    else
        error "Automation script not found"
        return 1
    fi
}

validate_phase_1() {
    log "Validating System Hardening..."
    
    # Check UFW status
    if ! ufw status | grep -q "Status: active"; then
        error "Firewall is not active"
        return 1
    fi
    
    # Check fail2ban status
    if ! systemctl is-active --quiet fail2ban; then
        error "fail2ban service is not running"
        return 1
    fi
    
    success "System hardening validation passed"
    return 0
}

rollback_phase_1() {
    log "Rolling back System Hardening..."
    
    # Restore SSH configuration
    if [[ -f /etc/ssh/sshd_config.backup ]]; then
        info "Restoring SSH configuration..."
        cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
        rm -f /etc/ssh/sshd_config.d/99-risk-platform.conf
        systemctl restart sshd
    fi
    
    # Disable UFW
    info "Disabling firewall..."
    ufw disable
    
    # Stop fail2ban
    info "Stopping fail2ban..."
    systemctl stop fail2ban
    
    success "System hardening rollback completed"
}

# Phase 2: Docker Engine
deploy_phase_2() {
    section "2"
    log "Starting Docker Engine Installation..."
    
    if check_script_exists "${AUTOMATION_SCRIPT}"; then
        info "Installing Docker Engine..."
        if "${AUTOMATION_SCRIPT}" --docker; then
            success "Docker Engine installation completed successfully"
            save_state "2"
            return 0
        else
            error "Docker Engine installation failed"
            return 1
        fi
    else
        error "Automation script not found"
        return 1
    fi
}

validate_phase_2() {
    log "Validating Docker Engine Installation..."
    
    # Check Docker version
    if ! docker --version; then
        error "Docker is not installed correctly"
        return 1
    fi
    
    # Check Docker Compose
    if ! docker compose version; then
        error "Docker Compose is not installed correctly"
        return 1
    fi
    
    # Check Docker service
    if ! systemctl is-active --quiet docker; then
        error "Docker service is not running"
        return 1
    fi
    
    success "Docker Engine validation passed"
    return 0
}

rollback_phase_2() {
    log "Rolling back Docker Engine Installation..."
    
    # Stop Docker service
    info "Stopping Docker service..."
    systemctl stop docker
    
    # Remove Docker packages
    info "Removing Docker packages..."
    apt purge -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    apt autoremove -y
    
    # Remove Docker files
    info "Removing Docker files..."
    rm -rf /var/lib/docker
    rm -rf /etc/docker
    rm -f /etc/apt/sources.list.d/docker.list
    
    success "Docker Engine rollback completed"
}

# Phase 3: Project Structure
deploy_phase_3() {
    section "3"
    log "Starting Project Structure Setup..."
    
    if check_script_exists "${AUTOMATION_SCRIPT}"; then
        info "Setting up project structure..."
        if "${AUTOMATION_SCRIPT}" --structure; then
            success "Project structure setup completed successfully"
            save_state "3"
            return 0
        else
            error "Project structure setup failed"
            return 1
        fi
    else
        error "Automation script not found"
        return 1
    fi
}

validate_phase_3() {
    log "Validating Project Structure..."
    
    # Check if key directories exist
    for dir in database secrets scripts docker-compose config logs api monitoring; do
        if [[ ! -d "${PROJECT_ROOT}/${dir}" ]]; then
            error "Required directory ${dir} is missing"
            return 1
        fi
    done
    
    # Check if secret files exist with proper permissions
    for secret in postgres_password.txt postgres_root_password.txt redis_password.txt; do
        if [[ ! -f "${PROJECT_ROOT}/secrets/database/${secret}" ]]; then
            error "Required secret file ${secret} is missing"
            return 1
        fi
        
        # Check permissions (should be 600)
        local perms=$(stat -c "%a" "${PROJECT_ROOT}/secrets/database/${secret}")
        if [[ "${perms}" != "600" ]]; then
            error "Secret file ${secret} has incorrect permissions: ${perms}, should be 600"
            return 1
        fi
    done
    
    success "Project structure validation passed"
    return 0
}

rollback_phase_3() {
    log "Rolling back Project Structure Setup..."
    
    if confirm "This will remove all project files. Are you sure?" "n"; then
        info "Removing project structure..."
        rm -rf "${PROJECT_ROOT}"
        success "Project structure rollback completed"
    else
        warning "Project structure rollback aborted"
    fi
}

# Phase 4: Database Layer
deploy_phase_4() {
    section "4"
    log "Starting Database Layer Setup..."
    
    if check_script_exists "${DATABASE_SCRIPT}"; then
        info "Setting up database layer..."
        if "${DATABASE_SCRIPT}"; then
            success "Database layer setup completed successfully"
            
            # Validate database
            if check_script_exists "${VALIDATE_DATABASE}"; then
                info "Validating database setup..."
                if "${VALIDATE_DATABASE}"; then
                    success "Database validation passed"
                    save_state "4"
                    return 0
                else
                    error "Database validation failed"
                    return 1
                fi
            else
                warning "Database validation script not found, skipping validation"
                save_state "4"
                return 0
            fi
        else
            error "Database layer setup failed"
            return 1
        fi
    else
        error "Database script not found"
        return 1
    fi
}

validate_phase_4() {
    log "Validating Database Layer..."
    
    if check_script_exists "${VALIDATE_DATABASE}"; then
        info "Running database validation..."
        if "${VALIDATE_DATABASE}"; then
            success "Database layer validation passed"
            return 0
        else
            error "Database layer validation failed"
            return 1
        fi
    else
        warning "Database validation script not found"
        
        # Basic validation
        info "Performing basic database validation..."
        
        # Check if PostgreSQL container is running
        if ! docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" ps | grep -q "postgres.*running"; then
            error "PostgreSQL container is not running"
            return 1
        fi
        
        # Check if Redis container is running
        if ! docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" ps | grep -q "redis.*running"; then
            error "Redis container is not running"
            return 1
        fi
        
        success "Basic database validation passed"
        return 0
    fi
}

rollback_phase_4() {
    log "Rolling back Database Layer Setup..."
    
    if check_script_exists "${ROLLBACK_DIR}/rollback_database.sh"; then
        info "Executing database rollback script..."
        "${ROLLBACK_DIR}/rollback_database.sh"
    else
        info "No dedicated rollback script found, performing manual rollback..."
        
        # Stop database containers
        info "Stopping database containers..."
        cd "${PROJECT_ROOT}"
        docker compose -f docker-compose/db.yml down -v
        
        # Remove database files
        if confirm "Remove database data files?" "n"; then
            info "Removing database files..."
            rm -rf "${PROJECT_ROOT}/database/data"
        fi
    fi
    
    success "Database layer rollback completed"
}

# Phase 5: API & Monitoring Services
deploy_phase_5() {
    section "5"
    log "Starting API & Monitoring Services Setup..."
    
    if check_script_exists "${AUTOMATION_SCRIPT}"; then
        info "Setting up API and monitoring services..."
        if "${AUTOMATION_SCRIPT}" --services; then
            success "API & Monitoring services setup completed successfully"
            save_state "5"
            return 0
        else
            error "API & Monitoring services setup failed"
            return 1
        fi
    else
        error "Automation script not found"
        return 1
    fi
}

validate_phase_5() {
    log "Validating API & Monitoring Services..."
    
    # Check API directory structure
    if [[ ! -d "${PROJECT_ROOT}/api/src" ]]; then
        error "API directory structure is missing"
        return 1
    fi
    
    # Check Prometheus config
    if [[ ! -f "${PROJECT_ROOT}/monitoring/prometheus/prometheus.yml" ]]; then
        error "Prometheus configuration is missing"
        return 1
    fi
    
    # Check Grafana config
    if [[ ! -d "${PROJECT_ROOT}/monitoring/grafana/provisioning" ]]; then
        error "Grafana configuration is missing"
        return 1
    fi
    
    success "API & Monitoring services validation passed"
    return 0
}

rollback_phase_5() {
    log "Rolling back API & Monitoring Services Setup..."
    
    # Remove API directory
    info "Removing API directory..."
    rm -rf "${PROJECT_ROOT}/api"
    
    # Remove monitoring configurations
    info "Removing monitoring configurations..."
    rm -rf "${PROJECT_ROOT}/monitoring/prometheus"
    rm -rf "${PROJECT_ROOT}/monitoring/grafana"
    
    success "API & Monitoring services rollback completed"
}

# Phase 6: Service Deployment
deploy_phase_6() {
    section "6"
    log "Starting Service Deployment..."
    
    if check_script_exists "${AUTOMATION_SCRIPT}"; then
        info "Deploying services..."
        if "${AUTOMATION_SCRIPT}" --deploy; then
            success "Services deployed successfully"
            
            # Wait for services to stabilize
            info "Waiting for services to stabilize (3 minutes)..."
            for i in {1..36}; do
                show_progress $i 36 "Waiting for services to stabilize"
                sleep 5
            done
            
            # Validate platform
            if check_script_exists "${VALIDATE_PLATFORM}"; then
                info "Validating platform deployment..."
                if "${VALIDATE_PLATFORM}"; then
                    success "Platform validation passed"
                    save_state "6"
                    return 0
                else
                    error "Platform validation failed"
                    return 1
                fi
            else
                warning "Platform validation script not found, skipping validation"
                save_state "6"
                return 0
            fi
        else
            error "Service deployment failed"
            return 1
        fi
    else
        error "Automation script not found"
        return 1
    fi
}

validate_phase_6() {
    log "Validating Service Deployment..."
    
    if check_script_exists "${VALIDATE_PLATFORM}"; then
        info "Running platform validation..."
        if "${VALIDATE_PLATFORM}"; then
            success "Service deployment validation passed"
            return 0
        else
            error "Service deployment validation failed"
            return 1
        fi
    else
        warning "Platform validation script not found"
        
        # Basic validation
        info "Performing basic service validation..."
        
        # Check if all containers are running
        local containers=$(docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" ps -q)
        local db_containers=$(docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" ps -q)
        
        if [[ -z "$containers" ]] || [[ -z "$db_containers" ]]; then
            error "Some containers are not running"
            return 1
        fi
        
        # Check API health endpoint
        if ! curl -s --fail http://localhost:3000/health > /dev/null; then
            error "API health check failed"
            return 1
        fi
        
        success "Basic service validation passed"
        return 0
    fi
}

rollback_phase_6() {
    log "Rolling back Service Deployment..."
    
    if check_script_exists "${ROLLBACK_DIR}/rollback_platform.sh"; then
        info "Executing platform rollback script..."
        "${ROLLBACK_DIR}/rollback_platform.sh" --deploy
    else
        info "No dedicated rollback script found, performing manual rollback..."
        
        # Stop all containers
        info "Stopping all containers..."
        cd "${PROJECT_ROOT}"
        docker compose -f docker-compose/base.yml down
    fi
    
    success "Service deployment rollback completed"
}

# Phase 7: Operational Tooling
deploy_phase_7() {
    section "7"
    log "Starting Operational Tooling Setup..."
    
    # Check for essential scripts
    if check_script_exists "${CREATE_ESSENTIAL}" && check_script_exists "${INSTALL_ESSENTIAL}"; then
        # Create essential scripts
        info "Creating essential operational scripts..."
        if "${CREATE_ESSENTIAL}"; then
            success "Essential scripts created successfully"
            
            # Install operational scripts
            info "Installing operational scripts..."
            if "${INSTALL_ESSENTIAL}"; then
                success "Operational scripts installed successfully"
                save_state "7"
                return 0
            else
                error "Operational scripts installation failed"
                return 1
            fi
        else
            error "Essential scripts creation failed"
            return 1
        fi
    else
        error "Essential scripts not found"
        return 1
    fi
}

validate_phase_7() {
    log "Validating Operational Tooling..."
    
    # Check if risk-platform command is available
    if ! command -v risk-platform &> /dev/null; then
        error "risk-platform command not found"
        return 1
    fi
    
    # Check if risk-platform command works
    if ! risk-platform --help &> /dev/null; then
        error "risk-platform command is not working"
        return 1
    fi
    
    # Check if platform status command works
    if ! risk-platform platform status &> /dev/null; then
        error "risk-platform platform status command is not working"
        return 1
    fi
    
    success "Operational tooling validation passed"
    return 0
}

rollback_phase_7() {
    log "Rolling back Operational Tooling Setup..."
    
    # Remove risk-platform binaries
    info "Removing risk-platform binaries..."
    rm -f /usr/local/bin/risk-platform*
    
    # Remove operational scripts
    info "Removing operational scripts..."
    rm -rf "${PROJECT_ROOT}/scripts/operational"
    
    success "Operational tooling rollback completed"
}

# Phase 8: Advanced Tooling
deploy_phase_8() {
    section "8"
    log "Starting Advanced Tooling Setup..."
    
    # Check for final scripts
    if check_script_exists "${CREATE_FINAL}" && check_script_exists "${INSTALL_FINAL}"; then
        # Create final scripts
        info "Creating final operational scripts..."
        if "${CREATE_FINAL}"; then
            success "Final scripts created successfully"
            
            # Install final scripts
            info "Installing final scripts..."
            if "${INSTALL_FINAL}"; then
                success "Final scripts installed successfully"
                save_state "8"
                return 0
            else
                error "Final scripts installation failed"
                return 1
            fi
        else
            error "Final scripts creation failed"
            return 1
        fi
    else
        error "Final scripts not found"
        return 1
    fi
}

validate_phase_8() {
    log "Validating Advanced Tooling..."
    
    # Check if risk-platform-ioc command is available
    if ! command -v risk-platform-ioc &> /dev/null; then
        error "risk-platform-ioc command not found"
        return 1
    fi
    
    # Check if risk-platform-analytics command is available
    if ! command -v risk-platform-analytics &> /dev/null; then
        error "risk-platform-analytics command not found"
        return 1
    fi
    
    # Check if risk-platform-ioc command works
    if ! risk-platform-ioc list &> /dev/null; then
        error "risk-platform-ioc command is not working"
        return 1
    fi
    
    success "Advanced tooling validation passed"
    return 0
}

rollback_phase_8() {
    log "Rolling back Advanced Tooling Setup..."
    
    # Remove advanced binaries
    info "Removing advanced binaries..."
    rm -f /usr/local/bin/risk-platform-*
    
    # Remove advanced scripts
    info "Removing advanced scripts..."
    rm -rf "${PROJECT_ROOT}/scripts/threat-intelligence"
    
    success "Advanced tooling rollback completed"
}

# Phase 9: TLS & Integrations
deploy_phase_9() {
    section "9"
    log "Starting TLS & Integrations Setup..."
    
    # Check for certificate management script
    if check_script_exists "${MANAGE_CERTS}"; then
        # Ask for domain name if not in force mode
        if [[ "${FORCE}" != "true" ]]; then
            read -p "Enter domain name for SSL certificate [${DOMAIN_NAME}]: " input_domain
            DOMAIN_NAME=${input_domain:-$DOMAIN_NAME}
        fi
        
        # Set up SSL certificate
        info "Setting up SSL certificate for ${DOMAIN_NAME}..."
        if "${MANAGE_CERTS}" "${DOMAIN_NAME}" letsencrypt; then
            success "SSL certificate setup completed successfully"
            
            # Restart Nginx
            info "Restarting Nginx..."
            cd "${PROJECT_ROOT}"
            docker compose -f docker-compose/base.yml restart nginx
            
            save_state "9"
            return 0
        else
            error "SSL certificate setup failed"
            return 1
        fi
    else
        error "Certificate management script not found"
        return 1
    fi
}

validate_phase_9() {
    log "Validating TLS & Integrations..."
    
    # Check if SSL certificate exists
    if [[ ! -f "${PROJECT_ROOT}/config/nginx/ssl/cert.pem" ]] || [[ ! -f "${PROJECT_ROOT}/config/nginx/ssl/key.pem" ]]; then
        error "SSL certificate files not found"
        return 1
    fi
    
    # Check HTTPS
    if ! curl -k -s --fail https://localhost/health > /dev/null; then
        error "HTTPS health check failed"
        return 1
    fi
    
    success "TLS & Integrations validation passed"
    return 0
}

rollback_phase_9() {
    log "Rolling back TLS & Integrations Setup..."
    
    # Restore Nginx configuration
    if [[ -f "${PROJECT_ROOT}/config/nginx/default.conf.backup" ]]; then
        info "Restoring Nginx configuration..."
        cp "${PROJECT_ROOT}/config/nginx/default.conf.backup" "${PROJECT_ROOT}/config/nginx/default.conf"
    fi
    
    # Remove SSL certificates
    info "Removing SSL certificates..."
    rm -rf "${PROJECT_ROOT}/config/nginx/ssl"
    
    # Restart Nginx
    info "Restarting Nginx..."
    cd "${PROJECT_ROOT}"
    docker compose -f docker-compose/base.yml restart nginx
    
    success "TLS & Integrations rollback completed"
}

# Phase 10: Production Hardening
deploy_phase_10() {
    section "10"
    log "Starting Production Hardening..."
    
    # Check if risk-platform command is available
    if command -v risk-platform &> /dev/null; then
        # Run security verification
        info "Running security verification..."
        if risk-platform security verify; then
            success "Security verification passed"
            save_state "10"
            return 0
        else
            error "Security verification failed"
            return 1
        fi
    else
        error "risk-platform command not found"
        return 1
    fi
}

validate_phase_10() {
    log "Validating Production Hardening..."
    
    # Check if risk-platform command is available
    if command -v risk-platform &> /dev/null; then
        # Run security verification
        info "Running security verification..."
        if risk-platform security verify; then
            success "Production hardening validation passed"
            return 0
        else
            error "Production hardening validation failed"
            return 1
        fi
    else
        error "risk-platform command not found"
        return 1
    fi
}

rollback_phase_10() {
    log "Rolling back Production Hardening..."
    
    warning "Production hardening rollback is not implemented"
    warning "Manual intervention may be required"
    
    success "Production hardening rollback completed"
}

# =============================================
# DEPLOYMENT ORCHESTRATION
# =============================================

deploy_phase() {
    local phase=$1
    local phase_name=${PHASES[$phase-1]}
    
    log "Deploying Phase ${phase}: ${phase_name}"
    
    # Call the appropriate deployment function
    local deploy_func="deploy_phase_${phase}"
    if declare -f "${deploy_func}" > /dev/null; then
        if ${deploy_func}; then
            success "Phase ${phase}: ${phase_name} completed successfully"
            return 0
        else
            error "Phase ${phase}: ${phase_name} failed"
            
            # Ask if user wants to rollback
            if [[ "${FORCE}" != "true" ]] && confirm "Do you want to rollback this phase?" "y"; then
                rollback_phase "${phase}"
            fi
            
            return 1
        fi
    else
        error "Deployment function for Phase ${phase} not found"
        return 1
    fi
}

validate_phase() {
    local phase=$1
    local phase_name=${PHASES[$phase-1]}
    
    log "Validating Phase ${phase}: ${phase_name}"
    
    # Call the appropriate validation function
    local validate_func="validate_phase_${phase}"
    if declare -f "${validate_func}" > /dev/null; then
        if ${validate_func}; then
            success "Phase ${phase}: ${phase_name} validation passed"
            return 0
        else
            error "Phase ${phase}: ${phase_name} validation failed"
            return 1
        fi
    else
        error "Validation function for Phase ${phase} not found"
        return 1
    fi
}

rollback_phase() {
    local phase=$1
    local phase_name=${PHASES[$phase-1]}
    
    log "Rolling back Phase ${phase}: ${phase_name}"
    
    # Call the appropriate rollback function
    local rollback_func="rollback_phase_${phase}"
    if declare -f "${rollback_func}" > /dev/null; then
        if ${rollback_func}; then
            success "Phase ${phase}: ${phase_name} rollback completed"
            
            # Update state file to previous phase
            local previous_phase=$((phase - 1))
            if [[ ${previous_phase} -lt 1 ]]; then
                previous_phase=0
            fi
            save_state "${previous_phase}"
            
            return 0
        else
            error "Phase ${phase}: ${phase_name} rollback failed"
            return 1
        fi
    else
        error "Rollback function for Phase ${phase} not found"
        return 1
    fi
}

deploy_all() {
    log "Starting complete deployment..."
    
    local current_phase=$(get_state)
    local start_phase=1
    
    if [[ "${RESUME}" == "true" && ${current_phase} -gt 0 ]]; then
        start_phase=$((current_phase + 1))
        log "Resuming deployment from Phase ${start_phase}"
    fi
    
    # Production safety check
    if is_production && [[ "${FORCE}" != "true" ]]; then
        warning "This appears to be a production environment"
        if ! confirm "Are you sure you want to deploy to production?" "n"; then
            critical "Deployment aborted by user"
        fi
    fi
    
    # Deploy each phase in sequence
    local deployment_status=0
    for ((phase=start_phase; phase<=10; phase++)); do
        if ! deploy_phase "${phase}"; then
            error "Deployment failed at Phase ${phase}"
            deployment_status=1
            break
        fi
    done
    
    # Generate deployment report
    generate_deployment_report "${deployment_status}"
    
    if [[ ${deployment_status} -eq 0 ]]; then
        success "🎉 Complete deployment finished successfully"
        return 0
    else
        error "❌ Deployment failed"
        return 1
    fi
}

validate_all() {
    log "Starting complete validation..."
    
    local validation_status=0
    
    # Validate each phase in sequence
    for ((phase=1; phase<=10; phase++)); do
        if ! validate_phase "${phase}"; then
            error "Validation failed at Phase ${phase}"
            validation_status=1
        fi
    done
    
    # Generate validation report
    generate_deployment_report "${validation_status}" "validation"
    
    if [[ ${validation_status} -eq 0 ]]; then
        success "🎉 Complete validation passed"
        return 0
    else
        error "❌ Validation failed"
        return 1
    fi
}

# =============================================
# INTERACTIVE MODE
# =============================================

show_interactive_menu() {
    clear
    echo -e "${BOLD}${BLUE}=== Risk Platform Deployment Tool ===${NC}"
    echo -e "${BLUE}Version: ${SCRIPT_VERSION}${NC}"
    echo
    echo "Current state: Phase $(get_state)"
    echo "Deployment time: $(elapsed_time)"
    echo
    echo "Available phases:"
    
    for ((i=1; i<=10; i++)); do
        local phase_name=${PHASES[$i-1]}
        local state=$(get_state)
        
        if [[ $i -le $state ]]; then
            echo -e "${GREEN}${i}. [✓] ${phase_name}${NC}"
        else
            echo -e "${i}. [ ] ${phase_name}"
        fi
    done
    
    echo
    echo "Special options:"
    echo "v. Validate all phases"
    echo "r. Resume deployment from current state"
    echo "a. Deploy all phases"
    echo "q. Quit"
    echo
    read -p "Select an option: " -n 1 -r selection
    echo
    
    case $selection in
        [1-9]|10)
            if deploy_phase "${selection}"; then
                success "Phase ${selection} completed successfully"
            else
                error "Phase ${selection} failed"
            fi
            ;;
        v)
            validate_all
            ;;
        r)
            RESUME=true
            deploy_all
            ;;
        a)
            deploy_all
            ;;
        q)
            echo "Exiting..."
            exit 0
            ;;
        *)
            error "Invalid selection"
            ;;
    esac
    
    echo
    read -p "Press Enter to continue..." -n 1 -r
    show_interactive_menu
}

# =============================================
# REPORTING
# =============================================

generate_deployment_report() {
    local status=$1
    local report_type=${2:-"deployment"}
    local report_date=$(date +'%Y-%m-%d %H:%M:%S')
    local hostname=$(hostname)
    local total_time=$(elapsed_time)
    
    log "Generating ${report_type} report..."
    
    # Create HTML report
    cat > "${REPORT_FILE}" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Platform ${report_type^} Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            margin-bottom: 20px;
        }
        h1, h2, h3 {
            margin-top: 0;
        }
        .summary {
            background-color: #f8f9fa;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .success {
            color: #28a745;
        }
        .warning {
            color: #ffc107;
        }
        .error {
            color: #dc3545;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .section {
            margin-bottom: 30px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 0.9em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Risk Platform ${report_type^} Report</h1>
            <p>Generated on ${report_date}</p>
        </header>
        
        <div class="summary">
            <h2>${report_type^} Summary</h2>
            <p>
                <strong>Status:</strong> 
                <span class="${status == 0 ? 'success' : 'error'}">
                    ${status == 0 ? 'PASSED' : 'FAILED'}
                </span>
            </p>
            <p><strong>Host:</strong> ${hostname}</p>
            <p><strong>Platform Version:</strong> 1.0.0</p>
            <p><strong>Total Time:</strong> ${total_time}</p>
            <p><strong>Current State:</strong> Phase $(get_state)</p>
        </div>
        
        <div class="section">
            <h2>Phase Status</h2>
            <table>
                <tr>
                    <th>#</th>
                    <th>Phase</th>
                    <th>Status</th>
                </tr>
EOF
    
    # Add phase status
    local current_state=$(get_state)
    
    for ((i=1; i<=10; i++)); do
        local phase_name=${PHASES[$i-1]}
        local phase_status="Not Started"
        local status_class="warning"
        
        if [[ $i -lt $current_state ]]; then
            phase_status="Completed"
            status_class="success"
        elif [[ $i -eq $current_state ]]; then
            if [[ ${status} -eq 0 ]]; then
                phase_status="Completed"
                status_class="success"
            else
                phase_status="Failed"
                status_class="error"
            fi
        elif [[ $i -gt $current_state ]]; then
            phase_status="Pending"
            status_class="warning"
        fi
        
        cat >> "${REPORT_FILE}" << EOF
                <tr>
                    <td>${i}</td>
                    <td>${phase_name}</td>
                    <td class="${status_class}">${phase_status}</td>
                </tr>
EOF
    done
    
    cat >> "${REPORT_FILE}" << EOF
            </table>
        </div>
        
        <div class="section">
            <h2>System Information</h2>
            <table>
                <tr>
                    <th>Item</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Operating System</td>
                    <td>$(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)</td>
                </tr>
                <tr>
                    <td>Kernel</td>
                    <td>$(uname -r)</td>
                </tr>
                <tr>
                    <td>CPU Cores</td>
                    <td>$(nproc)</td>
                </tr>
                <tr>
                    <td>Memory</td>
                    <td>$(free -h | awk 'NR==2{print $2}')</td>
                </tr>
                <tr>
                    <td>Disk Space</td>
                    <td>$(df -h / | awk 'NR==2{print $2}')</td>
                </tr>
                <tr>
                    <td>Docker Version</td>
                    <td>$(docker --version 2>/dev/null || echo "Not installed")</td>
                </tr>
            </table>
        </div>
        
        <div class="section">
            <h2>Service Status</h2>
            <table>
                <tr>
                    <th>Service</th>
                    <th>Status</th>
                </tr>
EOF
    
    # Add service status
    local services=("docker" "postgresql" "nginx" "api" "prometheus" "grafana")
    
    for service in "${services[@]}"; do
        local service_status="Unknown"
        local status_class="warning"
        
        case "${service}" in
            docker)
                if systemctl is-active --quiet docker; then
                    service_status="Running"
                    status_class="success"
                else
                    service_status="Stopped"
                    status_class="error"
                fi
                ;;
            postgresql|redis)
                if docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" ps | grep -q "${service}.*running"; then
                    service_status="Running"
                    status_class="success"
                else
                    service_status="Stopped"
                    status_class="error"
                fi
                ;;
            *)
                if docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" ps | grep -q "${service}.*running"; then
                    service_status="Running"
                    status_class="success"
                else
                    service_status="Stopped"
                    status_class="error"
                fi
                ;;
        esac
        
        cat >> "${REPORT_FILE}" << EOF
                <tr>
                    <td>${service}</td>
                    <td class="${status_class}">${service_status}</td>
                </tr>
EOF
    done
    
    cat >> "${REPORT_FILE}" << EOF
            </table>
        </div>
        
        <div class="section">
            <h2>Next Steps</h2>
            <ul>
EOF
    
    if [[ ${status} -eq 0 && ${current_state} -ge 10 ]]; then
        cat >> "${REPORT_FILE}" << EOF
                <li>Platform is fully deployed and ready for use</li>
                <li>Access the platform at: https://${DOMAIN_NAME}</li>
                <li>Review the platform documentation</li>
                <li>Set up monitoring alerts</li>
                <li>Configure backup schedules</li>
                <li>Train users on the platform</li>
EOF
    elif [[ ${status} -eq 0 && ${current_state} -lt 10 ]]; then
        cat >> "${REPORT_FILE}" << EOF
                <li>Continue deployment from Phase $((current_state + 1))</li>
                <li>Run: <code>./master_deploy.sh --resume</code></li>
                <li>Or run: <code>./master_deploy.sh --phase $((current_state + 1))</code></li>
EOF
    else
        cat >> "${REPORT_FILE}" << EOF
                <li>Fix issues in Phase ${current_state}</li>
                <li>Check the deployment log: <code>${DEPLOYMENT_LOG}</code></li>
                <li>Run: <code>./master_deploy.sh --phase ${current_state}</code></li>
EOF
    fi
    
    cat >> "${REPORT_FILE}" << EOF
            </ul>
        </div>
        
        <div class="footer">
            <p>Risk Platform ${report_type^} Report | Generated by master_deploy.sh v${SCRIPT_VERSION}</p>
        </div>
    </div>
</body>
</html>
EOF
    
    success "${report_type^} report generated: ${REPORT_FILE}"
}

# =============================================
# HELP AND USAGE
# =============================================

show_help() {
    echo -e "${BLUE}Risk Platform Master Deployment Script v${SCRIPT_VERSION}${NC}"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --all                Execute all phases in sequence"
    echo "  --interactive        Run in interactive mode (select phases)"
    echo "  --resume             Resume from last successful phase"
    echo "  --phase [PHASE_NUM]  Run specific phase (1-10)"
    echo "  --rollback [PHASE]   Rollback specific phase"
    echo "  --validate-only      Run validation without deployment"
    echo "  --force              Skip confirmations (use with caution)"
    echo "  --help               Display this help message"
    echo
    echo "Phases:"
    for ((i=1; i<=10; i++)); do
        echo "  ${i}. ${PHASES[$i-1]}"
    done
    echo
    echo "Example:"
    echo "  $0 --all             # Run complete deployment"
    echo "  $0 --interactive     # Run in interactive mode"
    echo "  $0 --phase 3         # Run only Phase 3 (Project Structure)"
    echo "  $0 --resume          # Resume from last successful phase"
    echo "  $0 --validate-only   # Validate without deploying"
    echo
}

# =============================================
# MAIN EXECUTION
# =============================================

main() {
    # Parse command line arguments
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi
    
    # Process arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --all)
                check_prerequisites
                deploy_all
                shift
                ;;
            --interactive)
                INTERACTIVE=true
                check_prerequisites
                show_interactive_menu
                shift
                ;;
            --resume)
                RESUME=true
                check_prerequisites
                deploy_all
                shift
                ;;
            --phase)
                if [[ -n "$2" && "$2" =~ ^[0-9]+$ && "$2" -ge 1 && "$2" -le 10 ]]; then
                    SPECIFIC_PHASE="$2"
                    check_prerequisites
                    deploy_phase "$SPECIFIC_PHASE"
                else
                    error "Invalid phase number. Must be between 1 and 10."
                    show_help
                    exit 1
                fi
                shift 2
                ;;
            --rollback)
                if [[ -n "$2" && "$2" =~ ^[0-9]+$ && "$2" -ge 1 && "$2" -le 10 ]]; then
                    ROLLBACK_PHASE="$2"
                    check_prerequisites
                    rollback_phase "$ROLLBACK_PHASE"
                else
                    error "Invalid phase number. Must be between 1 and 10."
                    show_help
                    exit 1
                fi
                shift 2
                ;;
            --validate-only)
                VALIDATE_ONLY=true
                check_prerequisites
                validate_all
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Acquire lock and run main function
acquire_lock
main "$@"
exit 0
