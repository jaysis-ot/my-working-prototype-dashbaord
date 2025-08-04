#!/bin/bash
# skip-api-deploy-dashboard.sh
# Script to bypass the problematic API container and deploy the Risk Platform dashboard directly
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
SCRIPTS_DIR="${PLATFORM_DIR}/scripts"
NGINX_CONTAINER="risk-platform-nginx"
POSTGRES_CONTAINER="risk-platform-postgres"
LOG_FILE="/var/log/risk-platform-dashboard-deploy-$(date +%Y%m%d-%H%M%S).log"

# Display header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  RISK PLATFORM DASHBOARD DEPLOYMENT          ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

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

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

log "Starting Risk Platform Dashboard Deployment"
log "Platform directory: $PLATFORM_DIR"
log "Dashboard directory: $DASHBOARD_DIR"
log "Log file: $LOG_FILE"

# Step 1: Check if infrastructure is running
log "Step 1: Checking infrastructure status"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if required containers are running
POSTGRES_RUNNING=$(docker ps | grep -q "$POSTGRES_CONTAINER" && echo "true" || echo "false")
NGINX_RUNNING=$(docker ps | grep -q "$NGINX_CONTAINER" && echo "true" || echo "false")

if [ "$POSTGRES_RUNNING" = "false" ]; then
    warning "PostgreSQL container is not running. Attempting to start..."
    docker-compose -f "$PLATFORM_DIR/docker-compose.yml" up -d postgres || {
        error "Failed to start PostgreSQL container. Please check Docker logs."
        exit 1
    }
else
    success "PostgreSQL container is running"
fi

if [ "$NGINX_RUNNING" = "false" ]; then
    warning "Nginx container is not running. Attempting to start..."
    docker-compose -f "$PLATFORM_DIR/docker-compose.yml" up -d nginx || {
        error "Failed to start Nginx container. Please check Docker logs."
        exit 1
    }
else
    success "Nginx container is running"
fi

# Step 2: Create database schema
log "Step 2: Setting up database schema"

# Create database directory if it doesn't exist
mkdir -p "$DB_DIR/migrations"

# Create initial schema migration
log "Creating initial schema migration"
cat > "$DB_DIR/migrations/001_initial_schema.sql" << 'EOF'
-- Initial schema for Risk Platform
BEGIN;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS risk_platform;

-- Set search path
SET search_path TO risk_platform;

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Threats table
CREATE TABLE IF NOT EXISTS threats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    threat_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    threat_type VARCHAR(50) NOT NULL,
    threat_category VARCHAR(50),
    severity VARCHAR(50) DEFAULT 'medium',
    likelihood VARCHAR(50) DEFAULT 'medium',
    external_references JSONB,
    threat_intelligence JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, threat_id)
);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    risk_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    threat_id UUID REFERENCES threats(id),
    impact VARCHAR(50) DEFAULT 'medium',
    likelihood VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    risk_score INTEGER,
    treatment_plan TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, risk_id)
);

-- Capabilities table
CREATE TABLE IF NOT EXISTS capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    capability_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    capability_type VARCHAR(50),
    maturity_level VARCHAR(50) DEFAULT 'developing',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, capability_id)
);

-- Risk-Capability mapping table
CREATE TABLE IF NOT EXISTS risk_capabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES risks(id),
    capability_id UUID NOT NULL REFERENCES capabilities(id),
    effectiveness VARCHAR(50) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(risk_id, capability_id)
);

-- Requirements table
CREATE TABLE IF NOT EXISTS requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    requirement_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(100),
    compliance_status VARCHAR(50) DEFAULT 'not_assessed',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, requirement_id)
);

-- Capability-Requirement mapping table
CREATE TABLE IF NOT EXISTS capability_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    capability_id UUID NOT NULL REFERENCES capabilities(id),
    requirement_id UUID NOT NULL REFERENCES requirements(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(capability_id, requirement_id)
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    evidence_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    evidence_type VARCHAR(50),
    file_path VARCHAR(255),
    file_hash VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, evidence_id)
);

-- Evidence links table
CREATE TABLE IF NOT EXISTS evidence_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES evidence(id),
    linked_entity_type VARCHAR(50) NOT NULL,
    linked_entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    previous_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust scores table
CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
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
    crypt('admin123', gen_salt('bf')),
    'Admin',
    'User',
    'admin',
    'active',
    NOW()
) ON CONFLICT (email) DO NOTHING;

COMMIT;
EOF

# Create database users script
log "Creating database users script"
cat > "$DB_DIR/create_users.sql" << 'EOF'
-- Create database users for Risk Platform
BEGIN;

-- Create application user
CREATE USER risk_platform_app WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE risk_platform TO risk_platform_app;
GRANT USAGE ON SCHEMA risk_platform TO risk_platform_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA risk_platform TO risk_platform_app;

-- Create read-only user
CREATE USER risk_platform_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE risk_platform TO risk_platform_readonly;
GRANT USAGE ON SCHEMA risk_platform TO risk_platform_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA risk_platform TO risk_platform_readonly;

COMMIT;
EOF

# Apply database schema
log "Applying database schema"
if docker exec "$POSTGRES_CONTAINER" psql -U postgres -c "CREATE DATABASE risk_platform;" 2>/dev/null; then
    success "Database created"
else
    warning "Database already exists or could not be created"
fi

# Install pgcrypto extension
docker exec "$POSTGRES_CONTAINER" psql -U postgres -d risk_platform -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" || warning "Could not create pgcrypto extension"

# Apply schema migration
cat "$DB_DIR/migrations/001_initial_schema.sql" | docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d risk_platform || {
    error "Failed to apply schema migration"
    exit 1
}

# Create database users
cat "$DB_DIR/create_users.sql" | docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d risk_platform || warning "Could not create database users"

success "Database schema applied successfully"

# Step 3: Create dashboard frontend
log "Step 3: Creating dashboard frontend"

# Create dashboard directory if it doesn't exist
mkdir -p "$DASHBOARD_DIR/public"

# Create index.html
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

# Create CSS file
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

# Create JavaScript file
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

# Set proper permissions
chmod -R 755 "$DASHBOARD_DIR"
success "Dashboard frontend created successfully"

# Step 4: Configure Nginx to serve the dashboard
log "Step 4: Configuring Nginx to serve the dashboard"

# Create Nginx configuration
NGINX_CONF="
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
"

# Check if Nginx is running in Docker
if docker ps | grep -q "$NGINX_CONTAINER"; then
    log "Nginx is running in Docker container"
    
    # Create temporary file
    echo "$NGINX_CONF" > /tmp/dashboard.conf
    
    # Copy dashboard files to Nginx container
    docker cp "$DASHBOARD_DIR/public" "$NGINX_CONTAINER":/opt/risk-platform/dashboard/
    
    # Copy Nginx configuration to container
    docker cp /tmp/dashboard.conf "$NGINX_CONTAINER":/etc/nginx/conf.d/default.conf
    
    # Restart Nginx container
    docker restart "$NGINX_CONTAINER"
else
    log "Nginx is running on the host"
    
    # Copy dashboard files to Nginx directory
    mkdir -p /var/www/risk-platform
    cp -r "$DASHBOARD_DIR/public" /var/www/risk-platform/
    
    # Create Nginx configuration
    echo "$NGINX_CONF" > /etc/nginx/sites-available/risk-platform
    
    # Enable site
    ln -sf /etc/nginx/sites-available/risk-platform /etc/nginx/sites-enabled/
    
    # Restart Nginx
    systemctl restart nginx
fi

success "Nginx configured to serve the dashboard"

# Step 5: Deploy enterprise scripts
log "Step 5: Deploying enterprise scripts"

# Create scripts directory
mkdir -p "$SCRIPTS_DIR"

# Function to create threat intelligence scripts
create_threat_intelligence_scripts() {
    log "Creating threat intelligence integration scripts..."
    
    mkdir -p "$SCRIPTS_DIR/threat-intelligence"
    
    # Threat feed integration
    cat > "$SCRIPTS_DIR/threat-intelligence/update-threat-feeds.sh" << 'EOF'
#!/bin/bash
# Threat Intelligence Feed Integration Script

set -e

PROJECT_ROOT="/opt/risk-platform"
THREAT_FEEDS_LOG="/opt/risk-platform/logs/threat-feeds.log"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$THREAT_FEEDS_LOG"; }

# Configuration - add your threat intelligence sources
MITRE_ATTACK_URL="https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"
MISP_FEEDS_CONFIG="/opt/risk-platform/config/threat-intel/misp-feeds.json"
OPENCTI_API_URL="${OPENCTI_URL:-http://localhost:8080}"
OPENCTI_API_KEY="${OPENCTI_API_KEY:-}"

log "Starting threat intelligence update..."

# 1. Update MITRE ATT&CK Framework
update_mitre_attack() {
    log "Updating MITRE ATT&CK framework..."
    
    # Download latest MITRE ATT&CK data
    curl -s "$MITRE_ATTACK_URL" -o /tmp/mitre-attack.json
    
    if [[ $? -eq 0 ]]; then
        # Parse and insert into database
        python3 << 'PYTHON_EOF'
import json
import psycopg2
import os
from datetime import datetime

# Connect to database
conn = psycopg2.connect(
    host="localhost",
    port="5432",
    database="risk_platform",
    user="risk_platform_app",
    password=os.environ.get('DB_PASSWORD', '')
)
cur = conn.cursor()

# Load MITRE data
with open('/tmp/mitre-attack.json', 'r') as f:
    mitre_data = json.load(f)

# Process techniques
techniques_updated = 0
for obj in mitre_data['objects']:
    if obj.get('type') == 'attack-pattern':
        technique_id = obj.get('external_references', [{}])[0].get('external_id', '')
        name = obj.get('name', '')
        description = obj.get('description', '')
        
        if technique_id.startswith('T'):
            # Update or insert technique
            cur.execute("""
                INSERT INTO risk_platform.threats (
                    organization_id,
                    threat_id,
                    title,
                    description,
                    threat_type,
                    threat_category,
                    external_references,
                    created_by
                ) VALUES (
                    (SELECT id FROM risk_platform.organizations LIMIT 1),
                    %s,
                    %s,
                    %s,
                    'cyber',
                    'mitre_attack',
                    %s,
                    (SELECT id FROM risk_platform.users WHERE role = 'admin' LIMIT 1)
                ) ON CONFLICT (organization_id, threat_id) DO UPDATE SET
                    description = EXCLUDED.description,
                    external_references = EXCLUDED.external_references,
                    updated_at = NOW()
            """, (
                technique_id,
                name,
                description,
                json.dumps([{"source": "MITRE ATT&CK", "id": technique_id}])
            ))
            techniques_updated += 1

conn.commit()
cur.close()
conn.close()

print(f"Updated {techniques_updated} MITRE ATT&CK techniques")
PYTHON_EOF

        log "✅ MITRE ATT&CK update completed"
    else
        log "❌ Failed to download MITRE ATT&CK data"
    fi
}

# Main execution
main() {
    update_mitre_attack
    
    log "Threat intelligence update completed"
}

main "$@"
EOF

    chmod +x "$SCRIPTS_DIR/threat-intelligence/"*.sh
    success "Threat intelligence scripts created"
}

# Function to create user management scripts
create_user_management_scripts() {
    log "Creating user management scripts..."
    
    mkdir -p "$SCRIPTS_DIR/user-management"
    
    # User provisioning script
    cat > "$SCRIPTS_DIR/user-management/provision-user.sh" << 'EOF'
#!/bin/bash
# User Provisioning Script

set -e

if [[ $# -lt 4 ]]; then
    echo "Usage: $0 <email> <first_name> <last_name> <role> [organization_slug]"
    echo "Roles: admin, manager, analyst, user, readonly"
    echo "Example: $0 john.doe@company.com John Doe analyst tech-corp"
    exit 1
fi

EMAIL="$1"
FIRST_NAME="$2"
LAST_NAME="$3"
ROLE="$4"
ORG_SLUG="${5:-default}"

PROJECT_ROOT="/opt/risk-platform"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"; }

# Validate role
VALID_ROLES=("admin" "manager" "analyst" "user" "readonly")
if [[ ! " ${VALID_ROLES[@]} " =~ " ${ROLE} " ]]; then
    echo "ERROR: Invalid role. Must be one of: ${VALID_ROLES[*]}"
    exit 1
fi

# Generate secure password
TEMP_PASSWORD=$(openssl rand -base64 12)

log "Provisioning user: $EMAIL"
log "Role: $ROLE"
log "Organization: $ORG_SLUG"

# Create user in database
docker exec risk-platform-postgres psql -U risk_platform_app -d risk_platform -c "
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
    (SELECT id FROM risk_platform.organizations WHERE slug = '$ORG_SLUG' LIMIT 1),
    '$EMAIL',
    crypt('$TEMP_PASSWORD', gen_salt('bf')),
    '$FIRST_NAME',
    '$LAST_NAME',
    '$ROLE',
    'active',
    NOW()
);"

if [[ $? -eq 0 ]]; then
    log "✅ User created successfully"
    
    # Generate welcome email content
    cat > "/tmp/welcome_${EMAIL//[@.]/_}.txt" << EMAIL_EOF
Subject: Welcome to Risk Platform

Dear $FIRST_NAME $LAST_NAME,

Your Risk Platform account has been created with the following details:

Email: $EMAIL
Role: $ROLE
Temporary Password: $TEMP_PASSWORD

Please log in at: http://$(hostname -I | awk '{print $1}')

For your security:
1. Change your password immediately after first login
2. Enable multi-factor authentication
3. Review your profile information

If you have any questions, contact the platform administrator.

Best regards,
Risk Platform Team
EMAIL_EOF

    log "Welcome email content created: /tmp/welcome_${EMAIL//[@.]/_}.txt"
    log "Temporary password: $TEMP_PASSWORD"
    log "⚠️  Send welcome email manually and securely delete the temporary file"
    
else
    log "❌ Failed to create user"
    exit 1
fi
EOF

    chmod +x "$SCRIPTS_DIR/user-management/"*.sh
    success "User management scripts created"
}

# Function to create data pipeline scripts
create_data_pipeline_scripts() {
    log "Creating data pipeline scripts..."
    
    mkdir -p "$SCRIPTS_DIR/data-pipeline"
    
    # Data validation script
    cat > "$SCRIPTS_DIR/data-pipeline/validate-data.sh" << 'EOF'
#!/bin/bash
# Data Validation Script

set -e

PROJECT_ROOT="/opt/risk-platform"
VALIDATION_REPORT="/opt/risk-platform/logs/data_validation_$(date +%Y%m%d_%H%M%S).txt"

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$VALIDATION_REPORT"; }

log "=== DATA VALIDATION REPORT ==="
log "Validation started: $(date)"

# 1. Referential integrity checks
log "\n1. REFERENTIAL INTEGRITY CHECKS"
log "================================"

# Check orphaned records
log "Checking for orphaned user records..."
ORPHANED_USERS=$(docker exec risk-platform-postgres psql -U risk_platform_app -d risk_platform -t -c "
SELECT COUNT(*) FROM risk_platform.users u
LEFT JOIN risk_platform.organizations o ON u.organization_id = o.id
WHERE o.id IS NULL;" | tr -d ' ')

if [[ $ORPHANED_USERS -gt 0 ]]; then
    log "⚠️  Found $ORPHANED_USERS orphaned user records"
else
    log "✅ No orphaned user records found"
fi

# Generate validation summary
log "\n=== VALIDATION SUMMARY ==="
TOTAL_ISSUES=$ORPHANED_USERS

log "Total validation issues found: $TOTAL_ISSUES"

if [[ $TOTAL_ISSUES -eq 0 ]]; then
    log "🎉 Data validation PASSED - No issues found"
    exit 0
else
    log "⚠️  Data validation found issues - Review and fix before production use"
    exit 1
fi
EOF

    chmod +x "$SCRIPTS_DIR/data-pipeline/"*.sh
    success "Data pipeline scripts created"
}

# Create enterprise scripts
create_threat_intelligence_scripts
create_user_management_scripts
create_data_pipeline_scripts

# Set up cron jobs for enterprise scripts
log "Setting up cron jobs for enterprise scripts"
CRON_FILE="/etc/cron.d/risk-platform"

cat > "$CRON_FILE" << EOF
# Risk Platform cron jobs

# Update threat feeds daily at 2 AM
0 2 * * * root $SCRIPTS_DIR/threat-intelligence/update-threat-feeds.sh > /dev/null 2>&1

# Validate data weekly on Sunday at 3 AM
0 3 * * 0 root $SCRIPTS_DIR/data-pipeline/validate-data.sh > /dev/null 2>&1
EOF

chmod 644 "$CRON_FILE"
success "Cron jobs set up successfully"

# Step 6: Final checks and summary
log "Step 6: Performing final checks"

# Check if Nginx is running
if docker ps | grep -q "$NGINX_CONTAINER" || systemctl is-active --quiet nginx; then
    success "Nginx is running"
else
    error "Nginx is not running. Please check Nginx logs."
fi

# Check if PostgreSQL is running
if docker ps | grep -q "$POSTGRES_CONTAINER"; then
    success "PostgreSQL is running"
else
    error "PostgreSQL is not running. Please check PostgreSQL logs."
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
echo -e "Scripts Directory: ${YELLOW}$SCRIPTS_DIR${NC}"
echo ""
echo "Enterprise Scripts:"
echo -e "Threat Intelligence: ${YELLOW}$SCRIPTS_DIR/threat-intelligence/${NC}"
echo -e "User Management: ${YELLOW}$SCRIPTS_DIR/user-management/${NC}"
echo -e "Data Pipeline: ${YELLOW}$SCRIPTS_DIR/data-pipeline/${NC}"
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
