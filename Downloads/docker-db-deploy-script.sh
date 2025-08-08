#!/bin/bash
# =====================================================
# Cyber Trust Platform - Docker Database Deployment Script
# Version: 1.0.0
# Date: 2025-01-09
# Description: Deploys database schema to PostgreSQL running in Docker
# =====================================================

# Configuration
DOCKER_CONTAINER="cyber-trust-postgres"
DB_NAME="${DB_NAME:-cyber_trust_db}"
DB_ADMIN_USER="${DB_ADMIN_USER:-postgres}"
DB_APP_USER="${DB_APP_USER:-cyber_trust_app}"
DB_APP_PASSWORD="${DB_APP_PASSWORD:-$(openssl rand -base64 32)}"
DB_READER_USER="${DB_READER_USER:-cyber_trust_reader}"
DB_READER_PASSWORD="${DB_READER_PASSWORD:-$(openssl rand -base64 32)}"
SCHEMA_FILE="${SCHEMA_FILE:-/opt/risk-platform/cyber_trust_schema.sql}"
BACKUP_DIR="${BACKUP_DIR:-/opt/risk-platform/backups}"
LOG_DIR="${LOG_DIR:-/opt/risk-platform/logs}"
SCRIPTS_DIR="${SCRIPTS_DIR:-/opt/risk-platform/scripts}"
LOG_FILE="${LOG_FILE:-$LOG_DIR/db_deployment_$(date +%Y%m%d_%H%M%S).log}"

# Admin user configuration
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 16)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Create necessary directories
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"
mkdir -p "$SCRIPTS_DIR"

# Header
echo "========================================="
echo "Cyber Trust Platform Docker Database Deployment"
echo "========================================="
echo ""
log_info "Starting database deployment at $(date)"
log_info "Target container: $DOCKER_CONTAINER"
log_info "Database name: $DB_NAME"

# Function to execute PostgreSQL command in Docker
docker_psql() {
    local command="$1"
    local database="${2:-postgres}"
    
    docker exec "$DOCKER_CONTAINER" psql -U "$DB_ADMIN_USER" -d "$database" -c "$command"
}

# Function to execute SQL file in Docker
docker_psql_file() {
    local file="$1"
    local database="${2:-$DB_NAME}"
    
    docker exec -i "$DOCKER_CONTAINER" psql -U "$DB_ADMIN_USER" -d "$database" < "$file"
}

# Step 1: Check if Docker container is running
log_info "Checking if PostgreSQL container is running..."
if docker ps --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER}$"; then
    log_success "Container $DOCKER_CONTAINER is running"
else
    log_error "Container $DOCKER_CONTAINER is not running!"
    log_info "Please start the container with: docker start $DOCKER_CONTAINER"
    exit 1
fi

# Step 2: Test PostgreSQL connection
log_info "Testing PostgreSQL connection..."
if docker_psql "SELECT version();" > /dev/null 2>&1; then
    PG_VERSION=$(docker_psql "SELECT version();" 2>/dev/null | grep PostgreSQL | head -1)
    log_success "Connected to PostgreSQL"
    log_info "Version: $PG_VERSION"
else
    log_error "Cannot connect to PostgreSQL in container $DOCKER_CONTAINER"
    exit 1
fi

# Step 3: Check if database exists
log_info "Checking if database $DB_NAME exists..."
DB_EXISTS=$(docker_psql "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" 2>/dev/null | grep -c "1 row")

if [ "$DB_EXISTS" -gt 0 ]; then
    log_warning "Database $DB_NAME already exists"
    
    # Ask for confirmation to continue
    echo -e "${YELLOW}Do you want to:${NC}"
    echo "  1) Drop and recreate the database (DELETES ALL DATA)"
    echo "  2) Keep existing database and add/update schema"
    echo "  3) Exit without changes"
    read -p "Select option (1-3): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            # Backup existing database first
            log_info "Creating backup of existing database..."
            BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$(date +%Y%m%d_%H%M%S).sql"
            mkdir -p "$BACKUP_DIR"
            
            if docker exec "$DOCKER_CONTAINER" pg_dump -U "$DB_ADMIN_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
                if [ -s "$BACKUP_FILE" ]; then
                    log_success "Backup created: $BACKUP_FILE"
                    gzip "$BACKUP_FILE"
                    log_info "Backup compressed: ${BACKUP_FILE}.gz"
                else
                    log_error "Backup file is empty"
                    exit 1
                fi
            else
                log_warning "Could not create backup, proceeding anyway..."
            fi
            
            # Drop existing database
            log_info "Dropping existing database..."
            docker_psql "DROP DATABASE IF EXISTS $DB_NAME;"
            
            # Create new database
            log_info "Creating new database..."
            docker_psql "CREATE DATABASE $DB_NAME WITH ENCODING='UTF8' TEMPLATE=template0;"
            log_success "Database recreated"
            ;;
        2)
            log_info "Keeping existing database, will add/update schema..."
            ;;
        3)
            log_info "Exiting without changes"
            exit 0
            ;;
        *)
            log_error "Invalid option"
            exit 1
            ;;
    esac
else
    # Create new database
    log_info "Creating database $DB_NAME..."
    docker_psql "CREATE DATABASE $DB_NAME WITH ENCODING='UTF8' TEMPLATE=template0;"
    log_success "Database created"
fi

# Step 4: Check if schema file exists
log_info "Checking for schema file..."
if [ ! -f "$SCHEMA_FILE" ]; then
    log_error "Schema file not found: $SCHEMA_FILE"
    
    # Try to find it in common locations
    if [ -f "/opt/risk-platform/cyber_trust_schema.sql" ]; then
        SCHEMA_FILE="/opt/risk-platform/cyber_trust_schema.sql"
        log_info "Found schema at: $SCHEMA_FILE"
    elif [ -f "./cyber_trust_schema.sql" ]; then
        SCHEMA_FILE="./cyber_trust_schema.sql"
        log_info "Found schema at: $SCHEMA_FILE"
    else
        log_error "Cannot find cyber_trust_schema.sql"
        log_info "Please ensure the schema file is at: /opt/risk-platform/cyber_trust_schema.sql"
        exit 1
    fi
fi

# Step 5: Create a temporary schema file with updated passwords
log_info "Preparing schema with secure passwords..."
TEMP_SCHEMA="/tmp/cyber_trust_schema_temp.sql"
cp "$SCHEMA_FILE" "$TEMP_SCHEMA"

# Replace placeholder passwords in the schema
sed -i "s/change_me_in_production/$DB_APP_PASSWORD/g" "$TEMP_SCHEMA"

# Step 6: Deploy schema
log_info "Deploying database schema..."
log_info "This may take a minute..."

if docker_psql_file "$TEMP_SCHEMA"; then
    log_success "Schema deployed successfully"
    rm -f "$TEMP_SCHEMA"
else
    log_error "Schema deployment failed"
    log_info "Check the log file for details: $LOG_FILE"
    rm -f "$TEMP_SCHEMA"
    exit 1
fi

# Step 7: Create/Update application users
log_info "Setting up database users..."

# Create application user
docker_psql "DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_user WHERE usename = '$DB_APP_USER') THEN
        CREATE ROLE $DB_APP_USER WITH LOGIN PASSWORD '$DB_APP_PASSWORD';
    ELSE
        ALTER ROLE $DB_APP_USER WITH PASSWORD '$DB_APP_PASSWORD';
    END IF;
END
\$\$;" 2>/dev/null

# Create read-only user
docker_psql "DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_user WHERE usename = '$DB_READER_USER') THEN
        CREATE ROLE $DB_READER_USER WITH LOGIN PASSWORD '$DB_READER_PASSWORD';
    ELSE
        ALTER ROLE $DB_READER_USER WITH PASSWORD '$DB_READER_PASSWORD';
    END IF;
END
\$\$;" 2>/dev/null

log_success "Database users configured"

# Step 8: Set permissions
log_info "Setting database permissions..."

docker_psql "GRANT CONNECT ON DATABASE $DB_NAME TO $DB_APP_USER;" "$DB_NAME"
docker_psql "GRANT CONNECT ON DATABASE $DB_NAME TO $DB_READER_USER;" "$DB_NAME"
docker_psql "GRANT USAGE ON SCHEMA cyber_trust TO $DB_APP_USER;" "$DB_NAME"
docker_psql "GRANT USAGE ON SCHEMA cyber_trust TO $DB_READER_USER;" "$DB_NAME"
docker_psql "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cyber_trust TO $DB_APP_USER;" "$DB_NAME"
docker_psql "GRANT SELECT ON ALL TABLES IN SCHEMA cyber_trust TO $DB_READER_USER;" "$DB_NAME"
docker_psql "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA cyber_trust TO $DB_APP_USER;" "$DB_NAME"
docker_psql "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA cyber_trust TO $DB_APP_USER;" "$DB_NAME"

# Grant permissions on future objects
docker_psql "ALTER DEFAULT PRIVILEGES IN SCHEMA cyber_trust GRANT ALL ON TABLES TO $DB_APP_USER;" "$DB_NAME"
docker_psql "ALTER DEFAULT PRIVILEGES IN SCHEMA cyber_trust GRANT SELECT ON TABLES TO $DB_READER_USER;" "$DB_NAME"
docker_psql "ALTER DEFAULT PRIVILEGES IN SCHEMA cyber_trust GRANT ALL ON SEQUENCES TO $DB_APP_USER;" "$DB_NAME"

log_success "Permissions configured"

# Step 9: Create initial organization and admin user
log_info "Creating initial organization and admin user..."

# Hash the admin password (using SHA256 for this example - you should use bcrypt in production)
ADMIN_PASSWORD_HASH=$(echo -n "$ADMIN_PASSWORD" | sha256sum | cut -d' ' -f1)

docker_psql "
-- Create initial organization
INSERT INTO cyber_trust.organizations (name, domain, industry, size, subscription_tier)
VALUES ('Demo Organization', 'example.com', 'Technology', 'medium', 'trial')
ON CONFLICT (domain) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

-- Create admin user
INSERT INTO cyber_trust.users (
    organization_id,
    email,
    password_hash,
    first_name,
    last_name,
    role
)
SELECT 
    id,
    '$ADMIN_EMAIL',
    '$ADMIN_PASSWORD_HASH',
    'Admin',
    'User',
    'admin'
FROM cyber_trust.organizations
WHERE domain = 'example.com'
ON CONFLICT (email) DO UPDATE SET 
    password_hash = '$ADMIN_PASSWORD_HASH',
    updated_at = CURRENT_TIMESTAMP;
" "$DB_NAME"

log_success "Initial data created"

# Step 10: Create maintenance scripts
log_info "Creating maintenance scripts..."

# Create backup script
cat > "$SCRIPTS_DIR/backup_database.sh" << EOF
#!/bin/bash
# Database backup script for Cyber Trust Platform

BACKUP_DIR="$BACKUP_DIR/db"
DB_NAME="$DB_NAME"
CONTAINER="$DOCKER_CONTAINER"
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/cyber_trust_backup_\$TIMESTAMP.sql.gz"

mkdir -p "\$BACKUP_DIR"

echo "Creating backup: \$BACKUP_FILE"
if docker exec "\$CONTAINER" pg_dump -U postgres "\$DB_NAME" | gzip > "\$BACKUP_FILE"; then
    echo "Backup successful"
    
    # Keep only last 7 days of backups
    find "\$BACKUP_DIR" -name "cyber_trust_backup_*.sql.gz" -mtime +7 -delete
    
    # Show backup size
    ls -lh "\$BACKUP_FILE"
else
    echo "Backup failed"
    exit 1
fi
EOF

chmod +x "$SCRIPTS_DIR/backup_database.sh"

# Create restore script
cat > "$SCRIPTS_DIR/restore_database.sh" << 'EOF'
#!/bin/bash
# Database restore script for Cyber Trust Platform

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
DB_NAME="cyber_trust_db"
CONTAINER="cyber-trust-postgres"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring from: $BACKUP_FILE"
echo "WARNING: This will replace all data in $DB_NAME!"
read -p "Continue? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Drop and recreate database
    docker exec "$CONTAINER" psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    docker exec "$CONTAINER" psql -U postgres -c "CREATE DATABASE $DB_NAME;"
    
    # Restore backup
    gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER" psql -U postgres -d "$DB_NAME"
    
    echo "Restore completed"
else
    echo "Restore cancelled"
fi
EOF

chmod +x "$SCRIPTS_DIR/restore_database.sh"

# Create maintenance script
cat > "$SCRIPTS_DIR/vacuum_database.sh" << EOF
#!/bin/bash
# Database maintenance script for Cyber Trust Platform

echo "Running database maintenance..."
docker exec "$DOCKER_CONTAINER" psql -U postgres -d "$DB_NAME" -c "VACUUM ANALYZE;"
docker exec "$DOCKER_CONTAINER" psql -U postgres -d "$DB_NAME" -c "REINDEX DATABASE $DB_NAME;"

# Refresh materialized views if they exist
docker exec "$DOCKER_CONTAINER" psql -U postgres -d "$DB_NAME" -c "
DO \\\$\\\$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'cyber_trust' AND matviewname = 'requirement_coverage_summary') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY cyber_trust.requirement_coverage_summary;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'cyber_trust' AND matviewname = 'risk_mitigation_summary') THEN
        REFRESH MATERIALIZED VIEW CONCURRENTLY cyber_trust.risk_mitigation_summary;
    END IF;
END
\\\$\\\$;
"
echo "Maintenance complete"
EOF

chmod +x "$SCRIPTS_DIR/vacuum_database.sh"

# Create health check script
cat > "$SCRIPTS_DIR/check_database.sh" << EOF
#!/bin/bash
# Database health check script

echo "Database Health Check"
echo "===================="

# Check container status
echo -n "Container Status: "
if docker ps | grep -q "$DOCKER_CONTAINER"; then
    echo "✓ Running"
else
    echo "✗ Not Running"
    exit 1
fi

# Check database connection
echo -n "Database Connection: "
if docker exec "$DOCKER_CONTAINER" psql -U postgres -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ Connected"
else
    echo "✗ Failed"
    exit 1
fi

# Check table count
echo -n "Tables in cyber_trust schema: "
TABLE_COUNT=\$(docker exec "$DOCKER_CONTAINER" psql -U postgres -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'cyber_trust';")
echo "\$TABLE_COUNT"

# Check record counts
echo ""
echo "Record Counts:"
docker exec "$DOCKER_CONTAINER" psql -U postgres -d "$DB_NAME" -c "
SELECT 
    'Organizations' as entity, COUNT(*) as count FROM cyber_trust.organizations
UNION ALL
SELECT 'Users', COUNT(*) FROM cyber_trust.users
UNION ALL
SELECT 'Requirements', COUNT(*) FROM cyber_trust.requirements
UNION ALL
SELECT 'Capabilities', COUNT(*) FROM cyber_trust.capabilities
UNION ALL
SELECT 'Risks', COUNT(*) FROM cyber_trust.risks
UNION ALL
SELECT 'Threats', COUNT(*) FROM cyber_trust.threats;
"

# Check database size
echo ""
echo -n "Database Size: "
docker exec "$DOCKER_CONTAINER" psql -U postgres -d "$DB_NAME" -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));"
EOF

chmod +x "$SCRIPTS_DIR/check_database.sh"

log_success "Maintenance scripts created"

# Step 11: Set up cron jobs
log_info "Setting up automated tasks..."

# Add cron jobs if they don't exist
(crontab -l 2>/dev/null | grep -v "backup_database.sh" ; echo "0 2 * * * $SCRIPTS_DIR/backup_database.sh >> $LOG_DIR/backup.log 2>&1") | crontab -
(crontab -l 2>/dev/null | grep -v "vacuum_database.sh" ; echo "0 3 * * 0 $SCRIPTS_DIR/vacuum_database.sh >> $LOG_DIR/maintenance.log 2>&1") | crontab -

log_success "Cron jobs configured"

# Step 12: Create .env file for application
log_info "Creating application configuration file..."

cat > "/opt/risk-platform/.env.database" << EOF
# Database Configuration
# Generated: $(date)

# Connection Details
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_SCHEMA=cyber_trust

# Application User (full access)
DB_USER=$DB_APP_USER
DB_PASSWORD=$DB_APP_PASSWORD

# Read-Only User (for reporting)
DB_READER_USER=$DB_READER_USER
DB_READER_PASSWORD=$DB_READER_PASSWORD

# Connection URLs
DATABASE_URL=postgresql://$DB_APP_USER:$DB_APP_PASSWORD@localhost:5432/$DB_NAME?schema=cyber_trust
DATABASE_URL_READER=postgresql://$DB_READER_USER:$DB_READER_PASSWORD@localhost:5432/$DB_NAME?schema=cyber_trust

# Docker Container
DB_CONTAINER=$DOCKER_CONTAINER

# Initial Admin Credentials
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
# Note: Password is hashed in database using SHA256
# In production, use bcrypt or argon2 for password hashing
EOF

chmod 600 "/opt/risk-platform/.env.database"
log_success "Configuration file created"

# Step 13: Test the deployment
log_info "Running deployment tests..."

# Test application user connection
echo -n "Testing application user connection... "
if docker exec "$DOCKER_CONTAINER" psql -U "$DB_APP_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM cyber_trust.organizations;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    log_warning "Application user may need additional configuration"
fi

# Test reader user connection
echo -n "Testing reader user connection... "
if docker exec "$DOCKER_CONTAINER" psql -U "$DB_READER_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM cyber_trust.organizations;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    log_warning "Reader user may need additional configuration"
fi

# Run health check
log_info "Running health check..."
"$SCRIPTS_DIR/check_database.sh"

# Display summary
echo ""
echo "========================================="
echo -e "${GREEN}${BOLD}Database Deployment Complete!${NC}"
echo "========================================="
echo ""
echo -e "${BOLD}Database Details:${NC}"
echo "  Container: $DOCKER_CONTAINER"
echo "  Database: $DB_NAME"
echo "  Schema: cyber_trust"
echo ""
echo -e "${BOLD}Application Credentials:${NC}"
echo "  Username: $DB_APP_USER"
echo "  Password: [Saved in /opt/risk-platform/.env.database]"
echo ""
echo -e "${BOLD}Admin User Credentials:${NC}"
echo "  Email: $ADMIN_EMAIL"
echo "  Password: $ADMIN_PASSWORD"
echo ""
echo -e "${BOLD}Important Files:${NC}"
echo "  Configuration: /opt/risk-platform/.env.database"
echo "  Backup Script: $SCRIPTS_DIR/backup_database.sh"
echo "  Restore Script: $SCRIPTS_DIR/restore_database.sh"
echo "  Maintenance Script: $SCRIPTS_DIR/vacuum_database.sh"
echo "  Health Check: $SCRIPTS_DIR/check_database.sh"
echo "  Deployment Log: $LOG_FILE"
echo ""
echo -e "${BOLD}Automated Tasks:${NC}"
echo "  • Daily backup at 2:00 AM"
echo "  • Weekly maintenance on Sundays at 3:00 AM"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo "  1. Update your application to use the database credentials"
echo "  2. Test the connection from your API services"
echo "  3. Run initial backup: $SCRIPTS_DIR/backup_database.sh"
echo "  4. Monitor logs in: $LOG_DIR"
echo ""
echo -e "${BOLD}Quick Commands:${NC}"
echo "  Check status:  $SCRIPTS_DIR/check_database.sh"
echo "  Create backup: $SCRIPTS_DIR/backup_database.sh"
echo "  View logs:     tail -f $LOG_FILE"
echo ""

log_success "Deployment completed successfully!"
log_info "Full log available at: $LOG_FILE"
