#!/bin/bash
# check-dashboard-status.sh
# Script to check the status of the Risk Platform dashboards and provide deployment guidance
# Version: 1.0.0
# Date: 2025-08-04

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_DIR="/opt/risk-platform"
API_URL="http://localhost/api/status"
GRAFANA_URL="http://localhost/monitoring"
MAIN_URL="http://localhost"
PUBLIC_IP=$(curl -s https://api.ipify.org)
LOG_FILE="/var/log/risk-platform-dashboard-check-$(date +%Y%m%d-%H%M%S).log"

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

log_section() {
    echo -e "\n${CYAN}===== $1 =====${NC}"
    echo "===== $1 =====" >> "$LOG_FILE"
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

# Function to check if a container is running
is_container_running() {
    local container=$1
    if docker ps --format '{{.Names}}' | grep -q "^$container$"; then
        return 0
    else
        return 1
    fi
}

# Function to check if a URL is accessible
check_url() {
    local url=$1
    local timeout=${2:-5}
    
    if curl -s --max-time "$timeout" "$url" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to check Grafana monitoring dashboard
check_grafana_dashboard() {
    log_section "Checking Grafana Monitoring Dashboard"
    
    # Check if Grafana container is running
    if is_container_running "risk-platform-grafana"; then
        log_success "Grafana container is running"
    else
        log_error "Grafana container is not running"
        return 1
    fi
    
    # Check if Grafana is accessible
    if check_url "$GRAFANA_URL"; then
        log_success "Grafana monitoring dashboard is accessible at $GRAFANA_URL"
    else
        log_warning "Grafana monitoring dashboard is not accessible at $GRAFANA_URL"
        
        # Check Grafana logs
        log_info "Checking Grafana logs for issues"
        docker logs risk-platform-grafana --tail 20
        
        return 1
    fi
    
    # Check if Prometheus is running (Grafana data source)
    if is_container_running "risk-platform-prometheus"; then
        log_success "Prometheus container is running (Grafana data source)"
    else
        log_warning "Prometheus container is not running (Grafana data source)"
    fi
    
    # Check if any dashboards are configured in Grafana
    log_info "Checking for configured dashboards in Grafana"
    
    # This requires the Grafana API, which might be protected
    # For now, we'll just provide information on how to check manually
    echo -e "${YELLOW}Note:${NC} To view configured dashboards in Grafana:"
    echo -e "1. Log in to Grafana at ${BOLD}http://$PUBLIC_IP/monitoring${NC}"
    echo -e "2. Use credentials: ${BOLD}admin/admin${NC}"
    echo -e "3. Navigate to 'Dashboards' in the left menu"
    
    return 0
}

# Function to check main Risk Platform dashboard
check_main_dashboard() {
    log_section "Checking Main Risk Platform Dashboard"
    
    # Check if API container is running
    if is_container_running "risk-platform-api"; then
        log_success "API container is running"
        
        # Check if API is accessible
        if check_url "$API_URL"; then
            log_success "API is accessible at $API_URL"
            
            # Get API response
            local api_response=$(curl -s "$API_URL")
            echo -e "API Response: $api_response"
            
            # Check if this is just the placeholder API
            if echo "$api_response" | grep -q "Welcome to Risk Platform API" || echo "$api_response" | grep -q "operational"; then
                log_warning "This appears to be the placeholder API, not the full Risk Platform API"
                echo -e "${YELLOW}Note:${NC} The current API is a placeholder. The actual Risk Platform API needs to be deployed."
            else
                log_success "This appears to be the actual Risk Platform API"
            fi
        else
            log_warning "API is not accessible at $API_URL"
        fi
    else
        log_error "API container is not running"
    fi
    
    # Check if the main dashboard is accessible
    if check_url "$MAIN_URL"; then
        log_success "Main URL is accessible at $MAIN_URL"
        
        # Check if this is the default placeholder page
        local main_response=$(curl -s "$MAIN_URL")
        if echo "$main_response" | grep -q "placeholder" || echo "$main_response" | grep -q "Welcome to the Risk Platform"; then
            log_warning "This appears to be the placeholder page, not the actual Risk Platform dashboard"
            echo -e "${YELLOW}Note:${NC} The current main page is a placeholder. The actual Risk Platform dashboard needs to be deployed."
        else
            log_success "This appears to be the actual Risk Platform dashboard"
        fi
    else
        log_warning "Main URL is not accessible at $MAIN_URL"
    fi
    
    # Check for React/Node.js application files
    log_info "Checking for React/Node.js application files"
    
    if [ -d "$PLATFORM_DIR/frontend" ]; then
        log_success "Frontend directory exists at $PLATFORM_DIR/frontend"
        
        # Check for package.json to verify it's a Node.js/React app
        if [ -f "$PLATFORM_DIR/frontend/package.json" ]; then
            log_success "Found package.json in frontend directory"
            
            # Check if it's the actual Risk Platform package.json
            if grep -q "risk-platform" "$PLATFORM_DIR/frontend/package.json" || grep -q "dashboard" "$PLATFORM_DIR/frontend/package.json"; then
                log_success "This appears to be the actual Risk Platform frontend code"
            else
                log_warning "Frontend code exists but may not be the actual Risk Platform code"
            fi
        else
            log_warning "No package.json found in frontend directory"
        fi
    else
        log_warning "No frontend directory found at $PLATFORM_DIR/frontend"
        echo -e "${YELLOW}Note:${NC} The Risk Platform frontend code needs to be deployed."
    fi
    
    return 0
}

# Function to check database status
check_database() {
    log_section "Checking Database Status"
    
    # Check if Postgres container is running
    if is_container_running "risk-platform-postgres"; then
        log_success "PostgreSQL container is running"
        
        # Check database connection
        log_info "Checking database connection"
        if docker exec risk-platform-postgres pg_isready -U risk_platform > /dev/null 2>&1; then
            log_success "Database connection is working"
            
            # Check if database has tables (schema)
            log_info "Checking database schema"
            local table_count=$(docker exec risk-platform-postgres psql -U risk_platform -d risk_platform -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" -t | tr -d ' ')
            
            if [ "$table_count" -gt 0 ]; then
                log_success "Database has $table_count tables"
                
                # List tables
                echo -e "${CYAN}Database Tables:${NC}"
                docker exec risk-platform-postgres psql -U risk_platform -d risk_platform -c "\dt" | sed 's/^/  /'
                
                # Check for specific tables that should exist in Risk Platform
                if docker exec risk-platform-postgres psql -U risk_platform -d risk_platform -c "\dt users" > /dev/null 2>&1 || \
                   docker exec risk-platform-postgres psql -U risk_platform -d risk_platform -c "\dt incidents" > /dev/null 2>&1 || \
                   docker exec risk-platform-postgres psql -U risk_platform -d risk_platform -c "\dt risks" > /dev/null 2>&1; then
                    log_success "Found Risk Platform specific tables"
                else
                    log_warning "No Risk Platform specific tables found"
                    echo -e "${YELLOW}Note:${NC} The database schema for Risk Platform needs to be deployed."
                fi
            else
                log_warning "Database has no tables"
                echo -e "${YELLOW}Note:${NC} The database schema for Risk Platform needs to be deployed."
            fi
        else
            log_warning "Database connection is not working"
        fi
    else
        log_error "PostgreSQL container is not running"
    fi
    
    return 0
}

# Function to explain the difference between monitoring and actual dashboard
explain_dashboard_difference() {
    log_section "Understanding the Difference: Monitoring vs. Risk Platform Dashboard"
    
    echo -e "${CYAN}${BOLD}Two Different Dashboards:${NC}"
    echo -e "Your deployment has two separate dashboard systems:"
    echo
    echo -e "${BOLD}1. MONITORING DASHBOARD (Grafana)${NC}"
    echo -e "   ${BOLD}URL:${NC} http://$PUBLIC_IP/monitoring"
    echo -e "   ${BOLD}Purpose:${NC} Infrastructure and system monitoring"
    echo -e "   ${BOLD}Technology:${NC} Grafana + Prometheus"
    echo -e "   ${BOLD}What it shows:${NC} System metrics, container health, resource usage"
    echo -e "   ${BOLD}Status:${NC} DEPLOYED (but may need configuration)"
    echo
    echo -e "${BOLD}2. RISK PLATFORM DASHBOARD (Your Application)${NC}"
    echo -e "   ${BOLD}URL:${NC} http://$PUBLIC_IP/"
    echo -e "   ${BOLD}Purpose:${NC} The actual Risk Platform application"
    echo -e "   ${BOLD}Technology:${NC} React/Node.js + PostgreSQL"
    echo -e "   ${BOLD}What it shows:${NC} Risk data, incidents, compliance, user interface"
    echo -e "   ${BOLD}Status:${NC} NOT YET DEPLOYED (infrastructure only)"
    echo
    echo -e "${CYAN}${BOLD}Current Status:${NC}"
    echo -e "You have successfully deployed the ${BOLD}infrastructure${NC} (Docker, databases, monitoring),"
    echo -e "but the actual ${BOLD}Risk Platform application code${NC} is not yet deployed."
    echo
    echo -e "${YELLOW}This is normal!${NC} The deployment process has two main phases:"
    echo -e "1. Infrastructure deployment (COMPLETED)"
    echo -e "2. Application deployment (PENDING)"
    
    return 0
}

# Function to provide deployment instructions
provide_deployment_instructions() {
    log_section "Deployment Instructions for Risk Platform Dashboard"
    
    echo -e "${CYAN}${BOLD}How to Deploy the Actual Risk Platform Dashboard:${NC}"
    echo
    echo -e "${BOLD}Step 1: Prepare Your Risk Platform Code${NC}"
    echo -e "You need to have your Risk Platform code ready:"
    echo -e "- Frontend (React)"
    echo -e "- Backend (Node.js API)"
    echo -e "- Database schema and initial data"
    echo
    echo -e "${BOLD}Step 2: Deploy the Database Schema${NC}"
    echo -e "Run the following to deploy your database schema:"
    echo -e "${YELLOW}# Copy your SQL schema file to the server${NC}"
    echo -e "scp schema.sql root@$PUBLIC_IP:/tmp/"
    echo
    echo -e "${YELLOW}# Apply the schema${NC}"
    echo -e "docker exec -i risk-platform-postgres psql -U risk_platform -d risk_platform < /tmp/schema.sql"
    echo
    echo -e "${BOLD}Step 3: Deploy the API (Backend)${NC}"
    echo -e "Replace the placeholder API with your actual API:"
    echo -e "${YELLOW}# Copy your API code to the server${NC}"
    echo -e "scp -r ./api-code/ root@$PUBLIC_IP:$PLATFORM_DIR/api/"
    echo
    echo -e "${YELLOW}# Rebuild and restart the API container${NC}"
    echo -e "cd $PLATFORM_DIR && docker-compose build api && docker-compose up -d api"
    echo
    echo -e "${BOLD}Step 4: Deploy the Frontend${NC}"
    echo -e "Deploy your React frontend:"
    echo -e "${YELLOW}# Copy your frontend build to the server${NC}"
    echo -e "scp -r ./frontend-build/ root@$PUBLIC_IP:$PLATFORM_DIR/frontend/"
    echo
    echo -e "${YELLOW}# Update Nginx configuration to serve the frontend${NC}"
    echo -e "cat > $PLATFORM_DIR/config/nginx/conf.d/default.conf << 'EOF'"
    echo -e "server {"
    echo -e "    listen 80;"
    echo -e "    server_name _;"
    echo -e ""
    echo -e "    # Serve frontend"
    echo -e "    root $PLATFORM_DIR/frontend/build;"
    echo -e "    index index.html;"
    echo -e ""
    echo -e "    # Handle React routing"
    echo -e "    location / {"
    echo -e "        try_files \$uri \$uri/ /index.html;"
    echo -e "    }"
    echo -e ""
    echo -e "    # API proxy"
    echo -e "    location /api/ {"
    echo -e "        proxy_pass http://api:3001/;"
    echo -e "        proxy_set_header Host \$host;"
    echo -e "        proxy_set_header X-Real-IP \$remote_addr;"
    echo -e "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo -e "        proxy_set_header X-Forwarded-Proto \$scheme;"
    echo -e "    }"
    echo -e ""
    echo -e "    # Monitoring dashboard"
    echo -e "    location /monitoring/ {"
    echo -e "        proxy_pass http://grafana:3000/;"
    echo -e "        proxy_set_header Host \$host;"
    echo -e "        proxy_set_header X-Real-IP \$remote_addr;"
    echo -e "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo -e "        proxy_set_header X-Forwarded-Proto \$scheme;"
    echo -e "    }"
    echo -e "}"
    echo -e "EOF"
    echo
    echo -e "${YELLOW}# Restart Nginx to apply changes${NC}"
    echo -e "docker-compose restart nginx"
    echo
    echo -e "${BOLD}Step 5: Verify Deployment${NC}"
    echo -e "After completing these steps, verify your deployment:"
    echo -e "- Frontend: http://$PUBLIC_IP/"
    echo -e "- API: http://$PUBLIC_IP/api/status"
    echo -e "- Monitoring: http://$PUBLIC_IP/monitoring"
    
    return 0
}

# Main function
main() {
    # Display header
    echo "==============================================="
    echo "  Risk Platform Dashboard Status Check Tool    "
    echo "==============================================="
    echo ""
    log_info "Starting dashboard status check"
    
    # Get public IP if not already set
    if [ -z "$PUBLIC_IP" ]; then
        PUBLIC_IP=$(hostname -I | awk '{print $1}')
        log_info "Using local IP: $PUBLIC_IP"
    else
        log_info "Public IP: $PUBLIC_IP"
    fi
    
    # Check Docker status
    log_info "Checking Docker status"
    if ! systemctl is-active --quiet docker; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    log_success "Docker is running"
    
    # Check container status
    log_info "Checking container status"
    docker ps
    
    # Check Grafana monitoring dashboard
    check_grafana_dashboard
    
    # Check main Risk Platform dashboard
    check_main_dashboard
    
    # Check database
    check_database
    
    # Explain the difference between monitoring and actual dashboard
    explain_dashboard_difference
    
    # Provide deployment instructions
    provide_deployment_instructions
    
    # Final summary
    log_section "Final Summary"
    
    echo -e "${CYAN}${BOLD}Current Deployment Status:${NC}"
    echo -e "✅ ${GREEN}Infrastructure${NC}: Docker, Nginx, PostgreSQL, Monitoring"
    
    # Check if Grafana is accessible
    if check_url "$GRAFANA_URL"; then
        echo -e "✅ ${GREEN}Monitoring Dashboard${NC}: Accessible at http://$PUBLIC_IP/monitoring"
    else
        echo -e "❌ ${RED}Monitoring Dashboard${NC}: Not accessible at http://$PUBLIC_IP/monitoring"
    fi
    
    # Check for actual dashboard
    if [ -d "$PLATFORM_DIR/frontend" ] && [ -f "$PLATFORM_DIR/frontend/package.json" ]; then
        echo -e "✅ ${GREEN}Risk Platform Dashboard${NC}: Code appears to be deployed"
    else
        echo -e "❌ ${RED}Risk Platform Dashboard${NC}: Not yet deployed"
    fi
    
    # Check database schema
    local table_count=$(docker exec risk-platform-postgres psql -U risk_platform -d risk_platform -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" -t 2>/dev/null | tr -d ' ' || echo "0")
    if [ "$table_count" -gt 0 ]; then
        echo -e "✅ ${GREEN}Database Schema${NC}: $table_count tables found"
    else
        echo -e "❌ ${RED}Database Schema${NC}: No tables found"
    fi
    
    echo ""
    echo -e "${CYAN}${BOLD}Next Steps:${NC}"
    echo -e "1. ${YELLOW}Fix Grafana monitoring dashboard${NC} if not accessible"
    echo -e "2. ${YELLOW}Deploy Risk Platform database schema${NC}"
    echo -e "3. ${YELLOW}Deploy Risk Platform API code${NC}"
    echo -e "4. ${YELLOW}Deploy Risk Platform frontend code${NC}"
    
    echo ""
    echo -e "Status check log saved to: ${YELLOW}$LOG_FILE${NC}"
    echo ""
    
    log_success "Dashboard status check completed"
}

# Run main function
main
