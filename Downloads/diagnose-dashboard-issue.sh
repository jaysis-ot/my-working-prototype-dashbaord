#!/bin/bash
# diagnose-dashboard-issue.sh
# Comprehensive diagnostic script for Risk Platform Dashboard issues
# Version: 1.0.0
# Date: 2025-08-04

# Set error handling (but don't exit on errors since this is a diagnostic script)
set -o pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_DIR="/opt/risk-platform"
DASHBOARD_DIR="${PLATFORM_DIR}/dashboard"
DB_DIR="${PLATFORM_DIR}/database"
SCRIPTS_DIR="${PLATFORM_DIR}/scripts"
NGINX_CONTAINER="risk-platform-nginx"
POSTGRES_CONTAINER="risk-platform-postgres"
API_CONTAINER="risk-platform-api"
GRAFANA_CONTAINER="risk-platform-grafana"
PROMETHEUS_CONTAINER="risk-platform-prometheus"
ALERTMANAGER_CONTAINER="risk-platform-alertmanager"
LOG_FILE="/var/log/dashboard-diagnosis-$(date +%Y%m%d-%H%M%S).log"
PG_USER="risk_platform"  # Using the discovered PostgreSQL user
FIX_SCRIPTS_DIR="/home/jay/Downloads/dashboard-fixes"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  RISK PLATFORM DASHBOARD DIAGNOSTIC TOOL      ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

# Create fix scripts directory
mkdir -p "$FIX_SCRIPTS_DIR"

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

debug() { 
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${MAGENTA}DEBUG:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] DEBUG: $1" >> "$LOG_FILE"
}

section() {
    echo ""
    echo -e "${CYAN}=== $1 ===${NC}"
    echo -e "${CYAN}$(printf '=%.0s' $(seq 1 ${#1}))======${NC}"
    echo ""
    echo "=== $1 ===" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# Function to create fix script
create_fix_script() {
    local script_name="$1"
    local script_content="$2"
    local script_path="${FIX_SCRIPTS_DIR}/${script_name}"
    
    echo "$script_content" > "$script_path"
    chmod +x "$script_path"
    
    echo -e "${GREEN}Created fix script:${NC} $script_path"
    echo "Run the script with: $script_path"
}

# Start main script
log "Starting Risk Platform Dashboard diagnostic"
log "Platform directory: $PLATFORM_DIR"
log "Dashboard directory: $DASHBOARD_DIR"
log "Log file: $LOG_FILE"

# Step 1: Check Docker and container status
section "CHECKING DOCKER STATUS AND CONTAINERS"

if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
    exit 1
fi
success "Docker is running"

# Check all containers status
log "Checking status of all containers"
echo -e "\n${YELLOW}Container Status:${NC}"
docker ps -a | grep "risk-platform" | awk '{print $1, $2, $(NF)}' | while read -r id image name; do
    status=$(docker inspect -f '{{.State.Status}}' "$id")
    if [[ "$status" == "running" ]]; then
        echo -e "  ${GREEN}✓${NC} $name ($image): $status"
    else
        echo -e "  ${RED}✗${NC} $name ($image): $status"
    fi
done

# Get detailed info for each container
for container in "$NGINX_CONTAINER" "$POSTGRES_CONTAINER" "$API_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
    if docker ps | grep -q "$container"; then
        log "Container $container is running"
        
        # Check container logs for errors
        log "Checking last 10 log entries for $container"
        echo -e "\n${YELLOW}Last 10 log entries for $container:${NC}"
        docker logs --tail 10 "$container" | while read -r line; do
            if echo "$line" | grep -i -E "error|fatal|warn|fail" > /dev/null; then
                echo -e "  ${RED}$line${NC}"
            else
                echo "  $line"
            fi
        done
    else
        warning "Container $container is not running"
        
        # Try to start the container
        log "Attempting to start $container"
        if docker start "$container" 2>/dev/null; then
            success "Started $container"
        else
            error "Failed to start $container"
        fi
    fi
done

# Step 2: Check Nginx configuration and what's being served
section "CHECKING NGINX CONFIGURATION AND CONTENT"

# Check if Nginx container is running
if ! docker ps | grep -q "$NGINX_CONTAINER"; then
    error "Nginx container is not running. Cannot check configuration."
else
    # Check Nginx configuration
    log "Checking Nginx configuration"
    nginx_conf=$(docker exec -i "$NGINX_CONTAINER" cat /etc/nginx/conf.d/default.conf 2>/dev/null)
    
    if [[ -n "$nginx_conf" ]]; then
        success "Found Nginx configuration"
        echo -e "\n${YELLOW}Nginx Configuration:${NC}"
        echo "$nginx_conf" | while read -r line; do
            echo "  $line"
        done
        
        # Check for common configuration issues
        if ! echo "$nginx_conf" | grep -q "root /opt/risk-platform/dashboard/public"; then
            error "Nginx configuration does not point to the correct root directory"
            
            # Create fix script
            create_fix_script "fix-nginx-root.sh" '#!/bin/bash
# Fix Nginx root directory configuration
set -e
echo "Fixing Nginx root directory configuration..."
cat > /tmp/default.conf << EOF
# Dashboard Configuration
server {
    listen 80;
    server_name _;

    # Dashboard
    location / {
        root /opt/risk-platform/dashboard/public;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Monitoring
    location /monitoring {
        proxy_pass http://grafana:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        root /opt/risk-platform/dashboard/public;
        expires max;
        log_not_found off;
    }
}
EOF
docker cp /tmp/default.conf risk-platform-nginx:/etc/nginx/conf.d/default.conf
docker exec risk-platform-nginx nginx -t
docker restart risk-platform-nginx
echo "Nginx configuration fixed and restarted!"
'
        fi
        
        if ! echo "$nginx_conf" | grep -q "try_files"; then
            warning "Nginx configuration missing try_files directive for SPA routing"
        fi
    else
        error "Could not retrieve Nginx configuration"
        
        # Create fix script
        create_fix_script "create-nginx-config.sh" '#!/bin/bash
# Create Nginx configuration
set -e
echo "Creating Nginx configuration..."
mkdir -p /opt/risk-platform/nginx/conf.d
cat > /opt/risk-platform/nginx/conf.d/default.conf << EOF
# Dashboard Configuration
server {
    listen 80;
    server_name _;

    # Dashboard
    location / {
        root /opt/risk-platform/dashboard/public;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Monitoring
    location /monitoring {
        proxy_pass http://grafana:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        root /opt/risk-platform/dashboard/public;
        expires max;
        log_not_found off;
    }
}
EOF
docker cp /opt/risk-platform/nginx/conf.d/default.conf risk-platform-nginx:/etc/nginx/conf.d/default.conf
docker restart risk-platform-nginx
echo "Nginx configuration created and container restarted!"
'
    fi
    
    # Check Nginx logs
    log "Checking Nginx error logs"
    nginx_error_log=$(docker exec -i "$NGINX_CONTAINER" cat /var/log/nginx/error.log 2>/dev/null | tail -n 20)
    
    if [[ -n "$nginx_error_log" ]]; then
        warning "Found Nginx error logs"
        echo -e "\n${YELLOW}Nginx Error Logs:${NC}"
        echo "$nginx_error_log" | while read -r line; do
            echo "  $line"
        done
    else
        success "No recent Nginx error logs found"
    fi
    
    # Check Nginx access logs
    log "Checking Nginx access logs"
    nginx_access_log=$(docker exec -i "$NGINX_CONTAINER" cat /var/log/nginx/access.log 2>/dev/null | tail -n 10)
    
    if [[ -n "$nginx_access_log" ]]; then
        log "Found Nginx access logs"
        echo -e "\n${YELLOW}Nginx Access Logs:${NC}"
        echo "$nginx_access_log" | while read -r line; do
            echo "  $line"
        done
    else
        warning "No Nginx access logs found"
    fi
    
    # Check what files are actually in the dashboard directory
    log "Checking what files are in the dashboard directory"
    dashboard_files=$(docker exec -i "$NGINX_CONTAINER" ls -la /opt/risk-platform/dashboard/public 2>/dev/null)
    
    if [[ -n "$dashboard_files" ]]; then
        success "Found files in dashboard directory"
        echo -e "\n${YELLOW}Dashboard Files:${NC}"
        echo "$dashboard_files" | while read -r line; do
            echo "  $line"
        done
        
        # Check for essential files
        if ! echo "$dashboard_files" | grep -q "index.html"; then
            error "index.html is missing from dashboard directory"
            
            # Create fix script
            create_fix_script "create-dashboard-files.sh" '#!/bin/bash
# Create dashboard files
set -e
echo "Creating dashboard files..."
mkdir -p /opt/risk-platform/dashboard/public
cat > /opt/risk-platform/dashboard/public/index.html << EOF
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

cat > /opt/risk-platform/dashboard/public/styles.css << EOF
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

cat > /opt/risk-platform/dashboard/public/script.js << EOF
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

chmod -R 755 /opt/risk-platform/dashboard
docker cp /opt/risk-platform/dashboard/public risk-platform-nginx:/opt/risk-platform/dashboard/
docker restart risk-platform-nginx
echo "Dashboard files created and container restarted!"
'
        fi
        
        if ! echo "$dashboard_files" | grep -q "styles.css"; then
            warning "styles.css is missing from dashboard directory"
        fi
        
        if ! echo "$dashboard_files" | grep -q "script.js"; then
            warning "script.js is missing from dashboard directory"
        fi
    else
        error "No files found in dashboard directory"
        
        # Create fix script (same as above)
        create_fix_script "create-dashboard-files.sh" '#!/bin/bash
# Create dashboard files
set -e
echo "Creating dashboard files..."
mkdir -p /opt/risk-platform/dashboard/public
# ... (same content as above) ...
'
    fi
    
    # Check what's being served by Nginx
    log "Checking what's being served by Nginx"
    
    # Use curl to check what's being served
    curl_result=$(curl -s -I http://localhost 2>/dev/null)
    
    if [[ -n "$curl_result" ]]; then
        log "Received HTTP response from Nginx"
        echo -e "\n${YELLOW}HTTP Response Headers:${NC}"
        echo "$curl_result" | while read -r line; do
            echo "  $line"
        done
        
        # Check for common HTTP issues
        if echo "$curl_result" | grep -q "HTTP/1.1 404"; then
            error "Nginx is returning 404 Not Found"
        elif echo "$curl_result" | grep -q "HTTP/1.1 403"; then
            error "Nginx is returning 403 Forbidden"
        elif echo "$curl_result" | grep -q "HTTP/1.1 500"; then
            error "Nginx is returning 500 Internal Server Error"
        elif echo "$curl_result" | grep -q "HTTP/1.1 502"; then
            error "Nginx is returning 502 Bad Gateway"
        elif echo "$curl_result" | grep -q "HTTP/1.1 200"; then
            success "Nginx is returning 200 OK"
        fi
    else
        warning "Could not get HTTP response from Nginx"
    fi
fi

# Step 3: Check database connection and admin user
section "CHECKING DATABASE CONNECTION AND ADMIN USER"

# Check if PostgreSQL container is running
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    error "PostgreSQL container is not running. Cannot check database."
else
    # Test PostgreSQL connection
    log "Testing PostgreSQL connection"
    if docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d risk_platform -c "SELECT 1;" >/dev/null 2>&1; then
        success "PostgreSQL connection successful"
        
        # Check if risk_platform schema exists
        log "Checking if risk_platform schema exists"
        schema_exists=$(docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d risk_platform -t -c "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = 'risk_platform';" 2>/dev/null)
        
        if [[ "$schema_exists" -eq "1" ]]; then
            success "risk_platform schema exists"
            
            # Check if admin user exists
            log "Checking if admin user exists"
            admin_exists=$(docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d risk_platform -t -c "SELECT COUNT(*) FROM risk_platform.users WHERE email = 'admin@risk-platform.local';" 2>/dev/null)
            
            if [[ "$admin_exists" -eq "1" ]]; then
                success "Admin user exists in the database"
            else
                error "Admin user does not exist in the database"
                
                # Create fix script
                create_fix_script "create-admin-user.sh" '#!/bin/bash
# Create admin user in database
set -e
echo "Creating admin user in database..."
docker exec -i risk-platform-postgres psql -U risk_platform -d risk_platform << EOF
-- Create default organization if it doesn't exist
INSERT INTO risk_platform.organizations (name, slug, industry)
VALUES ('"'"'Default Organization'"'"', '"'"'default'"'"', '"'"'Technology'"'"')
ON CONFLICT (slug) DO NOTHING;

-- Create admin user
INSERT INTO risk_platform.users (
    organization_id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    email_verified_at
) VALUES (
    (SELECT id FROM risk_platform.organizations WHERE slug = '"'"'default'"'"'),
    '"'"'admin@risk-platform.local'"'"',
    MD5('"'"'admin123'"'"'),
    '"'"'Admin'"'"',
    '"'"'User'"'"',
    '"'"'admin'"'"',
    '"'"'active'"'"',
    NOW()
) ON CONFLICT (email) DO NOTHING;
EOF
echo "Admin user created successfully!"
'
            fi
            
            # Check database tables
            log "Checking database tables"
            tables=$(docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d risk_platform -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'risk_platform';" 2>/dev/null)
            
            if [[ -n "$tables" ]]; then
                success "Found database tables"
                echo -e "\n${YELLOW}Database Tables:${NC}"
                echo "$tables" | while read -r line; do
                    echo "  $line"
                done
            else
                error "No tables found in risk_platform schema"
                
                # Create fix script
                create_fix_script "create-database-schema.sh" '#!/bin/bash
# Create database schema
set -e
echo "Creating database schema..."
docker exec -i risk-platform-postgres psql -U risk_platform -d risk_platform << EOF
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
    status VARCHAR(50) DEFAULT '"'"'active'"'"',
    mfa_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create default organization
INSERT INTO organizations (name, slug, industry)
VALUES ('"'"'Default Organization'"'"', '"'"'default'"'"', '"'"'Technology'"'"')
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
    (SELECT id FROM organizations WHERE slug = '"'"'default'"'"'),
    '"'"'admin@risk-platform.local'"'"',
    MD5('"'"'admin123'"'"'),
    '"'"'Admin'"'"',
    '"'"'User'"'"',
    '"'"'admin'"'"',
    '"'"'active'"'"',
    NOW()
) ON CONFLICT (email) DO NOTHING;
EOF
echo "Database schema created successfully!"
'
            fi
        else
            error "risk_platform schema does not exist"
            
            # Create fix script (same as above)
            create_fix_script "create-database-schema.sh" '#!/bin/bash
# Create database schema
set -e
echo "Creating database schema..."
# ... (same content as above) ...
'
        fi
    else
        error "PostgreSQL connection failed"
        
        # Create fix script
        create_fix_script "fix-postgresql-connection.sh" '#!/bin/bash
# Fix PostgreSQL connection
set -e
echo "Fixing PostgreSQL connection..."
# Restart PostgreSQL container
docker restart risk-platform-postgres
sleep 5
# Check if database exists
DB_EXISTS=$(docker exec -i risk-platform-postgres psql -U risk_platform -t -c "SELECT 1 FROM pg_database WHERE datname = '"'"'risk_platform'"'"';" postgres 2>/dev/null)
if [[ -z "$DB_EXISTS" ]]; then
    echo "Creating risk_platform database..."
    docker exec -i risk-platform-postgres psql -U risk_platform -c "CREATE DATABASE risk_platform;" postgres
fi
echo "PostgreSQL connection fixed!"
'
    fi
fi

# Step 4: Check for port conflicts and networking issues
section "CHECKING PORT CONFLICTS AND NETWORKING"

# Check what's listening on port 80
log "Checking what's listening on port 80"
port_80=$(netstat -tuln | grep ":80 " || echo "")

if [[ -n "$port_80" ]]; then
    log "Found process listening on port 80"
    echo -e "\n${YELLOW}Process listening on port 80:${NC}"
    echo "$port_80" | while read -r line; do
        echo "  $line"
    done
    
    # Check if it's Nginx
    if ! echo "$port_80" | grep -q "docker"; then
        warning "Port 80 might be used by a process other than Docker/Nginx"
    fi
else
    error "No process is listening on port 80"
    
    # Create fix script
    create_fix_script "fix-port-80.sh" '#!/bin/bash
# Fix port 80 binding
set -e
echo "Fixing port 80 binding..."
# Check if Nginx container is running
if ! docker ps | grep -q "risk-platform-nginx"; then
    echo "Starting Nginx container..."
    docker start risk-platform-nginx || docker-compose -f /opt/risk-platform/docker-compose.yml up -d nginx
else
    echo "Restarting Nginx container..."
    docker restart risk-platform-nginx
fi
# Check if port 80 is now listening
sleep 2
if netstat -tuln | grep -q ":80 "; then
    echo "Port 80 is now listening!"
else
    echo "Port 80 is still not listening. Checking for conflicts..."
    CONFLICT=$(netstat -tuln | grep ":80 ")
    if [[ -n "$CONFLICT" ]]; then
        echo "Found conflict: $CONFLICT"
        echo "Please stop the conflicting process and try again."
    else
        echo "No conflicts found. Recreating Nginx container with explicit port mapping..."
        docker stop risk-platform-nginx || true
        docker rm risk-platform-nginx || true
        docker run -d --name risk-platform-nginx \
            --network="$(docker inspect --format='"'"'{{.HostConfig.NetworkMode}}'"'"' risk-platform-postgres)" \
            -p 80:80 \
            -v /opt/risk-platform/dashboard/public:/opt/risk-platform/dashboard/public \
            -v /opt/risk-platform/nginx/conf.d:/etc/nginx/conf.d \
            nginx:alpine
    fi
fi
echo "Port 80 binding fixed!"
'
fi

# Check Docker network
log "Checking Docker network"
docker_network=$(docker network ls | grep "$(docker inspect --format='{{.HostConfig.NetworkMode}}' "$POSTGRES_CONTAINER")" || echo "")

if [[ -n "$docker_network" ]]; then
    success "Found Docker network for containers"
    echo -e "\n${YELLOW}Docker Network:${NC}"
    echo "$docker_network" | while read -r line; do
        echo "  $line"
    done
    
    # Check if all containers are on the same network
    log "Checking if all containers are on the same network"
    network_name=$(docker inspect --format='{{.HostConfig.NetworkMode}}' "$POSTGRES_CONTAINER")
    
    all_on_same_network=true
    for container in "$NGINX_CONTAINER" "$API_CONTAINER" "$GRAFANA_CONTAINER" "$PROMETHEUS_CONTAINER" "$ALERTMANAGER_CONTAINER"; do
        if docker ps | grep -q "$container"; then
            container_network=$(docker inspect --format='{{.HostConfig.NetworkMode}}' "$container")
            if [[ "$container_network" != "$network_name" ]]; then
                warning "Container $container is on network $container_network, not on $network_name"
                all_on_same_network=false
            fi
        fi
    done
    
    if $all_on_same_network; then
        success "All containers are on the same network"
    else
        error "Not all containers are on the same network"
        
        # Create fix script
        create_fix_script "fix-container-network.sh" '#!/bin/bash
# Fix container network
set -e
echo "Fixing container network..."
# Get the network of PostgreSQL container
NETWORK_NAME=$(docker inspect --format='"'"'{{.HostConfig.NetworkMode}}'"'"' risk-platform-postgres)
echo "Target network: $NETWORK_NAME"
# Check each container
for container in risk-platform-nginx risk-platform-api risk-platform-grafana risk-platform-prometheus risk-platform-alertmanager; do
    if docker ps | grep -q "$container"; then
        CONTAINER_NETWORK=$(docker inspect --format='"'"'{{.HostConfig.NetworkMode}}'"'"' "$container")
        if [[ "$CONTAINER_NETWORK" != "$NETWORK_NAME" ]]; then
            echo "Container $container is on network $CONTAINER_NETWORK, reconnecting to $NETWORK_NAME..."
            # Reconnect container to the correct network
            docker network disconnect "$CONTAINER_NETWORK" "$container" || true
            docker network connect "$NETWORK_NAME" "$container" || true
        else
            echo "Container $container is already on the correct network."
        fi
    fi
done
echo "Container network fixed!"
'
    fi
else
    error "Could not determine Docker network for containers"
fi

# Step 5: Check for common dashboard display issues
section "CHECKING FOR COMMON DASHBOARD DISPLAY ISSUES"

# Check if external resources are accessible
log "Checking if external resources are accessible"
curl_bootstrap=$(curl -s -I "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 2>/dev/null)
curl_chartjs=$(curl -s -I "https://cdn.jsdelivr.net/npm/chart.js" 2>/dev/null)

if [[ -n "$curl_bootstrap" && -n "$curl_chartjs" ]]; then
    success "External resources are accessible"
else
    warning "External resources might not be accessible"
    
    # Create fix script to use local resources
    create_fix_script "use-local-resources.sh" '#!/bin/bash
# Use local resources instead of CDN
set -e
echo "Setting up local resources instead of CDN..."
mkdir -p /opt/risk-platform/dashboard/public/vendor/bootstrap
mkdir -p /opt/risk-platform/dashboard/public/vendor/chartjs
mkdir -p /opt/risk-platform/dashboard/public/vendor/bootstrap-icons

# Download Bootstrap
echo "Downloading Bootstrap..."
curl -s -L "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" > /opt/risk-platform/dashboard/public/vendor/bootstrap/bootstrap.min.css
curl -s -L "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" > /opt/risk-platform/dashboard/public/vendor/bootstrap/bootstrap.bundle.min.js

# Download Chart.js
echo "Downloading Chart.js..."
curl -s -L "https://cdn.jsdelivr.net/npm/chart.js" > /opt/risk-platform/dashboard/public/vendor/chartjs/chart.min.js

# Download Bootstrap Icons CSS
echo "Downloading Bootstrap Icons..."
curl -s -L "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" > /opt/risk-platform/dashboard/public/vendor/bootstrap-icons/bootstrap-icons.css

# Update index.html to use local resources
echo "Updating index.html to use local resources..."
sed -i '"'"'s|https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css|vendor/bootstrap/bootstrap.min.css|g'"'"' /opt/risk-platform/dashboard/public/index.html
sed -i '"'"'s|https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css|vendor/bootstrap-icons/bootstrap-icons.css|g'"'"' /opt/risk-platform/dashboard/public/index.html
sed -i '"'"'s|https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js|vendor/bootstrap/bootstrap.bundle.min.js|g'"'"' /opt/risk-platform/dashboard/public/index.html
sed -i '"'"'s|https://cdn.jsdelivr.net/npm/chart.js|vendor/chartjs/chart.min.js|g'"'"' /opt/risk-platform/dashboard/public/index.html

# Copy files to Nginx container
docker cp /opt/risk-platform/dashboard/public risk-platform-nginx:/opt/risk-platform/dashboard/
docker restart risk-platform-nginx
echo "Local resources setup completed!"
'
fi

# Check for browser compatibility issues
log "Checking for potential browser compatibility issues"
warning "Browser compatibility can only be fully tested in the browser"
log "Creating a simple test page to verify basic HTML/CSS/JS functionality"

# Create a simple test page
mkdir -p "$FIX_SCRIPTS_DIR/test-page"
cat > "$FIX_SCRIPTS_DIR/test-page/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Test Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .test-box {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .success {
            color: green;
        }
        .failure {
            color: red;
        }
    </style>
</head>
<body>
    <h1>Dashboard Test Page</h1>
    
    <div class="test-box">
        <h2>HTML Test</h2>
        <p>If you can see this text, HTML is working correctly.</p>
        <div id="html-result"></div>
    </div>
    
    <div class="test-box">
        <h2>CSS Test</h2>
        <p>This text should have <span style="color: blue; font-weight: bold;">blue and bold styling</span>.</p>
        <div id="css-result"></div>
    </div>
    
    <div class="test-box">
        <h2>JavaScript Test</h2>
        <p>Clicking the button should show a message.</p>
        <button id="test-button">Click Me</button>
        <div id="js-result"></div>
    </div>
    
    <div class="test-box">
        <h2>External Resources Test</h2>
        <p>Testing if external resources can be loaded:</p>
        <ul>
            <li>Bootstrap: <span id="bootstrap-result">Testing...</span></li>
            <li>Chart.js: <span id="chartjs-result">Testing...</span></li>
        </ul>
    </div>
    
    <script>
        // HTML Test
        document.getElementById('html-result').innerHTML = '<span class="success">✓ HTML is working</span>';
        
        // CSS Test
        if (window.getComputedStyle(document.querySelector('span[style]')).color === 'rgb(0, 0, 255)') {
            document.getElementById('css-result').innerHTML = '<span class="success">✓ CSS is working</span>';
        } else {
            document.getElementById('css-result').innerHTML = '<span class="failure">✗ CSS might not be working correctly</span>';
        }
        
        // JavaScript Test
        document.getElementById('test-button').addEventListener('click', function() {
            document.getElementById('js-result').innerHTML = '<span class="success">✓ JavaScript is working</span>';
        });
        
        // External Resources Test
        function testExternalResource(url, resultId) {
            const script = document.createElement('script');
            script.src = url;
            script.onload = function() {
                document.getElementById(resultId).innerHTML = '<span class="success">✓ Loaded successfully</span>';
            };
            script.onerror = function() {
                document.getElementById(resultId).innerHTML = '<span class="failure">✗ Failed to load</span>';
            };
            document.head.appendChild(script);
        }
        
        testExternalResource('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js', 'bootstrap-result');
        testExternalResource('https://cdn.jsdelivr.net/npm/chart.js', 'chartjs-result');
    </script>
</body>
</html>
EOF

log "Created test page at $FIX_SCRIPTS_DIR/test-page/index.html"
log "You can copy this to the Nginx container to test basic functionality:"
echo "docker cp $FIX_SCRIPTS_DIR/test-page/index.html $NGINX_CONTAINER:/opt/risk-platform/dashboard/public/test.html"

# Create comprehensive fix script
create_fix_script "comprehensive-dashboard-fix.sh" '#!/bin/bash
# Comprehensive dashboard fix script
set -e
echo "Starting comprehensive dashboard fix..."

# 1. Check and fix PostgreSQL
echo "Checking PostgreSQL..."
if ! docker ps | grep -q "risk-platform-postgres"; then
    echo "Starting PostgreSQL container..."
    docker start risk-platform-postgres || docker-compose -f /opt/risk-platform/docker-compose.yml up -d postgres
    sleep 5
fi

# Ensure database exists
echo "Ensuring database exists..."
DB_EXISTS=$(docker exec -i risk-platform-postgres psql -U risk_platform -t -c "SELECT 1 FROM pg_database WHERE datname = '"'"'risk_platform'"'"';" postgres 2>/dev/null)
if [[ -z "$DB_EXISTS" ]]; then
    echo "Creating risk_platform database..."
    docker exec -i risk-platform-postgres psql -U risk_platform -c "CREATE DATABASE risk_platform;" postgres
fi

# Ensure schema exists
echo "Ensuring schema exists..."
docker exec -i risk-platform-postgres psql -U risk_platform -d risk_platform << EOF
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
    status VARCHAR(50) DEFAULT '"'"'active'"'"',
    mfa_enabled BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create default organization
INSERT INTO organizations (name, slug, industry)
VALUES ('"'"'Default Organization'"'"', '"'"'default'"'"', '"'"'Technology'"'"')
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
    (SELECT id FROM organizations WHERE slug = '"'"'default'"'"'),
    '"'"'admin@risk-platform.local'"'"',
    MD5('"'"'admin123'"'"'),
    '"'"'Admin'"'"',
    '"'"'User'"'"',
    '"'"'admin'"'"',
    '"'"'active'"'"',
    NOW()
) ON CONFLICT (email) DO NOTHING;
EOF

# 2. Check and fix Nginx
echo "Checking Nginx..."
if ! docker ps | grep -q "risk-platform-nginx"; then
    echo "Starting Nginx container..."
    docker start risk-platform-nginx || docker-compose -f /opt/risk-platform/docker-compose.yml up -d nginx
    sleep 2
fi

# Ensure dashboard directories exist
echo "Ensuring dashboard directories exist..."
mkdir -p /opt/risk-platform/dashboard/public
mkdir -p /opt/risk-platform/nginx/conf.d

# Create Nginx configuration
echo "Creating Nginx configuration..."
cat > /opt/risk-platform/nginx/conf.d/default.conf << EOF
# Dashboard Configuration
server {
    listen 80;
    server_name _;

    # Dashboard
    location / {
        root /opt/risk-platform/dashboard/public;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Monitoring
    location /monitoring {
        proxy_pass http://grafana:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        root /opt/risk-platform/dashboard/public;
        expires max;
        log_not_found off;
    }

    # Test page
    location /test {
        alias /opt/risk-platform/dashboard/public;
        index test.html;
    }
}
EOF

# Create dashboard files
echo "Creating dashboard files..."
cat > /opt/risk-platform/dashboard/public/index.html << EOF
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

cat > /opt/risk-platform/dashboard/public/styles.css << EOF
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

cat > /opt/risk-platform/dashboard/public/script.js << EOF
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

# Create test page
cat > /opt/risk-platform/dashboard/public/test.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Test Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .test-box {
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
        }
        .success {
            color: green;
        }
        .failure {
            color: red;
        }
    </style>
</head>
<body>
    <h1>Dashboard Test Page</h1>
    
    <div class="test-box">
        <h2>HTML Test</h2>
        <p>If you can see this text, HTML is working correctly.</p>
        <div id="html-result"></div>
    </div>
    
    <div class="test-box">
        <h2>CSS Test</h2>
        <p>This text should have <span style="color: blue; font-weight: bold;">blue and bold styling</span>.</p>
        <div id="css-result"></div>
    </div>
    
    <div class="test-box">
        <h2>JavaScript Test</h2>
        <p>Clicking the button should show a message.</p>
        <button id="test-button">Click Me</button>
        <div id="js-result"></div>
    </div>
    
    <div class="test-box">
        <h2>External Resources Test</h2>
        <p>Testing if external resources can be loaded:</p>
        <ul>
            <li>Bootstrap: <span id="bootstrap-result">Testing...</span></li>
            <li>Chart.js: <span id="chartjs-result">Testing...</span></li>
        </ul>
    </div>
    
    <script>
        // HTML Test
        document.getElementById("html-result").innerHTML = "<span class=\"success\">✓ HTML is working</span>";
        
        // CSS Test
        if (window.getComputedStyle(document.querySelector("span[style]")).color === "rgb(0, 0, 255)") {
            document.getElementById("css-result").innerHTML = "<span class=\"success\">✓ CSS is working</span>";
        } else {
            document.getElementById("css-result").innerHTML = "<span class=\"failure\">✗ CSS might not be working correctly</span>";
        }
        
        // JavaScript Test
        document.getElementById("test-button").addEventListener("click", function() {
            document.getElementById("js-result").innerHTML = "<span class=\"success\">✓ JavaScript is working</span>";
        });
        
        // External Resources Test
        function testExternalResource(url, resultId) {
            const script = document.createElement("script");
            script.src = url;
            script.onload = function() {
                document.getElementById(resultId).innerHTML = "<span class=\"success\">✓ Loaded successfully</span>";
            };
            script.onerror = function() {
                document.getElementById(resultId).innerHTML = "<span class=\"failure\">✗ Failed to load</span>";
            };
            document.head.appendChild(script);
        }
        
        testExternalResource("https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js", "bootstrap-result");
        testExternalResource("https://cdn.jsdelivr.net/npm/chart.js", "chartjs-result");
    </script>
</body>
</html>
EOF

# Set permissions
chmod -R 755 /opt/risk-platform/dashboard

# Copy files to Nginx container
echo "Copying files to Nginx container..."
docker cp /opt/risk-platform/dashboard/public risk-platform-nginx:/opt/risk-platform/dashboard/
docker cp /opt/risk-platform/nginx/conf.d/default.conf risk-platform-nginx:/etc/nginx/conf.d/

# Restart Nginx
echo "Restarting Nginx..."
docker restart risk-platform-nginx

# 3. Check network connectivity
echo "Checking network connectivity..."
# Ensure all containers are on the same network
NETWORK_NAME=$(docker inspect --format='"'"'{{.HostConfig.NetworkMode}}'"'"' risk-platform-postgres)
echo "Target network: $