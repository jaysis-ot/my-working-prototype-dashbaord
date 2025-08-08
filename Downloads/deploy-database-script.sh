#!/bin/bash
# =====================================================
# Cyber Trust Platform - Database Deployment Script
# Version: 1.0.0
# Date: 2025-01-09
# Description: Deploys the complete database schema to PostgreSQL
# =====================================================

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cyber_trust_db}"
DB_ADMIN_USER="${DB_ADMIN_USER:-postgres}"
DB_APP_USER="${DB_APP_USER:-cyber_trust_app}"
DB_APP_PASSWORD="${DB_APP_PASSWORD:-$(openssl rand -base64 32)}"
DB_READER_USER="${DB_READER_USER:-cyber_trust_reader}"
DB_READER_PASSWORD="${DB_READER_PASSWORD:-$(openssl rand -base64 32)}"
SCHEMA_FILE="${SCHEMA_FILE:-cyber_trust_schema.sql}"
BACKUP_DIR="${BACKUP_DIR:-/opt/risk-platform/backups}"
LOG_FILE="${LOG_FILE:-/opt/risk-platform/logs/db_deployment_$(date +%Y%m%d_%H%M%S).log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$BACKUP_DIR"

# Header
echo "========================================="
echo "Cyber Trust Platform Database Deployment"
echo "========================================="
echo ""
log_info "Starting database deployment at $(date)"
log_info "Database: $DB_NAME on $DB_HOST:$DB_PORT"

# Check if running in Docker or native
if [ -f /.dockerenv ]; then
    log_info "Running in Docker container"
    IS_DOCKER=true
else
    log_info "Running on host system"
    IS_DOCKER=false
fi

# Function to execute PostgreSQL command
execute_psql() {
    local command="$1"
    local database="${2:-postgres}"
    
    if [ "$IS_DOCKER" = true ]; then
        docker exec -i cyber-trust-postgres psql -U "$DB_ADMIN_USER" -d "$database" -c "$command"
    else
        PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$database" -c "$command"
    fi
}

# Function to execute SQL file
execute_sql_file() {
    local file="$1"
    local database="${2:-$DB_NAME}"
    
    if [ "$IS_DOCKER" = true ]; then
        docker exec -i cyber-trust-postgres psql -U "$DB_ADMIN_USER" -d "$database" < "$file"
    else
        PGPASSWORD="$DB_ADMIN_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$database" < "$file"
    fi
}

# Step 1: Check PostgreSQL connection
log_info "Checking PostgreSQL connection..."
if execute_psql "SELECT version();" > /dev/null 2>&1; then
    log_success "PostgreSQL connection successful"
else
    log_error "Cannot connect to PostgreSQL. Please check your connection settings."
    exit 1
fi

# Step 2: Check if database exists
log_info "Checking if database $DB_NAME exists..."
if execute_psql "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';" | grep -q 1; then
    log_warning "Database $DB_NAME already exists"
    
    # Ask for confirmation to continue
    read -p "Do you want to backup and recreate the database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Backup existing database
        log_info "Creating backup of existing database..."
        BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        if [ "$IS_DOCKER" = true ]; then
            docker exec cyber-trust-postgres pg_dump -U "$DB_ADMIN_USER" "$DB_NAME" > "$BACKUP_FILE"
        else
            PGPASSWORD="$DB_ADMIN_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" "$DB_NAME" > "$BACKUP_FILE"
        fi
        
        if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
            log_success "Backup created: $BACKUP_FILE"
        else
            log_error "Backup failed"
            exit 1
        fi
        
        # Drop existing database
        log_info "Dropping existing database..."
        execute_psql "DROP DATABASE IF EXISTS $DB_NAME;"
    else
        log_info "Exiting without changes"
        exit 0
    fi
fi

# Step 3: Create database
log_info "Creating database $DB_NAME..."
execute_psql "CREATE DATABASE $DB_NAME WITH ENCODING='UTF8' TEMPLATE=template0;"
log_success "Database created"

# Step 4: Create application users
log_info "Creating application users..."

# Update passwords in schema file
if [ -f "$SCHEMA_FILE" ]; then
    sed -i "s/change_me_in_production/$DB_APP_PASSWORD/g" "$SCHEMA_FILE"
fi

# Create users
execute_psql "CREATE ROLE $DB_APP_USER WITH LOGIN PASSWORD '$DB_APP_PASSWORD';" 2>/dev/null || log_warning "App user already exists"
execute_psql "CREATE ROLE $DB_READER_USER WITH LOGIN PASSWORD '$DB_READER_PASSWORD';" 2>/dev/null || log_warning "Reader user already exists"

log_success "Users created/verified"

# Step 5: Deploy schema
log_info "Deploying database schema..."
if [ -f "$SCHEMA_FILE" ]; then
    if execute_sql_file "$SCHEMA_FILE"; then
        log_success "Schema deployed successfully"
    else
        log_error "Schema deployment failed"
        exit 1
    fi
else
    log_error "Schema file not found: $SCHEMA_FILE"
    log_info "Downloading schema from repository..."
    
    # Download the schema file if not present
    wget -q https://raw.githubusercontent.com/your-repo/risk-platform/main/database/schema.sql -O "$SCHEMA_FILE"
    
    if [ -f "$SCHEMA_FILE" ]; then
        execute_sql_file "$SCHEMA_FILE"
        log_success "Schema deployed successfully"
    else
        log_error "Could not download schema file"
        exit 1
    fi
fi

# Step 6: Set permissions
log_info "Setting database permissions..."
execute_psql "GRANT CONNECT ON DATABASE $DB_NAME TO $DB_APP_USER;" "$DB_NAME"
execute_psql "GRANT CONNECT ON DATABASE $DB_NAME TO $DB_READER_USER;" "$DB_NAME"
execute_psql "GRANT USAGE ON SCHEMA cyber_trust TO $DB_APP_USER;" "$DB_NAME"
execute_psql "GRANT USAGE ON SCHEMA cyber_trust TO $DB_READER_USER;" "$DB_NAME"
execute_psql "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cyber_trust TO $DB_APP_USER;" "$DB_NAME"
execute_psql "GRANT SELECT ON ALL TABLES IN SCHEMA cyber_trust TO $DB_READER_USER;" "$DB_NAME"
execute_psql "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA cyber_trust TO $DB_APP_USER;" "$DB_NAME"
execute_psql "GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA cyber_trust TO $DB_APP_USER;" "$DB_NAME"
log_success "Permissions set"

# Step 7: Create initial organization and admin user
log_info "Creating initial organization and admin user..."

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-$(openssl rand -base64 16)}"
ADMIN_PASSWORD_HASH=$(echo -n "$ADMIN_PASSWORD" | sha256sum | cut -d' ' -f1)
ORG_NAME="${ORG_NAME:-Demo Organization}"

execute_psql "
INSERT INTO cyber_trust.organizations (name, domain, industry, size, subscription_tier)
VALUES ('$ORG_NAME', 'example.com', 'Technology', 'medium', 'trial')
ON CONFLICT DO NOTHING;

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
WHERE name = '$ORG_NAME'
ON CONFLICT (email) DO NOTHING;
" "$DB_NAME"

log_success "Initial data created"

# Step 8: Create database maintenance scripts
log_info "Creating maintenance scripts..."

# Create backup script
cat > "$BACKUP_DIR/backup_database.sh" << 'EOF'
#!/bin/bash
# Database backup script for Cyber Trust Platform

BACKUP_DIR="/opt/risk-platform/backups/db"
DB_NAME="cyber_trust_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cyber_trust_backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

# Create backup
echo "Creating backup: $BACKUP_FILE"
if docker exec cyber-trust-postgres pg_dump -U postgres "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    echo "Backup successful"
    
    # Keep only last 7 days of backups
    find "$BACKUP_DIR" -name "cyber_trust_backup_*.sql.gz" -mtime +7 -delete
else
    echo "Backup failed"
    exit 1
fi
EOF

chmod +x "$BACKUP_DIR/backup_database.sh"

# Create vacuum script
cat > "/opt/risk-platform/scripts/vacuum_database.sh" << 'EOF'
#!/bin/bash
# Database maintenance script for Cyber Trust Platform

echo "Running database maintenance..."
docker exec cyber-trust-postgres psql -U postgres -d cyber_trust_db -c "VACUUM ANALYZE;"
docker exec cyber-trust-postgres psql -U postgres -d cyber_trust_db -c "REINDEX DATABASE cyber_trust_db;"
docker exec cyber-trust-postgres psql -U postgres -d cyber_trust_db -c "REFRESH MATERIALIZED VIEW CONCURRENTLY cyber_trust.requirement_coverage_summary;"
docker exec cyber-trust-postgres psql -U postgres -d cyber_trust_db -c "REFRESH MATERIALIZED VIEW CONCURRENTLY cyber_trust.risk_mitigation_summary;"
echo "Maintenance complete"
EOF

chmod +x "/opt/risk-platform/scripts/vacuum_database.sh"

log_success "Maintenance scripts created"

# Step 9: Set up cron jobs
log_info "Setting up automated maintenance..."

# Add cron jobs
(crontab -l 2>/dev/null; echo "0 2 * * * $BACKUP_DIR/backup_database.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 3 * * 0 /opt/risk-platform/scripts/vacuum_database.sh") | crontab -

log_success "Cron jobs configured"

# Step 10: Create .env file for application
log_info "Creating application configuration..."

cat > "/opt/risk-platform/.env.database" << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_APP_USER
DB_PASSWORD=$DB_APP_PASSWORD
DB_READER_USER=$DB_READER_USER
DB_READER_PASSWORD=$DB_READER_PASSWORD
DB_SCHEMA=cyber_trust

# Initial Admin Credentials
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF

chmod 600 "/opt/risk-platform/.env.database"
log_success "Configuration file created"

# Step 11: Test the deployment
log_info "Testing database deployment..."

# Test application user connection
if PGPASSWORD="$DB_APP_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_APP_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM cyber_trust.organizations;" > /dev/null 2>&1; then
    log_success "Application user can connect and query"
else
    log_warning "Application user connection test failed"
fi

# Test reader user connection
if PGPASSWORD="$DB_READER_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_READER_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM cyber_trust.organizations;" > /dev/null 2>&1; then
    log_success "Reader user can connect and query"
else
    log_warning "Reader user connection test failed"
fi

# Display summary
echo ""
echo "========================================="
echo "Database Deployment Complete!"
echo "========================================="
echo ""
echo "Database Details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  Schema: cyber_trust"
echo ""
echo "Application Credentials:"
echo "  Username: $DB_APP_USER"
echo "  Password: Saved in /opt/risk-platform/.env.database"
echo ""
echo "Admin User Credentials:"
echo "  Email: $ADMIN_EMAIL"
echo "  Password: $ADMIN_PASSWORD"
echo ""
echo "Important Files:"
echo "  Configuration: /opt/risk-platform/.env.database"
echo "  Backup Script: $BACKUP_DIR/backup_database.sh"
echo "  Maintenance Script: /opt/risk-platform/scripts/vacuum_database.sh"
echo "  Deployment Log: $LOG_FILE"
echo ""
echo "Next Steps:"
echo "1. Update your application configuration with the database credentials"
echo "2. Test the connection from your application"
echo "3. Load any additional seed data as needed"
echo "4. Set up monitoring for database performance"
echo ""
echo "Automated Tasks:"
echo "- Daily backup at 2:00 AM"
echo "- Weekly maintenance (vacuum/reindex) on Sundays at 3:00 AM"
echo ""

log_success "Database deployment completed successfully!"
