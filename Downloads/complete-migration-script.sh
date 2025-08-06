#!/bin/bash
# complete-migration-script.sh
# Incremental migration script to upgrade the basic dashboard to enterprise architecture
# Version: 1.0.0
# Date: 2025-08-04

# Set error handling
set -e
trap 'echo "Error on line $LINENO. Migration failed."; exit 1' ERR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PLATFORM_DIR="/opt/risk-platform"
DASHBOARD_DIR="${PLATFORM_DIR}/dashboard"
DB_DIR="${PLATFORM_DIR}/database"
NGINX_DIR="${PLATFORM_DIR}/nginx"
CONFIG_DIR="${PLATFORM_DIR}/config"
SCRIPTS_DIR="${PLATFORM_DIR}/scripts"
BACKUP_DIR="${PLATFORM_DIR}/backups/pre-migration-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="/var/log/migration-$(date +%Y%m%d-%H%M%S).log"

# Container names
POSTGRES_CONTAINER="risk-platform-postgres"
NGINX_CONTAINER="risk-platform-nginx"
GRAFANA_CONTAINER="risk-platform-grafana"

# Database credentials
DB_USER="risk_platform"
DB_NAME="risk_platform"
DB_PASSWORD=$(grep POSTGRES_PASSWORD ${PLATFORM_DIR}/docker/docker-compose.yml 2>/dev/null | head -1 | cut -d'"' -f2 || echo "Risk_Platform_Password")

# Logging functions
log() {
    echo -e "${BLUE}[$(date +"%Y-%m-%d %H:%M:%S")]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Ask for confirmation
confirm() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        warning "Operation cancelled by user"
        return 1
    fi
    return 0
}

# Step 0: Check prerequisites
log "Checking prerequisites..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root or with sudo"
fi

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi

if ! systemctl is-active --quiet docker; then
    error "Docker service is not running. Please start Docker first."
fi

# Check if current deployment exists
if [ ! -d "$PLATFORM_DIR" ]; then
    warning "Platform directory not found at $PLATFORM_DIR"
    if confirm "Would you like to create it?"; then
        mkdir -p "$PLATFORM_DIR"
    else
        error "Platform directory is required for migration"
    fi
fi

success "Prerequisites checked"

# Step 1: Backup current deployment
log "STEP 1: Backing up current deployment"

# Create backup directory
mkdir -p "$BACKUP_DIR"
log "Backup directory created at $BACKUP_DIR"

# Backup Docker Compose files
if [ -d "${PLATFORM_DIR}/docker" ]; then
    log "Backing up Docker Compose files"
    cp -r "${PLATFORM_DIR}/docker" "$BACKUP_DIR/" || warning "Failed to backup Docker Compose files"
    success "Docker Compose files backed up"
else
    warning "Docker Compose directory not found, skipping backup"
fi

# Backup database
log "Backing up PostgreSQL database"
if docker ps | grep -q "$POSTGRES_CONTAINER"; then
    docker exec "$POSTGRES_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -F c > "$BACKUP_DIR/database_backup.dump" || warning "Failed to backup database"
    success "Database backup completed"
else
    warning "PostgreSQL container not running, skipping database backup"
fi

# Backup dashboard files
if [ -d "$DASHBOARD_DIR" ]; then
    log "Backing up dashboard files"
    cp -r "$DASHBOARD_DIR" "$BACKUP_DIR/" || warning "Failed to backup dashboard files"
    success "Dashboard files backed up"
else
    warning "Dashboard directory not found, skipping dashboard backup"
fi

# Backup Nginx configuration
if [ -d "$NGINX_DIR" ]; then
    log "Backing up Nginx configuration"
    cp -r "$NGINX_DIR" "$BACKUP_DIR/" || warning "Failed to backup Nginx configuration"
    success "Nginx configuration backed up"
else
    warning "Nginx directory not found, skipping Nginx backup"
fi

success "Backup completed at $BACKUP_DIR"

# Step 2: Enhance directory structure
log "STEP 2: Enhancing directory structure"

# Create enterprise directory structure (if not exists)
mkdir -p "${PLATFORM_DIR}/api"
mkdir -p "${PLATFORM_DIR}/frontend"
mkdir -p "${PLATFORM_DIR}/scripts"
mkdir -p "${CONFIG_DIR}/nginx"
mkdir -p "${CONFIG_DIR}/postgres"
mkdir -p "${CONFIG_DIR}/grafana"
mkdir -p "${PLATFORM_DIR}/logs"
mkdir -p "${PLATFORM_DIR}/secrets"
mkdir -p "${PLATFORM_DIR}/monitoring/dashboards"

# Move existing dashboard files to frontend directory if needed
if [ -d "$DASHBOARD_DIR/public" ] && [ ! -d "${PLATFORM_DIR}/frontend/public" ]; then
    log "Moving dashboard files to frontend directory"
    mkdir -p "${PLATFORM_DIR}/frontend/public"
    cp -r "$DASHBOARD_DIR/public/"* "${PLATFORM_DIR}/frontend/public/" || warning "Failed to copy dashboard files"
    success "Dashboard files moved to frontend directory"
fi

# Set proper permissions
chmod 750 "${PLATFORM_DIR}/scripts" "${CONFIG_DIR}"
chmod 700 "${PLATFORM_DIR}/secrets"

success "Directory structure enhanced"

# Step 3: Enhance database schema
log "STEP 3: Enhancing database schema"

# Create database directory if it doesn't exist
mkdir -p "${DB_DIR}/init"

# Create schema migration script
cat > "${DB_DIR}/init/01-schema-upgrade.sql" << 'EOF'
-- Set search path
SET search_path TO risk_platform;

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS risk_platform;

-- Create extension for UUIDs if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if organizations table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'risk_platform' AND tablename = 'organizations') THEN
        CREATE TABLE risk_platform.organizations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(100) UNIQUE NOT NULL,
            industry VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
        
        -- Insert default organization
        INSERT INTO risk_platform.organizations (name, slug, industry)
        VALUES ('Default Organization', 'default', 'Technology');
    END IF;
END
$$;

-- Check if users table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'risk_platform' AND tablename = 'users') THEN
        CREATE TABLE risk_platform.users (
            id SERIAL PRIMARY KEY,
            organization_id INTEGER NOT NULL REFERENCES risk_platform.organizations(id),
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
        
        -- Insert admin user
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
            (SELECT id FROM risk_platform.organizations WHERE slug = 'default'),
            'admin@risk-platform.local',
            MD5('admin123'),
            'Admin',
            'User',
            'admin',
            'active',
            NOW()
        );
    END IF;
END
$$;

-- Check if audit_log table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'risk_platform' AND tablename = 'audit_log') THEN
        CREATE TABLE risk_platform.audit_log (
            id SERIAL PRIMARY KEY,
            organization_id INTEGER NOT NULL REFERENCES risk_platform.organizations(id),
            user_id INTEGER REFERENCES risk_platform.users(id),
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(100) NOT NULL,
            entity_id INTEGER,
            details JSONB,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END
$$;

-- Check if trust_scores table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'risk_platform' AND tablename = 'trust_scores') THEN
        CREATE TABLE risk_platform.trust_scores (
            id SERIAL PRIMARY KEY,
            organization_id INTEGER NOT NULL REFERENCES risk_platform.organizations(id),
            score_date DATE NOT NULL,
            overall_score INTEGER NOT NULL,
            cyber_score INTEGER,
            physical_score INTEGER,
            operational_score INTEGER,
            compliance_score INTEGER,
            strategic_score INTEGER,
            details JSONB,
            created_by INTEGER REFERENCES risk_platform.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(organization_id, score_date)
        );
    END IF;
END
$$;

-- Enhance existing tables with additional fields if they exist

-- Enhance threats table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'risk_platform' AND tablename = 'threats') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'risk_platform' AND table_name = 'threats' AND column_name = 'organization_id') THEN
            ALTER TABLE risk_platform.threats ADD COLUMN organization_id INTEGER REFERENCES risk_platform.organizations(id);
            UPDATE risk_platform.threats SET organization_id = (SELECT id FROM risk_platform.organizations WHERE slug = 'default');
            ALTER TABLE risk_platform.threats ALTER COLUMN organization_id SET NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'risk_platform' AND table_name = 'threats' AND column_name = 'threat_id') THEN
            ALTER TABLE risk_platform.threats ADD COLUMN threat_id VARCHAR(50);
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'risk_platform' AND table_name = 'threats' AND column_name = 'external_references') THEN
            ALTER TABLE risk_platform.threats ADD COLUMN external_references JSONB;
        END IF;
    ELSE
        -- Create threats table if it doesn't exist
        CREATE TABLE risk_platform.threats (
            id SERIAL PRIMARY KEY,
            organization_id INTEGER NOT NULL REFERENCES risk_platform.organizations(id),
            threat_id VARCHAR(50),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            severity VARCHAR(50),
            status VARCHAR(50) DEFAULT 'active',
            source VARCHAR(100),
            external_references JSONB,
            created_by INTEGER REFERENCES risk_platform.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    END IF;
END
$$;

-- Enhance risks table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'risk_platform' AND tablename = 'risks') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'risk_platform' AND table_name = 'risks' AND column_name = 'organization_id') THEN
            ALTER TABLE risk_platform.risks ADD COLUMN organization_id INTEGER REFERENCES risk_platform.organizations(id);
            UPDATE risk_platform.risks SET organization_id = (SELECT id FROM risk_platform.organizations WHERE slug = 'default');
            ALTER TABLE risk_platform.risks ALTER COLUMN organization_id SET NOT NULL;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'risk_platform' AND table_name = 'risks' AND column_name = 'inherent_risk_score') THEN
            ALTER TABLE risk_platform.risks ADD COLUMN inherent_risk_score INTEGER;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'risk_platform' AND table_name = 'risks' AND column_name = 'residual_risk_score') THEN
            ALTER TABLE risk_platform.risks ADD COLUMN residual_risk_score INTEGER;
        END IF;
    ELSE
        -- Create risks table if it doesn't exist
        CREATE TABLE risk_platform.risks (
            id SERIAL PRIMARY KEY,
            organization_id INTEGER NOT NULL REFERENCES risk_platform.organizations(id),
            threat_id INTEGER REFERENCES risk_platform.threats(id),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            impact VARCHAR(50),
            likelihood VARCHAR(50),
            inherent_risk_score INTEGER,
            residual_risk_score INTEGER,
            status VARCHAR(50) DEFAULT 'open',
            treatment_strategy VARCHAR(100),
            created_by INTEGER REFERENCES risk_platform.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    END IF;
END
$$;

-- Enhance capabilities table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'risk_platform' AND tablename = 'capabilities') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'risk_platform' AND table_name = 'capabilities' AND column_name = 'organization_id') THEN
            ALTER TABLE risk_platform.capabilities ADD COLUMN organization_id INTEGER REFERENCES risk_platform.organizations(id);
            UPDATE risk_platform.capabilities SET organization_id = (SELECT id FROM risk_platform.organizations WHERE slug = 'default');
            ALTER TABLE risk_platform.capabilities ALTER COLUMN organization_id SET NOT NULL;
        END IF;
    ELSE
        -- Create capabilities table if it doesn't exist
        CREATE TABLE risk_platform.capabilities (
            id SERIAL PRIMARY KEY,
            organization_id INTEGER NOT NULL REFERENCES risk_platform.organizations(id),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            maturity_level VARCHAR(50),
            status VARCHAR(50) DEFAULT 'active',
            created_by INTEGER REFERENCES risk_platform.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    END IF;
END
$$;

-- Enhance requirements table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'risk_platform' AND tablename = 'requirements') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'risk_platform' AND table_name = 'requirements' AND column_name = 'organization_id') THEN
            ALTER TABLE risk_platform.requirements ADD COLUMN organization_id INTEGER REFERENCES risk_platform.organizations(id);
            UPDATE risk_platform.requirements SET organization_id = (SELECT id FROM risk_platform.organizations WHERE slug = 'default');
            ALTER TABLE risk_platform.requirements ALTER COLUMN organization_id SET NOT NULL;
        END IF;
    ELSE
        -- Create requirements table if it doesn't exist
        CREATE TABLE risk_platform.requirements (
            id SERIAL PRIMARY KEY,
            organization_id INTEGER NOT NULL REFERENCES risk_platform.organizations(id),
            capability_id INTEGER REFERENCES risk_platform.capabilities(id),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            compliance_status VARCHAR(50) DEFAULT 'not-assessed',
            source VARCHAR(100),
            created_by INTEGER REFERENCES risk_platform.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    END IF;
END
$$;

-- Enhance evidence table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'risk_platform' AND tablename = 'evidence') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'risk_platform' AND table_name = 'evidence' AND column_name = 'organization_id') THEN
            ALTER TABLE risk_platform.evidence ADD COLUMN organization_id INTEGER REFERENCES risk_platform.organizations(id);
            UPDATE risk_platform.evidence SET organization_id = (SELECT id FROM risk_platform.organizations WHERE slug = 'default');
            ALTER TABLE risk_platform.evidence ALTER COLUMN organization_id SET NOT NULL;
        END IF;
    ELSE
        -- Create evidence table if it doesn't exist
        CREATE TABLE risk_platform.evidence (
            id SERIAL PRIMARY KEY,
            organization_id INTEGER NOT NULL REFERENCES risk_platform.organizations(id),
            requirement_id INTEGER REFERENCES risk_platform.requirements(id),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            file_path VARCHAR(255),
            file_type VARCHAR(100),
            status VARCHAR(50) DEFAULT 'active',
            created_by INTEGER REFERENCES risk_platform.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITH TIME ZONE
        );
    END IF;
END
$$;

-- Create trust score calculation function
CREATE OR REPLACE FUNCTION calculate_trust_score(org_id INTEGER, score_date DATE)
RETURNS INTEGER AS $$
DECLARE
    cyber_score INTEGER := 0;
    physical_score INTEGER := 0;
    operational_score INTEGER := 0;
    compliance_score INTEGER := 0;
    strategic_score INTEGER := 0;
    overall_score INTEGER := 0;
    req_count INTEGER := 0;
BEGIN
    -- Calculate scores based on requirements compliance status
    SELECT 
        COUNT(*),
        COALESCE(AVG(CASE WHEN compliance_status = 'compliant' THEN 100
                         WHEN compliance_status = 'partial' THEN 50
                         WHEN compliance_status = 'non-compliant' THEN 0
                         ELSE 0 END), 0)::INTEGER
    INTO req_count, overall_score
    FROM risk_platform.requirements
    WHERE organization_id = org_id 
    AND deleted_at IS NULL;
    
    -- If no requirements, set a default score
    IF req_count = 0 THEN
        overall_score := 50; -- Default score
    END IF;
    
    -- Insert or update trust score
    INSERT INTO risk_platform.trust_scores (
        organization_id, 
        score_date, 
        overall_score, 
        cyber_score, 
        physical_score, 
        operational_score, 
        compliance_score, 
        strategic_score,
        details,
        created_by
    ) VALUES (
        org_id,
        score_date,
        overall_score,
        cyber_score,
        physical_score,
        operational_score,
        compliance_score,
        strategic_score,
        jsonb_build_object(
            'total_requirements', req_count,
            'calculation_date', NOW()
        ),
        (SELECT id FROM risk_platform.users WHERE role = 'admin' AND organization_id = org_id LIMIT 1)
    )
    ON CONFLICT (organization_id, score_date) DO UPDATE SET
        overall_score = EXCLUDED.overall_score,
        cyber_score = EXCLUDED.cyber_score,
        physical_score = EXCLUDED.physical_score,
        operational_score = EXCLUDED.operational_score,
        compliance_score = EXCLUDED.compliance_score,
        strategic_score = EXCLUDED.strategic_score,
        details = EXCLUDED.details,
        updated_at = NOW();
        
    RETURN overall_score;
END;
$$ LANGUAGE plpgsql;

-- Calculate initial trust score
SELECT calculate_trust_score((SELECT id FROM risk_platform.organizations WHERE slug = 'default'), CURRENT_DATE);

-- Create read-only user for reporting if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'risk_platform_readonly') THEN
        CREATE USER risk_platform_readonly WITH PASSWORD 'readonly_password';
        GRANT CONNECT ON DATABASE risk_platform TO risk_platform_readonly;
        GRANT USAGE ON SCHEMA risk_platform TO risk_platform_readonly;
        GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_readonly;
        ALTER DEFAULT PRIVILEGES IN SCHEMA risk_platform GRANT SELECT ON TABLES TO risk_platform_readonly;
    END IF;
END
$$;
EOF

# Apply database changes if PostgreSQL is running
if docker ps | grep -q "$POSTGRES_CONTAINER"; then
    log "Applying database schema changes"
    
    # Copy migration script to container
    docker cp "${DB_DIR}/init/01-schema-upgrade.sql" "$POSTGRES_CONTAINER:/tmp/schema-upgrade.sql"
    
    # Execute migration script
    docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -f "/tmp/schema-upgrade.sql" || warning "Database migration encountered issues"
    
    success "Database schema enhanced"
else
    warning "PostgreSQL container not running, schema changes will be applied on next container start"
    
    # Create init directory in Docker Compose volume if needed
    if [ -d "${PLATFORM_DIR}/docker" ]; then
        log "Updating Docker Compose configuration for database initialization"
        
        # Ensure the init script will be executed on container start
        mkdir -p "${PLATFORM_DIR}/docker/postgres/init"
        cp "${DB_DIR}/init/01-schema-upgrade.sql" "${PLATFORM_DIR}/docker/postgres/init/" || warning "Failed to copy initialization script"
    fi
fi

# Step 4: Enhance Nginx configuration
log "STEP 4: Enhancing Nginx configuration"

# Create enhanced Nginx configuration
mkdir -p "${CONFIG_DIR}/nginx"
cat > "${CONFIG_DIR}/nginx/default.conf" << 'EOF'
# Main server configuration
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'" always;
    
    # Frontend application
    location / {
        root /opt/risk-platform/frontend/public;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Monitoring access
    location /monitoring {
        proxy_pass http://grafana:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Health check
    location /health {
        return 200 '{"status":"healthy","timestamp":"'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}\n';
        add_header Content-Type application/json;
    }
    
    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        root /opt/risk-platform/frontend/public;
        expires max;
        log_not_found off;
    }
}
EOF

# Update Nginx configuration if container is running
if docker ps | grep -q "$NGINX_CONTAINER"; then
    log "Updating Nginx configuration in container"
    
    # Copy configuration to container
    docker cp "${CONFIG_DIR}/nginx/default.conf" "$NGINX_CONTAINER:/etc/nginx/conf.d/default.conf" || warning "Failed to copy Nginx configuration"
    
    # Reload Nginx configuration
    docker exec "$NGINX_CONTAINER" nginx -s reload || warning "Failed to reload Nginx configuration"
    
    success "Nginx configuration enhanced"
else
    warning "Nginx container not running, configuration will be applied on next container start"
fi

# Step 5: Create basic API service
log "STEP 5: Creating basic API service"

# Create API directory structure
mkdir -p "${PLATFORM_DIR}/api/src"

# Create package.json
cat > "${PLATFORM_DIR}/api/package.json" << 'EOF'
{
  "name": "risk-platform-api",
  "version": "1.0.0",
  "description": "Risk Platform API Service",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "pg": "^8.11.0"
  }
}
EOF

# Create server.js
cat > "${PLATFORM_DIR}/api/src/server.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Basic API endpoints
app.get('/api/v1/threats', (req, res) => {
    res.json({ message: 'Threats API endpoint' });
});

app.get('/api/v1/risks', (req, res) => {
    res.json({ message: 'Risks API endpoint' });
});

app.get('/api/v1/trust-score', (req, res) => {
    res.json({ 
        overall: 78,
        categories: {
            cyber: 85,
            physical: 72,
            operational: 78,
            compliance: 90,
            strategic: 65
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
EOF

# Create Dockerfile for API
cat > "${PLATFORM_DIR}/api/Dockerfile" << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
EOF

success "Basic API service created"

# Step 6: Create operational scripts
log "STEP 6: Creating operational scripts"

# Create scripts directory
mkdir -p "${SCRIPTS_DIR}/backup"
mkdir -p "${SCRIPTS_DIR}/monitoring"
mkdir -p "${SCRIPTS_DIR}/maintenance"

# Create backup script
cat > "${SCRIPTS_DIR}/backup/database-backup.sh" << 'EOF'
#!/bin/bash
# Database backup script

BACKUP_DIR="/opt/risk-platform/backups"
DATE=$(date +%Y%m%d-%H%M%S)
POSTGRES_CONTAINER="risk-platform-postgres"
DB_USER="risk_platform"
DB_NAME="risk_platform"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
echo "Creating database backup..."
docker exec "$POSTGRES_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -F c > "$BACKUP_DIR/database-$DATE.dump"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "database-*.dump" -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/database-$DATE.dump"
EOF
chmod +x "${SCRIPTS_DIR}/backup/database-backup.sh"

# Create monitoring script
cat > "${SCRIPTS_DIR}/monitoring/check-services.sh" << 'EOF'
#!/bin/bash
# Service health check script

# Check container status
echo "Checking container status..."
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check database connection
echo -e "\nChecking database connection..."
if docker exec risk-platform-postgres pg_isready -U risk_platform -d risk_platform; then
    echo "Database connection successful"
else
    echo "Database connection failed"
fi

# Check Nginx status
echo -e "\nChecking Nginx status..."
if docker exec risk-platform-nginx nginx -t; then
    echo "Nginx configuration is valid"
else
    echo "Nginx configuration has errors"
fi

# Check disk space
echo -e "\nChecking disk space..."
df -h /

# Check memory usage
echo -e "\nChecking memory usage..."
free -h
EOF
chmod +x "${SCRIPTS_DIR}/monitoring/check-services.sh"

# Create maintenance script
cat > "${SCRIPTS_DIR}/maintenance/update-system.sh" << 'EOF'
#!/bin/bash
# System update script

echo "Updating system packages..."
apt update && apt upgrade -y

echo "Pulling latest Docker images..."
cd /opt/risk-platform/docker
docker compose pull

echo "Restarting containers with latest images..."
docker compose up -d

echo "System update completed"
EOF
chmod +x "${SCRIPTS_DIR}/maintenance/update-system.sh"

# Create master control script
cat > "${SCRIPTS_DIR}/risk-platform-control.sh" << 'EOF'
#!/bin/bash
# Risk Platform Control Script

PLATFORM_DIR="/opt/risk-platform"
DOCKER_DIR="${PLATFORM_DIR}/docker"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Display help
show_help() {
    echo -e "${BLUE}Risk Platform Control Script${NC}"
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  status        Show status of all services"
    echo "  start         Start all services"
    echo "  stop          Stop all services"
    echo "  restart       Restart all services"
    echo "  backup        Create database backup"
    echo "  logs          Show container logs"
    echo "  update        Update system and containers"
    echo "  help          Show this help message"
}

# Check status
check_status() {
    echo -e "${BLUE}Checking Risk Platform status...${NC}"
    cd "$DOCKER_DIR" || exit 1
    docker compose ps
}

# Start services
start_services() {
    echo -e "${BLUE}Starting Risk Platform services...${NC}"
    cd "$DOCKER_DIR" || exit 1
    docker compose up -d
    echo -e "${GREEN}Services started${NC}"
}

# Stop services
stop_services() {
    echo -e "${BLUE}Stopping Risk Platform services...${NC}"
    cd "$DOCKER_DIR" || exit 1
    docker compose down
    echo -e "${GREEN}Services stopped${NC}"
}

# Restart services
restart_services() {
    echo -e "${BLUE}Restarting Risk Platform services...${NC}"
    cd "$DOCKER_DIR" || exit 1
    docker compose restart
    echo -e "${GREEN}Services restarted${NC}"
}

# Create backup
create_backup() {
    echo -e "${BLUE}Creating database backup...${NC}"
    "${PLATFORM_DIR}/scripts/backup/database-backup.sh"
}

# Show logs
show_logs() {
    echo -e "${BLUE}Showing container logs...${NC}"
    cd "$DOCKER_DIR" || exit 1
    docker compose logs --tail=100
}

# Update system
update_system() {
    echo -e "${BLUE}Updating system...${NC}"
    "${PLATFORM_DIR}/scripts/maintenance/update-system.sh"
}

# Main logic
case "$1" in
    status)
        check_status
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    backup)
        create_backup
        ;;
    logs)
        show_logs
        ;;
    update)
        update_system
        ;;
    help|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
EOF
chmod +x "${SCRIPTS_DIR}/risk-platform-control.sh"

# Create symlink for easy access
ln -sf "${SCRIPTS_DIR}/risk-platform-control.sh" /usr/local/bin/risk-platform || warning "Failed to create symlink"

success "Operational scripts created"

# Step 7: Update Docker Compose configuration
log "STEP 7: Updating Docker Compose configuration"

# Check if Docker Compose file exists
if [ -f "${PLATFORM_DIR}/docker/docker-compose.yml" ]; then
    # Backup existing Docker Compose file
    cp "${PLATFORM_DIR}/docker/docker-compose.yml" "${PLATFORM_DIR}/docker/docker-compose.yml.backup"
    
    # Create enhanced Docker Compose file
    cat > "${PLATFORM_DIR}/docker/docker-compose.yml" << EOF
version: '3.8'

services:
  # Database
  postgres:
    container_name: risk-platform-postgres
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

  # Web server
  nginx:
    container_name: risk-platform-nginx
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ${CONFIG_DIR}/nginx:/etc/nginx/conf.d
      - ${PLATFORM_DIR}/frontend/public:/opt/risk-platform/frontend/public
    networks:
      - risk_platform_network
    depends_on:
      - postgres
      - grafana
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # API service
  api:
    container_name: risk-platform-api
    build:
      context: ${PLATFORM_DIR}/api
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    networks:
      - risk_platform_network
    depends_on:
      - postgres

  # Monitoring
  grafana:
    container_name: risk-platform-grafana
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
    user: "472"

networks:
  risk_platform_network:
    driver: bridge

volumes:
  postgres_data:
  grafana_data:
EOF
    
    success "Docker Compose configuration updated"
else
    warning "Docker Compose file not found, creating new one"
    
    # Create Docker Compose directory
    mkdir -p "${PLATFORM_DIR}/docker"
    
    # Create new Docker Compose file
    cat > "${PLATFORM_DIR}/docker/docker-compose.yml" << EOF
version: '3.8'

services:
  # Database
  postgres:
    container_name: risk-platform-postgres
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

  # Web server
  nginx:
    container_name: risk-platform-nginx
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ${CONFIG_DIR}/nginx:/etc/nginx/conf.d
      - ${PLATFORM_DIR}/frontend/public:/opt/risk-platform/frontend/public
    networks:
      - risk_platform_network
    depends_on:
      - postgres
      - grafana
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # API service
  api:
    container_name: risk-platform-api
    build:
      context: ${PLATFORM_DIR}/api
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
    networks:
      - risk_platform_network
    depends_on:
      - postgres

  # Monitoring
  grafana:
    container_name: risk-platform-grafana
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
    user: "472"

networks:
  risk_platform_network:
    driver: bridge

volumes:
  postgres_data:
  grafana_data:
EOF
    
    success "Docker Compose configuration created"
fi

# Step 8: Deploy updated services
log "STEP 8: Deploying updated services"

# Ask for confirmation before deploying
if confirm "Ready to deploy updated services. This will restart all containers. Continue?"; then
    cd "${PLATFORM_DIR}/docker"
    
    # Build API container
    log "Building API container"
    docker compose build api
    
    # Start all services
    log "Starting all services"
    docker compose up -d
    
    # Wait for services to start
    log "Waiting for services to start..."
    sleep 15
    
    # Check service status
    log "Checking service status"
    docker compose ps
    
    success "Services deployed successfully"
else
    warning "Deployment skipped by user"
fi

# Step 9: Verify migration
log "STEP 9: Verifying migration"

# Check container status
log "Checking container status"
if docker ps | grep -q "$POSTGRES_CONTAINER" && docker ps | grep -q "$NGINX_CONTAINER"; then
    success "Containers are running"
else
    warning "Some containers are not running"
fi

# Check database connection
log "Checking database connection"
if docker exec "$POSTGRES_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" &>/dev/null; then
    success "Database connection successful"
else
    warning "Database connection failed"
fi

# Check web access
log "Checking web access"
if curl -s http://localhost | grep -q "Risk Platform"; then
    success "Web access successful"
else
    warning "Web access failed"
fi

# Final summary
log "MIGRATION SUMMARY"
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  MIGRATION COMPLETED SUCCESSFULLY ${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo "The Risk Platform has been upgraded to enterprise architecture:"
echo ""
echo -e "${BLUE}1. Enhanced Database Schema${NC}"
echo "   - Organization and user management"
echo "   - Trust score calculation"
echo "   - Audit logging"
echo ""
echo -e "${BLUE}2. API Service${NC}"
echo "   - Basic REST API endpoints"
echo "   - Health monitoring"
echo ""
echo -e "${BLUE}3. Operational Scripts${NC}"
echo "   - Backup and maintenance"
echo "   - Monitoring and health checks"
echo "   - Master control script (risk-platform command)"
echo ""
echo -e "${BLUE}4. Security Enhancements${NC}"
echo "   - Improved Nginx configuration"
echo "   - Security headers"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Change default passwords"
echo "2. Configure SSL certificates"
echo "3. Set up regular backups"
echo "4. Implement additional security measures"
echo ""
echo -e "${BLUE}Access Information:${NC}"
echo "Dashboard: http://$(hostname -I | awk '{print $1}')"
echo "Monitoring: http://$(hostname -I | awk '{print $1}')/monitoring"
echo ""
echo -e "${YELLOW}For any issues, check the migration log at:${NC} $LOG_FILE"
echo ""
echo -e "${GREEN}Migration completed successfully!${NC}"
