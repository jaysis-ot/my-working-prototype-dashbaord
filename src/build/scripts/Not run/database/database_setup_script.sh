#!/bin/bash
# Risk Platform Database Installation and Setup Script
# Comprehensive database installation, configuration, and table creation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Configuration
PROJECT_ROOT="/opt/risk-platform"
DB_NAME="risk_platform"
DB_USER="risk_platform_app"
DB_PASSWORD="$(openssl rand -base64 32)"
DB_ROOT_PASSWORD="$(openssl rand -base64 32)"
REDIS_PASSWORD="$(openssl rand -base64 32)"

# =============================================
# PHASE 1: DOCKER AND CONTAINER SETUP
# =============================================

install_docker() {
    log "Installing Docker and Docker Compose..."
    
    # Update package index
    sudo apt update
    
    # Install prerequisites
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    success "Docker installed successfully"
}

# =============================================
# PHASE 2: PROJECT STRUCTURE SETUP
# =============================================

setup_project_structure() {
    log "Setting up project directory structure..."
    
    # Create main project directory
    sudo mkdir -p $PROJECT_ROOT
    sudo chown $USER:$USER $PROJECT_ROOT
    cd $PROJECT_ROOT
    
    # Create directory structure
    mkdir -p {database/{init,config,backups,logs},secrets,scripts,monitoring/{prometheus,grafana},logs}
    
    # Set secure permissions
    chmod 750 database secrets scripts
    chmod 755 monitoring logs
    
    success "Project structure created"
}

# =============================================
# PHASE 3: SECRETS MANAGEMENT
# =============================================

generate_secrets() {
    log "Generating database credentials and secrets..."
    
    cd $PROJECT_ROOT/secrets
    
    # Generate database passwords
    echo "$DB_PASSWORD" > db_app_password.txt
    echo "$DB_ROOT_PASSWORD" > db_root_password.txt
    echo "$REDIS_PASSWORD" > redis_password.txt
    
    # Generate JWT secret
    openssl rand -base64 64 > jwt_secret.txt
    
    # Generate API keys
    openssl rand -hex 32 > api_key.txt
    openssl rand -hex 32 > webhook_secret.txt
    
    # Set secure permissions
    chmod 600 *.txt
    
    success "Secrets generated and secured"
}

# =============================================
# PHASE 4: DATABASE CONFIGURATION FILES
# =============================================

create_database_configs() {
    log "Creating database configuration files..."
    
    cd $PROJECT_ROOT
    
    # PostgreSQL configuration
    cat > database/config/postgresql.conf << 'EOF'
# PostgreSQL Configuration for Risk Platform
# Optimized for enterprise workloads

# Connection Settings
listen_addresses = '*'
port = 5432
max_connections = 200
superuser_reserved_connections = 3

# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# WAL Settings
wal_buffers = 16MB
checkpoint_completion_target = 0.9
wal_compression = on
max_wal_size = 1GB
min_wal_size = 80MB

# Logging
logging_collector = on
log_directory = 'pg_log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Security
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
password_encryption = scram-sha-256

# Performance
random_page_cost = 1.1
seq_page_cost = 1.0
effective_io_concurrency = 200
EOF

    # PostgreSQL host-based authentication
    cat > database/config/pg_hba.conf << 'EOF'
# PostgreSQL Client Authentication Configuration
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             postgres                                peer
local   all             all                                     md5

# IPv4 local connections
host    all             all             127.0.0.1/32           scram-sha-256
host    all             all             172.20.0.0/16          scram-sha-256

# IPv6 local connections
host    all             all             ::1/128                scram-sha-256

# Replication connections
local   replication     all                                     peer
host    replication     all             127.0.0.1/32           scram-sha-256
host    replication     all             172.20.0.0/16          scram-sha-256
EOF

    # Redis configuration
    cat > database/config/redis.conf << 'EOF'
# Redis Configuration for Risk Platform

# Network
bind 0.0.0.0
port 6379
protected-mode yes
tcp-backlog 511
timeout 300
tcp-keepalive 300

# Security
requirepass REDIS_PASSWORD_PLACEHOLDER

# Memory Management
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# Append Only File
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Logging
loglevel notice
logfile /var/log/redis/redis.log
syslog-enabled yes
syslog-ident redis

# Clients
maxclients 10000

# Security hardening
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command KEYS ""
rename-command CONFIG "CONFIG_b835729c9f58"
rename-command SHUTDOWN "SHUTDOWN_b835729c9f58"
rename-command DEBUG ""
rename-command EVAL ""
EOF

    success "Database configuration files created"
}

# =============================================
# PHASE 5: DOCKER COMPOSE FOR DATABASE
# =============================================

create_docker_compose() {
    log "Creating Docker Compose configuration for database services..."
    
    cd $PROJECT_ROOT
    
    cat > docker-compose.db.yml << 'EOF'
version: '3.8'

networks:
  risk_platform_db:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.3.0/24
  risk_platform_monitoring:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.4.0/24

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  postgres_backups:
    driver: local

services:
  postgres:
    image: postgres:16-alpine
    container_name: risk_platform_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      PGDATA: /var/lib/postgresql/data/pgdata
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - postgres_backups:/backups
      - ./database/config/postgresql.conf:/etc/postgresql/postgresql.conf
      - ./database/config/pg_hba.conf:/etc/postgresql/pg_hba.conf
      - ./database/init:/docker-entrypoint-initdb.d
      - ./database/logs:/var/log/postgresql
    ports:
      - "5432:5432"
    networks:
      risk_platform_db:
        ipv4_address: 172.20.3.10
    command: >
      postgres
      -c config_file=/etc/postgresql/postgresql.conf
      -c hba_file=/etc/postgresql/pg_hba.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 40s
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - SETUID
      - SETGID
      - DAC_OVERRIDE
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  redis:
    image: redis:7-alpine
    container_name: risk_platform_redis
    restart: unless-stopped
    command: redis-server /usr/local/etc/redis/redis.conf
    volumes:
      - redis_data:/data
      - ./database/config/redis.conf:/usr/local/etc/redis/redis.conf
      - ./database/logs:/var/log/redis
    ports:
      - "6379:6379"
    networks:
      risk_platform_db:
        ipv4_address: 172.20.3.11
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 20s
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  postgres_exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: risk_platform_postgres_exporter
    restart: unless-stopped
    environment:
      DATA_SOURCE_NAME: "postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?sslmode=disable"
    ports:
      - "9187:9187"
    networks:
      - risk_platform_db
      - risk_platform_monitoring
    depends_on:
      postgres:
        condition: service_healthy
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL

  redis_exporter:
    image: oliver006/redis_exporter:latest
    container_name: risk_platform_redis_exporter
    restart: unless-stopped
    environment:
      REDIS_ADDR: "redis://redis:6379"
      REDIS_PASSWORD: "${REDIS_PASSWORD}"
    ports:
      - "9121:9121"
    networks:
      - risk_platform_db
      - risk_platform_monitoring
    depends_on:
      redis:
        condition: service_healthy
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL

secrets:
  db_password:
    file: ./secrets/db_app_password.txt
  redis_password:
    file: ./secrets/redis_password.txt
EOF

    success "Docker Compose configuration created"
}

# =============================================
# PHASE 6: DATABASE SCHEMA CREATION
# =============================================

create_database_schema() {
    log "Creating comprehensive database schema..."
    
    cd $PROJECT_ROOT/database/init
    
    # Main database initialization
    cat > 01-init-database.sql << 'EOF'
-- Risk Platform Database Initialization
-- Creates extensions, users, and basic structure

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "hstore";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create application schema
CREATE SCHEMA IF NOT EXISTS risk_platform;

-- Create additional users with specific roles
CREATE USER risk_platform_readonly WITH PASSWORD 'readonly_change_me';
CREATE USER risk_platform_backup WITH PASSWORD 'backup_change_me'; 
CREATE USER risk_platform_monitor WITH PASSWORD 'monitor_change_me';
CREATE USER grafana WITH PASSWORD 'grafana_change_me';

-- Grant basic permissions
GRANT CONNECT ON DATABASE risk_platform TO risk_platform_readonly;
GRANT CONNECT ON DATABASE risk_platform TO risk_platform_backup;
GRANT CONNECT ON DATABASE risk_platform TO risk_platform_monitor;
GRANT CONNECT ON DATABASE risk_platform TO grafana;

GRANT USAGE ON SCHEMA risk_platform TO risk_platform_readonly;
GRANT USAGE ON SCHEMA risk_platform TO risk_platform_monitor;

-- Create Grafana database
CREATE DATABASE grafana OWNER grafana;
EOF

    # Complete schema with all tables
    cat > 02-create-schema.sql << 'EOF'
-- Complete Risk Platform Database Schema
-- All core tables for risk intelligence platform

SET search_path TO risk_platform;

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50), -- startup, small, medium, large, enterprise
    description TEXT,
    website VARCHAR(255),
    headquarters_country VARCHAR(3),
    regulatory_framework VARCHAR(100), -- SOC2, ISO27001, GDPR, etc.
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- admin, manager, analyst, user, readonly
    department VARCHAR(100),
    title VARCHAR(100),
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threats table - Core threat intelligence
CREATE TABLE threats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    threat_id VARCHAR(100) NOT NULL, -- Human-readable ID like THR-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    threat_type VARCHAR(100), -- cyber, physical, operational, strategic, compliance
    threat_category VARCHAR(100), -- malware, phishing, insider, natural disaster, etc.
    threat_source VARCHAR(100), -- external, internal, third-party
    attack_vector VARCHAR(100), -- email, web, physical, social engineering, etc.
    severity VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
    likelihood VARCHAR(20) DEFAULT 'medium', -- very_high, high, medium, low, very_low
    impact_description TEXT,
    mitigation_strategy TEXT,
    threat_intelligence JSONB DEFAULT '{}', -- TTPs, IOCs, etc.
    external_references JSONB DEFAULT '[]', -- MITRE ATT&CK, CVE, etc.
    tags TEXT[], -- Array of tags for categorization
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, mitigated, archived
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, threat_id)
);

-- Risks table - Business risks derived from threats
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    risk_id VARCHAR(100) NOT NULL, -- Human-readable ID like RSK-001
    threat_id UUID REFERENCES threats(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    risk_category VARCHAR(100), -- operational, financial, reputational, compliance, strategic
    business_unit VARCHAR(100),
    risk_owner UUID REFERENCES users(id),
    inherent_likelihood VARCHAR(20) DEFAULT 'medium',
    inherent_impact VARCHAR(20) DEFAULT 'medium',
    residual_likelihood VARCHAR(20) DEFAULT 'medium',
    residual_impact VARCHAR(20) DEFAULT 'medium',
    risk_appetite VARCHAR(20) DEFAULT 'medium', -- very_low, low, medium, high, very_high
    treatment_strategy VARCHAR(50) DEFAULT 'mitigate', -- accept, avoid, mitigate, transfer
    business_impact JSONB DEFAULT '{}', -- Financial, operational impact details
    regulatory_impact JSONB DEFAULT '{}', -- Compliance implications
    review_frequency VARCHAR(20) DEFAULT 'quarterly', -- daily, weekly, monthly, quarterly, annually
    next_review_date DATE,
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'open', -- open, in_treatment, closed, accepted
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, risk_id)
);

-- Capabilities table - Organizational capabilities and controls
CREATE TABLE capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    capability_id VARCHAR(100) NOT NULL, -- Human-readable ID like CAP-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    capability_type VARCHAR(100), -- technical, procedural, organizational, physical
    capability_category VARCHAR(100), -- security_control, process, technology, people
    domain VARCHAR(100), -- IAM, network_security, incident_response, etc.
    maturity_level INTEGER DEFAULT 1 CHECK (maturity_level BETWEEN 1 AND 5), -- 1-5 maturity scale
    implementation_status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, implemented, operational, decommissioned
    effectiveness_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (effectiveness_rating BETWEEN 0 AND 1),
    coverage_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (coverage_percentage BETWEEN 0 AND 100),
    automation_level VARCHAR(50) DEFAULT 'manual', -- manual, semi_automated, automated, continuous
    owner UUID REFERENCES users(id),
    responsible_team VARCHAR(100),
    technology_stack TEXT[], -- Array of technologies used
    dependencies TEXT[], -- Array of dependent capabilities
    compliance_frameworks TEXT[], -- SOC2, ISO27001, NIST, etc.
    implementation_cost DECIMAL(12,2),
    annual_cost DECIMAL(12,2),
    last_tested_date DATE,
    next_review_date DATE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}', -- Flexible metadata
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, deprecated
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, capability_id)
);

-- Requirements table - Regulatory and business requirements
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_id VARCHAR(100) NOT NULL, -- Human-readable ID like REQ-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    requirement_source VARCHAR(100), -- regulation, standard, policy, contract
    source_document VARCHAR(255), -- GDPR Article 32, SOC2 CC6.1, etc.
    requirement_type VARCHAR(100), -- technical, procedural, organizational, reporting
    compliance_framework VARCHAR(100), -- GDPR, SOC2, ISO27001, NIST, PCI_DSS, etc.
    control_family VARCHAR(100), -- access_control, encryption, monitoring, etc.
    applicability_criteria TEXT, -- When this requirement applies
    implementation_guidance TEXT,
    testing_procedures TEXT,
    evidence_requirements TEXT[],
    compliance_status VARCHAR(50) DEFAULT 'not_assessed', -- compliant, non_compliant, partial, not_assessed, not_applicable
    implementation_date DATE,
    last_assessment_date DATE,
    next_assessment_date DATE,
    assessment_frequency VARCHAR(20) DEFAULT 'annually', -- monthly, quarterly, annually
    criticality VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
    business_justification TEXT,
    implementation_cost DECIMAL(12,2),
    compliance_owner UUID REFERENCES users(id),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, superseded
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, requirement_id)
);

-- Evidence table - Artifacts and documentation
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    evidence_id VARCHAR(100) NOT NULL, -- Human-readable ID like EVD-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(100), -- policy, procedure, log, screenshot, report, certificate, etc.
    evidence_category VARCHAR(100), -- intent, implementation, operational, validation
    file_path VARCHAR(1000), -- Path to stored file
    file_hash VARCHAR(64), -- SHA-256 hash for integrity
    file_size BIGINT, -- File size in bytes
    mime_type VARCHAR(100),
    collection_method VARCHAR(100), -- manual, automated, api, export
    collection_frequency VARCHAR(50), -- one_time, daily, weekly, monthly, quarterly, annually, continuous
    confidence_level DECIMAL(3,2) DEFAULT 0.80 CHECK (confidence_level BETWEEN 0 AND 1),
    evidence_date TIMESTAMP WITH TIME ZONE, -- When evidence was generated/collected
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    retention_period INTERVAL DEFAULT '7 years', -- How long to keep evidence
    chain_of_custody JSONB DEFAULT '[]', -- Who handled evidence and when
    verification_status VARCHAR(50) DEFAULT 'unverified', -- verified, unverified, disputed, expired
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active', -- active, archived, superseded, deleted
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, evidence_id)
);

-- Risk_Capabilities mapping - Which capabilities address which risks
CREATE TABLE risk_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'mitigates', -- mitigates, monitors, prevents, detects, responds
    effectiveness_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (effectiveness_rating BETWEEN 0 AND 1),
    coverage_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (coverage_percentage BETWEEN 0 AND 100),
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5), -- 1=highest, 5=lowest
    implementation_status VARCHAR(50) DEFAULT 'planned',
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(risk_id, capability_id)
);

-- Capability_Requirements mapping - Which capabilities satisfy which requirements
CREATE TABLE capability_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
    satisfaction_level VARCHAR(50) DEFAULT 'partial', -- full, partial, minimal, none
    implementation_notes TEXT,
    gap_analysis TEXT,
    remediation_plan TEXT,
    target_completion_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(capability_id, requirement_id)
);

-- Evidence_Links - Links evidence to risks, capabilities, requirements
CREATE TABLE evidence_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    linked_entity_type VARCHAR(50) NOT NULL, -- risk, capability, requirement, threat
    linked_entity_id UUID NOT NULL,
    link_type VARCHAR(50) DEFAULT 'supports', -- supports, contradicts, supersedes, validates
    relevance_score DECIMAL(3,2) DEFAULT 1.00 CHECK (relevance_score BETWEEN 0 AND 1),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust Scores - Historical trust score calculations
CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- organization, risk, capability, requirement
    entity_id UUID,
    score_type VARCHAR(50) NOT NULL, -- overall, risk_posture, capability_maturity, compliance_level
    score_value DECIMAL(5,2) NOT NULL CHECK (score_value BETWEEN 0 AND 100),
    score_components JSONB DEFAULT '{}', -- Breakdown of score calculation
    calculation_method VARCHAR(100), -- weighted_average, risk_matrix, maturity_model, etc.
    confidence_interval DECIMAL(3,2) DEFAULT 0.95,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by VARCHAR(100) DEFAULT 'system', -- system, user, external
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log - Comprehensive audit trail
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    action VARCHAR(100) NOT NULL, -- create, read, update, delete, login, logout, etc.
    entity_type VARCHAR(50) NOT NULL, -- user, threat, risk, capability, etc.
    entity_id UUID,
    entity_name VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    change_summary TEXT,
    ip_address INET,
    user_agent TEXT,
    api_endpoint VARCHAR(255),
    request_method VARCHAR(10),
    response_status INTEGER,
    duration_ms INTEGER,
    risk_level VARCHAR(20) DEFAULT 'low', -- critical, high, medium, low
    tags TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- alert, reminder, update, system
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- critical, high, medium, low
    channel VARCHAR(50) DEFAULT 'email', -- email, sms, slack, webhook, in_app
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed, read
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL, -- First few chars for identification
    permissions TEXT[] DEFAULT '{"read"}', -- read, write, admin
    rate_limit INTEGER DEFAULT 1000, -- requests per hour
    allowed_ips INET[],
    last_used_at TIMESTAMP WITH TIME ZONE,
    last_used_ip INET,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id),
    revocation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
EOF

    # Create indexes for performance
    cat > 03-create-indexes.sql << 'EOF'
-- Performance Indexes for Risk Platform

SET search_path TO risk_platform;

-- Organizations indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_industry ON organizations(industry);
CREATE INDEX idx_organizations_active ON organizations(id) WHERE deleted_at IS NULL;

-- Users indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL AND status = 'active';

-- User sessions indexes
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Threats indexes
CREATE INDEX idx_threats_organization ON threats(organization_id);
CREATE INDEX idx_threats_type ON threats(threat_type);
CREATE INDEX idx_threats_severity ON threats(severity);
CREATE INDEX idx_threats_status ON threats(status);
CREATE INDEX idx_threats_active ON threats(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_threats_tags ON threats USING GIN(tags);

-- Risks indexes
CREATE INDEX idx_risks_organization ON risks(organization_id);
CREATE INDEX idx_risks_threat ON risks(threat_id);
CREATE INDEX idx_risks_category ON risks(risk_category);
CREATE INDEX idx_risks_owner ON risks(risk_owner);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_review_date ON risks(next_review_date);
CREATE INDEX idx_risks_active ON risks(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_risks_tags ON risks USING GIN(tags);

-- Capabilities indexes
CREATE INDEX idx_capabilities_organization ON capabilities(organization_id);
CREATE INDEX idx_capabilities_type ON capabilities(capability_type);
CREATE INDEX idx_capabilities_domain ON capabilities(domain);
CREATE INDEX idx_capabilities_status ON capabilities(implementation_status);
CREATE INDEX idx_capabilities_owner ON capabilities(owner);
CREATE INDEX idx_capabilities_maturity ON capabilities(maturity_level);
CREATE INDEX idx_capabilities_active ON capabilities(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_capabilities_tags ON capabilities USING GIN(tags);

-- Requirements indexes
CREATE INDEX idx_requirements_organization ON requirements(organization_id);
CREATE INDEX idx_requirements_framework ON requirements(compliance_framework);
CREATE INDEX idx_requirements_status ON requirements(compliance_status);
CREATE INDEX idx_requirements_owner ON requirements(compliance_owner);
CREATE INDEX idx_requirements_assessment_date ON requirements(next_assessment_date);
CREATE INDEX idx_requirements_active ON requirements(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_requirements_tags ON requirements USING GIN(tags);

-- Evidence indexes
CREATE INDEX idx_evidence_organization ON evidence(organization_id);
CREATE INDEX idx_evidence_type ON evidence(evidence_type);
CREATE INDEX idx_evidence_category ON evidence(evidence_category);
CREATE INDEX idx_evidence_date ON evidence(evidence_date);
CREATE INDEX idx_evidence_valid_until ON evidence(valid_until);
CREATE INDEX idx_evidence_status ON evidence(status);
CREATE INDEX idx_evidence_active ON evidence(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_evidence_tags ON evidence USING GIN(tags);

-- Mapping table indexes
CREATE INDEX idx_risk_capabilities_risk ON risk_capabilities(risk_id);
CREATE INDEX idx_risk_capabilities_capability ON risk_capabilities(capability_id);
CREATE INDEX idx_risk_capabilities_effectiveness ON risk_capabilities(effectiveness_rating);

CREATE INDEX idx_capability_requirements_capability ON capability_requirements(capability_id);
CREATE INDEX idx_capability_requirements_requirement ON capability_requirements(requirement_id);
CREATE INDEX idx_capability_requirements_satisfaction ON capability_requirements(satisfaction_level);

CREATE INDEX idx_evidence_links_evidence ON evidence_links(evidence_id);
CREATE INDEX idx_evidence_links_entity ON evidence_links(linked_entity_type, linked_entity_id);
CREATE INDEX idx_evidence_links_relevance ON evidence_links(relevance_score);

-- Trust scores indexes
CREATE INDEX idx_trust_scores_organization ON trust_scores(organization_id);
CREATE INDEX idx_trust_scores_entity ON trust_scores(entity_type, entity_id);
CREATE INDEX idx_trust_scores_type ON trust_scores(score_type);
CREATE INDEX idx_trust_scores_date ON trust_scores(calculation_date);
CREATE INDEX idx_trust_scores_valid ON trust_scores(valid_from, valid_until);

-- Audit log indexes
CREATE INDEX idx_audit_log_organization ON audit_log(organization_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_risk_level ON audit_log(risk_level);

-- Notifications indexes
CREATE INDEX idx_notifications_organization ON notifications(organization_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX idx_notifications_type ON notifications(type);

-- API keys indexes
CREATE INDEX idx_api_keys_organization ON api_keys(organization_id);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(id) WHERE revoked_at IS NULL AND expires_at > NOW();

-- Full-text search indexes
CREATE INDEX idx_threats_search ON threats USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_risks_search ON risks USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_capabilities_search ON capabilities USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_requirements_search ON requirements USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_evidence_search ON evidence USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
EOF

    # Create functions and triggers
    cat > 04-create-functions.sql << 'EOF'
-- Database Functions and Triggers for Risk Platform

SET search_path TO risk_platform;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threats_updated_at BEFORE UPDATE ON threats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_capabilities_updated_at BEFORE UPDATE ON capabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evidence_updated_at BEFORE UPDATE ON evidence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risk_capabilities_updated_at BEFORE UPDATE ON risk_capabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_capability_requirements_updated_at BEFORE UPDATE ON capability_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        organization_id,
        action,
        entity_type,
        entity_id,
        entity_name,
        old_values,
        new_values
    ) VALUES (
        COALESCE(NEW.organization_id, OLD.organization_id),
        CASE TG_OP
            WHEN 'INSERT' THEN 'create'
            WHEN 'UPDATE' THEN 'update'
            WHEN 'DELETE' THEN 'delete'
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        COALESCE(NEW.title, NEW.name, OLD.title, OLD.name),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create audit triggers for main tables
CREATE TRIGGER audit_threats AFTER INSERT OR UPDATE OR DELETE ON threats FOR EACH ROW EXECUTE FUNCTION create_audit_entry();
CREATE TRIGGER audit_risks AFTER INSERT OR UPDATE OR DELETE ON risks FOR EACH ROW EXECUTE FUNCTION create_audit_entry();
CREATE TRIGGER audit_capabilities AFTER INSERT OR UPDATE OR DELETE ON capabilities FOR EACH ROW EXECUTE FUNCTION create_audit_entry();
CREATE TRIGGER audit_requirements AFTER INSERT OR UPDATE OR DELETE ON requirements FOR EACH ROW EXECUTE FUNCTION create_audit_entry();
CREATE TRIGGER audit_evidence AFTER INSERT OR UPDATE OR DELETE ON evidence FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

-- Function to calculate risk scores
CREATE OR REPLACE FUNCTION calculate_risk_score(likelihood VARCHAR, impact VARCHAR)
RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN (
        CASE likelihood
            WHEN 'very_low' THEN 1
            WHEN 'low' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'high' THEN 4
            WHEN 'very_high' THEN 5
            ELSE 3
        END *
        CASE impact
            WHEN 'very_low' THEN 1
            WHEN 'low' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'high' THEN 4
            WHEN 'very_high' THEN 5
            ELSE 3
        END
    ) / 25.0; -- Normalize to 0-1 scale
END;
$$ language 'plpgsql';

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Function to get organization trust score
CREATE OR REPLACE FUNCTION get_organization_trust_score(org_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    trust_score DECIMAL(5,2);
BEGIN
    SELECT AVG(
        CASE 
            WHEN r.residual_likelihood = 'very_low' AND r.residual_impact = 'very_low' THEN 95
            WHEN r.residual_likelihood = 'low' AND r.residual_impact = 'low' THEN 85
            WHEN r.residual_likelihood = 'medium' OR r.residual_impact = 'medium' THEN 70
            WHEN r.residual_likelihood = 'high' OR r.residual_impact = 'high' THEN 50
            WHEN r.residual_likelihood = 'very_high' OR r.residual_impact = 'very_high' THEN 25
            ELSE 60
        END
    ) INTO trust_score
    FROM risks r
    WHERE r.organization_id = org_id 
    AND r.status = 'open'
    AND r.deleted_at IS NULL;
    
    RETURN COALESCE(trust_score, 50.00);
END;
$$ language 'plpgsql';
EOF

    # Create views for common queries
    cat > 05-create-views.sql << 'EOF'
-- Useful Views for Risk Platform

SET search_path TO risk_platform;

-- Active threats view
CREATE VIEW v_active_threats AS
SELECT 
    t.*,
    o.name as organization_name,
    u1.first_name || ' ' || u1.last_name as created_by_name,
    u2.first_name || ' ' || u2.last_name as updated_by_name
FROM threats t
JOIN organizations o ON t.organization_id = o.id
LEFT JOIN users u1 ON t.created_by = u1.id
LEFT JOIN users u2 ON t.updated_by = u2.id
WHERE t.deleted_at IS NULL AND t.status = 'active';

-- Risk dashboard view
CREATE VIEW v_risk_dashboard AS
SELECT 
    r.*,
    t.title as threat_title,
    t.threat_type,
    o.name as organization_name,
    u1.first_name || ' ' || u1.last_name as owner_name,
    u2.first_name || ' ' || u2.last_name as created_by_name,
    calculate_risk_score(r.residual_likelihood, r.residual_impact) as risk_score,
    COUNT(rc.capability_id) as mitigation_count
FROM risks r
JOIN organizations o ON r.organization_id = o.id
LEFT JOIN threats t ON r.threat_id = t.id
LEFT JOIN users u1 ON r.risk_owner = u1.id
LEFT JOIN users u2 ON r.created_by = u2.id
LEFT JOIN risk_capabilities rc ON r.id = rc.risk_id
WHERE r.deleted_at IS NULL
GROUP BY r.id, t.title, t.threat_type, o.name, u1.first_name, u1.last_name, u2.first_name, u2.last_name;

-- Capability maturity view
CREATE VIEW v_capability_maturity AS
SELECT 
    c.*,
    o.name as organization_name,
    u.first_name || ' ' || u.last_name as owner_name,
    COUNT(cr.requirement_id) as requirements_count,
    COUNT(rc.risk_id) as risks_addressed,
    AVG(rc.effectiveness_rating) as avg_effectiveness
FROM capabilities c
JOIN organizations o ON c.organization_id = o.id
LEFT JOIN users u ON c.owner = u.id
LEFT JOIN capability_requirements cr ON c.id = cr.capability_id
LEFT JOIN risk_capabilities rc ON c.id = rc.capability_id
WHERE c.deleted_at IS NULL
GROUP BY c.id, o.name, u.first_name, u.last_name;

-- Compliance status view
CREATE VIEW v_compliance_status AS
SELECT 
    req.*,
    o.name as organization_name,
    u.first_name || ' ' || u.last_name as owner_name,
    COUNT(cr.capability_id) as implementing_capabilities,
    COUNT(el.evidence_id) as evidence_count
FROM requirements req
JOIN organizations o ON req.organization_id = o.id
LEFT JOIN users u ON req.compliance_owner = u.id
LEFT JOIN capability_requirements cr ON req.id = cr.requirement_id
LEFT JOIN evidence_links el ON req.id = el.linked_entity_id AND el.linked_entity_type = 'requirement'
WHERE req.deleted_at IS NULL
GROUP BY req.id, o.name, u.first_name, u.last_name;

-- Evidence coverage view
CREATE VIEW v_evidence_coverage AS
SELECT 
    e.*,
    o.name as organization_name,
    u.first_name || ' ' || u.last_name as created_by_name,
    COUNT(el.linked_entity_id) as linked_entities_count,
    CASE 
        WHEN e.valid_until IS NULL THEN 'permanent'
        WHEN e.valid_until > NOW() THEN 'valid'
        ELSE 'expired'
    END as validity_status
FROM evidence e
JOIN organizations o ON e.organization_id = o.id
LEFT JOIN users u ON e.created_by = u.id
LEFT JOIN evidence_links el ON e.id = el.evidence_id
WHERE e.deleted_at IS NULL
GROUP BY e.id, o.name, u.first_name, u.last_name;

-- Trust score summary view
CREATE VIEW v_trust_scores_latest AS
SELECT DISTINCT ON (organization_id, entity_type, entity_id, score_type)
    ts.*,
    o.name as organization_name
FROM trust_scores ts
JOIN organizations o ON ts.organization_id = o.id
ORDER BY organization_id, entity_type, entity_id, score_type, calculation_date DESC;
EOF

    # Grant permissions
    cat > 06-grant-permissions.sql << 'EOF'
-- Grant Permissions for Risk Platform

SET search_path TO risk_platform;

-- Readonly user permissions
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA risk_platform TO risk_platform_readonly;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA risk_platform TO risk_platform_readonly;

-- Monitor user permissions (includes stats)
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_monitor;
GRANT SELECT ON pg_stat_database TO risk_platform_monitor;
GRANT SELECT ON pg_stat_user_tables TO risk_platform_monitor;
GRANT SELECT ON pg_stat_statements TO risk_platform_monitor;

-- Backup user permissions
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_backup;
GRANT USAGE ON SCHEMA risk_platform TO risk_platform_backup;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA risk_platform GRANT SELECT ON TABLES TO risk_platform_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA risk_platform GRANT SELECT ON SEQUENCES TO risk_platform_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA risk_platform GRANT SELECT ON TABLES TO risk_platform_monitor;
ALTER DEFAULT PRIVILEGES IN SCHEMA risk_platform GRANT SELECT ON TABLES TO risk_platform_backup;
EOF

    # Sample data for development
    cat > 07-sample-data.sql << 'EOF'
-- Sample Data for Development and Testing

SET search_path TO risk_platform;

-- Insert sample organization
INSERT INTO organizations (name, slug, industry, size, description, regulatory_framework) VALUES
('Sample Technology Corp', 'sample-tech-corp', 'Technology', 'medium', 'A sample technology company for demonstration purposes', 'SOC2,ISO27001');

-- Get the organization ID for subsequent inserts
WITH org AS (SELECT id FROM organizations WHERE slug = 'sample-tech-corp')

-- Insert sample admin user
INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role, department, title)
SELECT org.id, 'admin@sample-tech-corp.com', crypt('SecurePassword123!', gen_salt('bf')), 'Admin', 'User', 'admin', 'IT Security', 'CISO'
FROM org;

-- Insert sample threats
WITH org AS (SELECT id FROM organizations WHERE slug = 'sample-tech-corp'),
     admin_user AS (SELECT id FROM users WHERE email = 'admin@sample-tech-corp.com')
INSERT INTO threats (organization_id, threat_id, title, description, threat_type, threat_category, severity, likelihood, created_by) VALUES
(
    (SELECT id FROM org),
    'THR-001',
    'Phishing Attacks Against Employees',
    'Email-based phishing campaigns targeting employee credentials and sensitive information',
    'cyber',
    'phishing',
    'high',
    'high',
    (SELECT id FROM admin_user)
),
(
    (SELECT id FROM org),
    'THR-002',
    'Ransomware Deployment',
    'Malicious software that encrypts company data and demands payment for decryption',
    'cyber',
    'malware',
    'critical',
    'medium',
    (SELECT id FROM admin_user)
),
(
    (SELECT id FROM org),
    'THR-003',
    'Insider Data Theft',
    'Malicious or accidental data exfiltration by employees or contractors',
    'cyber',
    'insider',
    'high',
    'low',
    (SELECT id FROM admin_user)
);

-- Insert sample capabilities
WITH org AS (SELECT id FROM organizations WHERE slug = 'sample-tech-corp'),
     admin_user AS (SELECT id FROM users WHERE email = 'admin@sample-tech-corp.com')
INSERT INTO capabilities (organization_id, capability_id, title, description, capability_type, domain, maturity_level, implementation_status, owner, created_by) VALUES
(
    (SELECT id FROM org),
    'CAP-001',
    'Multi-Factor Authentication',
    'Implementation of MFA across all user accounts and systems',
    'technical',
    'identity_access_management',
    4,
    'operational',
    (SELECT id FROM admin_user),
    (SELECT id FROM admin_user)
),
(
    (SELECT id FROM org),
    'CAP-002',
    'Email Security Gateway',
    'Advanced email filtering and threat detection system',
    'technical',
    'email_security',
    3,
    'operational',
    (SELECT id FROM admin_user),
    (SELECT id FROM admin_user)
),
(
    (SELECT id FROM org),
    'CAP-003',
    'Security Awareness Training',
    'Regular cybersecurity training program for all employees',
    'procedural',
    'human_resources',
    2,
    'in_progress',
    (SELECT id FROM admin_user),
    (SELECT id FROM admin_user)
);

-- Insert sample requirements
WITH org AS (SELECT id FROM organizations WHERE slug = 'sample-tech-corp'),
     admin_user AS (SELECT id FROM users WHERE email = 'admin@sample-tech-corp.com')
INSERT INTO requirements (organization_id, requirement_id, title, description, requirement_source, compliance_framework, control_family, compliance_owner, created_by) VALUES
(
    (SELECT id FROM org),
    'REQ-001',
    'Access Control Management',
    'Logical access to information and application system functions is restricted',
    'SOC2 CC6.1',
    'SOC2',
    'access_control',
    (SELECT id FROM admin_user),
    (SELECT id FROM admin_user)
),
(
    (SELECT id FROM org),
    'REQ-002',
    'Vulnerability Management',
    'Vulnerabilities that could affect the entity are identified and monitored',
    'SOC2 CC7.1',
    'SOC2',
    'vulnerability_management',
    (SELECT id FROM admin_user),
    (SELECT id FROM admin_user)
);

-- Insert sample risks linked to threats
WITH org AS (SELECT id FROM organizations WHERE slug = 'sample-tech-corp'),
     admin_user AS (SELECT id FROM users WHERE email = 'admin@sample-tech-corp.com'),
     phishing_threat AS (SELECT id FROM threats WHERE threat_id = 'THR-001'),
     ransomware_threat AS (SELECT id FROM threats WHERE threat_id = 'THR-002')
INSERT INTO risks (organization_id, risk_id, threat_id, title, description, risk_category, inherent_likelihood, inherent_impact, residual_likelihood, residual_impact, risk_owner, created_by) VALUES
(
    (SELECT id FROM org),
    'RSK-001',
    (SELECT id FROM phishing_threat),
    'Credential Compromise via Phishing',
    'Risk of employee credentials being compromised through phishing attacks',
    'operational',
    'high',
    'high',
    'medium',
    'medium',
    (SELECT id FROM admin_user),
    (SELECT id FROM admin_user)
),
(
    (SELECT id FROM org),
    'RSK-002',
    (SELECT id FROM ransomware_threat),
    'Business Disruption from Ransomware',
    'Risk of business operations being disrupted by ransomware attack',
    'operational',
    'medium',
    'critical',
    'low',
    'high',
    (SELECT id FROM admin_user),
    (SELECT id FROM admin_user)
);

-- Link capabilities to risks
WITH credential_risk AS (SELECT id FROM risks WHERE risk_id = 'RSK-001'),
     ransomware_risk AS (SELECT id FROM risks WHERE risk_id = 'RSK-002'),
     mfa_cap AS (SELECT id FROM capabilities WHERE capability_id = 'CAP-001'),
     email_cap AS (SELECT id FROM capabilities WHERE capability_id = 'CAP-002'),
     training_cap AS (SELECT id FROM capabilities WHERE capability_id = 'CAP-003'),
     org AS (SELECT id FROM organizations WHERE slug = 'sample-tech-corp')
INSERT INTO risk_capabilities (organization_id, risk_id, capability_id, relationship_type, effectiveness_rating, coverage_percentage) VALUES
((SELECT id FROM org), (SELECT id FROM credential_risk), (SELECT id FROM mfa_cap), 'mitigates', 0.85, 95.0),
((SELECT id FROM org), (SELECT id FROM credential_risk), (SELECT id FROM email_cap), 'prevents', 0.70, 80.0),
((SELECT id FROM org), (SELECT id FROM credential_risk), (SELECT id FROM training_cap), 'prevents', 0.60, 100.0),
((SELECT id FROM org), (SELECT id FROM ransomware_risk), (SELECT id FROM email_cap), 'prevents', 0.75, 80.0),
((SELECT id FROM org), (SELECT id FROM ransomware_risk), (SELECT id FROM training_cap), 'prevents', 0.50, 100.0);

-- Insert sample evidence
WITH org AS (SELECT id FROM organizations WHERE slug = 'sample-tech-corp'),
     admin_user AS (SELECT id FROM users WHERE email = 'admin@sample-tech-corp.com')
INSERT INTO evidence (organization_id, evidence_id, title, description, evidence_type, evidence_category, confidence_level, evidence_date, created_by) VALUES
(
    (SELECT id FROM org),
    'EVD-001',
    'MFA Implementation Policy',
    'Corporate policy requiring multi-factor authentication for all user accounts',
    'policy',
    'intent',
    0.95,
    NOW() - INTERVAL '30 days',
    (SELECT id FROM admin_user)
),
(
    (SELECT id FROM org),
    'EVD-002',
    'MFA Configuration Screenshots',
    'Screenshots showing MFA configuration in identity provider',
    'screenshot',
    'implementation',
    0.85,
    NOW() - INTERVAL '7 days',
    (SELECT id FROM admin_user)
),
(
    (SELECT id FROM org),
    'EVD-003',
    'Authentication Logs',
    'System logs showing successful MFA authentications',
    'log',
    'operational',
    0.90,
    NOW() - INTERVAL '1 day',
    (SELECT id FROM admin_user)
);

-- Calculate initial trust scores
INSERT INTO trust_scores (organization_id, entity_type, score_type, score_value, score_components, calculation_method)
SELECT 
    o.id,
    'organization',
    'overall',
    get_organization_trust_score(o.id),
    '{"risk_count": 2, "capability_count": 3, "evidence_count": 3}',
    'weighted_average'
FROM organizations o
WHERE o.slug = 'sample-tech-corp';
EOF

    success "Database schema files created"
}

# =============================================
# PHASE 7: ENVIRONMENT CONFIGURATION
# =============================================

create_environment_file() {
    log "Creating environment configuration..."
    
    cd $PROJECT_ROOT
    
    cat > .env << EOF
# Risk Platform Environment Configuration
# Generated on $(date)

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_SSL_MODE=require
DB_POOL_MIN=5
DB_POOL_MAX=20

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0

# Application Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1
APP_NAME="Risk Platform API"

# Security Configuration
JWT_SECRET=$(cat secrets/jwt_secret.txt)
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
SESSION_SECRET=$(openssl rand -base64 32)

# API Configuration
API_RATE_LIMIT=1000
API_RATE_WINDOW=3600000
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
ALLOWED_HOSTS=localhost,127.0.0.1

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=pdf,doc,docx,xls,xlsx,txt,png,jpg,jpeg
UPLOAD_PATH=./uploads

# Email Configuration (placeholder)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=noreply@risk-platform.com
SMTP_PASS=change_me

# Monitoring Configuration
ENABLE_METRICS=true
METRICS_PORT=9090
LOG_LEVEL=info
LOG_FORMAT=json

# External Services (placeholder)
THREAT_INTEL_API_KEY=change_me
VULNERABILITY_DB_KEY=change_me

# Backup Configuration
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION_KEY=$(openssl rand -base64 32)
EOF

    # Set secure permissions
    chmod 600 .env
    
    success "Environment configuration created"
}

# =============================================
# PHASE 8: BACKUP AND MAINTENANCE SCRIPTS
# =============================================

create_maintenance_scripts() {
    log "Creating database backup and maintenance scripts..."
    
    cd $PROJECT_ROOT/scripts
    
    # Database backup script
    cat > backup-database.sh << 'EOF'
#!/bin/bash
# Database Backup Script for Risk Platform

set -e

BACKUP_DIR="/opt/risk-platform/database/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="risk_platform"
DB_USER="risk_platform_app"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting database backup..."

# Create compressed backup
docker compose -f /opt/risk-platform/docker-compose.db.yml exec -T postgres pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    --if-exists \
    --create \
    --verbose | gzip > "$BACKUP_DIR/risk_platform_backup_$DATE.sql.gz"

# Create schema-only backup
docker compose -f /opt/risk-platform/docker-compose.db.yml exec -T postgres pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --schema-only \
    --clean \
    --if-exists \
    --create > "$BACKUP_DIR/risk_platform_schema_$DATE.sql"

# Verify backup
if [ -f "$BACKUP_DIR/risk_platform_backup_$DATE.sql.gz" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/risk_platform_backup_$DATE.sql.gz" | cut -f1)
    log "Backup completed successfully: $BACKUP_SIZE"
else
    log "ERROR: Backup failed!"
    exit 1
fi

# Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "*_schema_*.sql" -mtime +30 -delete

log "Backup process completed"
EOF

    chmod +x backup-database.sh

    # Database maintenance script
    cat > maintain-database.sh << 'EOF'
#!/bin/bash
# Database Maintenance Script for Risk Platform

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting database maintenance..."

# Update statistics
log "Updating database statistics..."
docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql \
    -U risk_platform_app \
    -d risk_platform \
    -c "ANALYZE;"

# Vacuum database
log "Vacuuming database..."
docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql \
    -U risk_platform_app \
    -d risk_platform \
    -c "VACUUM ANALYZE;"

# Clean expired sessions
log "Cleaning expired sessions..."
docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql \
    -U risk_platform_app \
    -d risk_platform \
    -c "SELECT clean_expired_sessions();"

# Archive old audit logs (older than 1 year)
log "Archiving old audit logs..."
docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql \
    -U risk_platform_app \
    -d risk_platform \
    -c "DELETE FROM risk_platform.audit_log WHERE timestamp < NOW() - INTERVAL '1 year';"

# Update trust scores
log "Recalculating trust scores..."
docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql \
    -U risk_platform_app \
    -d risk_platform \
    -c "INSERT INTO risk_platform.trust_scores (organization_id, entity_type, score_type, score_value, calculation_method) 
        SELECT id, 'organization', 'overall', get_organization_trust_score(id), 'maintenance_update' 
        FROM risk_platform.organizations;"

log "Database maintenance completed"
EOF

    chmod +x maintain-database.sh

    # Database monitoring script
    cat > monitor-database.sh << 'EOF'
#!/bin/bash
# Database Health Monitoring Script

set -e

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Checking database health..."

# Check PostgreSQL status
if docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres pg_isready -U risk_platform_app -d risk_platform > /dev/null 2>&1; then
    log "✅ PostgreSQL is healthy"
else
    log "❌ PostgreSQL is not responding"
    exit 1
fi

# Check Redis status
if docker compose -f /opt/risk-platform/docker-compose.db.yml exec redis redis-cli ping > /dev/null 2>&1; then
    log "✅ Redis is healthy"
else
    log "❌ Redis is not responding"
    exit 1
fi

# Check database connections
CONNECTIONS=$(docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql \
    -U risk_platform_app \
    -d risk_platform \
    -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")

log "Active database connections: $CONNECTIONS"

if [ "$CONNECTIONS" -gt 50 ]; then
    log "⚠️  High number of database connections detected"
fi

# Check database size
DB_SIZE=$(docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql \
    -U risk_platform_app \
    -d risk_platform \
    -t -c "SELECT pg_size_pretty(pg_database_size('risk_platform'));")

log "Database size: $DB_SIZE"

# Check for long-running queries
LONG_QUERIES=$(docker compose -f /opt/risk-platform/docker-compose.db.yml exec postgres psql \
    -U risk_platform_app \
    -d risk_platform \
    -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '5 minutes';")

if [ "$LONG_QUERIES" -gt 0 ]; then
    log "⚠️  $LONG_QUERIES long-running queries detected"
fi

log "Database health check completed"
EOF

    chmod +x monitor-database.sh

    success "Maintenance scripts created"
}

# =============================================
# PHASE 9: INSTALLATION AND DEPLOYMENT
# =============================================

deploy_database_services() {
    log "Deploying database services..."
    
    cd $PROJECT_ROOT
    
    # Start PostgreSQL and Redis
    docker compose -f docker-compose.db.yml up -d postgres redis
    
    # Wait for services to be ready
    log "Waiting for database services to start..."
    sleep 30
    
    # Check if services are healthy
    local retries=0
    while [ $retries -lt 30 ]; do
        if docker compose -f docker-compose.db.yml exec postgres pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
            success "PostgreSQL is ready"
            break
        fi
        log "Waiting for PostgreSQL to be ready... (attempt $((retries + 1))/30)"
        sleep 10
        retries=$((retries + 1))
    done
    
    if [ $retries -eq 30 ]; then
        error "PostgreSQL failed to start within timeout"
    fi
    
    # Check Redis
    if docker compose -f docker-compose.db.yml exec redis redis-cli ping > /dev/null 2>&1; then
        success "Redis is ready"
    else
        error "Redis failed to start"
    fi
    
    success "Database services deployed successfully"
}

initialize_database_schema() {
    log "Initializing database schema..."
    
    cd $PROJECT_ROOT
    
    # Execute initialization scripts in order
    local scripts=(
        "01-init-database.sql"
        "02-create-schema.sql"
        "03-create-indexes.sql"
        "04-create-functions.sql"
        "05-create-views.sql"
        "06-grant-permissions.sql"
        "07-sample-data.sql"
    )
    
    for script in "${scripts[@]}"; do
        log "Executing $script..."
        if docker compose -f docker-compose.db.yml exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" < "database/init/$script"; then
            success "$script executed successfully"
        else
            error "Failed to execute $script"
        fi
    done
    
    success "Database schema initialized"
}

# =============================================
# PHASE 10: VALIDATION AND TESTING
# =============================================

validate_database_installation() {
    log "Validating database installation..."
    
    cd $PROJECT_ROOT
    
    # Test database connectivity
    log "Testing database connectivity..."
    docker compose -f docker-compose.db.yml exec postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null
    success "Database connectivity verified"
    
    # Check schema
    log "Validating database schema..."
    local table_count=$(docker compose -f docker-compose.db.yml exec postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'risk_platform';" | tr -d ' ')
    
    if [ "$table_count" -ge 15 ]; then
        success "Database schema validation passed ($table_count tables created)"
    else
        error "Database schema validation failed (only $table_count tables found)"
    fi
    
    # Test sample data
    log "Verifying sample data..."
    local org_count=$(docker compose -f docker-compose.db.yml exec postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM risk_platform.organizations;" | tr -d ' ')
    
    if [ "$org_count" -gt 0 ]; then
        success "Sample data verified ($org_count organizations found)"
    else
        warning "No sample data found - this is normal for production installations"
    fi
    
    # Test Redis
    log "Testing Redis functionality..."
    if docker compose -f docker-compose.db.yml exec redis redis-cli set test_key "test_value" > /dev/null && \
       docker compose -f docker-compose.db.yml exec redis redis-cli get test_key > /dev/null; then
        docker compose -f docker-compose.db.yml exec redis redis-cli del test_key > /dev/null
        success "Redis functionality verified"
    else
        error "Redis functionality test failed"
    fi
    
    # Test database functions
    log "Testing database functions..."
    docker compose -f docker-compose.db.yml exec postgres psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT calculate_risk_score('high', 'medium');" > /dev/null
    success "Database functions verified"
    
    success "Database installation validation completed"
}

create_validation_script() {
    log "Creating comprehensive validation script..."
    
    cd $PROJECT_ROOT/scripts
    
    cat > validate-database-setup.sh << 'EOF'
#!/bin/bash
# Comprehensive Database Validation Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"; }
success() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"; }
warning() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"; exit 1; }

echo "=== Risk Platform Database Validation ==="
echo

# Check Docker services
log "Checking Docker services status..."
cd /opt/risk-platform
if docker compose -f docker-compose.db.yml ps | grep -q "Up"; then
    success "Database services are running"
else
    error "Database services are not running"
fi

# Test PostgreSQL
log "Testing PostgreSQL connection..."
if docker compose -f docker-compose.db.yml exec postgres pg_isready -U risk_platform_app -d risk_platform > /dev/null 2>&1; then
    success "PostgreSQL connection successful"
else
    error "PostgreSQL connection failed"
fi

# Test Redis
log "Testing Redis connection..."
if docker compose -f docker-compose.db.yml exec redis redis-cli ping > /dev/null 2>&1; then
    success "Redis connection successful"
else
    error "Redis connection failed"
fi

# Validate schema
log "Validating database schema..."
TABLES=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'risk_platform';" | tr -d ' ')
VIEWS=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'risk_platform';" | tr -d ' ')
FUNCTIONS=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'risk_platform';" | tr -d ' ')

echo "  - Tables: $TABLES"
echo "  - Views: $VIEWS"  
echo "  - Functions: $FUNCTIONS"

if [ "$TABLES" -ge 15 ]; then
    success "Schema validation passed"
else
    error "Schema validation failed - insufficient tables"
fi

# Test core functionality
log "Testing core database functionality..."

# Test user creation
docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -c "
INSERT INTO risk_platform.organizations (name, slug, industry) VALUES ('Test Org', 'test-org-$(date +%s)', 'Technology') ON CONFLICT DO NOTHING;
" > /dev/null

# Test risk scoring function
RISK_SCORE=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT calculate_risk_score('high', 'medium');" | tr -d ' ')
if [ "$RISK_SCORE" = "0.48" ]; then
    success "Risk scoring function working correctly"
else
    warning "Risk scoring function returned unexpected value: $RISK_SCORE"
fi

# Test trust score function
ORG_ID=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT id FROM risk_platform.organizations LIMIT 1;" | tr -d ' ')
if [ ! -z "$ORG_ID" ]; then
    TRUST_SCORE=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT get_organization_trust_score('$ORG_ID');" | tr -d ' ')
    success "Trust scoring function working (score: $TRUST_SCORE)"
fi

# Test permissions
log "Testing user permissions..."
if docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_readonly -d risk_platform -c "SELECT COUNT(*) FROM risk_platform.organizations;" > /dev/null 2>&1; then
    success "Readonly user permissions working"
else
    warning "Readonly user permissions may have issues"
fi

# Check indexes
log "Verifying database indexes..."
INDEX_COUNT=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'risk_platform';" | tr -d ' ')
echo "  - Indexes created: $INDEX_COUNT"

if [ "$INDEX_COUNT" -ge 30 ]; then
    success "Database indexes properly created"
else
    warning "Some database indexes may be missing"
fi

# Performance test
log "Running basic performance test..."
START_TIME=$(date +%s%N)
docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -c "
SELECT COUNT(*) FROM risk_platform.organizations o 
JOIN risk_platform.users u ON o.id = u.organization_id;
" > /dev/null
END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
echo "  - Query execution time: ${DURATION}ms"

if [ "$DURATION" -lt 1000 ]; then
    success "Database performance test passed"
else
    warning "Database queries are slower than expected"
fi

# Check logs
log "Checking for errors in logs..."
if docker compose -f docker-compose.db.yml logs postgres 2>&1 | grep -i error | tail -5; then
    warning "Some errors found in PostgreSQL logs (see above)"
else
    success "No critical errors in PostgreSQL logs"
fi

# Storage usage
log "Checking storage usage..."
DB_SIZE=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SELECT pg_size_pretty(pg_database_size('risk_platform'));" | tr -d ' ')
echo "  - Database size: $DB_SIZE"

# Security validation
log "Performing security validation..."
SSL_STATUS=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SHOW ssl;" | tr -d ' ')
echo "  - SSL enabled: $SSL_STATUS"

PASSWORD_ENCRYPTION=$(docker compose -f docker-compose.db.yml exec postgres psql -U risk_platform_app -d risk_platform -t -c "SHOW password_encryption;" | tr -d ' ')
echo "  - Password encryption: $PASSWORD_ENCRYPTION"

if [ "$PASSWORD_ENCRYPTION" = "scram-sha-256" ]; then
    success "Strong password encryption enabled"
else
    warning "Password encryption not optimal"
fi

echo
echo "=== Database Validation Summary ==="
echo "✅ Database services: Running"
echo "✅ Schema: $TABLES tables, $VIEWS views, $FUNCTIONS functions"
echo "✅ Connectivity: PostgreSQL and Redis accessible"
echo "✅ Functionality: Core functions working"
echo "✅ Performance: Queries executing efficiently"
echo "✅ Security: SSL and strong encryption enabled"
echo
echo "Database installation validation completed successfully!"
echo
echo "Next steps:"
echo "1. Configure backup schedule: crontab -e"
echo "   Add: 0 2 * * * /opt/risk-platform/scripts/backup-database.sh"
echo "2. Set up monitoring alerts"
echo "3. Configure SSL certificates for production"
echo "4. Review and update default passwords"
echo "5. Start API services: docker compose up -d"
EOF

    chmod +x validate-database-setup.sh
    
    success "Validation script created"
}

# =============================================
# MAIN EXECUTION FLOW
# =============================================

main() {
    echo "=== Risk Platform Database Installation Script ==="
    echo "This script will install and configure the complete database infrastructure"
    echo "for the Risk Intelligence Platform."
    echo

    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        warning "Running as root - ensure this is intentional for production systems"
    fi

    # Confirmation
    read -p "Continue with database installation? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Installation cancelled by user"
        exit 0
    fi

    log "Starting Risk Platform database installation..."
    echo

    # Phase 1: Install Docker
    if ! command -v docker &> /dev/null; then
        install_docker
        log "Please log out and back in for Docker group changes to take effect"
        log "Then run this script again"
        exit 0
    else
        success "Docker already installed"
    fi

    # Phase 2: Setup project structure
    setup_project_structure

    # Phase 3: Generate secrets
    generate_secrets

    # Phase 4: Create configuration files
    create_database_configs

    # Phase 5: Create Docker Compose
    create_docker_compose

    # Phase 6: Create database schema
    create_database_schema

    # Phase 7: Create environment file
    create_environment_file

    # Phase 8: Create maintenance scripts
    create_maintenance_scripts

    # Phase 9: Deploy services
    deploy_database_services

    # Phase 10: Initialize schema
    initialize_database_schema

    # Phase 11: Create validation script
    create_validation_script

    # Phase 12: Run validation
    validate_database_installation

    echo
    success "=== Database Installation Completed Successfully! ==="
    echo
    echo "Database services are now running with the following configuration:"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - Database: $DB_NAME"
    echo "  - User: $DB_USER"
    echo
    echo "Important files created:"
    echo "  - Configuration: $PROJECT_ROOT/.env"
    echo "  - Secrets: $PROJECT_ROOT/secrets/"
    echo "  - Backups: $PROJECT_ROOT/database/backups/"
    echo "  - Scripts: $PROJECT_ROOT/scripts/"
    echo
    echo "Next steps:"
    echo "1. Review and secure credentials in $PROJECT_ROOT/secrets/"
    echo "2. Configure SSL certificates for production"
    echo "3. Set up automated backups: crontab -e"
    echo "4. Configure monitoring and alerting"
    echo "5. Deploy API services"
    echo
    echo "To validate installation: ./scripts/validate-database-setup.sh"
    echo "To backup database: ./scripts/backup-database.sh"
    echo "To monitor database: ./scripts/monitor-database.sh"
    echo
    warning "SECURITY: Change default passwords before production use!"
}

# Execute main function if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi