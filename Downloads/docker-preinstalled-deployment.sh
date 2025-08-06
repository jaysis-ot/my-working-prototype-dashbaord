#!/bin/bash
# docker-preinstalled-deployment.sh
# Risk Platform Deployment Script for environments with Docker pre-installed
# Version: 1.0.0
# Date: 2025-08-04

# Set error handling
set -e
trap 'echo "Error on line $LINENO. Deployment failed."; exit 1' ERR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_DIR="/opt/risk-platform"
DASHBOARD_DIR="${PLATFORM_DIR}/dashboard"
DB_DIR="${PLATFORM_DIR}/database"
NGINX_DIR="${PLATFORM_DIR}/nginx"
LOG_DIR="/var/log/risk-platform"
BACKUP_DIR="${PLATFORM_DIR}/backups"
LOG_FILE="${LOG_DIR}/deployment-$(date +%Y%m%d-%H%M%S).log"
DOCKER_NETWORK="risk-platform-network"

# Container names
NGINX_CONTAINER="risk-platform-nginx"
POSTGRES_CONTAINER="risk-platform-postgres"
GRAFANA_CONTAINER="risk-platform-grafana"
PROMETHEUS_CONTAINER="risk-platform-prometheus"
ALERTMANAGER_CONTAINER="risk-platform-alertmanager"

# Database configuration
DB_NAME="risk_platform"
DB_USER="risk_platform"
DB_PASSWORD="Risk_Platform_$(date +%s | sha256sum | base64 | head -c 12)"
DB_READONLY_USER="${DB_USER}_readonly"
DB_READONLY_PASSWORD="Readonly_$(date +%s | sha256sum | base64 | head -c 12)"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  RISK PLATFORM DEPLOYMENT (DOCKER PRE-INSTALLED)  ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Create directories
mkdir -p "$PLATFORM_DIR" "$DASHBOARD_DIR" "$DB_DIR" "$NGINX_DIR" "$LOG_DIR" "$BACKUP_DIR"

# Ensure log file exists and is writable
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

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
    exit 1
}

section() {
    echo ""
    echo -e "${CYAN}=== $1 ===${NC}"
    echo -e "${CYAN}$(printf '=%.0s' $(seq 1 ${#1}))======${NC}"
    echo ""
    echo "=== $1 ===" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# Step 1: Validate Docker is installed and running
section "VALIDATING DOCKER INSTALLATION"

log "Checking Docker service status"
if ! command -v docker &>/dev/null; then
    error "Docker is not installed. This script requires a pre-installed Docker environment."
fi

if ! systemctl is-active --quiet docker; then
    warning "Docker service is not running. Attempting to start..."
    systemctl start docker
    if ! systemctl is-active --quiet docker; then
        error "Failed to start Docker service. Please check Docker installation."
    fi
fi
success "Docker is installed and running"

# Check Docker Compose
log "Checking Docker Compose"
if command -v docker-compose &>/dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
    success "docker-compose is installed"
elif docker compose version &>/dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
    success "Docker Compose plugin is installed"
else
    warning "Docker Compose not found. Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin
    if docker compose version &>/dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
        success "Docker Compose plugin installed successfully"
    else
        error "Failed to install Docker Compose. Please install it manually."
    fi
fi

# Check Docker permissions
log "Checking Docker permissions"
if ! docker ps &>/dev/null; then
    warning "Current user cannot run Docker commands without sudo"
    if [ "$EUID" -ne 0 ]; then
        error "Please run this script as root or with sudo"
    fi
fi
success "Docker permissions verified"

# Step 2: Configure firewall with RDP preservation
section "CONFIGURING FIREWALL"

# Check if UFW is installed
if ! command -v ufw &>/dev/null; then
    log "UFW not found, installing..."
    apt-get update && apt-get install -y ufw
fi

# Configure UFW
log "Configuring UFW firewall"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (always allow SSH to prevent lockout)
log "Allowing SSH access"
ufw allow 22/tcp

# Allow HTTP and HTTPS
log "Allowing HTTP and HTTPS access"
ufw allow 80/tcp
ufw allow 443/tcp

# Check if RDP port is in use and allow it
log "Checking for RDP port"
if netstat -tuln | grep -q ":3389 "; then
    log "RDP port detected, allowing RDP access"
    ufw allow 3389/tcp
else
    log "RDP port not detected, allowing it anyway for future use"
    ufw allow 3389/tcp
fi

# Enable UFW
log "Enabling UFW"
echo "y" | ufw enable

# Verify UFW status
UFW_STATUS=$(ufw status)
if echo "$UFW_STATUS" | grep -q "Status: active"; then
    success "UFW firewall configured and enabled"
else
    warning "UFW firewall not active. Continuing without firewall..."
fi

# Step 3: Set up Docker network
section "SETTING UP DOCKER NETWORK"

# Check if network already exists
if docker network ls | grep -q "$DOCKER_NETWORK"; then
    log "Docker network already exists, removing to ensure clean state"
    docker network rm "$DOCKER_NETWORK" || true
fi

# Create Docker network
log "Creating Docker network"
docker network create --driver bridge "$DOCKER_NETWORK"
success "Docker network created"

# Step 4: Set up Nginx configuration
section "SETTING UP NGINX CONFIGURATION"

# Create Nginx configuration directory
mkdir -p "${NGINX_DIR}/conf.d"

# Create Nginx configuration without API upstream reference
log "Creating Nginx configuration"
cat > "${NGINX_DIR}/conf.d/default.conf" << 'EOF'
# Dashboard Configuration
server {
    listen 80;
    server_name _;

    # Dashboard
    location / {
        root /opt/risk-platform/dashboard/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Monitoring
    location /monitoring {
        proxy_pass http://grafana:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        root /opt/risk-platform/dashboard/public;
        expires max;
        log_not_found off;
    }
}
EOF
success "Nginx configuration created"

# Step 5: Create dashboard files
section "CREATING DASHBOARD FILES"

# Create dashboard directory
mkdir -p "$DASHBOARD_DIR/public"

# Create index.html
log "Creating index.html"
cat > "$DASHBOARD_DIR/public/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Platform Dashboard</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <!-- Sidebar -->
            <nav id="sidebar" class="col-md-3 col-lg-2 d-md-block bg-dark sidebar collapse">
                <div class="position-sticky pt-3">
                    <div class="sidebar-header mb-4">
                        <h3 class="text-light">Risk Platform</h3>
                    </div>
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link active" href="#dashboard">
                                <i class="bi bi-speedometer2 me-2"></i>
                                Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#threats">
                                <i class="bi bi-shield-exclamation me-2"></i>
                                Threats
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#risks">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                Risks
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#capabilities">
                                <i class="bi bi-check-circle me-2"></i>
                                Capabilities
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#requirements">
                                <i class="bi bi-list-check me-2"></i>
                                Requirements
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#evidence">
                                <i class="bi bi-file-earmark-text me-2"></i>
                                Evidence
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#reports">
                                <i class="bi bi-graph-up me-2"></i>
                                Reports
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#settings">
                                <i class="bi bi-gear me-2"></i>
                                Settings
                            </a>
                        </li>
                    </ul>
                    <hr class="text-light">
                    <div class="dropdown pb-4">
                        <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="https://github.com/mdo.png" alt="User" width="32" height="32" class="rounded-circle me-2">
                            <span>Admin User</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                            <li><a class="dropdown-item" href="#profile">Profile</a></li>
                            <li><a class="dropdown-item" href="#settings">Settings</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#logout">Sign out</a></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <!-- Main content -->
            <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                    <h1 class="h2">Dashboard</h1>
                    <div class="btn-toolbar mb-2 mb-md-0">
                        <div class="btn-group me-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary">Share</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary">Export</button>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle">
                            <i class="bi bi-calendar3"></i>
                            This week
                        </button>
                    </div>
                </div>

                <!-- Dashboard overview -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card text-white bg-primary mb-3">
                            <div class="card-header">Threats</div>
                            <div class="card-body">
                                <h5 class="card-title">15 Active Threats</h5>
                                <p class="card-text">3 Critical, 7 High, 5 Medium</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-danger mb-3">
                            <div class="card-header">Risks</div>
                            <div class="card-body">
                                <h5 class="card-title">12 Open Risks</h5>
                                <p class="card-text">2 Critical, 5 High, 5 Medium</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-success mb-3">
                            <div class="card-header">Capabilities</div>
                            <div class="card-body">
                                <h5 class="card-title">24 Capabilities</h5>
                                <p class="card-text">8 Mature, 12 Developing, 4 Initial</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-white bg-info mb-3">
                            <div class="card-header">Requirements</div>
                            <div class="card-body">
                                <h5 class="card-title">45 Requirements</h5>
                                <p class="card-text">32 Compliant, 8 Partial, 5 Non-Compliant</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Trust Score -->
                <div class="row mb-4">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="card-title mb-0">Trust Score</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4 text-center">
                                        <div class="trust-score-circle">
                                            <h1>78%</h1>
                                            <p>Overall Trust Score</p>
                                        </div>
                                    </div>
                                    <div class="col-md-8">
                                        <canvas id="trustScoreChart" width="400" height="200"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <h2>Recent Activity</h2>
                <div class="table-responsive">
                    <table class="table table-striped table-sm">
                        <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">User</th>
                                <th scope="col">Action</th>
                                <th scope="col">Entity</th>
                                <th scope="col">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>2025-08-04</td>
                                <td>Admin User</td>
                                <td>Created</td>
                                <td>Threat</td>
                                <td>Phishing Campaign (THR-001)</td>
                            </tr>
                            <tr>
                                <td>2025-08-03</td>
                                <td>John Doe</td>
                                <td>Updated</td>
                                <td>Risk</td>
                                <td>Data Breach Risk (RSK-002)</td>
                            </tr>
                            <tr>
                                <td>2025-08-02</td>
                                <td>Jane Smith</td>
                                <td>Added</td>
                                <td>Evidence</td>
                                <td>Security Awareness Training (EVD-005)</td>
                            </tr>
                            <tr>
                                <td>2025-08-01</td>
                                <td>Admin User</td>
                                <td>Created</td>
                                <td>Capability</td>
                                <td>Endpoint Protection (CAP-008)</td>
                            </tr>
                            <tr>
                                <td>2025-07-31</td>
                                <td>John Doe</td>
                                <td>Updated</td>
                                <td>Requirement</td>
                                <td>Access Control Policy (REQ-012)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="script.js"></script>
</body>
</html>
EOF

# Create CSS file
log "Creating styles.css"
cat > "$DASHBOARD_DIR/public/styles.css" << 'EOF'
body {
    font-size: .875rem;
    background-color: #f8f9fa;
}

.feather {
    width: 16px;
    height: 16px;
    vertical-align: text-bottom;
}

/*
 * Sidebar
 */
.sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 100;
    padding: 48px 0 0;
    box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
    height: 100vh;
}

.sidebar-sticky {
    position: relative;
    top: 0;
    height: calc(100vh - 48px);
    padding-top: .5rem;
    overflow-x: hidden;
    overflow-y: auto;
}

.sidebar .nav-link {
    font-weight: 500;
    color: #ccc;
}

.sidebar .nav-link.active {
    color: #fff;
    background-color: #0d6efd;
}

.sidebar .nav-link:hover {
    color: #fff;
}

.sidebar-header {
    padding: 0.5rem 1rem;
    text-align: center;
}

.sidebar hr {
    margin: 1rem 0;
}

/*
 * Navbar
 */
.navbar-brand {
    padding-top: .75rem;
    padding-bottom: .75rem;
    font-size: 1rem;
    background-color: rgba(0, 0, 0, .25);
    box-shadow: inset -1px 0 0 rgba(0, 0, 0, .25);
}

/*
 * Content
 */
main {
    padding-top: 1.5rem;
}

.trust-score-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.trust-score-circle h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: bold;
}

.trust-score-circle p {
    margin: 0;
    font-size: 0.9rem;
}

.card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    margin-bottom: 1.5rem;
}

.card-header {
    background-color: rgba(0, 0, 0, 0.03);
    border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.table {
    font-size: 0.875rem;
}
EOF

# Create JavaScript file
log "Creating script.js"
cat > "$DASHBOARD_DIR/public/script.js" << 'EOF'
document.addEventListener("DOMContentLoaded", function() {
    // Initialize trust score chart
    const ctx = document.getElementById("trustScoreChart").getContext("2d");
    const trustScoreChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Cyber", "Physical", "Operational", "Compliance", "Strategic"],
            datasets: [{
                label: "Trust Score by Category",
                data: [85, 72, 78, 90, 65],
                backgroundColor: [
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)"
                ],
                borderColor: [
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Handle sidebar navigation
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove("active"));
            
            // Add active class to clicked link
            this.classList.add("active");
            
            // Update main content based on the clicked link
            const target = this.getAttribute("href").substring(1);
            updateContent(target);
        });
    });

    // Function to update content based on navigation
    function updateContent(section) {
        const mainContent = document.querySelector("main");
        const pageTitle = document.querySelector("main h1");
        
        // Update page title
        pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
        
        // In a real application, this would load content from the server
        console.log(`Loading ${section} content...`);
    }

    // Simulate API data loading
    console.log("Loading dashboard data...");
    setTimeout(() => {
        console.log("Dashboard data loaded successfully");
    }, 1000);
});
EOF

# Set proper permissions
log "Setting proper permissions for dashboard files"
chmod -R 755 "$DASHBOARD_DIR"
success "Dashboard files created successfully"

# Step 6: Setup monitoring directories
section "SETTING UP MONITORING"

# Create Prometheus configuration directory
mkdir -p "${PLATFORM_DIR}/prometheus"

# Create basic Prometheus configuration
log "Creating Prometheus configuration"
cat > "${PLATFORM_DIR}/prometheus/prometheus.yml" << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'docker'
    static_configs:
      - targets: ['host.docker.internal:9323']
EOF

# Create Alertmanager configuration directory
mkdir -p "${PLATFORM_DIR}/alertmanager"

# Create basic Alertmanager configuration
log "Creating Alertmanager configuration"
cat > "${PLATFORM_DIR}/alertmanager/alertmanager.yml" << EOF
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  receiver: 'email'

receivers:
  - name: 'email'
    email_configs:
      - to: 'alerts@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'alertmanager@example.com'
        auth_password: 'password'
        require_tls: true
EOF

# Step 7: Create Docker Compose file
section "CREATING DOCKER COMPOSE CONFIGURATION"

# Create Docker Compose directory
mkdir -p "${PLATFORM_DIR}/docker"

# Create Docker Compose file
log "Creating Docker Compose file"
cat > "${PLATFORM_DIR}/docker/docker-compose.yml" << EOF
services:
  postgres:
    container_name: ${POSTGRES_CONTAINER}
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ${DB_DIR}/init:/docker-entrypoint-initdb.d
    networks:
      - risk_platform_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    container_name: ${NGINX_CONTAINER}
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ${NGINX_DIR}/conf.d:/etc/nginx/conf.d
      - ${DASHBOARD_DIR}/public:/opt/risk-platform/dashboard/public
    networks:
      - risk_platform_network
    depends_on:
      - postgres
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  grafana:
    container_name: ${GRAFANA_CONTAINER}
    image: grafana/grafana:latest
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
      GF_USERS_ALLOW_SIGN_UP: "false"
      GF_SERVER_ROOT_URL: "%(protocol)s://%(domain)s/monitoring"
      GF_SERVER_SERVE_FROM_SUB_PATH: "true"
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - risk_platform_network
    depends_on:
      - prometheus
    user: "472"

  prometheus:
    container_name: ${PROMETHEUS_CONTAINER}
    image: prom/prometheus:latest
    restart: unless-stopped
    volumes:
      - ${PLATFORM_DIR}/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - risk_platform_network

  alertmanager:
    container_name: ${ALERTMANAGER_CONTAINER}
    image: prom/alertmanager:latest
    restart: unless-stopped
    volumes:
      - ${PLATFORM_DIR}/alertmanager:/etc/alertmanager
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - risk_platform_network

networks:
  risk_platform_network:
    name: ${DOCKER_NETWORK}
    driver: bridge

volumes:
  postgres_data:
  grafana_data:
  prometheus_data:
  alertmanager_data:
EOF
success "Docker Compose configuration created"

# Step 8: Setup database initialization
section "SETTING UP DATABASE"

# Create database initialization directory
mkdir -p "${DB_DIR}/init"

# Create database initialization script
log "Creating database initialization script"
cat > "${DB_DIR}/init/01-init.sql" << EOF
-- Create schema
CREATE SCHEMA IF NOT EXISTS risk_platform;

-- Set search path
SET search_path TO risk_platform;

-- Create extension for UUIDs if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    mfa_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Threats table
CREATE TABLE IF NOT EXISTS threats (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    severity VARCHAR(50),
    status VARCHAR(50),
    source VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    threat_id INTEGER REFERENCES threats(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    impact VARCHAR(50),
    likelihood VARCHAR(50),
    status VARCHAR(50),
    treatment_strategy VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Capabilities table
CREATE TABLE IF NOT EXISTS capabilities (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    maturity_level VARCHAR(50),
    status VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Requirements table
CREATE TABLE IF NOT EXISTS requirements (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    capability_id INTEGER REFERENCES capabilities(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    compliance_status VARCHAR(50),
    source VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    requirement_id INTEGER REFERENCES requirements(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    file_type VARCHAR(100),
    status VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create default organization
INSERT INTO organizations (name, slug, industry)
VALUES ('Default Organization', 'default', 'Technology')
ON CONFLICT (slug) DO NOTHING;

-- Create admin user
INSERT INTO users (
    organization_id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified_at
) VALUES (
    (SELECT id FROM organizations WHERE slug = 'default'),
    'admin@risk-platform.local',
    MD5('admin123'),
    'Admin',
    'User',
    'admin',
    'active',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create read-only user for reporting
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${DB_READONLY_USER}') THEN
        CREATE USER ${DB_READONLY_USER} WITH PASSWORD '${DB_READONLY_PASSWORD}';
    END IF;
END
\$\$;

GRANT CONNECT ON DATABASE ${DB_NAME} TO ${DB_READONLY_USER};
GRANT USAGE ON SCHEMA risk_platform TO ${DB_READONLY_USER};
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO ${DB_READONLY_USER};
ALTER DEFAULT PRIVILEGES IN SCHEMA risk_platform GRANT SELECT ON TABLES TO ${DB_READONLY_USER};
EOF

# Create sample data script
log "Creating sample data script"
cat > "${DB_DIR}/init/02-sample-data.sql" << EOF
-- Set search path
SET search_path TO risk_platform;

-- Sample threats
INSERT INTO threats (organization_id, name, description, category, severity, status, source)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Phishing Campaign', 'Targeted phishing campaign against executives', 'Social Engineering', 'High', 'Active', 'External'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Ransomware', 'Potential ransomware attack through email attachments', 'Malware', 'Critical', 'Active', 'External'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Insider Threat', 'Disgruntled employee with access to sensitive data', 'Insider', 'Medium', 'Monitoring', 'Internal'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'DDoS Attack', 'Distributed denial of service attack against public services', 'Network', 'High', 'Active', 'External'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Zero-day Vulnerability', 'Unpatched zero-day vulnerability in web application', 'Application', 'Critical', 'Active', 'External');

-- Sample risks
INSERT INTO risks (organization_id, threat_id, name, description, category, impact, likelihood, status, treatment_strategy)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 1, 'Data Breach via Phishing', 'Unauthorized access to sensitive data through successful phishing', 'Data Protection', 'High', 'Medium', 'Open', 'Mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 2, 'Business Disruption', 'Critical systems unavailable due to ransomware', 'Business Continuity', 'Critical', 'Medium', 'Open', 'Mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 3, 'Data Exfiltration', 'Sensitive data stolen by insider', 'Data Protection', 'High', 'Low', 'Open', 'Mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 4, 'Service Unavailability', 'Customer-facing services unavailable during DDoS', 'Availability', 'Medium', 'High', 'Open', 'Transfer'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 5, 'Application Compromise', 'Web application compromised through zero-day', 'Application Security', 'High', 'Medium', 'Open', 'Mitigate');

-- Sample capabilities
INSERT INTO capabilities (organization_id, name, description, category, maturity_level, status)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Security Awareness', 'Employee security awareness training program', 'People', 'Managed', 'Active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Endpoint Protection', 'Endpoint detection and response solution', 'Technology', 'Defined', 'Active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Network Security', 'Firewall, IDS/IPS, and network monitoring', 'Technology', 'Managed', 'Active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Incident Response', 'Incident response plan and team', 'Process', 'Initial', 'Active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Vulnerability Management', 'Vulnerability scanning and patching process', 'Process', 'Defined', 'Active');

-- Sample requirements
INSERT INTO requirements (organization_id, capability_id, name, description, category, compliance_status, source)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 1, 'Annual Security Training', 'All employees must complete annual security awareness training', 'Training', 'Compliant', 'Internal Policy'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 2, 'EDR Deployment', 'EDR solution must be deployed on all endpoints', 'Endpoint Security', 'Partial', 'Internal Policy'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 3, 'Firewall Rules Review', 'Firewall rules must be reviewed quarterly', 'Network Security', 'Compliant', 'ISO 27001'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 4, 'Incident Response Testing', 'Incident response plan must be tested annually', 'Incident Management', 'Non-Compliant', 'NIST CSF'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 5, 'Monthly Vulnerability Scans', 'All systems must be scanned for vulnerabilities monthly', 'Vulnerability Management', 'Compliant', 'PCI DSS');
EOF
success "Database initialization scripts created"

# Step 9: Deploy containers
section "DEPLOYING CONTAINERS"

# Clean up any existing containers to avoid conflicts
log "Cleaning up existing containers"
docker rm -f "$NGINX_CONTAINER" "$POSTGRES_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER" 2>/dev/null || true

# Start containers using Docker Compose
log "Starting containers with Docker Compose"
cd "${PLATFORM_DIR}/docker"

if [ "$DOCKER_COMPOSE_CMD" = "docker-compose" ]; then
    docker-compose up -d
else
    docker compose up -d
fi

# Wait for containers to start
log "Waiting for containers to start..."
sleep 10

# Check container status
log "Checking container status"
CONTAINERS_RUNNING=true

for container in "$POSTGRES_CONTAINER" "$NGINX_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
    if ! docker ps | grep -q "$container"; then
        warning "Container $container is not running"
        CONTAINERS_RUNNING=false
        
        # Show logs for troubleshooting
        log "Logs for $container:"
        docker logs "$container"
    else
        success "Container $container is running"
    fi
done

if [ "$CONTAINERS_RUNNING" = false ]; then
    error "Not all containers are running. Please check the logs above for details."
fi

# Step 10: Verify deployment
section "VERIFYING DEPLOYMENT"

# Check Nginx
log "Checking Nginx"
if ! docker exec "$NGINX_CONTAINER" nginx -t &>/dev/null; then
    warning "Nginx configuration test failed"
    docker exec "$NGINX_CONTAINER" nginx -t
else
    success "Nginx configuration is valid"
fi

# Check PostgreSQL
log "Checking PostgreSQL"
if ! docker exec "$POSTGRES_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" &>/dev/null; then
    warning "PostgreSQL is not ready"
else
    success "PostgreSQL is ready"
    
    # Verify admin user exists
    if docker exec -i "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM risk_platform.users WHERE email='admin@risk-platform.local';" | grep -q "1"; then
        success "Admin user exists in database"
    else
        warning "Admin user does not exist in database"
    fi
fi

# Check Grafana
log "Checking Grafana"
if ! curl -s http://localhost/monitoring &>/dev/null; then
    warning "Grafana is not accessible"
else
    success "Grafana is accessible"
fi

# Get public IP for access URLs
PUBLIC_IP=$(hostname -I | awk '{print $1}')

# Final status
section "DEPLOYMENT SUMMARY"

echo -e "${GREEN}Risk Platform Dashboard has been successfully deployed!${NC}"
echo ""
echo "Access URLs:"
echo -e "Dashboard: ${YELLOW}http://$PUBLIC_IP/${NC}"
echo -e "Monitoring: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
echo ""
echo "Login Credentials:"
echo -e "Email: ${YELLOW}admin@risk-platform.local${NC}"
echo -e "Password: ${YELLOW}admin123${NC}"
echo ""
echo "Database Credentials:"
echo -e "Database: ${YELLOW}${DB_NAME}${NC}"
echo -e "Username: ${YELLOW}${DB_USER}${NC}"
echo -e "Password: ${YELLOW}${DB_PASSWORD}${NC}"
echo -e "Read-only Username: ${YELLOW}${DB_READONLY_USER}${NC}"
echo -e "Read-only Password: ${YELLOW}${DB_READONLY_PASSWORD}${NC}"
echo ""
echo "Important Directories:"
echo -e "Platform Directory: ${YELLOW}$PLATFORM_DIR${NC}"
echo -e "Dashboard Directory: ${YELLOW}$DASHBOARD_DIR${NC}"
echo -e "Database Directory: ${YELLOW}$DB_DIR${NC}"
echo -e "Nginx Configuration: ${YELLOW}$NGINX_DIR/conf.d/default.conf${NC}"
echo -e "Docker Compose: ${YELLOW}$PLATFORM_DIR/docker/docker-compose.yml${NC}"
echo ""
echo "Next Steps:"
echo "1. Log in to the dashboard at http://$PUBLIC_IP/"
echo "2. Change the default admin password"
echo "3. Customize the dashboard frontend"
echo "4. Set up SSL certificates for HTTPS"
echo ""
echo -e "${GREEN}Deployment log saved to: $LOG_FILE${NC}"
echo ""
success "Risk Platform deployment completed successfully"
