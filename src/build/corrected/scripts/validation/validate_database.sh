#!/bin/bash
# =========================================================================
# Risk Platform Database Validation Script
# =========================================================================
# This script performs comprehensive validation of the Risk Platform database
# infrastructure, including PostgreSQL and Redis, schema validation,
# security checks, and backup/recovery testing.
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
VALIDATION_LOG="${LOG_DIR}/database_validation.log"
BACKUP_DIR="${PROJECT_ROOT}/database/backups"
TEMP_DIR="/tmp/risk-platform-validation"

# Database connection parameters
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="risk_platform"
DB_USER="risk_platform_app"
DB_SCHEMA="risk_platform"

# Required tables (add all required tables here)
REQUIRED_TABLES=(
  "organizations"
  "users"
  "roles"
  "permissions"
  "threats"
  "vulnerabilities"
  "risks"
  "controls"
  "requirements"
  "assets"
  "incidents"
  "compliance_frameworks"
  "compliance_requirements"
  "audit_logs"
  "integrations"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# =============================================
# LOGGING FUNCTIONS
# =============================================

# Ensure log directory exists
mkdir -p "${LOG_DIR}"

# Initialize log file
echo "===== DATABASE VALIDATION $(date) =====" > "${VALIDATION_LOG}"

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

# Load database password
load_db_password() {
    if [[ -f "${PROJECT_ROOT}/secrets/database/postgres_app_password.txt" ]]; then
        DB_PASSWORD=$(cat "${PROJECT_ROOT}/secrets/database/postgres_app_password.txt")
    elif [[ -f "${PROJECT_ROOT}/.env" ]]; then
        DB_PASSWORD=$(grep DB_PASSWORD "${PROJECT_ROOT}/.env" | cut -d '=' -f2)
    else
        error "Database password file not found"
        return 1
    fi
    
    # Validate password is not empty
    if [[ -z "${DB_PASSWORD}" ]]; then
        error "Database password is empty"
        return 1
    fi
    
    return 0
}

# Load Redis password
load_redis_password() {
    if [[ -f "${PROJECT_ROOT}/secrets/database/redis_password.txt" ]]; then
        REDIS_PASSWORD=$(cat "${PROJECT_ROOT}/secrets/database/redis_password.txt")
    elif [[ -f "${PROJECT_ROOT}/.env" ]]; then
        REDIS_PASSWORD=$(grep REDIS_PASSWORD "${PROJECT_ROOT}/.env" | cut -d '=' -f2)
    else
        error "Redis password file not found"
        return 1
    }
    
    # Validate password is not empty
    if [[ -z "${REDIS_PASSWORD}" ]]; then
        error "Redis password is empty"
        return 1
    fi
    
    return 0
}

# Execute SQL query and return result
execute_sql() {
    local query="$1"
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "${query}" 2>>"${VALIDATION_LOG}"
}

# Execute SQL query and check if it succeeds
test_sql() {
    local query="$1"
    local description="$2"
    
    log "Testing: ${description}"
    
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "${query}" &>>"${VALIDATION_LOG}"; then
        success "✓ ${description}"
        return 0
    else
        error "✗ ${description}"
        return 1
    fi
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# =============================================
# VALIDATION FUNCTIONS
# =============================================

# 1. Container Health Checks
validate_container_health() {
    section "Container Health Checks"
    
    local postgres_status
    local redis_status
    local status_ok=true
    
    log "Checking PostgreSQL container status..."
    postgres_status=$(docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" ps --format json postgres | grep -o '"State":"[^"]*"' | cut -d'"' -f4)
    
    if [[ "${postgres_status}" == "running" ]]; then
        success "✓ PostgreSQL container is running"
    else
        error "✗ PostgreSQL container is not running (status: ${postgres_status})"
        status_ok=false
    fi
    
    log "Checking Redis container status..."
    redis_status=$(docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" ps --format json redis | grep -o '"State":"[^"]*"' | cut -d'"' -f4)
    
    if [[ "${redis_status}" == "running" ]]; then
        success "✓ Redis container is running"
    else
        error "✗ Redis container is not running (status: ${redis_status})"
        status_ok=false
    fi
    
    # Check container logs for errors
    log "Checking container logs for errors..."
    docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" logs --tail=100 postgres | grep -i "error\|fatal\|panic" > "${TEMP_DIR}/postgres_errors.log"
    
    if [[ -s "${TEMP_DIR}/postgres_errors.log" ]]; then
        warning "Found errors in PostgreSQL logs:"
        cat "${TEMP_DIR}/postgres_errors.log" | tee -a "${VALIDATION_LOG}"
    else
        success "✓ No critical errors found in PostgreSQL logs"
    fi
    
    docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" logs --tail=100 redis | grep -i "error\|fatal\|panic" > "${TEMP_DIR}/redis_errors.log"
    
    if [[ -s "${TEMP_DIR}/redis_errors.log" ]]; then
        warning "Found errors in Redis logs:"
        cat "${TEMP_DIR}/redis_errors.log" | tee -a "${VALIDATION_LOG}"
    else
        success "✓ No critical errors found in Redis logs"
    fi
    
    if [[ "${status_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 2. Connection Tests
validate_connections() {
    section "Database Connection Tests"
    
    local connection_ok=true
    
    # Test PostgreSQL connection
    log "Testing PostgreSQL connection..."
    if PGPASSWORD="${DB_PASSWORD}" pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"; then
        success "✓ PostgreSQL connection successful"
    else
        error "✗ PostgreSQL connection failed"
        connection_ok=false
    fi
    
    # Test basic query
    log "Testing basic SQL query..."
    if test_sql "SELECT 1 AS test;" "Basic SQL query"; then
        success "✓ Basic SQL query successful"
    else
        error "✗ Basic SQL query failed"
        connection_ok=false
    fi
    
    # Test Redis connection
    log "Testing Redis connection..."
    if command_exists redis-cli; then
        if echo "AUTH ${REDIS_PASSWORD}" | redis-cli -h localhost -p 6379 > /dev/null && \
           echo "PING" | redis-cli -h localhost -p 6379 -a "${REDIS_PASSWORD}" | grep -q "PONG"; then
            success "✓ Redis connection successful"
        else
            error "✗ Redis connection failed"
            connection_ok=false
        fi
    else
        warning "redis-cli not found, skipping Redis connection test"
        log "Installing redis-cli for future tests..."
        apt-get update && apt-get install -y redis-tools
    fi
    
    if [[ "${connection_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 3. Schema Validation
validate_schema() {
    section "Database Schema Validation"
    
    local schema_ok=true
    
    # Check if schema exists
    log "Checking if schema exists..."
    local schema_exists=$(execute_sql "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '${DB_SCHEMA}';")
    
    if [[ "${schema_exists}" -eq 1 ]]; then
        success "✓ Schema '${DB_SCHEMA}' exists"
    else
        error "✗ Schema '${DB_SCHEMA}' does not exist"
        schema_ok=false
    fi
    
    # Check if all required tables exist
    log "Checking if all required tables exist..."
    
    for table in "${REQUIRED_TABLES[@]}"; do
        local table_exists=$(execute_sql "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${DB_SCHEMA}' AND table_name = '${table}';")
        
        if [[ "${table_exists}" -eq 1 ]]; then
            success "✓ Table '${table}' exists"
        else
            error "✗ Table '${table}' does not exist"
            schema_ok=false
        fi
    done
    
    # Count total number of tables
    local total_tables=$(execute_sql "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${DB_SCHEMA}';")
    log "Total tables in schema: ${total_tables}"
    
    # Check if there are at least 15 tables
    if [[ "${total_tables}" -ge 15 ]]; then
        success "✓ Schema has at least 15 tables"
    else
        warning "Schema has fewer than 15 tables (found: ${total_tables})"
    fi
    
    # Check for primary keys
    log "Checking if tables have primary keys..."
    local tables_without_pk=$(execute_sql "
        SELECT t.table_name
        FROM information_schema.tables t
        LEFT JOIN information_schema.table_constraints c
            ON c.table_schema = t.table_schema
            AND c.table_name = t.table_name
            AND c.constraint_type = 'PRIMARY KEY'
        WHERE t.table_schema = '${DB_SCHEMA}'
        AND c.constraint_name IS NULL
        AND t.table_type = 'BASE TABLE';
    ")
    
    if [[ -z "${tables_without_pk}" ]]; then
        success "✓ All tables have primary keys"
    else
        warning "Tables without primary keys:"
        echo "${tables_without_pk}" | tee -a "${VALIDATION_LOG}"
    fi
    
    if [[ "${schema_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 4. Data Integrity
validate_data_integrity() {
    section "Data Integrity Checks"
    
    local data_ok=true
    
    # Check if there is sample data in key tables
    log "Checking for sample data in key tables..."
    
    # Check organizations table
    local org_count=$(execute_sql "SELECT COUNT(*) FROM ${DB_SCHEMA}.organizations;")
    if [[ "${org_count}" -gt 0 ]]; then
        success "✓ Organizations table has data (${org_count} rows)"
    else
        warning "Organizations table is empty"
    fi
    
    # Check users table
    local user_count=$(execute_sql "SELECT COUNT(*) FROM ${DB_SCHEMA}.users;")
    if [[ "${user_count}" -gt 0 ]]; then
        success "✓ Users table has data (${user_count} rows)"
    else
        warning "Users table is empty"
    fi
    
    # Check for orphaned records in key relationships
    log "Checking for orphaned records..."
    
    # Example: Check if all users have valid organization IDs
    local orphaned_users=$(execute_sql "
        SELECT COUNT(*) FROM ${DB_SCHEMA}.users u
        LEFT JOIN ${DB_SCHEMA}.organizations o ON u.organization_id = o.id
        WHERE o.id IS NULL;
    ")
    
    if [[ "${orphaned_users}" -eq 0 ]]; then
        success "✓ No orphaned user records found"
    else
        warning "Found ${orphaned_users} users with invalid organization IDs"
    fi
    
    # Check for duplicate primary keys
    log "Checking for duplicate primary keys..."
    local duplicate_pk_query="
        SELECT table_name FROM (
            SELECT 
                t.table_name, 
                c.column_name, 
                COUNT(*) 
            FROM 
                information_schema.tables t
            JOIN 
                information_schema.columns c ON c.table_name = t.table_name
            JOIN 
                information_schema.table_constraints tc ON tc.table_name = t.table_name
            JOIN 
                information_schema.constraint_column_usage ccu 
                    ON ccu.constraint_name = tc.constraint_name 
                    AND ccu.column_name = c.column_name
            WHERE 
                t.table_schema = '${DB_SCHEMA}'
                AND tc.constraint_type = 'PRIMARY KEY'
            GROUP BY 
                t.table_name, c.column_name
            HAVING 
                COUNT(*) > 1
        ) as duplicates;
    "
    
    local duplicate_pks=$(execute_sql "${duplicate_pk_query}")
    
    if [[ -z "${duplicate_pks}" ]]; then
        success "✓ No duplicate primary keys found"
    else
        error "✗ Found tables with duplicate primary keys:"
        echo "${duplicate_pks}" | tee -a "${VALIDATION_LOG}"
        data_ok=false
    fi
    
    # Check data types of key columns
    log "Checking data types of key columns..."
    
    # Example: Check that organization_id is an integer/uuid in users table
    local org_id_type=$(execute_sql "
        SELECT data_type FROM information_schema.columns 
        WHERE table_schema = '${DB_SCHEMA}' 
        AND table_name = 'users' 
        AND column_name = 'organization_id';
    ")
    
    if [[ "${org_id_type}" == "integer" || "${org_id_type}" == "uuid" ]]; then
        success "✓ Organization ID has correct data type (${org_id_type})"
    else
        warning "Organization ID has unexpected data type: ${org_id_type}"
    fi
    
    if [[ "${data_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 5. Performance Tests
validate_performance() {
    section "Database Performance Tests"
    
    local perf_ok=true
    
    # Check for slow queries in logs
    log "Checking for slow queries..."
    docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec postgres grep -i "duration:" /var/log/postgresql/postgresql-*.log > "${TEMP_DIR}/slow_queries.log" 2>/dev/null || true
    
    if [[ -s "${TEMP_DIR}/slow_queries.log" ]]; then
        warning "Found slow queries in PostgreSQL logs:"
        head -5 "${TEMP_DIR}/slow_queries.log" | tee -a "${VALIDATION_LOG}"
        echo "... (see ${VALIDATION_LOG} for complete list)" | tee -a "${VALIDATION_LOG}"
    else
        success "✓ No slow queries found in logs"
    fi
    
    # Test query performance
    log "Testing query performance..."
    
    # Simple performance test - should complete quickly
    local start_time=$(date +%s.%N)
    execute_sql "SELECT COUNT(*) FROM ${DB_SCHEMA}.organizations;" > /dev/null
    local end_time=$(date +%s.%N)
    local duration=$(echo "${end_time} - ${start_time}" | bc)
    
    log "Simple count query completed in ${duration} seconds"
    
    if (( $(echo "${duration} < 1.0" | bc -l) )); then
        success "✓ Simple query performance is good (${duration}s)"
    else
        warning "Simple query took longer than expected (${duration}s)"
    fi
    
    # Check index usage
    log "Checking index usage..."
    local missing_indexes=$(execute_sql "
        SELECT
            schemaname || '.' || relname AS table,
            seq_scan,
            seq_tup_read,
            idx_scan,
            seq_tup_read / CASE WHEN seq_scan = 0 THEN 1 ELSE seq_scan END AS avg_seq_tuples,
            idx_tup_fetch / CASE WHEN idx_scan = 0 THEN 1 ELSE idx_scan END AS avg_idx_tuples
        FROM
            pg_stat_user_tables
        WHERE
            schemaname = '${DB_SCHEMA}'
            AND seq_scan > 10
            AND idx_scan = 0
            AND seq_tup_read > 1000
        ORDER BY
            seq_tup_read DESC;
    ")
    
    if [[ -z "${missing_indexes}" ]]; then
        success "✓ No tables with missing indexes detected"
    else
        warning "Tables that might benefit from indexes:"
        echo "${missing_indexes}" | tee -a "${VALIDATION_LOG}"
    fi
    
    # Check database statistics
    log "Checking database statistics..."
    local db_stats=$(execute_sql "
        SELECT
            pg_database_size('${DB_NAME}') / (1024 * 1024) AS size_mb,
            (SELECT setting::integer FROM pg_settings WHERE name = 'max_connections') AS max_connections,
            (SELECT count(*) FROM pg_stat_activity) AS active_connections;
    ")
    
    log "Database statistics:"
    echo "${db_stats}" | tee -a "${VALIDATION_LOG}"
    
    # Check connection count
    local active_connections=$(echo "${db_stats}" | awk '{print $3}')
    local max_connections=$(echo "${db_stats}" | awk '{print $2}')
    
    if (( active_connections < max_connections / 2 )); then
        success "✓ Connection count is healthy (${active_connections}/${max_connections})"
    else
        warning "High number of connections (${active_connections}/${max_connections})"
    fi
    
    if [[ "${perf_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 6. Security Checks
validate_security() {
    section "Database Security Checks"
    
    local security_ok=true
    
    # Check if password authentication is required
    log "Checking password authentication settings..."
    local auth_method=$(docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec postgres grep "host.*${DB_NAME}.*${DB_USER}" /var/lib/postgresql/data/pg_hba.conf | awk '{print $NF}')
    
    if [[ "${auth_method}" == "md5" || "${auth_method}" == "scram-sha-256" ]]; then
        success "✓ Strong password authentication is enabled (${auth_method})"
    else
        error "✗ Weak authentication method: ${auth_method}"
        security_ok=false
    fi
    
    # Check password strength
    log "Checking password strength..."
    local password_length=${#DB_PASSWORD}
    
    if [[ ${password_length} -ge 16 ]]; then
        success "✓ Database password meets length requirements (${password_length} chars)"
    else
        warning "Database password is shorter than recommended (${password_length} chars)"
    fi
    
    # Check if SSL is enabled
    log "Checking if SSL is enabled..."
    local ssl_enabled=$(execute_sql "SHOW ssl;")
    
    if [[ "${ssl_enabled}" == "on" ]]; then
        success "✓ SSL is enabled"
    else
        warning "SSL is not enabled"
    fi
    
    # Check for public schema permissions
    log "Checking public schema permissions..."
    local public_permissions=$(execute_sql "
        SELECT grantee, privilege_type
        FROM information_schema.role_table_grants
        WHERE table_schema = 'public'
        AND grantee = 'PUBLIC';
    ")
    
    if [[ -z "${public_permissions}" ]]; then
        success "✓ No excessive public schema permissions"
    else
        warning "Public schema has the following permissions:"
        echo "${public_permissions}" | tee -a "${VALIDATION_LOG}"
    fi
    
    # Check for superuser accounts
    log "Checking for superuser accounts..."
    local superusers=$(execute_sql "
        SELECT usename FROM pg_user WHERE usesuper = true AND usename != 'postgres';
    ")
    
    if [[ -z "${superusers}" ]]; then
        success "✓ No additional superuser accounts found"
    else
        warning "Additional superuser accounts found:"
        echo "${superusers}" | tee -a "${VALIDATION_LOG}"
    fi
    
    # Check if database is exposed externally
    log "Checking if database is exposed externally..."
    local external_listeners=$(docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec postgres grep "listen_addresses" /var/lib/postgresql/data/postgresql.conf | grep -v "^#")
    
    if [[ -z "${external_listeners}" || "${external_listeners}" == *"'localhost'"* ]]; then
        success "✓ Database is not exposed externally"
    else
        warning "Database might be exposed externally: ${external_listeners}"
    fi
    
    if [[ "${security_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 7. Backup Validation
validate_backups() {
    section "Backup Validation"
    
    local backup_ok=true
    
    # Check if backup directory exists
    log "Checking backup directory..."
    if [[ -d "${BACKUP_DIR}" ]]; then
        success "✓ Backup directory exists"
    else
        warning "Backup directory does not exist, creating it..."
        mkdir -p "${BACKUP_DIR}"
    fi
    
    # Create a test backup
    log "Creating test backup..."
    local backup_file="${BACKUP_DIR}/test_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${backup_file}"; then
        success "✓ Test backup created successfully: ${backup_file}"
        
        # Check backup file size
        local backup_size=$(du -h "${backup_file}" | cut -f1)
        log "Backup size: ${backup_size}"
        
        # Validate backup content
        log "Validating backup content..."
        if grep -q "CREATE TABLE" "${backup_file}" && grep -q "COPY" "${backup_file}"; then
            success "✓ Backup content validation passed"
        else
            error "✗ Backup content validation failed"
            backup_ok=false
        fi
    else
        error "✗ Failed to create test backup"
        backup_ok=false
    fi
    
    # Check for recent backups
    log "Checking for recent backups..."
    local recent_backups=$(find "${BACKUP_DIR}" -name "*.sql" -o -name "*.dump" -o -name "*.backup" -mtime -7 | wc -l)
    
    if [[ "${recent_backups}" -gt 0 ]]; then
        success "✓ Found ${recent_backups} backups from the last 7 days"
    else
        warning "No recent backups found in the last 7 days"
    fi
    
    # Check backup script existence
    log "Checking for backup scripts..."
    if [[ -f "${PROJECT_ROOT}/scripts/database/backup_database.sh" ]]; then
        success "✓ Backup script exists"
        
        # Test backup script execution
        log "Testing backup script execution..."
        if "${PROJECT_ROOT}/scripts/database/backup_database.sh" --test; then
            success "✓ Backup script test execution successful"
        else
            warning "Backup script test execution failed"
        fi
    else
        warning "Backup script not found, creating a basic one..."
        
        # Create a basic backup script
        mkdir -p "${PROJECT_ROOT}/scripts/database"
        cat > "${PROJECT_ROOT}/scripts/database/backup_database.sh" << 'EOF'
#!/bin/bash
# Basic database backup script

set -e

PROJECT_ROOT="/opt/risk-platform"
BACKUP_DIR="${PROJECT_ROOT}/database/backups"
DB_NAME="risk_platform"
DB_USER="risk_platform_app"
DB_HOST="localhost"
DB_PORT="5432"

# Load password
DB_PASSWORD=$(cat "${PROJECT_ROOT}/secrets/database/postgres_app_password.txt")

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Create timestamped backup file
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"

# Run backup
if [[ "$1" == "--test" ]]; then
    echo "Running in test mode"
    BACKUP_FILE="${BACKUP_DIR}/test_backup.sql"
fi

echo "Creating backup: ${BACKUP_FILE}"
PGPASSWORD="${DB_PASSWORD}" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -f "${BACKUP_FILE}"

# Compress backup
gzip -f "${BACKUP_FILE}"

echo "Backup completed: ${BACKUP_FILE}.gz"

# Exit with success in test mode
if [[ "$1" == "--test" ]]; then
    exit 0
fi
EOF
        chmod +x "${PROJECT_ROOT}/scripts/database/backup_database.sh"
        success "✓ Basic backup script created"
    fi
    
    if [[ "${backup_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 8. Recovery Tests
validate_recovery() {
    section "Recovery Testing"
    
    local recovery_ok=true
    
    # Check if we have a backup to test recovery
    log "Looking for a backup file to test recovery..."
    local test_backup=$(find "${BACKUP_DIR}" -name "test_backup_*.sql" | sort -r | head -1)
    
    if [[ -z "${test_backup}" ]]; then
        warning "No test backup found, skipping recovery test"
        return 0
    fi
    
    # Create a test database for recovery
    local test_db="risk_platform_recovery_test"
    log "Creating test database for recovery: ${test_db}"
    
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "DROP DATABASE IF EXISTS ${test_db};" && \
       PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "CREATE DATABASE ${test_db};"; then
        success "✓ Test database created"
        
        # Restore backup to test database
        log "Restoring backup to test database..."
        if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${test_db}" -f "${test_backup}"; then
            success "✓ Backup restored successfully to test database"
            
            # Verify restored data
            log "Verifying restored data..."
            local table_count=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${test_db}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${DB_SCHEMA}';" | tr -d ' ')
            
            if [[ "${table_count}" -gt 0 ]]; then
                success "✓ Restored database has ${table_count} tables"
            else
                error "✗ Restored database has no tables"
                recovery_ok=false
            fi
        else
            error "✗ Failed to restore backup to test database"
            recovery_ok=false
        fi
        
        # Clean up test database
        log "Cleaning up test database..."
        PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -c "DROP DATABASE IF EXISTS ${test_db};"
    else
        error "✗ Failed to create test database"
        recovery_ok=false
    fi
    
    if [[ "${recovery_ok}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

# 9. Replication Status
validate_replication() {
    section "Replication Status"
    
    # Check if replication is configured
    log "Checking if replication is configured..."
    local replication_role=$(execute_sql "SELECT pg_is_in_recovery();")
    
    if [[ "${replication_role}" == "f" ]]; then
        log "This is a primary database (not a replica)"
        
        # Check if there are any replicas connected
        local replica_count=$(execute_sql "SELECT count(*) FROM pg_stat_replication;")
        
        if [[ "${replica_count}" -gt 0 ]]; then
            success "✓ ${replica_count} replica(s) connected to this primary"
            
            # Show replica details
            log "Replica details:"
            execute_sql "SELECT client_addr, state, sent_lsn, write_lsn, flush_lsn, replay_lsn FROM pg_stat_replication;" | tee -a "${VALIDATION_LOG}"
            
            # Check replication lag
            log "Checking replication lag..."
            local max_lag=$(execute_sql "
                SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::int AS lag_seconds
                FROM pg_stat_replication
                ORDER BY lag_seconds DESC
                LIMIT 1;
            ")
            
            if [[ -z "${max_lag}" ]]; then
                log "No lag information available"
            elif [[ "${max_lag}" -lt 60 ]]; then
                success "✓ Replication lag is acceptable (${max_lag} seconds)"
            else
                warning "High replication lag: ${max_lag} seconds"
            fi
        else
            log "No replicas connected to this primary"
        fi
    elif [[ "${replication_role}" == "t" ]]; then
        log "This is a replica database"
        
        # Check replication status
        local primary_conninfo=$(docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec postgres grep "primary_conninfo" /var/lib/postgresql/data/postgresql.conf | grep -v "^#")
        
        if [[ -n "${primary_conninfo}" ]]; then
            success "✓ Replica is configured with: ${primary_conninfo}"
        else
            warning "Replica configuration not found"
        fi
        
        # Check replication lag
        log "Checking replication lag..."
        local lag_seconds=$(execute_sql "
            SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::int AS lag_seconds;
        ")
        
        if [[ -z "${lag_seconds}" ]]; then
            warning "Unable to determine replication lag"
        elif [[ "${lag_seconds}" -lt 60 ]]; then
            success "✓ Replication lag is acceptable (${lag_seconds} seconds)"
        else
            warning "High replication lag: ${lag_seconds} seconds"
        fi
    else
        warning "Unable to determine replication role"
    fi
    
    return 0
}

# 10. Log Analysis
validate_logs() {
    section "Database Log Analysis"
    
    # Check PostgreSQL logs for errors
    log "Analyzing PostgreSQL logs for errors..."
    docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec postgres grep -i "error\|fatal\|panic" /var/log/postgresql/postgresql-*.log > "${TEMP_DIR}/postgres_errors_full.log" 2>/dev/null || true
    
    if [[ -s "${TEMP_DIR}/postgres_errors_full.log" ]]; then
        local error_count=$(wc -l < "${TEMP_DIR}/postgres_errors_full.log")
        warning "Found ${error_count} error/fatal/panic messages in PostgreSQL logs"
        
        # Show the most recent errors
        log "Most recent errors (last 5):"
        tail -5 "${TEMP_DIR}/postgres_errors_full.log" | tee -a "${VALIDATION_LOG}"
        
        # Categorize errors
        log "Error categories:"
        grep -o "ERROR:  .*" "${TEMP_DIR}/postgres_errors_full.log" | sort | uniq -c | sort -nr | head -10 | tee -a "${VALIDATION_LOG}"
    else
        success "✓ No critical errors found in PostgreSQL logs"
    fi
    
    # Check for connection issues
    log "Checking for connection issues..."
    docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec postgres grep -i "connection" /var/log/postgresql/postgresql-*.log | grep -i "error\|fail\|timeout\|refused" > "${TEMP_DIR}/connection_issues.log" 2>/dev/null || true
    
    if [[ -s "${TEMP_DIR}/connection_issues.log" ]]; then
        local issue_count=$(wc -l < "${TEMP_DIR}/connection_issues.log")
        warning "Found ${issue_count} connection issues in logs"
        
        # Show the most recent connection issues
        log "Most recent connection issues (last 5):"
        tail -5 "${TEMP_DIR}/connection_issues.log" | tee -a "${VALIDATION_LOG}"
    else
        success "✓ No connection issues found in logs"
    fi
    
    # Check for deadlocks
    log "Checking for deadlocks..."
    docker compose -f "${PROJECT_ROOT}/docker-compose/db.yml" exec postgres grep -i "deadlock" /var/log/postgresql/postgresql-*.log > "${TEMP_DIR}/deadlocks.log" 2>/dev/null || true
    
    if [[ -s "${TEMP_DIR}/deadlocks.log" ]]; then
        local deadlock_count=$(wc -l < "${TEMP_DIR}/deadlocks.log")
        warning "Found ${deadlock_count} deadlock situations in logs"
        
        # Show deadlock details
        log "Deadlock details:"
        cat "${TEMP_DIR}/deadlocks.log" | tee -a "${VALIDATION_LOG}"
    else
        success "✓ No deadlocks found in logs"
    fi
    
    return 0
}

# =============================================
# MAIN VALIDATION FUNCTION
# =============================================

run_validation() {
    section "Starting Database Validation"
    log "Risk Platform Database Validation - $(date)"
    
    # Load credentials
    load_db_password || { error "Failed to load database password"; return 1; }
    load_redis_password || { warning "Failed to load Redis password, some tests may be skipped"; }
    
    # Track overall validation status
    local validation_status=0
    
    # Run all validation functions
    validate_container_health || validation_status=1
    validate_connections || validation_status=1
    validate_schema || validation_status=1
    validate_data_integrity || validation_status=1
    validate_performance || validation_status=1
    validate_security || validation_status=1
    validate_backups || validation_status=1
    validate_recovery || validation_status=1
    validate_replication || validation_status=1
    validate_logs || validation_status=1
    
    # Summary
    section "Validation Summary"
    
    if [[ ${validation_status} -eq 0 ]]; then
        success "🎉 Database validation PASSED"
        log "All validation checks completed successfully"
    else
        error "❌ Database validation FAILED"
        log "Some validation checks failed - see log for details: ${VALIDATION_LOG}"
    fi
    
    return ${validation_status}
}

# =============================================
# MAIN EXECUTION
# =============================================

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
