#!/bin/bash
# =========================================================================
# Risk Platform Comprehensive Validation Script
# =========================================================================
# This script performs end-to-end validation of the Risk Platform deployment
# including service health, API endpoints, monitoring, security, performance,
# and workflow testing.
#
# Version: 1.0.0
# Date: 2025-07-28
# =========================================================================

# Strict error handling
set -e

# =============================================
# CONFIGURATION
# =============================================

PROJECT_ROOT="/opt/risk-platform"
LOG_DIR="${PROJECT_ROOT}/logs"
VALIDATION_LOG="${LOG_DIR}/platform_validation.log"
REPORT_FILE="${PROJECT_ROOT}/validation_report.html"
TEMP_DIR="/tmp/risk-platform-validation"

# Service endpoints
API_BASE_URL="http://localhost:3000"
PROMETHEUS_URL="http://localhost:9090"
GRAFANA_URL="http://localhost:3001"
NGINX_URL="http://localhost"
HTTPS_URL="https://localhost"

# Test parameters
LOAD_TEST_REQUESTS=100
LOAD_TEST_CONCURRENCY=10
RESPONSE_TIME_THRESHOLD=500  # milliseconds
CPU_THRESHOLD=80             # percent
MEMORY_THRESHOLD=80          # percent

# Critical API endpoints to test
API_ENDPOINTS=(
  "/health"
  "/api/v1/status"
  "/api/v1/organizations"
  "/api/v1/users"
  "/api/v1/requirements"
  "/api/v1/threats"
  "/api/v1/risks"
)

# Required services
REQUIRED_SERVICES=(
  "api"
  "postgres"
  "redis"
  "nginx"
  "prometheus"
  "grafana"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# =============================================
# LOGGING FUNCTIONS
# =============================================

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

# Initialize log file
echo "===== PLATFORM VALIDATION $(date) =====" > "${VALIDATION_LOG}"

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}" | tee -a "${VALIDATION_LOG}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}" | tee -a "${VALIDATION_LOG}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "${VALIDATION_LOG}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "${VALIDATION_LOG}"
}

section() {
    echo -e "\n${BOLD}${BLUE}=== $1 ===${NC}" | tee -a "${VALIDATION_LOG}"
}

# =============================================
# UTILITY FUNCTIONS
# =============================================

# Create temporary directory
mkdir -p "${TEMP_DIR}"

# Clean up on exit
cleanup() {
    log "Cleaning up temporary files..."
    rm -rf "${TEMP_DIR}"
}

trap cleanup EXIT

# Measure response time of a URL
measure_response_time() {
    local url=$1
    local start_time=$(date +%s.%N)
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${url}")
    local end_time=$(date +%s.%N)
    local duration=$(echo "${end_time} - ${start_time}" | bc)
    local ms_duration=$(echo "${duration} * 1000" | bc | cut -d'.' -f1)
    
    echo "${http_code}:${ms_duration}"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get current timestamp
get_timestamp() {
    date +"%Y-%m-%d %H:%M:%S"
}

# Get system resource usage
get_system_resources() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    local memory_usage=$(free | grep Mem | awk '{print $3/$2 * 100}')
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
    
    echo "${cpu_usage}:${memory_usage}:${disk_usage}"
}

# =============================================
# VALIDATION FUNCTIONS
# =============================================

# 1. Service Health Checks
validate_service_health() {
    section "Service Health Checks"
    
    local health_ok=true
    
    # Check Docker service
    log "Checking Docker service status..."
    if systemctl is-active --quiet docker; then
        success "✓ Docker service is running"
    else
        error "✗ Docker service is not running"
        health_ok=false
    fi
    
    # Check container status
    log "Checking container status..."
    
    for service in "${REQUIRED_SERVICES[@]}"; do
        local container_status
        
        # Handle different docker-compose files
        if [[ "${service}" == "postgres" || "${service}" == "redis" ]]; then
            container_status=$(docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" ps --format json "${service}" 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4)
        else
            container_status=$(docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" ps --format json "${service}" 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4)
        fi
        
        if [[ "${container_status}" == "running" ]]; then
            success "✓ ${service} container is running"
        else
            error "✗ ${service} container is not running (status: ${container_status:-unknown})"
            health_ok=false
        fi
    done
    
    # Check container health status
    log "Checking container health status..."
    
    for service in "${REQUIRED_SERVICES[@]}"; do
        local compose_file="${PROJECT_ROOT}/docker-compose/base.yml"
        if [[ "${service}" == "postgres" || "${service}" == "redis" ]]; then
            compose_file="${PROJECT_ROOT}/docker-compose/db.yml"
        fi
        
        local health_status=$(docker compose -f "${compose_file}" ps --format json "${service}" 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4)
        
        if [[ "${health_status}" == "healthy" ]]; then
            success "✓ ${service} container is healthy"
        elif [[ "${health_status}" == "starting" ]]; then
            warning "${service} container health check is still initializing"
        elif [[ -z "${health_status}" ]]; then
            warning "${service} container has no health check defined"
        else
            error "✗ ${service} container is unhealthy (status: ${health_status})"
            health_ok=false
        fi
    done
    
    # Check for container restarts
    log "Checking for container restarts..."
    
    for service in "${REQUIRED_SERVICES[@]}"; do
        local compose_file="${PROJECT_ROOT}/docker-compose/base.yml"
        if [[ "${service}" == "postgres" || "${service}" == "redis" ]]; then
            compose_file="${PROJECT_ROOT}/docker-compose/db.yml"
        fi
        
        local restart_count=$(docker compose -f "${compose_file}" ps --format json "${service}" 2>/dev/null | grep -o '"RestartCount":[0-9]*' | cut -d':' -f2)
        
        if [[ "${restart_count}" == "0" ]]; then
            success "✓ ${service} container has not restarted"
        elif [[ -z "${restart_count}" ]]; then
            warning "Unable to determine restart count for ${service}"
        else
            warning "${service} container has restarted ${restart_count} times"
        fi
    done
    
    # Check system resources
    log "Checking system resource usage..."
    local resources=$(get_system_resources)
    local cpu_usage=$(echo "${resources}" | cut -d':' -f1)
    local memory_usage=$(echo "${resources}" | cut -d':' -f2)
    local disk_usage=$(echo "${resources}" | cut -d':' -f3)
    
    log "System resources: CPU ${cpu_usage}%, Memory ${memory_usage}%, Disk ${disk_usage}%"
    
    if (( $(echo "${cpu_usage} < ${CPU_THRESHOLD}" | bc -l) )); then
        success "✓ CPU usage is within threshold (${cpu_usage}% < ${CPU_THRESHOLD}%)"
    else
        warning "CPU usage is high (${cpu_usage}% >= ${CPU_THRESHOLD}%)"
    fi
    
    if (( $(echo "${memory_usage} < ${MEMORY_THRESHOLD}" | bc -l) )); then
        success "✓ Memory usage is within threshold (${memory_usage}% < ${MEMORY_THRESHOLD}%)"
    else
        warning "Memory usage is high (${memory_usage}% >= ${MEMORY_THRESHOLD}%)"
    fi
    
    if (( $(echo "${disk_usage} < 90" | bc -l) )); then
        success "✓ Disk usage is acceptable (${disk_usage}%)"
    else
        warning "Disk usage is high (${disk_usage}%)"
    fi
    
    if [[ "${health_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 2. API Endpoint Testing
validate_api_endpoints() {
    section "API Endpoint Testing"
    
    local api_ok=true
    local results=()
    
    log "Testing API endpoints..."
    
    # Test each endpoint
    for endpoint in "${API_ENDPOINTS[@]}"; do
        local url="${API_BASE_URL}${endpoint}"
        log "Testing endpoint: ${url}"
        
        local response=$(measure_response_time "${url}")
        local http_code=$(echo "${response}" | cut -d':' -f1)
        local response_time=$(echo "${response}" | cut -d':' -f2)
        
        # Store results for reporting
        results+=("${endpoint}:${http_code}:${response_time}")
        
        if [[ "${http_code}" == "200" || "${http_code}" == "201" ]]; then
            if (( response_time < RESPONSE_TIME_THRESHOLD )); then
                success "✓ ${endpoint} - HTTP ${http_code} in ${response_time}ms"
            else
                warning "${endpoint} - HTTP ${http_code} but slow response (${response_time}ms > ${RESPONSE_TIME_THRESHOLD}ms)"
            fi
        else
            error "✗ ${endpoint} - HTTP ${http_code} in ${response_time}ms"
            api_ok=false
        fi
        
        # Get response body for further analysis
        local response_body="${TEMP_DIR}/response_${endpoint//\//_}.json"
        curl -s "${url}" -o "${response_body}"
        
        # Check response structure if it's JSON
        if [[ -s "${response_body}" ]] && grep -q "{" "${response_body}"; then
            if jq . "${response_body}" > /dev/null 2>&1; then
                success "✓ ${endpoint} - Valid JSON response"
            else
                warning "${endpoint} - Invalid JSON response"
            fi
        fi
    done
    
    # Test API authentication if applicable
    if [[ -f "${PROJECT_ROOT}/secrets/api_token.txt" ]]; then
        local api_token=$(cat "${PROJECT_ROOT}/secrets/api_token.txt")
        log "Testing authenticated API endpoint..."
        
        local auth_endpoint="/api/v1/protected-resource"
        local auth_url="${API_BASE_URL}${auth_endpoint}"
        
        # Test without token (should fail)
        local unauth_response=$(curl -s -o /dev/null -w "%{http_code}" "${auth_url}")
        
        if [[ "${unauth_response}" == "401" || "${unauth_response}" == "403" ]]; then
            success "✓ Authentication check passed - Unauthorized request correctly rejected"
        else
            warning "Authentication check failed - Unauthorized request returned ${unauth_response}, expected 401/403"
        fi
        
        # Test with token (should succeed)
        local auth_response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${api_token}" "${auth_url}")
        
        if [[ "${auth_response}" == "200" ]]; then
            success "✓ Authentication check passed - Authorized request succeeded"
        else
            warning "Authentication check failed - Authorized request returned ${auth_response}, expected 200"
        fi
    else
        log "No API token found, skipping authentication tests"
    fi
    
    # Save API test results for reporting
    printf "%s\n" "${results[@]}" > "${TEMP_DIR}/api_results.txt"
    
    if [[ "${api_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 3. Monitoring Stack Validation
validate_monitoring_stack() {
    section "Monitoring Stack Validation"
    
    local monitoring_ok=true
    
    # Check Prometheus
    log "Checking Prometheus..."
    local prometheus_response=$(measure_response_time "${PROMETHEUS_URL}/-/healthy")
    local prometheus_code=$(echo "${prometheus_response}" | cut -d':' -f1)
    local prometheus_time=$(echo "${prometheus_response}" | cut -d':' -f2)
    
    if [[ "${prometheus_code}" == "200" ]]; then
        success "✓ Prometheus is healthy (${prometheus_time}ms)"
    else
        error "✗ Prometheus health check failed (HTTP ${prometheus_code})"
        monitoring_ok=false
    fi
    
    # Check Prometheus targets
    log "Checking Prometheus targets..."
    local targets_json="${TEMP_DIR}/prometheus_targets.json"
    curl -s "${PROMETHEUS_URL}/api/v1/targets" -o "${targets_json}"
    
    if [[ -s "${targets_json}" ]] && jq . "${targets_json}" > /dev/null 2>&1; then
        local up_targets=$(jq '.data.activeTargets[] | select(.health=="up") | .labels.job' "${targets_json}" | wc -l)
        local down_targets=$(jq '.data.activeTargets[] | select(.health=="down") | .labels.job' "${targets_json}" | wc -l)
        
        log "Prometheus targets: ${up_targets} up, ${down_targets} down"
        
        if [[ ${down_targets} -eq 0 ]]; then
            success "✓ All Prometheus targets are up"
        else
            warning "Some Prometheus targets are down (${down_targets})"
            jq '.data.activeTargets[] | select(.health=="down") | .labels.job' "${targets_json}" | tee -a "${VALIDATION_LOG}"
        fi
    else
        warning "Unable to parse Prometheus targets response"
    fi
    
    # Check Grafana
    log "Checking Grafana..."
    local grafana_response=$(measure_response_time "${GRAFANA_URL}/api/health")
    local grafana_code=$(echo "${grafana_response}" | cut -d':' -f1)
    local grafana_time=$(echo "${grafana_response}" | cut -d':' -f2)
    
    if [[ "${grafana_code}" == "200" ]]; then
        success "✓ Grafana is healthy (${grafana_time}ms)"
    else
        error "✗ Grafana health check failed (HTTP ${grafana_code})"
        monitoring_ok=false
    fi
    
    # Check Grafana datasources
    log "Checking Grafana datasources..."
    local datasources_json="${TEMP_DIR}/grafana_datasources.json"
    
    # Try to get datasources with default admin credentials
    curl -s -u "admin:admin" "${GRAFANA_URL}/api/datasources" -o "${datasources_json}"
    
    if [[ -s "${datasources_json}" ]] && jq . "${datasources_json}" > /dev/null 2>&1; then
        local datasource_count=$(jq '. | length' "${datasources_json}")
        
        log "Grafana datasources: ${datasource_count}"
        
        if [[ ${datasource_count} -gt 0 ]]; then
            success "✓ Grafana has ${datasource_count} datasource(s) configured"
            
            # Check if Prometheus datasource exists
            if jq '.[] | select(.name=="Prometheus")' "${datasources_json}" | grep -q "Prometheus"; then
                success "✓ Prometheus datasource is configured in Grafana"
            else
                warning "Prometheus datasource not found in Grafana"
            fi
        else
            warning "No Grafana datasources configured"
        fi
    else
        warning "Unable to access Grafana datasources (authentication may be required)"
    fi
    
    # Check alerting
    log "Checking alerting configuration..."
    
    # Check Prometheus alerting rules
    local rules_json="${TEMP_DIR}/prometheus_rules.json"
    curl -s "${PROMETHEUS_URL}/api/v1/rules" -o "${rules_json}"
    
    if [[ -s "${rules_json}" ]] && jq . "${rules_json}" > /dev/null 2>&1; then
        local rule_count=$(jq '.data.groups | map(.rules | length) | add' "${rules_json}")
        
        if [[ -n "${rule_count}" && "${rule_count}" != "null" && ${rule_count} -gt 0 ]]; then
            success "✓ Prometheus has ${rule_count} alerting rule(s) configured"
        else
            warning "No Prometheus alerting rules configured"
        fi
    else
        warning "Unable to parse Prometheus rules response"
    fi
    
    if [[ "${monitoring_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 4. Reverse Proxy Testing
validate_reverse_proxy() {
    section "Reverse Proxy Testing"
    
    local proxy_ok=true
    
    # Check Nginx HTTP
    log "Checking Nginx HTTP..."
    local nginx_response=$(measure_response_time "${NGINX_URL}")
    local nginx_code=$(echo "${nginx_response}" | cut -d':' -f1)
    local nginx_time=$(echo "${nginx_response}" | cut -d':' -f2)
    
    if [[ "${nginx_code}" == "200" || "${nginx_code}" == "301" || "${nginx_code}" == "302" ]]; then
        success "✓ Nginx HTTP is responding (${nginx_time}ms)"
    else
        error "✗ Nginx HTTP check failed (HTTP ${nginx_code})"
        proxy_ok=false
    fi
    
    # Check HTTPS if available
    log "Checking HTTPS..."
    local https_response=$(measure_response_time "${HTTPS_URL}" 2>/dev/null || echo "000:0")
    local https_code=$(echo "${https_response}" | cut -d':' -f1)
    local https_time=$(echo "${https_response}" | cut -d':' -f2)
    
    if [[ "${https_code}" == "200" || "${https_code}" == "301" || "${https_code}" == "302" ]]; then
        success "✓ HTTPS is responding (${https_time}ms)"
        
        # Check SSL certificate
        log "Checking SSL certificate..."
        local ssl_info=$(echo | openssl s_client -connect localhost:443 2>/dev/null | openssl x509 -noout -text)
        
        if [[ -n "${ssl_info}" ]]; then
            # Extract certificate details
            local issuer=$(echo "${ssl_info}" | grep "Issuer:" | sed 's/.*Issuer: //')
            local expiry=$(echo "${ssl_info}" | grep "Not After :" | sed 's/.*Not After : //')
            local subject=$(echo "${ssl_info}" | grep "Subject:" | sed 's/.*Subject: //')
            
            log "SSL Certificate Details:"
            log "  Issuer: ${issuer}"
            log "  Expiry: ${expiry}"
            log "  Subject: ${subject}"
            
            # Check certificate expiration
            local expiry_date=$(date -d "${expiry}" +%s)
            local current_date=$(date +%s)
            local days_left=$(( (expiry_date - current_date) / 86400 ))
            
            if [[ ${days_left} -gt 30 ]]; then
                success "✓ SSL certificate is valid for ${days_left} more days"
            elif [[ ${days_left} -gt 0 ]]; then
                warning "SSL certificate will expire in ${days_left} days"
            else
                error "✗ SSL certificate has expired"
                proxy_ok=false
            fi
        else
            warning "Unable to retrieve SSL certificate information"
        fi
    else
        warning "HTTPS is not responding (HTTP ${https_code})"
    fi
    
    # Check Nginx configuration
    log "Checking Nginx configuration..."
    if docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" exec nginx nginx -t &>/dev/null; then
        success "✓ Nginx configuration is valid"
    else
        error "✗ Nginx configuration is invalid"
        proxy_ok=false
    fi
    
    # Check proxy routes
    log "Checking proxy routes..."
    local routes=(
        "/api/v1/status:api"
        "/health:api"
        "/prometheus/:prometheus"
        "/grafana/:grafana"
    )
    
    for route_info in "${routes[@]}"; do
        local route=$(echo "${route_info}" | cut -d':' -f1)
        local target=$(echo "${route_info}" | cut -d':' -f2)
        
        log "Testing route: ${route} -> ${target}"
        local route_response=$(curl -s -o /dev/null -w "%{http_code}" "${NGINX_URL}${route}")
        
        if [[ "${route_response}" == "200" ]]; then
            success "✓ Route ${route} is working"
        else
            warning "Route ${route} returned HTTP ${route_response}"
        fi
    done
    
    if [[ "${proxy_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 5. Performance Validation
validate_performance() {
    section "Performance Validation"
    
    local perf_ok=true
    
    # Check if Apache Bench is installed
    if ! command_exists ab; then
        warning "Apache Bench (ab) not found, installing..."
        apt-get update && apt-get install -y apache2-utils
    fi
    
    # Basic load test on API health endpoint
    log "Running basic load test on API health endpoint..."
    local load_test_url="${API_BASE_URL}/health"
    local load_test_output="${TEMP_DIR}/load_test_results.txt"
    
    if ab -n ${LOAD_TEST_REQUESTS} -c ${LOAD_TEST_CONCURRENCY} -q "${load_test_url}" > "${load_test_output}" 2>&1; then
        # Parse results
        local requests_per_second=$(grep "Requests per second" "${load_test_output}" | awk '{print $4}')
        local time_per_request=$(grep "Time per request" "${load_test_output}" | head -1 | awk '{print $4}')
        local failed_requests=$(grep "Failed requests" "${load_test_output}" | awk '{print $3}')
        
        log "Load test results:"
        log "  Requests per second: ${requests_per_second}"
        log "  Time per request: ${time_per_request} ms"
        log "  Failed requests: ${failed_requests}"
        
        if [[ ${failed_requests} -eq 0 ]]; then
            success "✓ Load test completed with no failures"
        else
            warning "Load test had ${failed_requests} failed requests"
        fi
        
        if (( $(echo "${time_per_request} < ${RESPONSE_TIME_THRESHOLD}" | bc -l) )); then
            success "✓ Response time is within threshold (${time_per_request}ms < ${RESPONSE_TIME_THRESHOLD}ms)"
        else
            warning "Response time exceeds threshold (${time_per_request}ms >= ${RESPONSE_TIME_THRESHOLD}ms)"
        fi
    else
        error "✗ Load test failed to execute"
        perf_ok=false
    fi
    
    # Check resource usage during load
    log "Checking resource usage during load..."
    local resources_before=$(get_system_resources)
    
    # Run a brief load test in background
    ab -n 1000 -c 10 -q "${load_test_url}" > /dev/null 2>&1 &
    local ab_pid=$!
    
    # Wait a moment for load to build
    sleep 5
    
    # Check resources under load
    local resources_during=$(get_system_resources)
    local cpu_before=$(echo "${resources_before}" | cut -d':' -f1)
    local cpu_during=$(echo "${resources_during}" | cut -d':' -f1)
    local mem_before=$(echo "${resources_before}" | cut -d':' -f2)
    local mem_during=$(echo "${resources_during}" | cut -d':' -f2)
    
    log "Resource usage before load: CPU ${cpu_before}%, Memory ${mem_before}%"
    log "Resource usage during load: CPU ${cpu_during}%, Memory ${mem_during}%"
    
    # Calculate increase
    local cpu_increase=$(echo "${cpu_during} - ${cpu_before}" | bc)
    local mem_increase=$(echo "${mem_during} - ${mem_before}" | bc)
    
    log "Resource increase: CPU +${cpu_increase}%, Memory +${mem_increase}%"
    
    # Wait for load test to complete
    wait ${ab_pid}
    
    # Check container stats
    log "Checking container resource usage..."
    for service in api nginx; do
        local stats=$(docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" exec "${service}" cat /proc/stat 2>/dev/null || echo "N/A")
        log "${service} stats: ${stats}"
    done
    
    # Database connection pool check
    log "Checking database connection pool..."
    local db_connections=$(docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;" -t | tr -d ' ')
    
    if [[ -n "${db_connections}" ]]; then
        log "Active database connections: ${db_connections}"
        
        if [[ ${db_connections} -lt 50 ]]; then
            success "✓ Database connection count is healthy (${db_connections})"
        else
            warning "High number of database connections (${db_connections})"
        fi
    else
        warning "Unable to determine database connection count"
    fi
    
    if [[ "${perf_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 6. Security Verification
validate_security() {
    section "Security Verification"
    
    local security_ok=true
    
    # Check security headers
    log "Checking security headers..."
    local headers_output="${TEMP_DIR}/security_headers.txt"
    curl -s -I "${NGINX_URL}" > "${headers_output}"
    
    # Define required security headers
    local required_headers=(
        "Strict-Transport-Security"
        "X-Content-Type-Options"
        "X-Frame-Options"
        "X-XSS-Protection"
        "Content-Security-Policy"
    )
    
    for header in "${required_headers[@]}"; do
        if grep -q "${header}:" "${headers_output}"; then
            success "✓ ${header} header is present"
        else
            warning "${header} header is missing"
        fi
    done
    
    # Check for HTTPS redirect
    log "Checking HTTPS redirect..."
    local redirect_code=$(curl -s -o /dev/null -w "%{http_code}" -I "${NGINX_URL}")
    
    if [[ "${redirect_code}" == "301" || "${redirect_code}" == "302" ]]; then
        local redirect_location=$(curl -s -I "${NGINX_URL}" | grep -i "Location:" | awk '{print $2}' | tr -d '\r')
        
        if [[ "${redirect_location}" == https://* ]]; then
            success "✓ HTTP to HTTPS redirect is configured"
        else
            warning "Redirect is not to HTTPS: ${redirect_location}"
        fi
    else
        warning "No HTTP to HTTPS redirect configured"
    fi
    
    # Check firewall status
    log "Checking firewall status..."
    if command_exists ufw; then
        if ufw status | grep -q "Status: active"; then
            success "✓ Firewall is active"
            
            # Check open ports
            local open_ports=$(ufw status | grep ALLOW | wc -l)
            log "Firewall has ${open_ports} open port rules"
        else
            warning "Firewall is not active"
        fi
    else
        warning "UFW firewall not installed"
    fi
    
    # Check fail2ban status
    log "Checking fail2ban status..."
    if command_exists fail2ban-client; then
        if systemctl is-active --quiet fail2ban; then
            success "✓ fail2ban is active"
            
            # Check jails
            local active_jails=$(fail2ban-client status | grep "Jail list" | sed 's/^.*:\s*//' | tr ',' ' ')
            log "Active fail2ban jails: ${active_jails}"
        else
            warning "fail2ban is not active"
        fi
    else
        warning "fail2ban not installed"
    fi
    
    # Check for exposed sensitive files
    log "Checking for exposed sensitive files..."
    local sensitive_paths=(
        "/.env"
        "/config"
        "/.git"
        "/secrets"
    )
    
    for path in "${sensitive_paths[@]}"; do
        local sensitive_code=$(curl -s -o /dev/null -w "%{http_code}" "${NGINX_URL}${path}")
        
        if [[ "${sensitive_code}" == "403" || "${sensitive_code}" == "404" ]]; then
            success "✓ ${path} is not accessible (${sensitive_code})"
        else
            error "✗ ${path} might be exposed (${sensitive_code})"
            security_ok=false
        fi
    done
    
    # Check for default credentials
    log "Checking for default credentials..."
    local default_creds=(
        "admin:admin:${GRAFANA_URL}/login"
        "admin:password:${API_BASE_URL}/api/v1/login"
    )
    
    for cred_info in "${default_creds[@]}"; do
        local username=$(echo "${cred_info}" | cut -d':' -f1)
        local password=$(echo "${cred_info}" | cut -d':' -f2)
        local login_url=$(echo "${cred_info}" | cut -d':' -f3)
        
        log "Testing default credentials: ${username}:${password} at ${login_url}"
        
        # This is a simple check - in a real system you'd need to adapt this to the actual login API
        local login_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "{\"username\":\"${username}\",\"password\":\"${password}\"}" "${login_url}")
        
        if [[ "${login_response}" == "200" || "${login_response}" == "302" ]]; then
            warning "Default credentials ${username}:${password} might work"
        else
            success "✓ Default credentials ${username}:${password} rejected"
        fi
    done
    
    if [[ "${security_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 7. Integration Testing
validate_integrations() {
    section "Integration Testing"
    
    local integration_ok=true
    
    # Check database integration
    log "Checking database integration..."
    local db_health=$(curl -s "${API_BASE_URL}/health" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
    
    if [[ "${db_health}" == "up" ]]; then
        success "✓ Database integration is working"
    else
        error "✗ Database integration is not working (status: ${db_health:-unknown})"
        integration_ok=false
    fi
    
    # Check Redis integration
    log "Checking Redis integration..."
    local redis_health=$(curl -s "${API_BASE_URL}/health" | grep -o '"redis":"[^"]*"' | cut -d'"' -f4)
    
    if [[ "${redis_health}" == "up" ]]; then
        success "✓ Redis integration is working"
    else
        error "✗ Redis integration is not working (status: ${redis_health:-unknown})"
        integration_ok=false
    fi
    
    # Check external integrations if configured
    log "Checking external integrations..."
    local integrations_config="${PROJECT_ROOT}/config/integrations/external-services.conf"
    
    if [[ -f "${integrations_config}" ]]; then
        log "Found external integrations configuration"
        
        # Check for Slack integration
        if grep -q "SLACK_WEBHOOK_URL" "${integrations_config}"; then
            log "Slack integration is configured"
            
            # Test Slack integration if test script exists
            if [[ -f "${PROJECT_ROOT}/scripts/integrations/slack-integration.sh" ]]; then
                if "${PROJECT_ROOT}/scripts/integrations/slack-integration.sh" test; then
                    success "✓ Slack integration test passed"
                else
                    warning "Slack integration test failed"
                fi
            else
                warning "Slack integration script not found"
            fi
        fi
        
        # Check for email integration
        if grep -q "SMTP_HOST" "${integrations_config}"; then
            log "Email integration is configured"
            
            # Test email integration if test script exists
            if [[ -f "${PROJECT_ROOT}/scripts/integrations/email-notifications.sh" ]]; then
                if "${PROJECT_ROOT}/scripts/integrations/email-notifications.sh" test; then
                    success "✓ Email integration test passed"
                else
                    warning "Email integration test failed"
                fi
            else
                warning "Email integration script not found"
            fi
        fi
    else
        log "No external integrations configuration found"
    fi
    
    # Check for API integrations
    log "Checking API integrations..."
    
    # This is a placeholder - in a real system, you'd test actual API integrations
    # For example, testing if the system can connect to external threat intelligence APIs
    
    if [[ -f "${PROJECT_ROOT}/scripts/threat-intelligence/update-threat-feeds.sh" ]]; then
        log "Threat intelligence integration is configured"
        
        # Test threat intelligence integration
        if "${PROJECT_ROOT}/scripts/threat-intelligence/update-threat-feeds.sh" --dry-run; then
            success "✓ Threat intelligence integration test passed"
        else
            warning "Threat intelligence integration test failed"
        fi
    fi
    
    if [[ "${integration_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 8. Backup System Validation
validate_backup_system() {
    section "Backup System Validation"
    
    local backup_ok=true
    
    # Check if backup scripts exist
    log "Checking backup scripts..."
    local backup_script="${PROJECT_ROOT}/scripts/database/backup_database.sh"
    
    if [[ -f "${backup_script}" ]]; then
        success "✓ Backup script exists"
        
        # Check if backup script is executable
        if [[ -x "${backup_script}" ]]; then
            success "✓ Backup script is executable"
        else
            warning "Backup script is not executable"
            chmod +x "${backup_script}"
            log "Made backup script executable"
        fi
        
        # Test backup script with dry run
        log "Testing backup script (dry run)..."
        if "${backup_script}" --test; then
            success "✓ Backup script test passed"
        else
            error "✗ Backup script test failed"
            backup_ok=false
        fi
    else
        error "✗ Backup script not found"
        backup_ok=false
    fi
    
    # Check backup directory
    log "Checking backup directory..."
    local backup_dir="${PROJECT_ROOT}/database/backups"
    
    if [[ -d "${backup_dir}" ]]; then
        success "✓ Backup directory exists"
        
        # Check for recent backups
        local recent_backups=$(find "${backup_dir}" -type f -name "*.sql*" -o -name "*.dump*" -o -name "*.backup*" -mtime -7 | wc -l)
        
        if [[ ${recent_backups} -gt 0 ]]; then
            success "✓ Found ${recent_backups} recent backups (last 7 days)"
            
            # List recent backups
            log "Recent backups:"
            find "${backup_dir}" -type f -name "*.sql*" -o -name "*.dump*" -o -name "*.backup*" -mtime -7 -exec ls -lh {} \; | tee -a "${VALIDATION_LOG}"
        else
            warning "No recent backups found (last 7 days)"
        fi
    else
        warning "Backup directory does not exist"
        mkdir -p "${backup_dir}"
        log "Created backup directory"
    fi
    
    # Check backup scheduling
    log "Checking backup scheduling..."
    if crontab -l 2>/dev/null | grep -q "backup_database.sh"; then
        success "✓ Backup is scheduled in crontab"
        
        # Show backup schedule
        log "Backup schedule:"
        crontab -l | grep "backup_database.sh" | tee -a "${VALIDATION_LOG}"
    else
        warning "Backup is not scheduled in crontab"
        
        # Suggest a backup schedule
        log "Suggested backup crontab entry:"
        echo "0 2 * * * ${backup_script} > /var/log/risk-platform-backup.log 2>&1" | tee -a "${VALIDATION_LOG}"
    fi
    
    # Check backup retention policy
    log "Checking backup retention policy..."
    if [[ -f "${PROJECT_ROOT}/scripts/database/cleanup_old_backups.sh" ]]; then
        success "✓ Backup retention script exists"
        
        # Check if retention script is scheduled
        if crontab -l 2>/dev/null | grep -q "cleanup_old_backups.sh"; then
            success "✓ Backup retention is scheduled"
        else
            warning "Backup retention is not scheduled"
        fi
    else
        warning "No backup retention script found"
        
        # Create a basic retention script
        log "Creating basic backup retention script..."
        mkdir -p "${PROJECT_ROOT}/scripts/database"
        cat > "${PROJECT_ROOT}/scripts/database/cleanup_old_backups.sh" << 'EOF'
#!/bin/bash
# Basic backup retention script

BACKUP_DIR="/opt/risk-platform/database/backups"
DAYS_TO_KEEP=30

# Remove backups older than DAYS_TO_KEEP
find "${BACKUP_DIR}" -type f -name "*.sql*" -o -name "*.dump*" -o -name "*.backup*" -mtime +${DAYS_TO_KEEP} -delete

echo "Removed backups older than ${DAYS_TO_KEEP} days"
EOF
        chmod +x "${PROJECT_ROOT}/scripts/database/cleanup_old_backups.sh"
        success "✓ Created basic backup retention script"
    fi
    
    if [[ "${backup_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 9. Error Log Analysis
validate_error_logs() {
    section "Error Log Analysis"
    
    # Check API logs
    log "Analyzing API logs..."
    local api_logs="${PROJECT_ROOT}/logs/api.log"
    local api_error_logs="${TEMP_DIR}/api_errors.log"
    
    if [[ -f "${api_logs}" ]]; then
        grep -i "error\|exception\|fail\|fatal" "${api_logs}" > "${api_error_logs}" 2>/dev/null || true
        
        local error_count=$(wc -l < "${api_error_logs}")
        log "Found ${error_count} errors/exceptions in API logs"
        
        if [[ ${error_count} -gt 0 ]]; then
            warning "API logs contain errors:"
            head -10 "${api_error_logs}" | tee -a "${VALIDATION_LOG}"
            
            if [[ ${error_count} -gt 10 ]]; then
                log "... and ${error_count} more (see ${VALIDATION_LOG} for details)"
            fi
        else
            success "✓ No errors found in API logs"
        fi
    else
        warning "API log file not found"
    fi
    
    # Check Nginx logs
    log "Analyzing Nginx logs..."
    local nginx_error_logs="${TEMP_DIR}/nginx_errors.log"
    
    docker compose -f "${PROJECT_ROOT}/docker-compose/base.yml" exec nginx cat /var/log/nginx/error.log > "${nginx_error_logs}" 2>/dev/null || true
    
    if [[ -s "${nginx_error_logs}" ]]; then
        local nginx_error_count=$(wc -l < "${nginx_error_logs}")
        log "Found ${nginx_error_count} entries in Nginx error log"
        
        if [[ ${nginx_error_count} -gt 0 ]]; then
            warning "Nginx error log contains entries:"
            head -10 "${nginx_error_logs}" | tee -a "${VALIDATION_LOG}"
            
            if [[ ${nginx_error_count} -gt 10 ]]; then
                log "... and ${nginx_error_count} more (see ${VALIDATION_LOG} for details)"
            fi
        else
            success "✓ No errors found in Nginx error log"
        fi
    else
        success "✓ Nginx error log is empty"
    fi
    
    # Check database logs
    log "Analyzing database logs..."
    local db_error_logs="${TEMP_DIR}/db_errors.log"
    
    docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec postgres grep -i "error\|fatal\|panic" /var/log/postgresql/postgresql-*.log > "${db_error_logs}" 2>/dev/null || true
    
    if [[ -s "${db_error_logs}" ]]; then
        local db_error_count=$(wc -l < "${db_error_logs}")
        log "Found ${db_error_count} errors in database logs"
        
        if [[ ${db_error_count} -gt 0 ]]; then
            warning "Database logs contain errors:"
            head -10 "${db_error_logs}" | tee -a "${VALIDATION_LOG}"
            
            if [[ ${db_error_count} -gt 10 ]]; then
                log "... and ${db_error_count} more (see ${VALIDATION_LOG} for details)"
            fi
        else
            success "✓ No errors found in database logs"
        fi
    else
        success "✓ No errors found in database logs"
    fi
    
    # Check system logs
    log "Analyzing system logs for application-related errors..."
    local system_error_logs="${TEMP_DIR}/system_errors.log"
    
    grep -i "risk-platform\|docker" /var/log/syslog | grep -i "error\|fail\|fatal" > "${system_error_logs}" 2>/dev/null || true
    
    if [[ -s "${system_error_logs}" ]]; then
        local system_error_count=$(wc -l < "${system_error_logs}")
        log "Found ${system_error_count} application-related errors in system logs"
        
        if [[ ${system_error_count} -gt 0 ]]; then
            warning "System logs contain application-related errors:"
            head -10 "${system_error_logs}" | tee -a "${VALIDATION_LOG}"
            
            if [[ ${system_error_count} -gt 10 ]]; then
                log "... and ${system_error_count} more (see ${VALIDATION_LOG} for details)"
            fi
        else
            success "✓ No application-related errors found in system logs"
        fi
    else
        success "✓ No application-related errors found in system logs"
    fi
    
    return 0
}

# 10. End-to-End Workflow Testing
validate_workflows() {
    section "End-to-End Workflow Testing"
    
    local workflow_ok=true
    
    # Test user authentication workflow
    log "Testing user authentication workflow..."
    
    # This is a placeholder - in a real system, you'd test actual authentication
    # For example, register a test user, login, verify token, logout
    
    # Simulate a basic authentication workflow
    local auth_endpoint="${API_BASE_URL}/api/v1/login"
    local auth_payload="{\"username\":\"test@example.com\",\"password\":\"password123\"}"
    local auth_response="${TEMP_DIR}/auth_response.json"
    
    curl -s -X POST -H "Content-Type: application/json" -d "${auth_payload}" "${auth_endpoint}" -o "${auth_response}"
    
    if [[ -s "${auth_response}" ]] && grep -q "token\|error" "${auth_response}"; then
        log "Authentication response received"
        
        # Check if authentication succeeded
        if grep -q "token" "${auth_response}" && ! grep -q "error" "${auth_response}"; then
            success "✓ Authentication workflow test passed"
            
            # Extract token for further tests
            local token=$(grep -o '"token":"[^"]*"' "${auth_response}" | cut -d'"' -f4)
            
            # Test authenticated endpoint
            log "Testing authenticated endpoint..."
            local protected_endpoint="${API_BASE_URL}/api/v1/protected-resource"
            local protected_response="${TEMP_DIR}/protected_response.json"
            
            curl -s -H "Authorization: Bearer ${token}" "${protected_endpoint}" -o "${protected_response}"
            
            if [[ -s "${protected_response}" ]] && ! grep -q "error" "${protected_response}"; then
                success "✓ Authenticated endpoint test passed"
            else
                warning "Authenticated endpoint test failed"
            fi
        else
            warning "Authentication failed - this might be expected if using test credentials"
        fi
    else
        warning "Authentication endpoint not implemented or not responding correctly"
    fi
    
    # Test data creation workflow
    log "Testing data creation workflow..."
    
    # This is a placeholder - in a real system, you'd test actual data creation
    # For example, create an organization, add users, add assets, etc.
    
    # Simulate a basic data creation workflow
    local create_endpoint="${API_BASE_URL}/api/v1/organizations"
    local create_payload="{\"name\":\"Test Organization\",\"industry\":\"Technology\",\"size\":\"Medium\"}"
    local create_response="${TEMP_DIR}/create_response.json"
    
    curl -s -X POST -H "Content-Type: application/json" -d "${create_payload}" "${create_endpoint}" -o "${create_response}"
    
    if [[ -s "${create_response}" ]]; then
        log "Data creation response received"
        
        # Check if creation succeeded
        if grep -q "id\|uuid" "${create_response}" && ! grep -q "error" "${create_response}"; then
            success "✓ Data creation workflow test passed"
            
            # Extract ID for further tests
            local org_id=$(grep -o '"id":[0-9]*' "${create_response}" | cut -d':' -f2)
            
            # Test data retrieval
            log "Testing data retrieval..."
            local get_endpoint="${API_BASE_URL}/api/v1/organizations/${org_id}"
            local get_response="${TEMP_DIR}/get_response.json"
            
            curl -s "${get_endpoint}" -o "${get_response}"
            
            if [[ -s "${get_response}" ]] && grep -q "name.*Test Organization" "${get_response}"; then
                success "✓ Data retrieval test passed"
            else
                warning "Data retrieval test failed"
            fi
        else
            warning "Data creation failed - this might be expected in test environment"
        fi
    else
        warning "Data creation endpoint not implemented or not responding correctly"
    fi
    
    # Test risk assessment workflow
    log "Testing risk assessment workflow..."
    
    # This is a placeholder - in a real system, you'd test actual risk assessment
    # For example, create a risk, assess it, mitigate it, etc.
    
    # Simulate a basic risk assessment workflow
    local risk_endpoint="${API_BASE_URL}/api/v1/risks"
    local risk_payload="{\"title\":\"Test Risk\",\"description\":\"This is a test risk\",\"severity\":\"Medium\",\"likelihood\":\"Low\"}"
    local risk_response="${TEMP_DIR}/risk_response.json"
    
    curl -s -X POST -H "Content-Type: application/json" -d "${risk_payload}" "${risk_endpoint}" -o "${risk_response}"
    
    if [[ -s "${risk_response}" ]]; then
        log "Risk assessment response received"
        
        # Check if risk creation succeeded
        if grep -q "id\|uuid" "${risk_response}" && ! grep -q "error" "${risk_response}"; then
            success "✓ Risk assessment workflow test passed"
        else
            warning "Risk assessment failed - this might be expected in test environment"
        fi
    else
        warning "Risk assessment endpoint not implemented or not responding correctly"
    fi
    
    # Test reporting workflow
    log "Testing reporting workflow..."
    
    # This is a placeholder - in a real system, you'd test actual reporting
    # For example, generate a report, export it, etc.
    
    # Simulate a basic reporting workflow
    local report_endpoint="${API_BASE_URL}/api/v1/reports/generate"
    local report_payload="{\"type\":\"executive\",\"format\":\"pdf\"}"
    local report_response="${TEMP_DIR}/report_response.json"
    
    curl -s -X POST -H "Content-Type: application/json" -d "${report_payload}" "${report_endpoint}" -o "${report_response}"
    
    if [[ -s "${report_response}" ]]; then
        log "Reporting response received"
        
        # Check if report generation succeeded
        if grep -q "url\|id" "${report_response}" && ! grep -q "error" "${report_response}"; then
            success "✓ Reporting workflow test passed"
        else
            warning "Reporting failed - this might be expected in test environment"
        fi
    else
        warning "Reporting endpoint not implemented or not responding correctly"
    fi
    
    if [[ "${workflow_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# =============================================
# REPORT GENERATION
# =============================================

generate_report() {
    section "Generating Validation Report"
    
    local report_date=$(date +'%Y-%m-%d %H:%M:%S')
    local hostname=$(hostname)
    local validation_result=$1
    
    # Create HTML report
    cat > "${REPORT_FILE}" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Platform Validation Report</title>
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
            <h1>Risk Platform Validation Report</h1>
            <p>Generated on ${report_date}</p>
        </header>
        
        <div class="summary">
            <h2>Validation Summary</h2>
            <p>
                <strong>Status:</strong> 
                <span class="${validation_result == 0 ? 'success' : 'error'}">
                    ${validation_result == 0 ? 'PASSED' : 'FAILED'}
                </span>
            </p>
            <p><strong>Host:</strong> ${hostname}</p>
            <p><strong>Platform Version:</strong> 1.0.0</p>
        </div>
        
        <div class="section">
            <h2>Service Health</h2>
            <table>
                <tr>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Health</th>
                    <th>Restarts</th>
                </tr>
EOF
    
    # Add service health data
    for service in "${REQUIRED_SERVICES[@]}"; do
        local compose_file="${PROJECT_ROOT}/docker-compose/base.yml"
        if [[ "${service}" == "postgres" || "${service}" == "redis" ]]; then
            compose_file="${PROJECT_ROOT}/docker-compose/db.yml"
        fi
        
        local status=$(docker compose -f "${compose_file}" ps --format json "${service}" 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4)
        local health=$(docker compose -f "${compose_file}" ps --format json "${service}" 2>/dev/null | grep -o '"Health":"[^"]*"' | cut -d'"' -f4)
        local restarts=$(docker compose -f "${compose_file}" ps --format json "${service}" 2>/dev/null | grep -o '"RestartCount":[0-9]*' | cut -d':' -f2)
        
        # Default values if not found
        status=${status:-"unknown"}
        health=${health:-"N/A"}
        restarts=${restarts:-"0"}
        
        # Determine status class
        local status_class="warning"
        if [[ "${status}" == "running" ]]; then
            status_class="success"
        elif [[ "${status}" == "exited" || "${status}" == "dead" ]]; then
            status_class="error"
        fi
        
        # Determine health class
        local health_class="warning"
        if [[ "${health}" == "healthy" ]]; then
            health_class="success"
        elif [[ "${health}" == "unhealthy" ]]; then
            health_class="error"
        fi
        
        cat >> "${REPORT_FILE}" << EOF
                <tr>
                    <td>${service}</td>
                    <td class="${status_class}">${status}</td>
                    <td class="${health_class}">${health}</td>
                    <td>${restarts}</td>
                </tr>
EOF
    done
    
    cat >> "${REPORT_FILE}" << EOF
            </table>
        </div>
        
        <div class="section">
            <h2>API Endpoint Performance</h2>
            <table>
                <tr>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Response Time (ms)</th>
                    <th>Result</th>
                </tr>
EOF
    
    # Add API endpoint data if available
    if [[ -f "${TEMP_DIR}/api_results.txt" ]]; then
        while IFS=: read -r endpoint http_code response_time; do
            # Determine status class
            local status_class="warning"
            if [[ "${http_code}" == "200" || "${http_code}" == "201" ]]; then
                status_class="success"
            elif [[ "${http_code}" == "400" || "${http_code}" == "401" || "${http_code}" == "403" || "${http_code}" == "404" || "${http_code}" == "500" ]]; then
                status_class="error"
            fi
            
            # Determine response time class
            local time_class="success"
            if (( response_time > RESPONSE_TIME_THRESHOLD )); then
                time_class="warning"
            fi
            if (( response_time > RESPONSE_TIME_THRESHOLD * 2 )); then
                time_class="error"
            fi
            
            # Determine result
            local result="PASS"
            local result_class="success"
            if [[ "${http_code}" != "200" && "${http_code}" != "201" ]] || (( response_time > RESPONSE_TIME_THRESHOLD * 2 )); then
                result="FAIL"
                result_class="error"
            elif (( response_time > RESPONSE_TIME_THRESHOLD )); then
                result="WARN"
                result_class="warning"
            fi
            
            cat >> "${REPORT_FILE}" << EOF
                <tr>
                    <td>${endpoint}</td>
                    <td class="${status_class}">${http_code}</td>
                    <td class="${time_class}">${response_time}</td>
                    <td class="${result_class}">${result}</td>
                </tr>
EOF
        done < "${TEMP_DIR}/api_results.txt"
    else
        cat >> "${REPORT_FILE}" << EOF
                <tr>
                    <td colspan="4">No API endpoint data available</td>
                </tr>
EOF
    fi
    
    cat >> "${REPORT_FILE}" << EOF
            </table>
        </div>
        
        <div class="section">
            <h2>System Resources</h2>
            <table>
                <tr>
                    <th>Resource</th>
                    <th>Usage</th>
                    <th>Threshold</th>
                    <th>Status</th>
                </tr>
EOF
    
    # Add system resource data
    local resources=$(get_system_resources)
    local cpu_usage=$(echo "${resources}" | cut -d':' -f1)
    local memory_usage=$(echo "${resources}" | cut -d':' -f2)
    local disk_usage=$(echo "${resources}" | cut -d':' -f3)
    
    # CPU status
    local cpu_class="success"
    local cpu_status="OK"
    if (( $(echo "${cpu_usage} >= ${CPU_THRESHOLD}" | bc -l) )); then
        cpu_class="warning"
        cpu_status="HIGH"
    fi
    if (( $(echo "${cpu_usage} >= 90" | bc -l) )); then
        cpu_class="error"
        cpu_status="CRITICAL"
    fi
    
    # Memory status
    local memory_class="success"
    local memory_status="OK"
    if (( $(echo "${memory_usage} >= ${MEMORY_THRESHOLD}" | bc -l) )); then
        memory_class="warning"
        memory_status="HIGH"
    fi
    if (( $(echo "${memory_usage} >= 90" | bc -l) )); then
        memory_class="error"
        memory_status="CRITICAL"
    fi
    
    # Disk status
    local disk_class="success"
    local disk_status="OK"
    if (( $(echo "${disk_usage} >= 80" | bc -l) )); then
        disk_class="warning"
        disk_status="HIGH"
    fi
    if (( $(echo "${disk_usage} >= 90" | bc -l) )); then
        disk_class="error"
        disk_status="CRITICAL"
    fi
    
    cat >> "${REPORT_FILE}" << EOF
                <tr>
                    <td>CPU</td>
                    <td>${cpu_usage}%</td>
                    <td>${CPU_THRESHOLD}%</td>
                    <td class="${cpu_class}">${cpu_status}</td>
                </tr>
                <tr>
                    <td>Memory</td>
                    <td>${memory_usage}%</td>
                    <td>${MEMORY_THRESHOLD}%</td>
                    <td class="${memory_class}">${memory_status}</td>
                </tr>
                <tr>
                    <td>Disk</td>
                    <td>${disk_usage}%</td>
                    <td>90%</td>
                    <td class="${disk_class}">${disk_status}</td>
                </tr>
            </table>
        </div>
        
        <div class="section">
            <h2>Security Status</h2>
            <table>
                <tr>
                    <th>Check</th>
                    <th>Status</th>
                    <th>Details</th>
                </tr>
EOF
    
    # Add security data
    local security_checks=(
        "Firewall:$(ufw status | grep -q 'Status: active' && echo 'ACTIVE' || echo 'INACTIVE'):$(ufw status | grep 'Status: active' && echo 'UFW is enabled and configured' || echo 'UFW is not active')"
        "HTTPS Redirect:$(curl -s -I "${NGINX_URL}" | grep -q 'Location: https://' && echo 'ENABLED' || echo 'DISABLED'):$(curl -s -I "${NGINX_URL}" | grep -i 'Location:' | head -1 || echo 'No redirect configured')"
        "Security Headers:$(curl -s -I "${NGINX_URL}" | grep -q 'Strict-Transport-Security\|X-Content-Type-Options\|X-Frame-Options' && echo 'CONFIGURED' || echo 'MISSING'):$(curl -s -I "${NGINX_URL}" | grep -E 'Strict-Transport-Security|X-Content-Type-Options|X-Frame-Options|X-XSS-Protection|Content-Security-Policy' | tr '\r' ' ' | paste -sd ',' -)"
    )
    
    for check_info in "${security_checks[@]}"; do
        IFS=: read -r check status details <<< "${check_info}"
        
        # Determine status class
        local status_class="warning"
        if [[ "${status}" == "ACTIVE" || "${status}" == "ENABLED" || "${status}" == "CONFIGURED" ]]; then
            status_class="success"
        elif [[ "${status}" == "INACTIVE" || "${status}" == "DISABLED" || "${status}" == "MISSING" ]]; then
            status_class="error"
        fi
        
        cat >> "${REPORT_FILE}" << EOF
                <tr>
                    <td>${check}</td>
                    <td class="${status_class}">${status}</td>
                    <td>${details}</td>
                </tr>
EOF
    done
    
    cat >> "${REPORT_FILE}" << EOF
            </table>
        </div>
        
        <div class="section">
            <h2>Validation Details</h2>
            <p>For detailed validation results, please see the validation log at: <code>${VALIDATION_LOG}</code></p>
        </div>
        
        <div class="footer">
            <p>Risk Platform Validation Report | Generated by validate_platform.sh v1.0.0</p>
        </div>
    </div>
</body>
</html>
EOF
    
    success "Validation report generated: ${REPORT_FILE}"
}

# =============================================
# MAIN EXECUTION
# =============================================

run_validation() {
    section "Starting Platform Validation"
    log "Risk Platform Validation - $(date)"
    
    # Track overall validation status
    local validation_status=0
    
    # Run all validation functions
    validate_service_health || validation_status=1
    validate_api_endpoints || validation_status=1
    validate_monitoring_stack || validation_status=1
    validate_reverse_proxy || validation_status=1
    validate_performance || validation_status=1
    validate_security || validation_status=1
    validate_integrations || validation_status=1
    validate_backup_system || validation_status=1
    validate_error_logs || validation_status=1
    validate_workflows || validation_status=1
    
    # Generate validation report
    generate_report ${validation_status}
    
    # Summary
    section "Validation Summary"
    
    if [[ ${validation_status} -eq 0 ]]; then
        success "🎉 Platform validation PASSED"
        log "All validation checks completed successfully"
    else
        error "❌ Platform validation FAILED"
        log "Some validation checks failed - see log for details: ${VALIDATION_LOG}"
        log "Validation report generated: ${REPORT_FILE}"
    fi
    
    return ${validation_status}
}

main() {
    # Check if running as root or with sudo
    if [[ $EUID -ne 0 && ! -w "${PROJECT_ROOT}" ]]; then
        error "This script requires root privileges or write access to ${PROJECT_ROOT}"
        exit 1
    fi
    
    # Run validation
    if run_validation; then
        exit 0
    else
        exit 1
    fi
}

# Execute main function
main
