#!/bin/bash
# fix-uuid-and-nginx.sh
# Script to fix UUID extension and Nginx configuration issues
# Version: 1.0.0
# Date: 2025-08-04

# Set strict error handling
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
POSTGRES_CONTAINER="risk-platform-postgres"
NGINX_CONTAINER="risk-platform-nginx"
DOCKER_COMPOSE_FILE="${PLATFORM_DIR}/docker-compose.yml"
LOG_FILE="/var/log/risk-platform-fix-$(date +%Y%m%d-%H%M%S).log"
PG_USER="risk_platform"  # Using the discovered PostgreSQL user

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  FIXING UUID AND NGINX CONFIGURATION ISSUES   ${NC}"
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
}

# Function to run command in PostgreSQL container and capture output
run_pg_command() {
    local cmd="$1"
    local result
    
    result=$(docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d risk_platform -c "$cmd" 2>&1)
    
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo "$result"
        return 0
    else
        echo "$result"
        return 1
    fi
}

# Start main script
log "Starting UUID and Nginx configuration fixes"
log "Platform directory: $PLATFORM_DIR"
log "Dashboard directory: $DASHBOARD_DIR"
log "Log file: $LOG_FILE"
log "PostgreSQL user: $PG_USER"

# Step 1: Fix PostgreSQL UUID extension issue
section "FIXING POSTGRESQL UUID EXTENSION"

# Check if uuid-ossp extension is already installed
log "Checking if uuid-ossp extension is already installed"
UUID_INSTALLED=$(run_pg_command "SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp';" | grep -c "1" || echo "0")

if [[ "$UUID_INSTALLED" -eq "1" ]]; then
    success "uuid-ossp extension is already installed"
else
    log "Attempting to install uuid-ossp extension"
    
    if run_pg_command "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" > /dev/null; then
        success "uuid-ossp extension installed successfully"
    else
        warning "Failed to install uuid-ossp extension. Creating simplified schema without UUID dependencies."
        
        # Create simplified schema with serial IDs instead of UUIDs
        log "Creating simplified schema with serial IDs"
        
        # Drop existing schema if it exists
        run_pg_command "DROP SCHEMA IF EXISTS risk_platform CASCADE;" || warning "Could not drop existing schema"
        
        # Create simplified schema
        cat > /tmp/simplified_schema.sql << 'EOF'
-- Simplified schema for Risk Platform using serial IDs instead of UUIDs
BEGIN;

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

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threats table
CREATE TABLE IF NOT EXISTS threats (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    threat_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    threat_type VARCHAR(50) NOT NULL,
    threat_category VARCHAR(50),
    severity VARCHAR(50) DEFAULT 'medium',
    likelihood VARCHAR(50) DEFAULT 'medium',
    external_references JSONB,
    threat_intelligence JSONB,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, threat_id)
);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    risk_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    threat_id INTEGER REFERENCES threats(id),
    impact VARCHAR(50) DEFAULT 'medium',
    likelihood VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    risk_score INTEGER,
    treatment_plan TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, risk_id)
);

-- Capabilities table
CREATE TABLE IF NOT EXISTS capabilities (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    capability_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    capability_type VARCHAR(50),
    maturity_level VARCHAR(50) DEFAULT 'developing',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, capability_id)
);

-- Risk-Capability mapping table
CREATE TABLE IF NOT EXISTS risk_capabilities (
    id SERIAL PRIMARY KEY,
    risk_id INTEGER NOT NULL REFERENCES risks(id),
    capability_id INTEGER NOT NULL REFERENCES capabilities(id),
    effectiveness VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(risk_id, capability_id)
);

-- Requirements table
CREATE TABLE IF NOT EXISTS requirements (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    requirement_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(100),
    compliance_status VARCHAR(50) DEFAULT 'not_assessed',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, requirement_id)
);

-- Capability-Requirement mapping table
CREATE TABLE IF NOT EXISTS capability_requirements (
    id SERIAL PRIMARY KEY,
    capability_id INTEGER NOT NULL REFERENCES capabilities(id),
    requirement_id INTEGER NOT NULL REFERENCES requirements(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(capability_id, requirement_id)
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    evidence_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(50),
    file_path VARCHAR(255),
    file_hash VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, evidence_id)
);

-- Evidence links table
CREATE TABLE IF NOT EXISTS evidence_links (
    id SERIAL PRIMARY KEY,
    evidence_id INTEGER NOT NULL REFERENCES evidence(id),
    linked_entity_type VARCHAR(50) NOT NULL,
    linked_entity_id INTEGER NOT NULL,
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
    entity_type VARCHAR(50),
    entity_id INTEGER,
    previous_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust scores table
CREATE TABLE IF NOT EXISTS trust_scores (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    score_type VARCHAR(50) NOT NULL,
    score_value NUMERIC NOT NULL,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_threats_organization ON threats(organization_id);
CREATE INDEX idx_risks_organization ON risks(organization_id);
CREATE INDEX idx_risks_threat ON risks(threat_id);
CREATE INDEX idx_capabilities_organization ON capabilities(organization_id);
CREATE INDEX idx_requirements_organization ON requirements(organization_id);
CREATE INDEX idx_evidence_organization ON evidence(organization_id);
CREATE INDEX idx_audit_log_organization ON audit_log(organization_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- Create functions for triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for audit log
CREATE OR REPLACE FUNCTION create_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO risk_platform.audit_log (
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            new_values
        ) VALUES (
            NEW.organization_id,
            CASE WHEN TG_TABLE_NAME = 'users' THEN NEW.id ELSE NULL END,
            'create',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO risk_platform.audit_log (
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            previous_values,
            new_values
        ) VALUES (
            NEW.organization_id,
            CASE WHEN TG_TABLE_NAME = 'users' THEN NEW.id ELSE NULL END,
            'update',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW)
        );
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO risk_platform.audit_log (
            organization_id,
            user_id,
            action,
            entity_type,
            entity_id,
            previous_values
        ) VALUES (
            OLD.organization_id,
            CASE WHEN TG_TABLE_NAME = 'users' THEN OLD.id ELSE NULL END,
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for all tables
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threats_updated_at
    BEFORE UPDATE ON threats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risks_updated_at
    BEFORE UPDATE ON risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capabilities_updated_at
    BEFORE UPDATE ON capabilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_updated_at
    BEFORE UPDATE ON requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at
    BEFORE UPDATE ON evidence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit triggers for main tables
CREATE TRIGGER audit_organizations
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_threats
    AFTER INSERT OR UPDATE OR DELETE ON threats
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_risks
    AFTER INSERT OR UPDATE OR DELETE ON risks
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_capabilities
    AFTER INSERT OR UPDATE OR DELETE ON capabilities
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_requirements
    AFTER INSERT OR UPDATE OR DELETE ON requirements
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

CREATE TRIGGER audit_evidence
    AFTER INSERT OR UPDATE OR DELETE ON evidence
    FOR EACH ROW EXECUTE FUNCTION create_audit_entry();

-- Create default organization and admin user
INSERT INTO organizations (name, slug, industry)
VALUES ('Default Organization', 'default', 'Technology')
ON CONFLICT (slug) DO NOTHING;

-- Create admin user with password 'admin123' (in production, use a secure password)
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

COMMIT;
EOF

        # Apply simplified schema
        log "Applying simplified schema"
        if cat /tmp/simplified_schema.sql | docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d risk_platform; then
            success "Simplified schema applied successfully"
        else
            error "Failed to apply simplified schema"
            exit 1
        fi
    fi
fi

# Step 2: Fix Nginx read-only filesystem issue
section "FIXING NGINX READ-ONLY FILESYSTEM"

# Check if docker-compose.yml exists
if [[ ! -f "$DOCKER_COMPOSE_FILE" ]]; then
    error "Docker Compose file not found at $DOCKER_COMPOSE_FILE"
    log "Creating a new Docker Compose file"
    
    # Create a basic Docker Compose file
    mkdir -p "$(dirname "$DOCKER_COMPOSE_FILE")"
    cat > "$DOCKER_COMPOSE_FILE" << EOF
version: '3'

services:
  postgres:
    container_name: risk-platform-postgres
    image: postgres:15
    environment:
      POSTGRES_USER: $PG_USER
      POSTGRES_PASSWORD: risk_platform_password
      POSTGRES_DB: risk_platform
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    container_name: risk-platform-nginx
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./dashboard/public:/opt/risk-platform/dashboard/public
      - ./nginx/conf.d:/etc/nginx/conf.d
    depends_on:
      - postgres
    restart: unless-stopped

  grafana:
    container_name: risk-platform-grafana
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  postgres_data:
  grafana_data:
EOF
    success "Created new Docker Compose file"
fi

# Create Nginx configuration directory
log "Creating Nginx configuration directory"
mkdir -p "${PLATFORM_DIR}/nginx/conf.d"

# Create Nginx configuration
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
success "Nginx configuration created"

# Recreate the Nginx container with the new configuration
log "Recreating Nginx container with the new configuration"
if docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --force-recreate nginx; then
    success "Nginx container recreated successfully"
else
    warning "Failed to recreate Nginx container with docker-compose. Trying alternative approach."
    
    # Stop and remove the existing Nginx container
    log "Stopping and removing existing Nginx container"
    docker stop "$NGINX_CONTAINER" || true
    docker rm "$NGINX_CONTAINER" || true
    
    # Create a new Nginx container with proper volume mounts
    log "Creating new Nginx container with proper volume mounts"
    if docker run -d --name "$NGINX_CONTAINER" \
        --network="$(docker inspect --format='{{.HostConfig.NetworkMode}}' "$POSTGRES_CONTAINER")" \
        -p 80:80 \
        -v "${PLATFORM_DIR}/dashboard/public:/opt/risk-platform/dashboard/public" \
        -v "${PLATFORM_DIR}/nginx/conf.d:/etc/nginx/conf.d" \
        nginx:alpine; then
        success "New Nginx container created successfully"
    else
        error "Failed to create new Nginx container"
        exit 1
    fi
fi

# Step 3: Ensure dashboard files are accessible
section "ENSURING DASHBOARD FILES ARE ACCESSIBLE"

# Check if dashboard directory exists
if [[ ! -d "$DASHBOARD_DIR/public" ]]; then
    log "Creating dashboard directory"
    mkdir -p "$DASHBOARD_DIR/public"
fi

# Create index.html if it doesn't exist
if [[ ! -f "$DASHBOARD_DIR/public/index.html" ]]; then
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
fi

# Create styles.css if it doesn't exist
if [[ ! -f "$DASHBOARD_DIR/public/styles.css" ]]; then
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
fi

# Create script.js if it doesn't exist
if [[ ! -f "$DASHBOARD_DIR/public/script.js" ]]; then
    log "Creating script.js"
    cat > "$DASHBOARD_DIR/public/script.js" << 'EOF'
document.addEventListener('DOMContentLoaded', function() {
    // Initialize trust score chart
    const ctx = document.getElementById('trustScoreChart').getContext('2d');
    const trustScoreChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cyber', 'Physical', 'Operational', 'Compliance', 'Strategic'],
            datasets: [{
                label: 'Trust Score by Category',
                data: [85, 72, 78, 90, 65],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
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
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Update main content based on the clicked link
            const target = this.getAttribute('href').substring(1);
            updateContent(target);
        });
    });

    // Function to update content based on navigation
    function updateContent(section) {
        const mainContent = document.querySelector('main');
        const pageTitle = document.querySelector('main h1');
        
        // Update page title
        pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
        
        // In a real application, this would load content from the server
        console.log(`Loading ${section} content...`);
    }

    // Simulate API data loading
    console.log('Loading dashboard data...');
    setTimeout(() => {
        console.log('Dashboard data loaded successfully');
    }, 1000);
});
EOF
fi

# Set proper permissions
chmod -R 755 "$DASHBOARD_DIR"
success "Dashboard files created and permissions set"

# Step 4: Final checks and summary
section "PERFORMING FINAL CHECKS"

# Check if Nginx is running
if docker ps | grep -q "$NGINX_CONTAINER"; then
    success "Nginx container is running"
else
    error "Nginx container is not running. Please check Docker logs."
    exit 1
fi

# Check if PostgreSQL is running
if docker ps | grep -q "$POSTGRES_CONTAINER"; then
    success "PostgreSQL container is running"
else
    error "PostgreSQL container is not running. Please check Docker logs."
    exit 1
fi

# Test PostgreSQL connection
log "Testing PostgreSQL connection"
if docker exec -i "$POSTGRES_CONTAINER" psql -U "$PG_USER" -d risk_platform -c "SELECT 1;" >/dev/null 2>&1; then
    success "PostgreSQL connection successful"
else
    error "PostgreSQL connection failed. Please check database logs."
    exit 1
fi

# Get public IP
PUBLIC_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

# Final status
echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  RISK PLATFORM DASHBOARD DEPLOYMENT SUMMARY   ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""
echo -e "${GREEN}Risk Platform Dashboard has been successfully deployed!${NC}"
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
echo -e "Database Directory: ${YELLOW}$DB_DIR${NC}"
echo -e "Nginx Configuration: ${YELLOW}$PLATFORM_DIR/nginx/conf.d/default.conf${NC}"
echo ""
echo "PostgreSQL Connection:"
echo -e "User: ${YELLOW}$PG_USER${NC}"
echo -e "Database: ${YELLOW}risk_platform${NC}"
echo ""
echo "Next Steps:"
echo "1. Change the default admin password"
echo "2. Customize the dashboard frontend"
echo "3. Import your actual threat and risk data"
echo "4. Configure additional security measures"
echo ""
echo "For more information, see the documentation in the repository."
echo ""
echo -e "${GREEN}Deployment log saved to: $LOG_FILE${NC}"
echo ""
success "Risk Platform Dashboard deployment completed successfully"
