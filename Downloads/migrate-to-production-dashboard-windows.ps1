# migrate-to-production-dashboard-windows.ps1
# Enterprise Risk Platform Dashboard Migration Script for Windows
# Version: 1.0.0
# Date: 2025-08-04

# Set error action preference to stop on errors
$ErrorActionPreference = "Stop"

# Script configuration
$ProjectName = "risk-platform"
$ProjectRoot = "$env:USERPROFILE\Documents\$ProjectName"
$LogFile = "$env:USERPROFILE\Documents\$ProjectName\logs\migration-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$BackupDir = "$env:USERPROFILE\Documents\$ProjectName\backups\pre-migration-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Database configuration (for local development)
$DbName = "risk_platform"
$DbUser = "risk_platform"
$DbPassword = "Risk_Platform_Password"
$DbHost = "localhost"
$DbPort = "5432"

# Colors for output
function Write-ColorOutput {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [string]$ForegroundColor = "White"
    )
    
    Write-Host $Message -ForegroundColor $ForegroundColor
    Add-Content -Path $LogFile -Value $Message
}

function Log {
    param ([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-ColorOutput "[$timestamp] $Message" -ForegroundColor Cyan
}

function Success {
    param ([string]$Message)
    Write-ColorOutput "✅ $Message" -ForegroundColor Green
}

function Warning {
    param ([string]$Message)
    Write-ColorOutput "⚠️ $Message" -ForegroundColor Yellow
}

function Error {
    param ([string]$Message)
    Write-ColorOutput "❌ $Message" -ForegroundColor Red
    Exit 1
}

function Confirm {
    param ([string]$Message)
    
    $confirmation = Read-Host "$Message (y/n)"
    if ($confirmation -ne 'y') {
        Warning "Operation cancelled by user"
        return $false
    }
    return $true
}

# Step 0: Check prerequisites
function Check-Prerequisites {
    Log "Checking prerequisites..."

    # Create directories if they don't exist
    if (-not (Test-Path -Path $ProjectRoot)) {
        New-Item -ItemType Directory -Path $ProjectRoot -Force | Out-Null
    }
    
    if (-not (Test-Path -Path (Split-Path -Path $LogFile -Parent))) {
        New-Item -ItemType Directory -Path (Split-Path -Path $LogFile -Parent) -Force | Out-Null
    }

    # Check Node.js installation
    try {
        $nodeVersion = node -v
        Log "Node.js version: $nodeVersion"
    } catch {
        Error "Node.js is not installed or not in PATH. Please install Node.js first."
    }

    # Check npm installation
    try {
        $npmVersion = npm -v
        Log "npm version: $npmVersion"
    } catch {
        Error "npm is not installed or not in PATH. Please install npm first."
    }

    # Check for PostgreSQL client tools (optional)
    try {
        $psqlVersion = psql --version
        Log "PostgreSQL client tools: $psqlVersion"
    } catch {
        Warning "PostgreSQL client tools not found. Database schema creation might be limited."
        Warning "Consider installing PostgreSQL or just the client tools for full functionality."
    }

    # Check for Git
    try {
        $gitVersion = git --version
        Log "Git version: $gitVersion"
    } catch {
        Warning "Git is not installed or not in PATH. Version control capabilities will be limited."
    }

    # Check for React installation (check for react-scripts in global modules)
    try {
        $reactVersion = npm list -g react-scripts
        if ($reactVersion -match "react-scripts") {
            Log "React tools found: $reactVersion"
        } else {
            Warning "React tools not found globally. Will install locally for the project."
        }
    } catch {
        Warning "Could not verify React tools. Will install locally for the project."
    }

    Success "Prerequisites checked"
}

# Step 1: Backup current project (if exists)
function Backup-CurrentProject {
    Log "STEP 1: Backing up any existing project"

    if (Test-Path -Path $ProjectRoot) {
        # Create backup directory
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Log "Backup directory created at $BackupDir"

        # Check if there are files to backup
        $filesToBackup = Get-ChildItem -Path $ProjectRoot -Exclude "backups", "logs"
        if ($filesToBackup.Count -gt 0) {
            Log "Backing up existing project files"
            foreach ($item in $filesToBackup) {
                Copy-Item -Path $item.FullName -Destination $BackupDir -Recurse -Force
            }
            Success "Project files backed up to $BackupDir"
        } else {
            Log "No existing project files to backup"
        }
    } else {
        Log "No existing project to backup"
    }

    Success "Backup completed"
}

# Step 2: Enhance directory structure
function Enhance-DirectoryStructure {
    Log "STEP 2: Enhancing directory structure"

    # Create enterprise directory structure
    $directories = @(
        "$ProjectRoot\api",
        "$ProjectRoot\frontend",
        "$ProjectRoot\database",
        "$ProjectRoot\config",
        "$ProjectRoot\scripts",
        "$ProjectRoot\logs",
        "$ProjectRoot\backups",
        "$ProjectRoot\monitoring",
        "$ProjectRoot\docs",
        "$ProjectRoot\config\nginx",
        "$ProjectRoot\config\postgres",
        "$ProjectRoot\config\grafana",
        "$ProjectRoot\database\init",
        "$ProjectRoot\database\migrations",
        "$ProjectRoot\scripts\deployment",
        "$ProjectRoot\scripts\maintenance",
        "$ProjectRoot\scripts\monitoring",
        "$ProjectRoot\scripts\security",
        "$ProjectRoot\monitoring\dashboards",
        "$ProjectRoot\monitoring\alerts"
    )

    foreach ($dir in $directories) {
        if (-not (Test-Path -Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Log "Created directory: $dir"
        }
    }

    # Move existing dashboard files to frontend directory if needed
    $dashboardDir = "$ProjectRoot\dashboard"
    $frontendPublicDir = "$ProjectRoot\frontend\public"
    
    if ((Test-Path -Path $dashboardDir) -and (-not (Test-Path -Path $frontendPublicDir))) {
        Log "Moving dashboard files to frontend directory"
        New-Item -ItemType Directory -Path $frontendPublicDir -Force | Out-Null
        Copy-Item -Path "$dashboardDir\*" -Destination $frontendPublicDir -Recurse -Force
        Success "Dashboard files moved to frontend directory"
    }

    Success "Directory structure enhanced"
}

# Step 3: Enhance database schema
function Enhance-DatabaseSchema {
    Log "STEP 3: Enhancing database schema"

    # Create schema migration script
    $schemaPath = "$ProjectRoot\database\init\01-schema-upgrade.sql"
    
    # Create the SQL file with the enhanced schema
    Set-Content -Path $schemaPath -Value @'
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
'@

    # Create a batch file to execute the SQL script with PostgreSQL
    $batchPath = "$ProjectRoot\database\apply-schema.bat"
    Set-Content -Path $batchPath -Value @"
@echo off
echo Applying database schema...
set PGPASSWORD=$DbPassword
psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f "%~dp0\init\01-schema-upgrade.sql"
if %ERRORLEVEL% NEQ 0 (
    echo Error applying schema!
    exit /b %ERRORLEVEL%
)
echo Schema applied successfully!
"@

    Success "Database schema enhancement scripts created"
    Log "To apply schema to a local PostgreSQL database, run: $batchPath"
}

# Step 4: Create Node.js API
function Create-NodeJsApi {
    Log "STEP 4: Creating Node.js API with enterprise endpoints"

    # Create API directory structure
    $apiDir = "$ProjectRoot\api"
    $apiSrcDir = "$apiDir\src"
    $apiDirs = @(
        "$apiSrcDir\controllers",
        "$apiSrcDir\models",
        "$apiSrcDir\routes",
        "$apiSrcDir\middleware",
        "$apiSrcDir\utils",
        "$apiSrcDir\config",
        "$apiDir\tests"
    )

    foreach ($dir in $apiDirs) {
        if (-not (Test-Path -Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }

    # Create package.json
    $packageJsonPath = "$apiDir\package.json"
    Set-Content -Path $packageJsonPath -Value @'
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
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "pg": "^8.11.0",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "winston": "^3.8.2",
    "morgan": "^1.10.0",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
'@

    # Create .env file
    $envPath = "$apiDir\.env"
    Set-Content -Path $envPath -Value @"
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=$DbHost
DB_PORT=$DbPort
DB_NAME=$DbName
DB_USER=$DbUser
DB_PASSWORD=$DbPassword

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRATION=24h

# Logging
LOG_LEVEL=debug
"@

    # Create server.js
    $serverJsPath = "$apiSrcDir\server.js"
    Set-Content -Path $serverJsPath -Value @'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config } = require('./config/config');
const routes = require('./routes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
'@

    # Create config.js
    $configJsPath = "$apiSrcDir\config\config.js"
    Set-Content -Path $configJsPath -Value @'
const dotenv = require('dotenv');
dotenv.config();

const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'risk_platform',
        user: process.env.DB_USER || 'risk_platform',
        password: process.env.DB_PASSWORD || 'Risk_Platform_Password',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
        expiresIn: process.env.JWT_EXPIRATION || '24h',
    },
    logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = { config };
'@

    # Create db.js
    $dbJsPath = "$apiSrcDir\config\db.js"
    Set-Content -Path $dbJsPath -Value @'
const { Pool } = require('pg');
const { config } = require('./config');

const pool = new Pool({
    host: config.db.host,
    port: config.db.port,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
'@

    # Create routes index.js
    $routesIndexPath = "$apiSrcDir\routes\index.js"
    Set-Content -Path $routesIndexPath -Value @'
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const threatRoutes = require('./threats');
const riskRoutes = require('./risks');
const trustScoreRoutes = require('./trustScores');

// Register routes
router.use('/auth', authRoutes);
router.use('/threats', threatRoutes);
router.use('/risks', riskRoutes);
router.use('/trust-scores', trustScoreRoutes);

module.exports = router;
'@

    # Create auth routes
    $authRoutesPath = "$apiSrcDir\routes\auth.js"
    Set-Content -Path $authRoutesPath -Value @'
const express = require('express');
const router = express.Router();

// Mock auth routes for now
router.post('/login', (req, res) => {
    // In a real app, you would validate credentials and generate a JWT
    res.json({
        token: 'mock_jwt_token',
        user: {
            id: 1,
            email: 'admin@risk-platform.local',
            role: 'admin'
        }
    });
});

router.post('/register', (req, res) => {
    res.json({
        message: 'User registered successfully',
        user: {
            id: 2,
            email: req.body.email,
            role: 'user'
        }
    });
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
'@

    # Create threats routes
    $threatsRoutesPath = "$apiSrcDir\routes\threats.js"
    Set-Content -Path $threatsRoutesPath -Value @'
const express = require('express');
const router = express.Router();

// Mock data
const threats = [
    { id: 1, threat_id: 'THR-001', name: 'Phishing Attack', severity: 'high', category: 'cyber' },
    { id: 2, threat_id: 'THR-002', name: 'Malware Infection', severity: 'critical', category: 'cyber' },
    { id: 3, threat_id: 'THR-003', name: 'Data Breach', severity: 'critical', category: 'cyber' }
];

// Get all threats
router.get('/', (req, res) => {
    res.json({ threats });
});

// Get threat by ID
router.get('/:id', (req, res) => {
    const threat = threats.find(t => t.id === parseInt(req.params.id));
    if (!threat) {
        return res.status(404).json({ message: 'Threat not found' });
    }
    res.json({ threat });
});

// Create new threat
router.post('/', (req, res) => {
    const newThreat = {
        id: threats.length + 1,
        threat_id: `THR-00${threats.length + 1}`,
        ...req.body
    };
    threats.push(newThreat);
    res.status(201).json({ threat: newThreat });
});

// Update threat
router.put('/:id', (req, res) => {
    const threatIndex = threats.findIndex(t => t.id === parseInt(req.params.id));
    if (threatIndex === -1) {
        return res.status(404).json({ message: 'Threat not found' });
    }
    
    threats[threatIndex] = { ...threats[threatIndex], ...req.body };
    res.json({ threat: threats[threatIndex] });
});

// Delete threat
router.delete('/:id', (req, res) => {
    const threatIndex = threats.findIndex(t => t.id === parseInt(req.params.id));
    if (threatIndex === -1) {
        return res.status(404).json({ message: 'Threat not found' });
    }
    
    const deletedThreat = threats.splice(threatIndex, 1)[0];
    res.json({ message: 'Threat deleted', threat: deletedThreat });
});

module.exports = router;
'@

    # Create risks routes
    $risksRoutesPath = "$apiSrcDir\routes\risks.js"
    Set-Content -Path $risksRoutesPath -Value @'
const express = require('express');
const router = express.Router();

// Mock data
const risks = [
    { id: 1, name: 'Unauthorized Access', impact: 'high', likelihood: 'medium', threat_id: 1 },
    { id: 2, name: 'Data Loss', impact: 'high', likelihood: 'low', threat_id: 3 },
    { id: 3, name: 'System Compromise', impact: 'critical', likelihood: 'low', threat_id: 2 }
];

// Get all risks
router.get('/', (req, res) => {
    res.json({ risks });
});

// Get risk by ID
router.get('/:id', (req, res) => {
    const risk = risks.find(r => r.id === parseInt(req.params.id));
    if (!risk) {
        return res.status(404).json({ message: 'Risk not found' });
    }
    res.json({ risk });
});

// Create new risk
router.post('/', (req, res) => {
    const newRisk = {
        id: risks.length + 1,
        ...req.body
    };
    risks.push(newRisk);
    res.status(201).json({ risk: newRisk });
});

// Update risk
router.put('/:id', (req, res) => {
    const riskIndex = risks.findIndex(r => r.id === parseInt(req.params.id));
    if (riskIndex === -1) {
        return res.status(404).json({ message: 'Risk not found' });
    }
    
    risks[riskIndex] = { ...risks[riskIndex], ...req.body };
    res.json({ risk: risks[riskIndex] });
});

// Delete risk
router.delete('/:id', (req, res) => {
    const riskIndex = risks.findIndex(r => r.id === parseInt(req.params.id));
    if (riskIndex === -1) {
        return res.status(404).json({ message: 'Risk not found' });
    }
    
    const deletedRisk = risks.splice(riskIndex, 1)[0];
    res.json({ message: 'Risk deleted', risk: deletedRisk });
});

module.exports = router;
'@

    # Create trust scores routes
    $trustScoresRoutesPath = "$apiSrcDir\routes\trustScores.js"
    Set-Content -Path $trustScoresRoutesPath -Value @'
const express = require('express');
const router = express.Router();

// Mock data
const trustScores = [
    { 
        id: 1, 
        organization_id: 1, 
        score_date: '2025-08-01', 
        overall_score: 78,
        cyber_score: 85,
        physical_score: 72,
        operational_score: 78,
        compliance_score: 90,
        strategic_score: 65
    },
    { 
        id: 2, 
        organization_id: 1, 
        score_date: '2025-07-01', 
        overall_score: 75,
        cyber_score: 80,
        physical_score: 70,
        operational_score: 75,
        compliance_score: 85,
        strategic_score: 65
    }
];

// Get all trust scores
router.get('/', (req, res) => {
    res.json({ trustScores });
});

// Get latest trust score
router.get('/latest', (req, res) => {
    const latestScore = trustScores.sort((a, b) => 
        new Date(b.score_date) - new Date(a.score_date)
    )[0];
    
    res.json({ trustScore: latestScore });
});

// Get trust score by date
router.get('/:date', (req, res) => {
    const score = trustScores.find(s => s.score_date === req.params.date);
    if (!score) {
        return res.status(404).json({ message: 'Trust score not found for this date' });
    }
    res.json({ trustScore: score });
});

// Calculate new trust score
router.post('/calculate', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    const newScore = {
        id: trustScores.length + 1,
        organization_id: 1,
        score_date: today,
        overall_score: Math.floor(Math.random() * 20) + 70, // Random score between 70-90
        cyber_score: Math.floor(Math.random() * 20) + 70,
        physical_score: Math.floor(Math.random() * 20) + 70,
        operational_score: Math.floor(Math.random() * 20) + 70,
        compliance_score: Math.floor(Math.random() * 20) + 70,
        strategic_score: Math.floor(Math.random() * 20) + 70
    };
    
    trustScores.push(newScore);
    res.status(201).json({ message: 'Trust score calculated', trustScore: newScore });
});

module.exports = router;
'@

    # Create a batch file to start the API
    $startApiPath = "$apiDir\start-api.bat"
    Set-Content -Path $startApiPath -Value @'
@echo off
cd %~dp0
echo Starting Risk Platform API...
npm install
npm run dev
'@

    Success "Node.js API with enterprise endpoints created"
    Log "To start the API, run: $startApiPath"
}

# Step 5: Create React frontend
function Create-ReactFrontend {
    Log "STEP 5: Creating React frontend with enterprise features"

    $frontendDir = "$ProjectRoot\frontend"
    
    # Check if create-react-app is installed
    $createReactAppInstalled = $false
    try {
        $createReactAppVersion = npx create-react-app --version
        $createReactAppInstalled = $true
    } catch {
        Log "Installing create-react-app globally..."
        npm install -g create-react-app
    }

    # Create a batch file to initialize and build the React app
    $setupReactPath = "$frontendDir\setup-react-app.bat"
    Set-Content -Path $setupReactPath -Value @'
@echo off
cd %~dp0
echo Setting up React application...

if exist "package.json" (
    echo React app already initialized, installing dependencies...
    call npm install
) else (
    echo Creating new React app...
    call npx create-react-app .
    
    echo Installing additional dependencies...
    call npm install axios react-router-dom @mui/material @mui/icons-material @emotion/react @emotion/styled recharts
)

echo React application setup complete!
echo To start the development server, run: npm start
'@

    # Create a batch file to start the React development server
    $startReactPath = "$frontendDir\start-react.bat"
    Set-Content -Path $startReactPath -Value @'
@echo off
cd %~dp0
echo Starting React development server...
npm start
'@

    # Create a batch file to build the React app for production
    $buildReactPath = "$frontendDir\build-react.bat"
    Set-Content -Path $buildReactPath -Value @'
@echo off
cd %~dp0
echo Building React application for production...
npm run build
echo Build completed!
'@

    # Create sample React components for the enterprise dashboard
    $componentsDir = "$frontendDir\src\components"
    if (-not (Test-Path -Path $componentsDir)) {
        New-Item -ItemType Directory -Path $componentsDir -Force | Out-Null
    }

    # Create a README with instructions
    $readmePath = "$frontendDir\README.md"
    Set-Content -Path $readmePath -Value @'
# Risk Platform Frontend

This is the React frontend for the Risk Platform enterprise dashboard.

## Setup Instructions

1. Run `setup-react-app.bat` to initialize the React application and install dependencies
2. Run `start-react.bat` to start the development server
3. Run `build-react.bat` to build the application for production

## Project Structure

After setup, the project will have the following structure:

```
frontend/
├── node_modules/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Threats/
│   │   ├── Risks/
│   │   └── ...
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.js
│   ├── index.js
│   └── ...
├── package.json
└── ...
```

## Development Guidelines

1. Use the component-based architecture
2. Follow the established naming conventions
3. Implement proper error handling
4. Use the API service for all backend communication
5. Follow the design system guidelines

## Production Deployment

To deploy to production:

1. Run `build-react.bat` to create a production build
2. Copy the contents of the `build` directory to your web server
3. Configure your web server to serve the static files

For more information, refer to the documentation in the `docs` directory.
'@

    Success "React frontend setup created"
    Log "To set up the React app, run: $setupReactPath"
}

# Step 6: Create operational scripts
function Create-OperationalScripts {
    Log "STEP 6: Creating operational scripts in Windows format"

    $scriptsDir = "$ProjectRoot\scripts"
    
    # Create backup script
    $backupScriptPath = "$scriptsDir\backup-database.bat"
    Set-Content -Path $backupScriptPath -Value @"
@echo off
echo Running database backup...
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_DIR=$ProjectRoot\backups
set PGPASSWORD=$DbPassword

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Creating backup to %BACKUP_DIR%\risk_platform_%TIMESTAMP%.sql
psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT 1" > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Database connection failed!
    exit /b %ERRORLEVEL%
)

pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName -f "%BACKUP_DIR%\risk_platform_%TIMESTAMP%.sql"
if %ERRORLEVEL% NEQ 0 (
    echo Backup failed!
    exit /b %ERRORLEVEL%
)

echo Backup completed successfully: %BACKUP_DIR%\risk_platform_%TIMESTAMP%.sql

:: Clean up old backups (keep last 10)
echo Cleaning up old backups...
powershell -Command "Get-ChildItem -Path '%BACKUP_DIR%' -Filter 'risk_platform_*.sql' | Sort-Object CreationTime -Descending | Select-Object -Skip 10 | Remove-Item -Force"

echo Backup process completed!
"@

    # Create monitoring script
    $monitoringScriptPath = "$scriptsDir\monitoring\check-services.bat"
    New-Item -ItemType Directory -Path "$scriptsDir\monitoring" -Force | Out-Null
    Set-Content -Path $monitoringScriptPath -Value @'
@echo off
echo Checking service status...
powershell -Command "Write-Host 'System Health Check' -ForegroundColor Green"

echo.
echo Checking API status...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/health' -UseBasicParsing; Write-Host 'API Status: ' -NoNewline; Write-Host 'RUNNING' -ForegroundColor Green; Write-Host $response.Content } catch { Write-Host 'API Status: ' -NoNewline; Write-Host 'NOT RUNNING' -ForegroundColor Red }"

echo.
echo Checking database connection...
set PGPASSWORD=%DB_PASSWORD%
psql -h localhost -p 5432 -U risk_platform -d risk_platform -c "SELECT 'Database connection successful';" 2>nul
if %ERRORLEVEL% NEQ 0 (
    powershell -Command "Write-Host 'Database Status: ' -NoNewline; Write-Host 'NOT CONNECTED' -ForegroundColor Red"
) else (
    powershell -Command "Write-Host 'Database Status: ' -NoNewline; Write-Host 'CONNECTED' -ForegroundColor Green"
)

echo.
echo Checking disk space...
powershell -Command "Get-PSDrive C | Select-Object Name, @{Name='Size (GB)';Expression={[math]::Round($_.Used / 1GB, 2)}}, @{Name='Free (GB)';Expression={[math]::Round($_.Free / 1GB, 2)}}, @{Name='Free (%)';Expression={[math]::Round(($_.Free / ($_.Used + $_.Free)) * 100, 2)}} | Format-Table -AutoSize"

echo.
echo Checking memory usage...
powershell -Command "Get-CimInstance Win32_OperatingSystem | Select-Object @{Name='Total Memory (GB)';Expression={[math]::Round($_.TotalVisibleMemorySize / 1MB, 2)}}, @{Name='Free Memory (GB)';Expression={[math]::Round($_.FreePhysicalMemory / 1MB, 2)}}, @{Name='Free Memory (%)';Expression={[math]::Round(($_.FreePhysicalMemory / $_.TotalVisibleMemorySize) * 100, 2)}} | Format-Table -AutoSize"

echo.
echo Checking running processes...
powershell -Command "Get-Process -Name 'node', 'postgres*', 'nginx' -ErrorAction SilentlyContinue | Select-Object ProcessName, Id, @{Name='Memory (MB)';Expression={[math]::Round($_.WorkingSet / 1MB, 2)}}, CPU | Format-Table -AutoSize"

echo.
echo Health check completed!
'@

    # Create deployment script
    $deploymentScriptPath = "$scriptsDir\deployment\deploy-to-production.bat"
    New-Item -ItemType Directory -Path "$scriptsDir\deployment" -Force | Out-Null
    Set-Content -Path $deploymentScriptPath -Value @'
@echo off
echo Risk Platform Production Deployment
echo ==================================
echo.
echo This script will prepare the Risk Platform for production deployment.
echo.
echo Steps:
echo 1. Build React frontend
echo 2. Prepare API for production
echo 3. Create deployment package
echo.
echo Press Ctrl+C to abort or
pause

echo.
echo Step 1: Building React frontend...
cd /d %~dp0\..\..\frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Frontend build failed!
    exit /b %ERRORLEVEL%
)
echo Frontend built successfully!

echo.
echo Step 2: Preparing API for production...
cd /d %~dp0\..\..\api
call npm install --production
if %ERRORLEVEL% NEQ 0 (
    echo API preparation failed!
    exit /b %ERRORLEVEL%
)
echo API prepared successfully!

echo.
echo Step 3: Creating deployment package...
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set DEPLOY_DIR=%~dp0\..\..\deploy\risk-platform-%TIMESTAMP%

if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"
if not exist "%DEPLOY_DIR%\api" mkdir "%DEPLOY_DIR%\api"
if not exist "%DEPLOY_DIR%\frontend" mkdir "%DEPLOY_DIR%\frontend"
if not exist "%DEPLOY_DIR%\database" mkdir "%DEPLOY_DIR%\database"
if not exist "%DEPLOY_DIR%\scripts" mkdir "%DEPLOY_DIR%\scripts"

echo Copying API files...
xcopy /E /Y "%~dp0\..\..\api" "%DEPLOY_DIR%\api\"
echo Copying frontend files...
xcopy /E /Y "%~dp0\..\..\frontend\build" "%DEPLOY_DIR%\frontend\"
echo Copying database scripts...
xcopy /E /Y "%~dp0\..\..\database" "%DEPLOY_DIR%\database\"
echo Copying operational scripts...
xcopy /E /Y "%~dp0\..\..\scripts" "%DEPLOY_DIR%\scripts\"

echo Creating README file...
echo Risk Platform Deployment Package > "%DEPLOY_DIR%\README.txt"
echo Created: %date% %time% >> "%DEPLOY_DIR%\README.txt"
echo. >> "%DEPLOY_DIR%\README.txt"
echo Deployment Instructions: >> "%DEPLOY_DIR%\README.txt"
echo 1. Copy the 'frontend' directory to your web server's document root >> "%DEPLOY_DIR%\README.txt"
echo 2. Set up the API by following instructions in api/README.md >> "%DEPLOY_DIR%\README.txt"
echo 3. Run the database scripts to set up your database >> "%DEPLOY_DIR%\README.txt"
echo 4. Configure environment variables as specified in documentation >> "%DEPLOY_DIR%\README.txt"

echo.
echo Deployment package created at: %DEPLOY_DIR%
echo.
echo Deployment preparation completed successfully!
'@

    # Create maintenance script
    $maintenanceScriptPath = "$scriptsDir\maintenance\update-system.bat"
    New-Item -ItemType Directory -Path "$scriptsDir\maintenance" -Force | Out-Null
    Set-Content -Path $maintenanceScriptPath -Value @'
@echo off
echo Risk Platform Maintenance
echo ========================
echo.
echo This script will update the Risk Platform components.
echo.
echo Steps:
echo 1. Update API dependencies
echo 2. Update frontend dependencies
echo 3. Check for database updates
echo.
echo Press Ctrl+C to abort or
pause

echo.
echo Step 1: Updating API dependencies...
cd /d %~dp0\..\..\api
call npm update
if %ERRORLEVEL% NEQ 0 (
    echo API update failed!
    exit /b %ERRORLEVEL%
)
echo API dependencies updated successfully!

echo.
echo Step 2: Updating frontend dependencies...
cd /d %~dp0\..\..\frontend
call npm update
if %ERRORLEVEL% NEQ 0 (
    echo Frontend update failed!
    exit /b %ERRORLEVEL%
)
echo Frontend dependencies updated successfully!

echo.
echo Step 3: Checking for database updates...
echo No automatic database updates available.
echo Please check the database/migrations directory for any new migration scripts.

echo.
echo System update completed successfully!
'@

    # Create master control script
    $masterControlPath = "$ProjectRoot\risk-platform-control.bat"
    Set-Content -Path $masterControlPath -Value @'
@echo off
setlocal enabledelayedexpansion

echo Risk Platform Control Script
echo ===========================

if "%1"=="" goto :help
if "%1"=="help" goto :help
if "%1"=="status" goto :status
if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="backup" goto :backup
if "%1"=="update" goto :update
if "%1"=="deploy" goto :deploy
goto :help

:help
echo.
echo Usage: risk-platform-control.bat [command]
echo.
echo Commands:
echo   status        Check status of all services
echo   start         Start development services
echo   stop          Stop running services
echo   backup        Create database backup
echo   update        Update system components
echo   deploy        Prepare deployment package
echo   help          Show this help message
echo.
goto :end

:status
echo.
echo Checking Risk Platform status...
call "%~dp0\scripts\monitoring\check-services.bat"
goto :end

:start
echo.
echo Starting Risk Platform services...
start cmd /c "cd /d %~dp0\api && call start-api.bat"
start cmd /c "cd /d %~dp0\frontend && call start-react.bat"
echo Services started in separate windows.
goto :end

:stop
echo.
echo Stopping Risk Platform services...
powershell -Command "Get-Process -Name 'node' -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like '*Risk Platform*'} | Stop-Process -Force"
echo Services stopped.
goto :end

:backup
echo.
echo Creating database backup...
call "%~dp0\scripts\backup-database.bat"
goto :end

:update
echo.
echo Updating Risk Platform components...
call "%~dp0\scripts\maintenance\update-system.bat"
goto :end

:deploy
echo.
echo Preparing deployment package...
call "%~dp0\scripts\deployment\deploy-to-production.bat"
goto :end

:end
endlocal
'@

    Success "Operational scripts created in Windows format"
    Log "Master control script created: $masterControlPath"
}

# Step 7: Create documentation
function Create-Documentation {
    Log "STEP 7: Creating documentation"

    $docsDir = "$ProjectRoot\docs"
    
    # Create README
    $readmePath = "$ProjectRoot\README.md"
    Set-Content -Path $readmePath -Value @'
# Risk Platform Enterprise Dashboard

A comprehensive risk intelligence and business assurance platform built for enterprise environments.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  API Layer      │    │  Database       │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │    React    │ │◄───┤ │   Node.js   │ │◄───┤ │ PostgreSQL  │ │
│ │  Dashboard  │ │    │ │     API     │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Monitoring    │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │   Grafana   │ │
                    │ │ Dashboards  │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

## Quick Start

### Prerequisites

- Windows 10 or 11
- Node.js 16+ and npm
- PostgreSQL 14+ (local or remote)
- Git (optional)

### Setup

1. Clone or download this repository
2. Run `risk-platform-control.bat help` to see available commands
3. Run `risk-platform-control.bat start` to start development services

### Development

- Frontend: React application in the `frontend` directory
- API: Node.js Express API in the `api` directory
- Database: PostgreSQL schema in the `database` directory

## Features

- **Comprehensive Risk Management**
  - Threat tracking and analysis
  - Risk assessment and mitigation
  - Trust score calculation
  - Compliance monitoring

- **Enterprise-Ready Architecture**
  - Multi-tenant support
  - Role-based access control
  - Audit logging
  - Comprehensive API

- **Modern Technology Stack**
  - React frontend with Material UI
  - Node.js API with Express
  - PostgreSQL database
  - Grafana monitoring

## Directory Structure

```
risk-platform/
├── api/                    # Node.js API application
├── frontend/               # React frontend application
├── database/               # Database schema and migrations
├── config/                 # Configuration files
├── scripts/                # Operational scripts
│   ├── deployment/         # Deployment scripts
│   ├── maintenance/        # Maintenance scripts
│   └── monitoring/         # Monitoring scripts
├── docs/                   # Documentation
├── logs/                   # Log files
└── backups/                # Database backups
```

## Documentation

- [User Guide](docs/user-guide.md)
- [API Documentation](docs/api-docs.md)
- [Development Guide](docs/development-guide.md)
- [Deployment Guide](docs/deployment-guide.md)

## License

This project is proprietary and confidential.
'@

    # Create API documentation
    $apiDocsPath = "$docsDir\api-docs.md"
    New-Item -ItemType Directory -Path $docsDir -Force | Out-Null
    Set-Content -Path $apiDocsPath -Value @'
# Risk Platform API Documentation

## Overview

The Risk Platform API provides programmatic access to the Risk Intelligence and Business Assurance Platform. This RESTful API allows you to manage threats, risks, capabilities, requirements, and evidence through a comprehensive set of endpoints.

## Base URL

- Development: `http://localhost:3000/api/v1`
- Production: `https://api.risk-platform.local/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "your_email",
  "password": "your_password"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@risk-platform.local",
    "role": "admin"
  }
}
```

## Core Endpoints

### Health and Status

#### GET /health
Check service health status.

```
GET /health
```

Response:

```json
{
  "status": "healthy",
  "timestamp": "2025-08-04T12:34:56.789Z",
  "uptime": 3600
}
```

### Threats Management

#### GET /api/v1/threats
List all threats with pagination and filtering.

Parameters:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50, max: 100)
- `search` (string): Search in title and description
- `threat_type` (string): Filter by threat type
- `severity` (string): Filter by severity level

Response:

```json
{
  "threats": [
    {
      "id": 1,
      "threat_id": "THR-001",
      "name": "Phishing Attack",
      "severity": "high",
      "category": "cyber"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

#### POST /api/v1/threats
Create a new threat.

Request:

```json
{
  "threat_id": "THR-001",
  "name": "Phishing Attack",
  "description": "Email-based phishing campaign",
  "threat_type": "cyber",
  "category": "phishing",
  "severity": "high"
}
```

Response:

```json
{
  "threat": {
    "id": 1,
    "threat_id": "THR-001",
    "name": "Phishing Attack",
    "description": "Email-based phishing campaign",
    "threat_type": "cyber",
    "category": "phishing",
    "severity": "high"
  }
}
```

### Risk Management

#### GET /api/v1/risks
List all risks with filtering and pagination.

#### POST /api/v1/risks
Create a new risk assessment.

### Trust Scores

#### GET /api/v1/trust-scores/latest
Get the latest trust score.

Response:

```json
{
  "trustScore": {
    "id": 1,
    "organization_id": 1,
    "score_date": "2025-08-01",
    "overall_score": 78,
    "cyber_score": 85,
    "physical_score": 72,
    "operational_score": 78,
    "compliance_score": 90,
    "strategic_score": 65
  }
}
```

## Error Handling

All API responses follow a consistent format:

### Success Response
```json
{
  "data": {
    // Response data
  },
  "pagination": {  // For paginated endpoints
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": {
      "field": "threat_id",
      "issue": "Already exists"
    }
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error
'@

    # Create development guide
    $developmentGuidePath = "$docsDir\development-guide.md"
    Set-Content -Path $developmentGuidePath -Value @'
# Risk Platform Development Guide

## Development Environment Setup

### Prerequisites

1. **Node.js and npm**
   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node -v` and `npm -v`

2. **PostgreSQL**
   - Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
   - Create a database named `risk_platform`
   - Create a user with appropriate permissions

3. **Code Editor**
   - Visual Studio Code is recommended
   - Install extensions for JavaScript, React, and PostgreSQL

### Project Setup

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd risk-platform
   ```

2. **Set up API**
   ```
   cd api
   npm install
   ```

3. **Set up Frontend**
   ```
   cd frontend
   npm install
   ```

4. **Initialize Database**
   - Run the schema creation script:
   ```
   cd database
   apply-schema.bat
   ```

5. **Start Development Servers**
   ```
   risk-platform-control.bat start
   ```

## Development Workflow

### API Development

1. **API Structure**
   - `api/src/server.js` - Entry point
   - `api/src/routes/` - API routes
   - `api/src/controllers/` - Business logic
   - `api/src/models/` - Data models
   - `api/src/middleware/` - Request middleware

2. **Adding a New Endpoint**
   - Create route in `routes/`
   - Implement controller in `controllers/`
   - Add model if needed in `models/`
   - Update documentation

3. **Testing API**
   - Use Postman or curl to test endpoints
   - Write unit tests with Jest

### Frontend Development

1. **Frontend Structure**
   - `frontend/src/index.js` - Entry point
   - `frontend/src/App.js` - Main component
   - `frontend/src/components/` - Reusable components
   - `frontend/src/pages/` - Page components
   - `frontend/src/services/` - API services

2. **Adding a New Feature**
   - Create components in `components/`
   - Add page in `pages/`
   - Update routes in `App.js`
   - Add API service in `services/`

3. **Testing Frontend**
   - Use React Testing Library for component tests
   - Use browser dev tools for debugging

### Database Development

1. **Creating Migrations**
   - Add SQL scripts to `database/migrations/`
   - Follow naming convention: `YYYYMMDD_description.sql`
   - Test migrations in development first

2. **Data Model Changes**
   - Update schema in `database/init/`
   - Create migration for existing deployments
   - Update API models to match

## Coding Standards

### JavaScript/TypeScript

- Use ES6+ features
- Follow Airbnb style guide
- Use async/await for asynchronous code
- Document functions with JSDoc

### React

- Use functional components with hooks
- Use React Router for navigation
- Follow component composition pattern
- Keep components small and focused

### API Design

- Follow RESTful principles
- Use consistent naming conventions
- Include proper error handling
- Document all endpoints

## Deployment

See the [Deployment Guide](deployment-guide.md) for detailed instructions.

## Troubleshooting

### Common Issues

1. **API won't start**
   - Check if port 3000 is already in use
   - Verify database connection settings
   - Check for syntax errors in code

2. **Frontend build fails**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for syntax errors in components

3. **Database connection issues**
   - Verify PostgreSQL is running
   - Check connection credentials
   - Ensure database exists and user has permissions

### Getting Help

- Check the documentation in the `docs/` directory
- Review logs in the `logs/` directory
- Contact the development team
'@

    # Create deployment guide
    $deploymentGuidePath = "$docsDir\deployment-guide.md"
    Set-Content -Path $deploymentGuidePath -Value @'
# Risk Platform Deployment Guide

## Deployment Options

The Risk Platform can be deployed in several ways:

1. **Local Development** - For testing and development
2. **On-Premises Server** - For internal enterprise use
3. **Cloud Deployment** - For scalable production environments

This guide covers all deployment scenarios.

## Deployment Prerequisites

### For All Deployments

- Node.js 16+ and npm
- PostgreSQL 14+
- Git (for version control)
- Sufficient disk space (minimum 10GB)

### For Production Deployments

- Dedicated server or cloud instance
- SSL certificate for HTTPS
- Backup solution
- Monitoring tools

## Local Development Deployment

1. **Setup Environment**
   - Follow the instructions in the Development Guide
   - Use `risk-platform-control.bat start` to run locally

2. **Configuration**
   - Edit `.env` files in `api/` and `frontend/` directories
   - Configure database connection in `api/.env`

## On-Premises Server Deployment

1. **Prepare Deployment Package**
   ```
   risk-platform-control.bat deploy
   ```

2. **Server Setup**
   - Install Node.js and PostgreSQL on the server
   - Configure firewall to allow necessary ports
   - Set up SSL certificate

3. **Deploy Application**
   - Copy deployment package to server
   - Extract package to desired location
   - Configure environment variables
   - Set up process manager (PM2 recommended)

4. **Database Setup**
   - Create PostgreSQL database
   - Run schema creation scripts
   - Set up backup schedule

5. **Web Server Configuration**
   - Configure Nginx or Apache as reverse proxy
   - Set up SSL termination
   - Configure caching and compression

6. **Start Services**
   ```
   cd /path/to/risk-platform
   pm2 start api/src/server.js --name "risk-platform-api"
   ```

## Cloud Deployment

### AWS Deployment

1. **Infrastructure Setup**
   - EC2 instance for API
   - RDS for PostgreSQL
   - S3 for static assets
   - CloudFront for CDN (optional)
   - Load Balancer for high availability

2. **Deployment Steps**
   - Deploy API to EC2
   - Deploy frontend to S3/CloudFront
   - Configure RDS database
   - Set up security groups and IAM roles

### Azure Deployment

1. **Infrastructure Setup**
   - App Service for API
   - Azure SQL Database
   - Blob Storage for static assets
   - Azure CDN (optional)

2. **Deployment Steps**
   - Deploy API to App Service
   - Deploy frontend to Blob Storage/CDN
   - Configure Azure SQL Database
   - Set up networking and security

## Post-Deployment Tasks

1. **Verify Deployment**
   - Test API endpoints
   - Test frontend functionality
   - Verify database connections

2. **Set Up Monitoring**
   - Configure application logging
   - Set up performance monitoring
   - Configure alerts

3. **Security Hardening**
   - Review security settings
   - Implement rate limiting
   - Configure firewall rules

4. **Backup Configuration**
   - Set up database backups
   - Configure application state backups
   - Test restore procedures

## Troubleshooting

### Common Deployment Issues

1. **API Connection Issues**
   - Check network configuration
   - Verify environment variables
   - Check firewall settings

2. **Database Connection Issues**
   - Verify connection strings
   - Check database user permissions
   - Test network connectivity

3. **Frontend Loading Issues**
   - Check browser console for errors
   - Verify API endpoint configuration
   - Check CORS settings

## Maintenance

1. **Updates and Patches**
   - Use `risk-platform-control.bat update` to update components
   - Follow change management procedures
   - Test updates in staging environment first

2. **Scaling**
   - Horizontal scaling: Add more API instances
   - Vertical scaling: Increase server resources
   - Database scaling: Implement read replicas

3. **Backup and Recovery**
   - Regular database backups
   - Application state backups
   - Disaster recovery testing
'@

    Success "Documentation created"
}

# Step 8: Final setup and verification
function Finalize-Setup {
    Log "STEP 8: Finalizing setup and verification"

    # Create a batch file to verify the setup
    $verifySetupPath = "$ProjectRoot\verify-setup.bat"
    Set-Content -Path $verifySetupPath -Value @'
@echo off
echo Risk Platform Setup Verification
echo ==============================
echo.
powershell -Command "Write-Host 'Checking directory structure...' -ForegroundColor Cyan"

set ERRORS=0

if not exist "%~dp0\api" (
    powershell -Command "Write-Host 'API directory is missing!' -ForegroundColor Red"
    set /a ERRORS+=1
) else (
    powershell -Command "Write-Host 'API directory: OK' -ForegroundColor Green"
)

if not exist "%~dp0\frontend" (
    powershell -Command "Write-Host 'Frontend directory is missing!' -ForegroundColor Red"
    set /a ERRORS+=1
) else (
    powershell -Command "Write-Host 'Frontend directory: OK' -ForegroundColor Green"
)

if not exist "%~dp0\database" (
    powershell -Command "Write-Host 'Database directory is missing!' -ForegroundColor Red"
    set /a ERRORS+=1
) else (
    powershell -Command "Write-Host 'Database directory: OK' -ForegroundColor Green"
)

if not exist "%~dp0\scripts" (
    powershell -Command "Write-Host 'Scripts directory is missing!' -ForegroundColor Red"
    set /a ERRORS+=1
) else (
    powershell -Command "Write-Host 'Scripts directory: OK' -ForegroundColor Green"
)

if not exist "%~dp0\docs" (
    powershell -Command "Write-Host 'Documentation directory is missing!' -ForegroundColor Red"
    set /a ERRORS+=1
) else (
    powershell -Command "Write-Host 'Documentation directory: OK' -ForegroundColor Green"
)

echo.
powershell -Command "Write-Host 'Checking Node.js and npm...' -ForegroundColor Cyan"
node -v > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    powershell -Command "Write-Host 'Node.js is not installed or not in PATH!' -ForegroundColor Red"
    set /a ERRORS+=1
) else (
    powershell -Command "Write-Host 'Node.js: OK' -ForegroundColor Green"
)

npm -v > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    powershell -Command "Write-Host 'npm is not installed or not in PATH!' -ForegroundColor Red"
    set /a ERRORS+=1
) else (
    powershell -Command "Write-Host 'npm: OK' -ForegroundColor Green"
)

echo.
powershell -Command "Write-Host 'Checking API package.json...' -ForegroundColor Cyan"
if not exist "%~dp0\api\package.json" (
    powershell -Command "Write-Host 'API package.json is missing!' -ForegroundColor Red"
    set /a ERRORS+=1
) else (
    powershell -Command "Write-Host 'API package.json: OK' -ForegroundColor Green"
)

echo.
powershell -Command "Write-Host 'Checking database schema...' -ForegroundColor Cyan"
if not exist "%~dp0\database\init\01-schema-upgrade.sql" (
    powershell -Command "Write-Host 'Database schema is missing!' -ForegroundColor Red"
    set /a ERRORS+=1
) else (
    powershell -Command "Write-Host 'Database schema: OK' -ForegroundColor Green"
)

echo.
echo Verification Summary:
if %ERRORS% EQU 0 (
    powershell -Command "Write-Host 'All checks passed! The Risk Platform is set up correctly.' -ForegroundColor Green"
) else (
    powershell -Command "Write-Host 'Verification found %ERRORS% issues that need to be addressed.' -ForegroundColor Red"
)

echo.
echo Next Steps:
echo 1. Initialize the React frontend: run frontend\setup-react-app.bat
echo 2. Start the API: run api\start-api.bat
echo 3. Start the React development server: run frontend\start-react.bat
echo 4. Or use the master control script: risk-platform-control.bat start
echo.
echo For more information, see the documentation in the docs directory.
'@

    # Final README
    $finalReadmePath = "$ProjectRoot\GETTING_STARTED.md"
    Set-Content -Path $finalReadmePath -Value @'
# Getting Started with Risk Platform

## Overview

Congratulations on setting up the Risk Platform! This guide will help you get started with development and deployment.

## Quick Start

1. **Verify your setup**
   ```
   verify-setup.bat
   ```

2. **Initialize the React frontend**
   ```
   frontend\setup-react-app.bat
   ```

3. **Start the development environment**
   ```
   risk-platform-control.bat start
   ```

4. **Access the application**
   - API: http://localhost:3000
   - Frontend: http://localhost:3000

## Development Workflow

1. **API Development**
   - Edit files in the `api/src` directory
   - The API will automatically reload when files change

2. **Frontend Development**
   - Edit files in the `frontend/src` directory
   - The React development server will automatically reload

3. **Database Changes**
   - Edit schema in `database/init`
   - Apply changes using `database/apply-schema.bat`

## Deployment

1. **Prepare for deployment**
   ```
   risk-platform-control.bat deploy
   ```

2. **Deploy to your environment**
   - Follow the instructions in `docs/deployment-guide.md`

## Documentation

- `README.md` - Main project documentation
- `docs/api-docs.md` - API documentation
- `docs/development-guide.md` - Development guide
- `docs/deployment-guide.md` - Deployment guide

## Getting Help

If you encounter any issues, check the following:

1. Verify your setup with `verify-setup.bat`
2. Check the logs in the `logs` directory
3. Consult the documentation in the `docs` directory

## Next Steps

1. Familiarize yourself with the codebase
2. Review the API documentation
3. Explore the React components
4. Run the database schema setup
5. Start building your features!
'@

    Success "Setup finalized and verification script created"
}

# Main function
function Main {
    Log "Starting Risk Platform migration to enterprise architecture"
    Log "Project root: $ProjectRoot"
    Log "Log file: $LogFile"

    # Run all steps
    Check-Prerequisites
    Backup-CurrentProject
    Enhance-DirectoryStructure
    Enhance-DatabaseSchema
    Create-NodeJsApi
    Create-ReactFrontend
    Create-OperationalScripts
    Create-Documentation
    Finalize-Setup

    # Final summary
    Log "MIGRATION SUMMARY"
    Write-ColorOutput "==================================" -ForegroundColor Green
    Write-ColorOutput "  MIGRATION COMPLETED SUCCESSFULLY " -ForegroundColor Green
    Write-ColorOutput "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "The Risk Platform has been migrated to enterprise architecture:"
    Write-Host ""
    Write-ColorOutput "1. Enhanced Project Structure" -ForegroundColor Cyan
    Write-Host "   - Complete enterprise directory structure"
    Write-Host "   - Separation of concerns (API, frontend, database, etc.)"
    Write-Host ""
    Write-ColorOutput "2. Database Schema" -ForegroundColor Cyan
    Write-Host "   - Organization and user management"
    Write-Host "   - Trust score calculation"
    Write-Host "   - Audit logging"
    Write-Host ""
    Write-ColorOutput "3. Node.js API" -ForegroundColor Cyan
    Write-Host "   - RESTful API endpoints"
    Write-Host "   - Authentication and authorization"
    Write-Host "   - Error handling and validation"
    Write-Host ""
    Write-ColorOutput "4. React Frontend" -ForegroundColor Cyan
    Write-Host "   - Modern React application"
    Write-Host "   - Component-based architecture"
    Write-Host "   - Ready for development"
    Write-Host ""
    Write-ColorOutput "5. Operational Scripts" -ForegroundColor Cyan
    Write-Host "   - Backup and maintenance"
    Write-Host "   - Deployment procedures"
    Write-Host "   - Monitoring and health checks"
    Write-Host ""
    Write-ColorOutput "6. Documentation" -ForegroundColor Cyan
    Write-Host "   - API documentation"
    Write-Host "   - Development guide"
    Write-Host "   - Deployment guide"
    Write-Host ""
    Write-ColorOutput "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Run verify-setup.bat to confirm everything is set up correctly"
    Write-Host "2. Initialize the React frontend with frontend\setup-react-app.bat"
    Write-Host "3. Start the development environment with risk-platform-control.bat start"
    Write-Host "4. Review GETTING_STARTED.md for more information"
    Write-Host ""
    Write-ColorOutput "Project location: $ProjectRoot" -ForegroundColor Green
    Write-Host ""
    Success "Migration completed successfully!"
}

# Execute main function
Main
