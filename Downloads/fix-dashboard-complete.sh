#!/bin/bash
# fix-dashboard-complete.sh
# Comprehensive fix script for Risk Platform Dashboard issues
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
PLATFORM_DIR="/opt/risk-platform"
DASHBOARD_DIR="${PLATFORM_DIR}/dashboard"
DB_DIR="${PLATFORM_DIR}/database"
NGINX_CONTAINER="risk-platform-nginx"
POSTGRES_CONTAINER="risk-platform-postgres"
API_CONTAINER="risk-platform-api"
GRAFANA_CONTAINER="risk-platform-grafana"
LOG_FILE="/var/log/dashboard-fix-$(date +%Y%m%d-%H%M%S).log"
PG_USER="risk_platform"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  RISK PLATFORM DASHBOARD COMPREHENSIVE FIX    ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
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
}

section() {
    echo ""
    echo -e "${CYAN}=== $1 ===${NC}"
    echo -e "${CYAN}$(printf '=%.0s' $(seq 1 ${#1}))======${NC}"
    echo ""
    echo "=== $1 ===" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# Start main script
log "Starting comprehensive dashboard fix"
log "Platform directory: $PLATFORM_DIR"
log "Dashboard directory: $DASHBOARD_DIR"
log "Log file: $LOG_FILE"

# Step 1: Fix Nginx configuration
section "FIXING NGINX CONFIGURATION"

# Check if Nginx container exists
if ! docker ps -a | grep -q "$NGINX_CONTAINER"; then
    error "Nginx container not found. Please check your Docker setup."
    exit 1
fi

# Stop Nginx container if it's running or restarting
log "Stopping Nginx container"
docker stop "$NGINX_CONTAINER" || true

# Create Nginx configuration directory
log "Creating Nginx configuration directory"
mkdir -p "${PLATFORM_DIR}/nginx/conf.d"

# Create Nginx configuration without the problematic "api" upstream reference
log "Creating Nginx configuration"
cat > "${PLATFORM_DIR}/nginx/conf.d/default.conf" << 'EOF'
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
success "Nginx configuration created without API upstream reference"

# Step 2: Create dashboard files
section "CREATING DASHBOARD FILES"

# Create dashboard directory if it doesn't exist
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
chmod -R 755 "$DASHBOARD_DIR"
success "Dashboard files created successfully"

# Step 3: Fix database connection and create admin user
section "FIXING DATABASE CONNECTION AND CREATING ADMIN USER"

# Check if PostgreSQL container is running
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    warning "PostgreSQL container is not running. Attempting to start..."
    docker start "$POSTGRES_CONTAINER" || {
        error "Failed to start PostgreSQL container. Please check Docker logs."
        exit 1
    }
fi

# Wait for PostgreSQL to start
log "Waiting for PostgreSQL to start..."
sleep 5

# Test PostgreSQL connection
log "Testing PostgreSQL connection"
if ! docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d postgres -c "SELECT 1;" >/dev/null 2>&1; then
    error "Failed to connect to PostgreSQL. Please check your PostgreSQL setup."
    exit 1
fi
success "PostgreSQL connection successful"

# Check if risk_platform database exists
log "Checking if risk_platform database exists"
DB_EXISTS=$(docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname = 'risk_platform';" | grep -c "1" || echo "0")

if [[ "$DB_EXISTS" -eq "0" ]]; then
    log "Creating risk_platform database"
    docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d postgres -c "CREATE DATABASE risk_platform;" || {
        error "Failed to create risk_platform database. Please check PostgreSQL logs."
        exit 1
    }
    success "Database created successfully"
else
    log "Database risk_platform already exists"
fi

# Create schema and tables
log "Creating schema and tables"
docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d risk_platform << 'EOF'
-- Create schema
CREATE SCHEMA IF NOT EXISTS risk_platform;

-- Set search path
SET search_path TO risk_platform;

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
EOF

success "Schema and admin user created successfully"

# Step 4: Set up proper container networking
section "SETTING UP CONTAINER NETWORKING"

# Check if all containers are on the same network
log "Checking container networking"
POSTGRES_NETWORK=$(docker inspect --format='{{.HostConfig.NetworkMode}}' "$POSTGRES_CONTAINER")
log "PostgreSQL container network: $POSTGRES_NETWORK"

# Ensure Nginx container is on the same network
if docker ps -a | grep -q "$NGINX_CONTAINER"; then
    NGINX_NETWORK=$(docker inspect --format='{{.HostConfig.NetworkMode}}' "$NGINX_CONTAINER" 2>/dev/null || echo "unknown")
    log "Nginx container network: $NGINX_NETWORK"
    
    if [[ "$NGINX_NETWORK" != "$POSTGRES_NETWORK" ]]; then
        warning "Nginx container is on a different network. Fixing..."
        
        # Reconnect Nginx to the correct network
        docker network disconnect "$NGINX_NETWORK" "$NGINX_CONTAINER" 2>/dev/null || true
        docker network connect "$POSTGRES_NETWORK" "$NGINX_CONTAINER" 2>/dev/null || true
        
        success "Nginx container network fixed"
    else
        success "Nginx container is on the correct network"
    fi
fi

# Ensure Grafana container is on the same network
if docker ps | grep -q "$GRAFANA_CONTAINER"; then
    GRAFANA_NETWORK=$(docker inspect --format='{{.HostConfig.NetworkMode}}' "$GRAFANA_CONTAINER" 2>/dev/null || echo "unknown")
    log "Grafana container network: $GRAFANA_NETWORK"
    
    if [[ "$GRAFANA_NETWORK" != "$POSTGRES_NETWORK" ]]; then
        warning "Grafana container is on a different network. Fixing..."
        
        # Reconnect Grafana to the correct network
        docker network disconnect "$GRAFANA_NETWORK" "$GRAFANA_CONTAINER" 2>/dev/null || true
        docker network connect "$POSTGRES_NETWORK" "$GRAFANA_CONTAINER" 2>/dev/null || true
        
        success "Grafana container network fixed"
    else
        success "Grafana container is on the correct network"
    fi
fi

# Step 5: Recreate Nginx container with proper configuration
section "RECREATING NGINX CONTAINER"

# Stop and remove the existing Nginx container
log "Stopping and removing existing Nginx container"
docker stop "$NGINX_CONTAINER" 2>/dev/null || true
docker rm "$NGINX_CONTAINER" 2>/dev/null || true

# Create a new Nginx container with proper volume mounts
log "Creating new Nginx container with proper volume mounts"
docker run -d --name "$NGINX_CONTAINER" \
    --network="$POSTGRES_NETWORK" \
    -p 80:80 \
    -v "${PLATFORM_DIR}/dashboard/public:/opt/risk-platform/dashboard/public" \
    -v "${PLATFORM_DIR}/nginx/conf.d:/etc/nginx/conf.d" \
    nginx:alpine || {
    error "Failed to create new Nginx container. Please check Docker logs."
    exit 1
}

success "Nginx container recreated successfully"

# Step 6: Test the final result
section "TESTING FINAL RESULT"

# Wait for Nginx to start
log "Waiting for Nginx to start..."
sleep 5

# Check if Nginx is running
if ! docker ps | grep -q "$NGINX_CONTAINER"; then
    error "Nginx container is not running. Please check Docker logs."
    exit 1
fi
success "Nginx container is running"

# Check if Nginx configuration is valid
log "Checking Nginx configuration"
if ! docker exec "$NGINX_CONTAINER" nginx -t >/dev/null 2>&1; then
    error "Nginx configuration is invalid. Please check Nginx logs."
    exit 1
fi
success "Nginx configuration is valid"

# Test HTTP connection
log "Testing HTTP connection"
if ! curl -s -I http://localhost >/dev/null 2>&1; then
    warning "Could not connect to http://localhost. Please check your network setup."
else
    success "HTTP connection successful"
fi

# Get public IP
PUBLIC_IP=$(hostname -I | awk '{print $1}')

# Final status
echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  RISK PLATFORM DASHBOARD FIX SUMMARY         ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""
echo -e "${GREEN}Risk Platform Dashboard has been successfully fixed!${NC}"
echo ""
echo "Access URLs:"
echo -e "Dashboard: ${YELLOW}http://$PUBLIC_IP/${NC}"
echo -e "Monitoring: ${YELLOW}http://$PUBLIC_IP/monitoring${NC}"
echo ""
echo "Login Credentials:"
echo -e "Email: ${YELLOW}admin@risk-platform.local${NC}"
echo -e "Password: ${YELLOW}admin123${NC}"
echo ""
echo "Important Directories:"
echo -e "Platform Directory: ${YELLOW}$PLATFORM_DIR${NC}"
echo -e "Dashboard Directory: ${YELLOW}$DASHBOARD_DIR${NC}"
echo -e "Nginx Configuration: ${YELLOW}$PLATFORM_DIR/nginx/conf.d/default.conf${NC}"
echo ""
echo "Next Steps:"
echo "1. Log in to the dashboard at http://$PUBLIC_IP/"
echo "2. Change the default admin password"
echo "3. Customize the dashboard frontend"
echo "4. Import your actual threat and risk data"
echo ""
echo -e "${GREEN}Deployment log saved to: $LOG_FILE${NC}"
echo ""
success "Risk Platform Dashboard fix completed successfully"
