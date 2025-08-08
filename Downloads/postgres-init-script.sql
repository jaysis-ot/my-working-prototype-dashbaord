-- Trust Platform Database Initialization Script
-- This creates the initial schema structure for the platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas for logical separation
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS risk;
CREATE SCHEMA IF NOT EXISTS evidence;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS reporting;

-- Set search path
SET search_path TO core, risk, evidence, audit, reporting, public;

-- Create enum types for consistency
CREATE TYPE core.status AS ENUM ('active', 'inactive', 'pending', 'archived');
CREATE TYPE risk.severity AS ENUM ('critical', 'high', 'medium', 'low', 'informational');
CREATE TYPE risk.likelihood AS ENUM ('certain', 'likely', 'possible', 'unlikely', 'rare');
CREATE TYPE evidence.artifact_type AS ENUM ('policy', 'configuration', 'log', 'audit', 'test', 'review');

-- Core Organizations table
CREATE TABLE IF NOT EXISTS core.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status core.status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Audit log table (for compliance and traceability)
CREATE TABLE IF NOT EXISTS audit.audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_id UUID,
    organization_id UUID,
    changed_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    ip_address INET
);

-- Create indexes for performance
CREATE INDEX idx_audit_log_timestamp ON audit.audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_org ON audit.audit_log(organization_id);
CREATE INDEX idx_organizations_status ON core.organizations(status);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit.log_changes() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit.audit_log(
        table_name,
        operation,
        organization_id,
        changed_data,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.organization_id, OLD.organization_id),
        to_jsonb(NEW),
        CURRENT_TIMESTAMP
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION core.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update trigger to organizations
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON core.organizations
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at();

-- Create read-only user for reporting
CREATE ROLE readonly_user WITH LOGIN PASSWORD 'readonly_password_change_me';
GRANT CONNECT ON DATABASE trustplatform TO readonly_user;
GRANT USAGE ON SCHEMA core, risk, evidence, audit, reporting TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA core, risk, evidence, audit, reporting TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA core, risk, evidence, audit, reporting 
    GRANT SELECT ON TABLES TO readonly_user;

-- Initial data
INSERT INTO core.organizations (name, status, metadata) 
VALUES 
    ('System Organization', 'active', '{"type": "system", "initialized": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- Grant permissions to the main application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA core, risk, evidence, audit, reporting TO trustadmin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA core, risk, evidence, audit, reporting TO trustadmin;
ALTER DEFAULT PRIVILEGES IN SCHEMA core, risk, evidence, audit, reporting 
    GRANT ALL ON TABLES TO trustadmin;
ALTER DEFAULT PRIVILEGES IN SCHEMA core, risk, evidence, audit, reporting 
    GRANT ALL ON SEQUENCES TO trustadmin;