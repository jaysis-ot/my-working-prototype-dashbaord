#!/bin/bash
# migrate-to-production-dashboard.sh
# Comprehensive migration script to upgrade the basic dashboard deployment
# to a production-ready enterprise system following the Risk Platform architecture
# Version: 1.0.0
# Date: 2025-08-04

set -e
trap 'echo "Error on line $LINENO. Migration failed."; exit 1' ERR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CURRENT_IP=$(hostname -I | awk '{print $1}')
PLATFORM_DIR="/opt/risk-platform"
DASHBOARD_DIR="${PLATFORM_DIR}/dashboard"
DB_DIR="${PLATFORM_DIR}/database"
NGINX_DIR="${PLATFORM_DIR}/nginx"
DOCKER_COMPOSE_DIR="${PLATFORM_DIR}/docker"
LOG_DIR="/var/log/risk-platform"
BACKUP_DIR="${PLATFORM_DIR}/backups/migration-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="${LOG_DIR}/migration-$(date +%Y%m%d-%H%M%S).log"
DOCKER_NETWORK="risk-platform-network"

# Container names
NGINX_CONTAINER="risk-platform-nginx"
POSTGRES_CONTAINER="risk-platform-postgres"
GRAFANA_CONTAINER="risk-platform-grafana"
PROMETHEUS_CONTAINER="risk-platform-prometheus"
ALERTMANAGER_CONTAINER="risk-platform-alertmanager"
API_CONTAINER="risk-platform-api"
WORKER_CONTAINER="risk-platform-worker"
REDIS_CONTAINER="risk-platform-redis"
ELASTICSEARCH_CONTAINER="risk-platform-elasticsearch"
RABBITMQ_CONTAINER="risk-platform-rabbitmq"

# Database credentials
DB_USER="risk_platform"
DB_NAME="risk_platform"
DB_PASSWORD=$(cat /opt/risk-platform/docker/docker-compose.yml | grep POSTGRES_PASSWORD | head -1 | cut -d'"' -f2 || echo "Risk_Platform_Password")

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  RISK PLATFORM PRODUCTION MIGRATION SCRIPT   ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

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

# Step 1: Check prerequisites
section "CHECKING PREREQUISITES"

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

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
fi

# Check if current deployment exists
if [ ! -d "$PLATFORM_DIR" ]; then
    error "Current platform directory not found at $PLATFORM_DIR"
fi

# Check disk space (need at least 10GB free)
FREE_SPACE=$(df -m / | awk 'NR==2 {print $4}')
if [ "$FREE_SPACE" -lt 10240 ]; then
    warning "Less than 10GB free disk space available. Migration may fail."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Migration aborted due to insufficient disk space."
    fi
fi

success "All prerequisites checked"

# Step 2: Backup current deployment
section "BACKING UP CURRENT DEPLOYMENT"

# Create backup directory
mkdir -p "$BACKUP_DIR"
log "Backup directory created at $BACKUP_DIR"

# Backup Docker Compose files
log "Backing up Docker Compose files"
cp -r "$DOCKER_COMPOSE_DIR" "$BACKUP_DIR/docker" || warning "Failed to backup Docker Compose files"

# Backup database
log "Backing up PostgreSQL database"
if docker ps | grep -q "$POSTGRES_CONTAINER"; then
    docker exec "$POSTGRES_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -F c > "$BACKUP_DIR/database_backup.dump" || warning "Failed to backup database"
    success "Database backup completed"
else
    warning "PostgreSQL container not running, skipping database backup"
fi

# Backup dashboard files
log "Backing up dashboard files"
if [ -d "$DASHBOARD_DIR" ]; then
    cp -r "$DASHBOARD_DIR" "$BACKUP_DIR/dashboard" || warning "Failed to backup dashboard files"
    success "Dashboard files backup completed"
else
    warning "Dashboard directory not found, skipping dashboard backup"
fi

# Backup Nginx configuration
log "Backing up Nginx configuration"
if [ -d "$NGINX_DIR" ]; then
    cp -r "$NGINX_DIR" "$BACKUP_DIR/nginx" || warning "Failed to backup Nginx configuration"
    success "Nginx configuration backup completed"
else
    warning "Nginx directory not found, skipping Nginx backup"
fi

# Backup monitoring configuration
log "Backing up monitoring configuration"
if [ -d "${PLATFORM_DIR}/monitoring" ]; then
    cp -r "${PLATFORM_DIR}/monitoring" "$BACKUP_DIR/monitoring" || warning "Failed to backup monitoring configuration"
    success "Monitoring configuration backup completed"
else
    warning "Monitoring directory not found, skipping monitoring backup"
fi

success "Backup completed at $BACKUP_DIR"

# Step 3: Stop current services
section "STOPPING CURRENT SERVICES"

log "Stopping all running containers"
cd "$DOCKER_COMPOSE_DIR"
docker compose down || warning "Failed to stop some containers, continuing anyway"

success "All services stopped"

# Step 4: Create enterprise directory structure
section "CREATING ENTERPRISE DIRECTORY STRUCTURE"

log "Creating enterprise directory structure"

# Create main directories
mkdir -p "${PLATFORM_DIR}/{api,frontend,database,config,scripts,secrets,logs,backups,monitoring,threat-intel,integrations}"
mkdir -p "${PLATFORM_DIR}/config/{nginx,postgres,redis,api,prometheus,grafana,elasticsearch,rabbitmq}"
mkdir -p "${PLATFORM_DIR}/database/{init,migrations,backups}"
mkdir -p "${PLATFORM_DIR}/scripts/{deployment,maintenance,security,threat-intelligence,user-management,analytics}"
mkdir -p "${PLATFORM_DIR}/monitoring/{dashboards,alerts,rules}"
mkdir -p "${PLATFORM_DIR}/secrets/{certs,keys,passwords}"
mkdir -p "${PLATFORM_DIR}/frontend/public"
mkdir -p "${PLATFORM_DIR}/api/{src,tests,docs}"
mkdir -p "${PLATFORM_DIR}/api/src/{controllers,models,routes,middleware,services,utils,config}"

# Set proper permissions
chmod 700 "${PLATFORM_DIR}/secrets"
chmod 750 "${PLATFORM_DIR}/config" "${PLATFORM_DIR}/scripts"

success "Enterprise directory structure created"

# Step 5: Create production database schema
section "CREATING PRODUCTION DATABASE SCHEMA"

log "Creating production database schema"

# Create database initialization script
cat > "${DB_DIR}/init/01-enterprise-schema.sql" << 'EOF'
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
    mfa_secret VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threats table
CREATE TABLE IF NOT EXISTS threats (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    threat_id VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    threat_type VARCHAR(100),
    threat_category VARCHAR(100),
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    source VARCHAR(100),
    external_references JSONB,
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
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_category VARCHAR(100),
    impact VARCHAR(50),
    likelihood VARCHAR(50),
    inherent_risk_score INTEGER,
    residual_risk_score INTEGER,
    status VARCHAR(50) DEFAULT 'open',
    treatment_strategy VARCHAR(100),
    treatment_details TEXT,
    owner_id INTEGER REFERENCES users(id),
    reviewer_id INTEGER REFERENCES users(id),
    review_date TIMESTAMP WITH TIME ZONE,
    next_review_date TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Capabilities table
CREATE TABLE IF NOT EXISTS capabilities (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    capability_category VARCHAR(100),
    maturity_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    owner_id INTEGER REFERENCES users(id),
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
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirement_category VARCHAR(100),
    compliance_status VARCHAR(50) DEFAULT 'not-assessed',
    source VARCHAR(100),
    source_reference VARCHAR(100),
    owner_id INTEGER REFERENCES users(id),
    review_frequency VARCHAR(50),
    last_review_date TIMESTAMP WITH TIME ZONE,
    next_review_date TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Evidence types table
CREATE TABLE IF NOT EXISTS evidence_types (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_types VARCHAR(255),
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
    evidence_type_id INTEGER REFERENCES evidence_types(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    file_type VARCHAR(100),
    file_size INTEGER,
    file_hash VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Trust score table
CREATE TABLE IF NOT EXISTS trust_scores (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    score_date DATE NOT NULL,
    overall_score INTEGER NOT NULL,
    cyber_score INTEGER,
    physical_score INTEGER,
    operational_score INTEGER,
    compliance_score INTEGER,
    strategic_score INTEGER,
    details JSONB,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    integration_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Threat intelligence sources
CREATE TABLE IF NOT EXISTS threat_intel_sources (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    last_update_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indicators of Compromise (IoCs)
CREATE TABLE IF NOT EXISTS indicators (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    indicator_type VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    threat_id INTEGER REFERENCES threats(id),
    source_id INTEGER REFERENCES threat_intel_sources(id),
    confidence VARCHAR(50),
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    first_seen TIMESTAMP WITH TIME ZONE,
    last_seen TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    report_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB,
    schedule VARCHAR(100),
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Report results
CREATE TABLE IF NOT EXISTS report_results (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    report_id INTEGER REFERENCES reports(id),
    result_data JSONB,
    file_path VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API keys
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    data JSONB,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create evidence types
INSERT INTO evidence_types (organization_id, name, description, file_types)
VALUES 
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Policy Document', 'Organizational policy documents', 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Technical Configuration', 'Technical configuration evidence', 'application/pdf,image/png,image/jpeg,text/plain'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Audit Report', 'Internal or external audit reports', 'application/pdf'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Training Record', 'Security awareness training records', 'application/pdf,image/png,image/jpeg'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Risk Assessment', 'Risk assessment documents', 'application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
ON CONFLICT DO NOTHING;

-- Create threat intelligence sources
INSERT INTO threat_intel_sources (organization_id, name, source_type, config, status)
VALUES 
    ((SELECT id FROM organizations WHERE slug = 'default'), 'MITRE ATT&CK', 'mitre-attack', '{"url": "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json", "update_frequency": "weekly"}', 'active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'AlienVault OTX', 'otx', '{"api_key": "YOUR_API_KEY", "update_frequency": "daily"}', 'inactive'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'CISA Known Exploited Vulnerabilities', 'cisa-kev', '{"url": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json", "update_frequency": "daily"}', 'active')
ON CONFLICT DO NOTHING;

-- Create read-only user for reporting
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'risk_platform_readonly') THEN
        CREATE USER risk_platform_readonly WITH PASSWORD 'readonly_password';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE risk_platform TO risk_platform_readonly;
GRANT USAGE ON SCHEMA risk_platform TO risk_platform_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA risk_platform GRANT SELECT ON TABLES TO risk_platform_readonly;

-- Create functions for trust score calculation
CREATE OR REPLACE FUNCTION calculate_trust_score(org_id INTEGER, score_date DATE)
RETURNS INTEGER AS $$
DECLARE
    cyber_score INTEGER;
    physical_score INTEGER;
    operational_score INTEGER;
    compliance_score INTEGER;
    strategic_score INTEGER;
    overall_score INTEGER;
BEGIN
    -- Calculate cyber score (25% weight)
    SELECT COALESCE(AVG(
        CASE 
            WHEN compliance_status = 'compliant' THEN 100
            WHEN compliance_status = 'partial' THEN 50
            WHEN compliance_status = 'non-compliant' THEN 0
            ELSE 0
        END
    ), 0)::INTEGER INTO cyber_score
    FROM risk_platform.requirements
    WHERE organization_id = org_id 
    AND requirement_category = 'cyber'
    AND deleted_at IS NULL;
    
    -- Calculate physical score (15% weight)
    SELECT COALESCE(AVG(
        CASE 
            WHEN compliance_status = 'compliant' THEN 100
            WHEN compliance_status = 'partial' THEN 50
            WHEN compliance_status = 'non-compliant' THEN 0
            ELSE 0
        END
    ), 0)::INTEGER INTO physical_score
    FROM risk_platform.requirements
    WHERE organization_id = org_id 
    AND requirement_category = 'physical'
    AND deleted_at IS NULL;
    
    -- Calculate operational score (20% weight)
    SELECT COALESCE(AVG(
        CASE 
            WHEN compliance_status = 'compliant' THEN 100
            WHEN compliance_status = 'partial' THEN 50
            WHEN compliance_status = 'non-compliant' THEN 0
            ELSE 0
        END
    ), 0)::INTEGER INTO operational_score
    FROM risk_platform.requirements
    WHERE organization_id = org_id 
    AND requirement_category = 'operational'
    AND deleted_at IS NULL;
    
    -- Calculate compliance score (25% weight)
    SELECT COALESCE(AVG(
        CASE 
            WHEN compliance_status = 'compliant' THEN 100
            WHEN compliance_status = 'partial' THEN 50
            WHEN compliance_status = 'non-compliant' THEN 0
            ELSE 0
        END
    ), 0)::INTEGER INTO compliance_score
    FROM risk_platform.requirements
    WHERE organization_id = org_id 
    AND requirement_category = 'compliance'
    AND deleted_at IS NULL;
    
    -- Calculate strategic score (15% weight)
    SELECT COALESCE(AVG(
        CASE 
            WHEN compliance_status = 'compliant' THEN 100
            WHEN compliance_status = 'partial' THEN 50
            WHEN compliance_status = 'non-compliant' THEN 0
            ELSE 0
        END
    ), 0)::INTEGER INTO strategic_score
    FROM risk_platform.requirements
    WHERE organization_id = org_id 
    AND requirement_category = 'strategic'
    AND deleted_at IS NULL;
    
    -- Calculate overall score with weights
    overall_score := (cyber_score * 0.25) + (physical_score * 0.15) + 
                    (operational_score * 0.20) + (compliance_score * 0.25) + 
                    (strategic_score * 0.15);
    
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
            'cyber_weight', 0.25,
            'physical_weight', 0.15,
            'operational_weight', 0.20,
            'compliance_weight', 0.25,
            'strategic_weight', 0.15
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

-- Create audit logging function
CREATE OR REPLACE FUNCTION log_audit() RETURNS TRIGGER AS $$
DECLARE
    audit_data JSONB;
    entity_type TEXT;
    action_type TEXT;
BEGIN
    -- Determine entity type from table name
    entity_type := TG_TABLE_NAME;
    
    -- Determine action type
    IF (TG_OP = 'INSERT') THEN
        action_type := 'create';
        audit_data := row_to_json(NEW)::JSONB;
    ELSIF (TG_OP = 'UPDATE') THEN
        action_type := 'update';
        audit_data := jsonb_build_object(
            'old', row_to_json(OLD)::JSONB,
            'new', row_to_json(NEW)::JSONB,
            'changed_fields', (
                SELECT jsonb_object_agg(key, value)
                FROM jsonb_each(row_to_json(NEW)::JSONB)
                WHERE NOT (row_to_json(OLD)::JSONB ? key AND row_to_json(OLD)::JSONB->key = value)
            )
        );
    ELSIF (TG_OP = 'DELETE') THEN
        action_type := 'delete';
        audit_data := row_to_json(OLD)::JSONB;
    END IF;
    
    -- Insert audit log
    INSERT INTO risk_platform.audit_log (
        organization_id,
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        created_at
    ) VALUES (
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.organization_id
            ELSE NEW.organization_id
        END,
        current_setting('risk_platform.current_user_id', true)::INTEGER,
        action_type,
        entity_type,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        audit_data,
        NOW()
    );
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER audit_threats_trigger
AFTER INSERT OR UPDATE OR DELETE ON risk_platform.threats
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_risks_trigger
AFTER INSERT OR UPDATE OR DELETE ON risk_platform.risks
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_requirements_trigger
AFTER INSERT OR UPDATE OR DELETE ON risk_platform.requirements
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_capabilities_trigger
AFTER INSERT OR UPDATE OR DELETE ON risk_platform.capabilities
FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_evidence_trigger
AFTER INSERT OR UPDATE OR DELETE ON risk_platform.evidence
FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Create sample data
INSERT INTO risk_platform.threats (organization_id, threat_id, title, description, threat_type, threat_category, severity, status, source)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 'T1566', 'Phishing', 'Adversaries may send phishing messages to gain access to victim systems', 'technique', 'social-engineering', 'high', 'active', 'MITRE ATT&CK'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'T1486', 'Data Encryption for Impact', 'Ransomware and other malware encrypt data on target systems', 'technique', 'impact', 'critical', 'active', 'MITRE ATT&CK'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'T1078', 'Valid Accounts', 'Adversaries may obtain and abuse credentials of existing accounts', 'technique', 'persistence', 'high', 'active', 'MITRE ATT&CK'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'T1190', 'Exploit Public-Facing Application', 'Exploitation of vulnerabilities in public-facing applications', 'technique', 'initial-access', 'high', 'active', 'MITRE ATT&CK'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'T1133', 'External Remote Services', 'Adversaries may leverage external remote services as a point of entry', 'technique', 'initial-access', 'medium', 'active', 'MITRE ATT&CK');

-- Create sample risks
INSERT INTO risk_platform.risks (organization_id, threat_id, title, description, risk_category, impact, likelihood, inherent_risk_score, residual_risk_score, status, treatment_strategy)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 1, 'Data Breach via Phishing', 'Risk of data breach through successful phishing attacks', 'data-protection', 'high', 'medium', 75, 45, 'open', 'mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 2, 'Ransomware Attack', 'Risk of business disruption due to ransomware', 'business-continuity', 'critical', 'medium', 90, 60, 'open', 'mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 3, 'Insider Threat', 'Risk of data exfiltration by malicious insiders', 'data-protection', 'high', 'low', 60, 30, 'open', 'mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 4, 'Web Application Compromise', 'Risk of compromise through vulnerable web applications', 'application-security', 'high', 'medium', 75, 45, 'open', 'mitigate'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 5, 'VPN Compromise', 'Risk of unauthorized access through VPN', 'network-security', 'high', 'low', 60, 30, 'open', 'transfer');

-- Create sample capabilities
INSERT INTO risk_platform.capabilities (organization_id, title, description, capability_category, maturity_level, status)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Security Awareness', 'Security awareness training program', 'people', 'managed', 'active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Endpoint Protection', 'Endpoint detection and response solution', 'technology', 'defined', 'active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Network Security', 'Firewall, IDS/IPS, and network monitoring', 'technology', 'managed', 'active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Incident Response', 'Incident response plan and team', 'process', 'initial', 'active'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 'Vulnerability Management', 'Vulnerability scanning and patching process', 'process', 'defined', 'active');

-- Create sample requirements
INSERT INTO risk_platform.requirements (organization_id, capability_id, title, description, requirement_category, compliance_status, source, source_reference)
VALUES
    ((SELECT id FROM organizations WHERE slug = 'default'), 1, 'Annual Security Training', 'All employees must complete annual security awareness training', 'operational', 'compliant', 'Internal Policy', 'SEC-001'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 2, 'EDR Deployment', 'EDR solution must be deployed on all endpoints', 'cyber', 'partial', 'Internal Policy', 'SEC-002'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 3, 'Firewall Rules Review', 'Firewall rules must be reviewed quarterly', 'cyber', 'compliant', 'ISO 27001', 'A.13.1.1'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 4, 'Incident Response Testing', 'Incident response plan must be tested annually', 'operational', 'non-compliant', 'NIST CSF', 'RS.MI-1'),
    ((SELECT id FROM organizations WHERE slug = 'default'), 5, 'Monthly Vulnerability Scans', 'All systems must be scanned for vulnerabilities monthly', 'cyber', 'compliant', 'PCI DSS', '11.2');

-- Calculate initial trust score
SELECT calculate_trust_score((SELECT id FROM organizations WHERE slug = 'default'), CURRENT_DATE);
EOF

# Create database migration script
cat > "${DB_DIR}/init/02-migrate-data.sql" << 'EOF'
-- Migrate data from basic dashboard to enterprise schema
-- This script assumes the basic schema tables exist and have data

-- Set search path
SET search_path TO risk_platform;

-- Migrate any existing threats data
INSERT INTO threats (
    organization_id,
    title,
    description,
    threat_category,
    severity,
    status,
    source,
    created_at
)
SELECT 
    (SELECT id FROM organizations WHERE slug = 'default'),
    name,
    description,
    category,
    severity,
    status,
    source,
    created_at
FROM threats_old
ON CONFLICT DO NOTHING;

-- Migrate any existing risks data
INSERT INTO risks (
    organization_id,
    title,
    description,
    risk_category,
    impact,
    likelihood,
    status,
    treatment_strategy,
    created_at
)
SELECT 
    (SELECT id FROM organizations WHERE slug = 'default'),
    name,
    description,
    category,
    impact,
    likelihood,
    status,
    treatment_strategy,
    created_at
FROM risks_old
ON CONFLICT DO NOTHING;

-- Migrate any existing capabilities data
INSERT INTO capabilities (
    organization_id,
    title,
    description,
    capability_category,
    maturity_level,
    status,
    created_at
)
SELECT 
    (SELECT id FROM organizations WHERE slug = 'default'),
    name,
    description,
    category,
    maturity_level,
    status,
    created_at
FROM capabilities_old
ON CONFLICT DO NOTHING;

-- Migrate any existing requirements data
INSERT INTO requirements (
    organization_id,
    title,
    description,
    requirement_category,
    compliance_status,
    source,
    created_at
)
SELECT 
    (SELECT id FROM organizations WHERE slug = 'default'),
    name,
    description,
    category,
    compliance_status,
    source,
    created_at
FROM requirements_old
ON CONFLICT DO NOTHING;

-- Migrate any existing evidence data
INSERT INTO evidence (
    organization_id,
    title,
    description,
    file_path,
    file_type,
    status,
    created_at
)
SELECT 
    (SELECT id FROM organizations WHERE slug = 'default'),
    name,
    description,
    file_path,
    file_type,
    status,
    created_at
FROM evidence_old
ON CONFLICT DO NOTHING;

-- Calculate trust score after migration
SELECT calculate_trust_score((SELECT id FROM organizations WHERE slug = 'default'), CURRENT_DATE);
EOF

success "Production database schema created"

# Step 6: Migrate dashboard frontend
section "MIGRATING DASHBOARD FRONTEND"

log "Migrating dashboard frontend files"

# Copy existing dashboard files to the new structure
if [ -d "$DASHBOARD_DIR/public" ]; then
    cp -r "$DASHBOARD_DIR/public/"* "${PLATFORM_DIR}/frontend/public/" || warning "Failed to copy some dashboard files"
    success "Dashboard files migrated"
else
    warning "Dashboard public directory not found, creating basic structure"
    
    # Create basic index.html if not exists
    cat > "${PLATFORM_DIR}/frontend/public/index.html" << 'EOF'
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
    cat > "${PLATFORM_DIR}/frontend/public/styles.css" << 'EOF'
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
    cat > "${PLATFORM_DIR}/frontend/public/script.js" << 'EOF'
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
    success "Basic dashboard structure created"
fi

# Step 7: Create API service
section "CREATING API SERVICE"

log "Setting up Node.js API service"

# Create package.json
cat > "${PLATFORM_DIR}/api/package.json" << 'EOF'
{
  "name": "risk-platform-api",
  "version": "1.0.0",
  "description": "Risk Platform API Service",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.11.0",
    "redis": "^4.6.7",
    "uuid": "^9.0.0",
    "winston": "^3.9.0"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "nodemon": "^2.0.22",
    "supertest": "^6.3.3"
  }
}
EOF

# Create server.js
cat > "${PLATFORM_DIR}/api/src/server.js" << 'EOF'
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

const PORT = config.port || 3000;

// Start the server
const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
    });
});
EOF

# Create app.js
cat > "${PLATFORM_DIR}/api/src/app.js" << 'EOF'
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('./routes/auth');
const threatsRoutes = require('./routes/threats');
const risksRoutes = require('./routes/risks');
const requirementsRoutes = require('./routes/requirements');
const capabilitiesRoutes = require('./routes/capabilities');
const evidenceRoutes = require('./routes/evidence');
const trustScoresRoutes = require('./routes/trustScores');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/threats', authMiddleware, threatsRoutes);
app.use('/api/v1/risks', authMiddleware, risksRoutes);
app.use('/api/v1/requirements', authMiddleware, requirementsRoutes);
app.use('/api/v1/capabilities', authMiddleware, capabilitiesRoutes);
app.use('/api/v1/evidence', authMiddleware, evidenceRoutes);
app.use('/api/v1/trust-scores', authMiddleware, trustScoresRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handler
app.use(errorHandler);

module.exports = app;
EOF

# Create basic config file
mkdir -p "${PLATFORM_DIR}/api/src/config"
cat > "${PLATFORM_DIR}/api/src/config/config.js" << 'EOF'
require('dotenv').config();

module.exports = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    apiVersion: 'v1',
    database: {
        host: process.env.DB_HOST || 'postgres',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'risk_platform',
        user: process.env.DB_USER || 'risk_platform',
        password: process.env.DB_PASSWORD || 'password',
        ssl: process.env.DB_SSL === 'true',
        pool: {
            min: parseInt(process.env.DB_POOL_MIN || '5'),
            max: parseInt(process.env.DB_POOL_MAX || '20')
        }
    },
    redis: {
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || '',
        db: process.env.REDIS_DB || 0
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: process.env.CORS_CREDENTIALS === 'true'
    },
    upload: {
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'), // 10MB
        allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,application/pdf').split(',')
    }
};
EOF

# Create logger configuration
cat > "${PLATFORM_DIR}/api/src/config/logger.js" << 'EOF'
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'risk-platform-api' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    info => `${info.timestamp} ${info.level}: ${info.message}`
                )
            )
        }),
        new winston.transports.File({ 
            filename: '/opt/risk-platform/logs/error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: '/opt/risk-platform/logs/combined.log' 
        })
    ]
});

module.exports = logger;
EOF

# Create basic route files
mkdir -p "${PLATFORM_DIR}/api/src/routes"
cat > "${PLATFORM_DIR}/api/src/routes/auth.js" << 'EOF'
const express = require('express');
const router = express.Router();

// Mock authentication for now
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    // For demonstration purposes only - in production use proper auth
    if (email === 'admin@risk-platform.local' && password === 'admin123') {
        res.json({
            success: true,
            token: 'mock-jwt-token',
            user: {
                id: 1,
                email: 'admin@risk-platform.local',
                role: 'admin',
                firstName: 'Admin',
                lastName: 'User'
            }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

router.post('/register', (req, res) => {
    res.status(201).json({
        success: true,
        message: 'User registered successfully'
    });
});

router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
EOF

# Create basic middleware
mkdir -p "${PLATFORM_DIR}/api/src/middleware"
cat > "${PLATFORM_DIR}/api/src/middleware/auth.js" << 'EOF'
// Basic authentication middleware
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    // For demonstration purposes only - in production verify JWT token
    if (authHeader.startsWith('Bearer ')) {
        // Mock user for development
        req.user = {
            id: 1,
            email: 'admin@risk-platform.local',
            role: 'admin'
        };
        return next();
    }
    
    return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
    });
};
EOF

cat > "${PLATFORM_DIR}/api/src/middleware/errorHandler.js" << 'EOF'
const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
    // Log the error
    logger.error(err.message, { stack: err.stack });
    
    // Set default status code and message
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = err.message || 'Resource not found';
    }
    
    // Send error response
    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
EOF

# Create basic route stubs for all endpoints
for route in threats risks requirements capabilities evidence trustScores; do
    cat > "${PLATFORM_DIR}/api/src/routes/${route}.js" << EOF
const express = require('express');
const router = express.Router();

// GET all
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: [],
        message: '${route} endpoint stub'
    });
});

// GET by ID
router.get('/:id', (req, res) => {
    res.json({
        success: true,
        data: { id: req.params.id },
        message: '${route} endpoint stub'
    });
});

// POST new
router.post('/', (req, res) => {
    res.status(201).json({
        success: true,
        data: { id: 'new-id', ...req.body },
        message: '${route} created successfully'
    });
});

// PUT update
router.put('/:id', (req, res) => {
    res.json({
        success: true,
        data: { id: req.params.id, ...req.body },
        message: '${route} updated successfully'
    });
});

// DELETE
router.delete('/:id', (req, res) => {
    res.json({
        success: true,
        message: '${route} deleted successfully'
    });
});

module.exports = router;
EOF
done

# Create .env file
cat > "${PLATFORM_DIR}/api/.env" << EOF
# Application Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1
LOG_LEVEL=info

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=risk_platform
DB_USER=risk_platform
DB_PASSWORD=${DB_PASSWORD}
DB_SSL=false
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Security Configuration
JWT_SECRET=change_this_to_a_secure_random_string_in_production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=*
CORS_CREDENTIALS=false

# Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf
EOF

success "API service created"

# Step 8: Create Nginx configuration
section "CREATING NGINX CONFIGURATION"

log "Setting up Nginx configuration"

# Create Nginx configuration
mkdir -p "${NGINX_DIR}/conf.d"
cat > "${NGINX_DIR}/conf.d/default.conf" << 'EOF'
# Main server configuration
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Logging configuration
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Frontend application
    location / {
        root /opt/risk-platform/frontend/public;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 30d;
            add_header Cache-Control "public, no-transform";
        }
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://api:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=10 nodelay;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Monitoring endpoints
    location /monitoring/ {
        proxy_pass http://grafana:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health checks
    location /health {
        proxy_pass http://api:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        access_log off;
        add_header Content-Type application/json;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# Rate limiting configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
EOF

success "Nginx configuration created"

# Step 9: Create Docker Compose file
section "CREATING DOCKER COMPOSE FILE"

log "Creating Docker Compose configuration"

# Generate random passwords
REDIS_PASSWORD=$(openssl rand -base64 24)
RABBITMQ_PASSWORD=$(openssl rand -base64 24)
ELASTICSEARCH_PASSWORD=$(openssl rand -base64 24)
GRAFANA_PASSWORD=$(openssl rand -base64 24)

# Create Docker Compose file
cat > "${DOCKER_COMPOSE_DIR}/docker-compose.yml" << EOF
version: '3.8'

services:
  # Database layer
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
      - risk_platform_db
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    container_name: ${REDIS_CONTAINER}
    image: redis:alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - risk_platform_db
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Application layer
  api:
    container_name: ${API_CONTAINER}
    build:
      context: ${PLATFORM_DIR}/api
      dockerfile: Dockerfile
    image: risk-platform-api:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_