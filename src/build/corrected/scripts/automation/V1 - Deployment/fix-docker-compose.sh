#!/bin/bash
# fix-docker-compose.sh
# This script fixes Docker Compose configuration issues in the Risk Platform deployment
# Version: 1.0.0
# Date: 2025-08-01

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="/var/log/risk-platform-fix-$(date +%Y%m%d-%H%M%S).log"
PROJECT_DIR="/opt/risk-platform"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
API_DIR="$PROJECT_DIR/api"

# Logging functions
log_info() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${BLUE}INFO:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] INFO: $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${GREEN}SUCCESS:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] SUCCESS: $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${YELLOW}WARNING:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] WARNING: $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "[$(date +"%Y-%m-%d %H:%M:%S")] ${RED}ERROR:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ERROR: $1" >> "$LOG_FILE"
}

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    log_error "This script must be run as root!"
    exit 1
fi

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"
chmod 640 "$LOG_FILE"

log_info "Starting Docker Compose configuration fix..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed! Please run the main deployment script first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    log_error "Docker Compose is not installed! Please run the main deployment script first."
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "Project directory does not exist: $PROJECT_DIR"
    exit 1
fi

# Backup original docker-compose.yml if it exists
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
    BACKUP_FILE="$DOCKER_COMPOSE_FILE.$(date +%Y%m%d%H%M%S).bak"
    cp "$DOCKER_COMPOSE_FILE" "$BACKUP_FILE"
    log_success "Original Docker Compose file backed up to $BACKUP_FILE"
else
    log_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    exit 1
fi

# Create API placeholder directory
log_info "Creating API placeholder..."
mkdir -p "$API_DIR/src"

# Create package.json for API placeholder
cat > "$API_DIR/package.json" << 'EOF'
{
  "name": "risk-platform-api-placeholder",
  "version": "1.0.0",
  "description": "Placeholder API for Risk Platform",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "morgan": "^1.10.0"
  }
}
EOF

# Create API placeholder source
cat > "$API_DIR/src/index.js" << 'EOF'
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', {
  stream: fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' })
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Risk Platform API Placeholder',
    version: '1.0.0',
    status: 'operational'
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    hostname: os.hostname(),
    platform: os.platform(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
    },
    cpu: os.cpus().length
  });
});

// Metrics endpoint for Prometheus
app.get('/metrics', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const metrics = [
    '# HELP process_uptime_seconds The uptime of the process in seconds',
    `# TYPE process_uptime_seconds gauge`,
    `process_uptime_seconds ${uptime}`,
    '',
    '# HELP process_resident_memory_bytes Memory usage in bytes',
    `# TYPE process_resident_memory_bytes gauge`,
    `process_resident_memory_bytes ${memoryUsage.rss}`,
    '',
    '# HELP process_heap_bytes Node.js heap size in bytes',
    `# TYPE process_heap_bytes gauge`,
    `process_heap_bytes ${memoryUsage.heapTotal}`,
    '',
    '# HELP process_heap_used_bytes Node.js heap used in bytes',
    `# TYPE process_heap_used_bytes gauge`,
    `process_heap_used_bytes ${memoryUsage.heapUsed}`
  ].join('\n');
  
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Start server
app.listen(port, () => {
  console.log(`Risk Platform API Placeholder running on port ${port}`);
});
EOF

# Create Dockerfile for API placeholder
cat > "$API_DIR/Dockerfile" << 'EOF'
FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
EOF

# Set proper permissions
chmod -R 755 "$API_DIR"

log_success "API placeholder created"

# Create fixed Docker Compose file
log_info "Creating fixed Docker Compose configuration..."

cat > "$DOCKER_COMPOSE_FILE" << 'EOF'
# Risk Platform Docker Compose Configuration
# Fixed version - removes obsolete attributes and uses standard images

services:
  nginx:
    image: nginx:1.25-alpine
    container_name: risk-platform-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx:/etc/nginx/conf.d
      - ./config/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    networks:
      - risk-platform-network
    depends_on:
      - api
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: risk-platform-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./api/logs:/app/logs
      - ./config/api:/app/config
    networks:
      - risk-platform-network
    depends_on:
      - db
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  db:
    image: postgres:16-alpine
    container_name: risk-platform-db
    restart: unless-stopped
    environment:
      - POSTGRES_USER=risk_platform
      - POSTGRES_PASSWORD=risk_platform_password
      - POSTGRES_DB=risk_platform
    volumes:
      - ./data/db:/var/lib/postgresql/data
    networks:
      - risk-platform-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  prometheus:
    image: prom/prometheus:latest
    container_name: risk-platform-prometheus
    restart: unless-stopped
    volumes:
      - ./config/monitoring/prometheus:/etc/prometheus
      - ./data/monitoring/prometheus:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - risk-platform-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  grafana:
    image: grafana/grafana:latest
    container_name: risk-platform-grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - ./data/monitoring/grafana:/var/lib/grafana
      - ./config/monitoring/grafana/dashboards:/etc/grafana/dashboards
      - ./config/monitoring/grafana/provisioning:/etc/grafana/provisioning
    networks:
      - risk-platform-network
    depends_on:
      - prometheus
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  alertmanager:
    image: prom/alertmanager:latest
    container_name: risk-platform-alertmanager
    restart: unless-stopped
    volumes:
      - ./config/monitoring/alertmanager:/etc/alertmanager
      - ./data/monitoring/alertmanager:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - risk-platform-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  risk-platform-network:
    driver: bridge
EOF

log_success "Fixed Docker Compose configuration created"

# Create .env file for environment variables
cat > "$PROJECT_DIR/.env" << 'EOF'
# Risk Platform Environment Variables
DOCKER_REGISTRY=docker.io
POSTGRES_PASSWORD=risk_platform_password
GRAFANA_ADMIN_PASSWORD=admin
EOF

chmod 600 "$PROJECT_DIR/.env"
log_success "Environment variables file created"

# Install Node.js and npm if not already installed
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js..."
    apt-get update
    apt-get install -y ca-certificates curl gnupg
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
    apt-get update
    apt-get install -y nodejs
    log_success "Node.js installed"
fi

# Build and start the services
log_info "Building and starting services..."
cd "$PROJECT_DIR"

# Stop any running containers
docker compose down

# Build and start the services
if docker compose up -d --build; then
    log_success "Services built and started successfully"
else
    log_error "Failed to build and start services"
    exit 1
fi

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 10

# Check if services are running
if [ "$(docker compose ps -q | wc -l)" -gt 0 ]; then
    log_success "Services are running"
    
    # Get the IP address
    IP_ADDRESS=$(hostname -I | awk '{print $1}')
    
    echo ""
    echo "==============================================="
    echo "       Risk Platform Deployment Fixed!         "
    echo "==============================================="
    echo ""
    echo "The Risk Platform has been successfully fixed and deployed."
    echo ""
    echo "Access the platform at: http://$IP_ADDRESS"
    echo "API status: http://$IP_ADDRESS/api/status"
    echo "Monitoring dashboard: http://$IP_ADDRESS/monitoring"
    echo ""
    echo "Grafana admin credentials:"
    echo "Username: admin"
    echo "Password: admin"
    echo ""
    echo "==============================================="
else
    log_error "Services are not running"
    echo "Check the Docker logs for more information:"
    echo "docker compose logs"
    exit 1
fi

log_success "Docker Compose configuration fix completed"
