#!/bin/bash
# Risk-Platform VPS Deployment Continuation Script for Ubuntu 24.04
# Version: 2.0.0
# Date: 2025-07-31
#
# This script continues deployment after the APT sources and package conflicts
# have been resolved by vps-apt-fix.sh. It handles:
#  - Docker installation and setup
#  - Project structure creation
#  - Monitoring stack configuration
#  - Services setup
#  - Platform deployment preparation

# Script version
SCRIPT_VERSION="2.0.0-ubuntu24.04"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="/var/log/risk-platform-deploy-$(date +%Y%m%d-%H%M%S).log"
BACKUP_DIR="/opt/risk-platform/backups"
STATE_FILE="/opt/risk-platform/.automation_state"
EMERGENCY_RESTORE_SCRIPT="/opt/risk-platform/scripts/restore_network.sh"

# Default settings
ADMIN_IP=""
ALLOW_SSH=true
ALLOW_HTTP=true
ALLOW_HTTPS=true
ALLOW_RDP=true
DOCKER_REGISTRY="docker.io"
PROJECT_DIR="/opt/risk-platform"
DOMAIN=""
CONFIG_DIR="$PROJECT_DIR/config"
DATA_DIR="$PROJECT_DIR/data"
SCRIPTS_DIR="$PROJECT_DIR/scripts"
LOGS_DIR="$PROJECT_DIR/logs"
BACKUP_DIR="$PROJECT_DIR/backups"

# Trap errors
trap 'handle_error $? $LINENO' ERR

# Error handler
handle_error() {
    local exit_code=$1
    local line_number=$2
    log_error "Error on line $line_number: Command exited with status $exit_code"
    exit $exit_code
}

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

# Save state function
save_state() {
    echo "$1" > "$STATE_FILE"
    log_info "Automation state saved: $1"
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

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to install Docker
install_docker() {
    log_info "Installing Docker..."
    
    # Check if Docker is already installed
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        log_warning "Docker and Docker Compose are already installed. Skipping installation."
        return 0
    fi
    
    # Install Docker dependencies
    apt-get update
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Enable and start Docker
    systemctl enable docker
    systemctl start docker
    
    # Create Docker network
    docker network create risk-platform-network || true
    
    # Test Docker installation
    if docker run --rm hello-world &> /dev/null; then
        log_success "Docker installed and working correctly"
    else
        log_error "Docker installation failed"
        exit 1
    fi
    
    # Create docker-compose.yml symlink for compatibility
    ln -sf /usr/libexec/docker/cli-plugins/docker-compose /usr/local/bin/docker-compose 2>/dev/null || true
    
    log_success "Docker and Docker Compose installed successfully"
    save_state "docker_installed"
}

# Function to create project structure
create_project_structure() {
    log_info "Creating project structure..."
    
    # Create main project directory
    mkdir -p "$PROJECT_DIR"
    
    # Create subdirectories
    mkdir -p "$CONFIG_DIR/api"
    mkdir -p "$CONFIG_DIR/nginx"
    mkdir -p "$CONFIG_DIR/monitoring/grafana/dashboards"
    mkdir -p "$CONFIG_DIR/monitoring/grafana/provisioning"
    mkdir -p "$CONFIG_DIR/monitoring/prometheus"
    mkdir -p "$CONFIG_DIR/monitoring/alertmanager"
    mkdir -p "$CONFIG_DIR/ssl"
    
    mkdir -p "$DATA_DIR/api"
    mkdir -p "$DATA_DIR/db"
    mkdir -p "$DATA_DIR/monitoring/grafana"
    mkdir -p "$DATA_DIR/monitoring/prometheus"
    mkdir -p "$DATA_DIR/monitoring/alertmanager"
    
    mkdir -p "$SCRIPTS_DIR/backup"
    mkdir -p "$SCRIPTS_DIR/monitoring"
    mkdir -p "$SCRIPTS_DIR/maintenance"
    
    mkdir -p "$LOGS_DIR/api"
    mkdir -p "$LOGS_DIR/nginx"
    mkdir -p "$LOGS_DIR/monitoring"
    
    mkdir -p "$BACKUP_DIR/db"
    mkdir -p "$BACKUP_DIR/config"
    
    # Set proper permissions
    chown -R root:root "$PROJECT_DIR"
    find "$PROJECT_DIR" -type d -exec chmod 755 {} \;
    find "$LOGS_DIR" -type d -exec chmod 775 {} \;
    find "$DATA_DIR" -type d -exec chmod 750 {} \;
    find "$CONFIG_DIR" -type d -exec chmod 750 {} \;
    
    log_success "Project structure created successfully"
    save_state "structure_created"
}

# Function to create Docker Compose file
create_docker_compose() {
    log_info "Creating Docker Compose configuration..."
    
    cat > "$PROJECT_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

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
    image: ${DOCKER_REGISTRY}/risk-platform-api:latest
    container_name: risk-platform-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_USER=risk_platform
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - DB_NAME=risk_platform
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
    volumes:
      - ./config/api:/app/config
      - ./logs/api:/app/logs
    networks:
      - risk-platform-network
    depends_on:
      - db
    secrets:
      - db_password
      - jwt_secret
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
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
      - POSTGRES_DB=risk_platform
    volumes:
      - ./data/db:/var/lib/postgresql/data
    networks:
      - risk-platform-network
    secrets:
      - db_password
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
    volumes:
      - ./data/monitoring/grafana:/var/lib/grafana
      - ./config/monitoring/grafana/dashboards:/etc/grafana/dashboards
      - ./config/monitoring/grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD__FILE=/run/secrets/grafana_admin_password
      - GF_USERS_ALLOW_SIGN_UP=false
    networks:
      - risk-platform-network
    depends_on:
      - prometheus
    secrets:
      - grafana_admin_password
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
    external: true

secrets:
  db_password:
    file: ./config/secrets/db_password.txt
  jwt_secret:
    file: ./config/secrets/jwt_secret.txt
  grafana_admin_password:
    file: ./config/secrets/grafana_admin_password.txt
EOF

    # Create secrets directory and generate random passwords
    mkdir -p "$PROJECT_DIR/config/secrets"
    chmod 700 "$PROJECT_DIR/config/secrets"
    
    # Generate random passwords if they don't exist
    if [ ! -f "$PROJECT_DIR/config/secrets/db_password.txt" ]; then
        openssl rand -base64 32 > "$PROJECT_DIR/config/secrets/db_password.txt"
    fi
    
    if [ ! -f "$PROJECT_DIR/config/secrets/jwt_secret.txt" ]; then
        openssl rand -base64 64 > "$PROJECT_DIR/config/secrets/jwt_secret.txt"
    fi
    
    if [ ! -f "$PROJECT_DIR/config/secrets/grafana_admin_password.txt" ]; then
        openssl rand -base64 16 > "$PROJECT_DIR/config/secrets/grafana_admin_password.txt"
    fi
    
    # Set proper permissions on secrets
    chmod 600 "$PROJECT_DIR/config/secrets/"*.txt
    
    log_success "Docker Compose configuration created successfully"
    save_state "docker_compose_created"
}

# Function to create monitoring configurations
create_monitoring_configs() {
    log_info "Creating monitoring configurations..."
    
    # Create Prometheus configuration
    cat > "$CONFIG_DIR/monitoring/prometheus/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  scrape_timeout: 10s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'api'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['api:3000']
EOF

    # Create Prometheus rules directory and sample alert rules
    mkdir -p "$CONFIG_DIR/monitoring/prometheus/rules"
    
    cat > "$CONFIG_DIR/monitoring/prometheus/rules/alerts.yml" << 'EOF'
groups:
  - name: basic_alerts
    rules:
      - alert: InstanceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Instance {{ $labels.instance }} down"
          description: "{{ $labels.instance }} of job {{ $labels.job }} has been down for more than 1 minute."

      - alert: HighCPULoad
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU load on {{ $labels.instance }}"
          description: "CPU load is above 80% for more than 5 minutes."

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is above 85% for more than 5 minutes."

      - alert: HighDiskUsage
        expr: node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.lxcfs|squashfs"} / node_filesystem_size_bytes{fstype!~"tmpfs|fuse.lxcfs|squashfs"} * 100 < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High disk usage on {{ $labels.instance }}:{{ $labels.mountpoint }}"
          description: "Disk usage is above 90% for more than 5 minutes."
EOF

    # Create Alertmanager configuration
    cat > "$CONFIG_DIR/monitoring/alertmanager/alertmanager.yml" << 'EOF'
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'instance', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 12h
  receiver: 'email-notifications'
  routes:
  - match:
      severity: critical
    receiver: 'email-notifications'
    repeat_interval: 1h

receivers:
- name: 'email-notifications'
  email_configs:
  - to: 'admin@example.com'
    from: 'alertmanager@example.com'
    smarthost: 'smtp.example.com:587'
    auth_username: 'alertmanager@example.com'
    auth_password: 'password'
    require_tls: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']
EOF

    # Create Grafana provisioning directories
    mkdir -p "$CONFIG_DIR/monitoring/grafana/provisioning/datasources"
    mkdir -p "$CONFIG_DIR/monitoring/grafana/provisioning/dashboards"
    
    # Create Grafana datasource provisioning
    cat > "$CONFIG_DIR/monitoring/grafana/provisioning/datasources/prometheus.yml" << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
EOF

    # Create Grafana dashboard provisioning
    cat > "$CONFIG_DIR/monitoring/grafana/provisioning/dashboards/dashboards.yml" << 'EOF'
apiVersion: 1

providers:
  - name: 'Default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/dashboards
EOF

    # Create a sample Grafana dashboard
    cat > "$CONFIG_DIR/monitoring/grafana/dashboards/system-overview.json" << 'EOF'
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": "-- Grafana --",
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "gnetId": null,
  "graphTooltip": 0,
  "id": 1,
  "links": [],
  "panels": [
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 2,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.3.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
          "interval": "",
          "legendFormat": "CPU Usage",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "CPU Usage",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "percent",
          "label": null,
          "logBase": 1,
          "max": "100",
          "min": "0",
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    },
    {
      "aliasColors": {},
      "bars": false,
      "dashLength": 10,
      "dashes": false,
      "datasource": "Prometheus",
      "fieldConfig": {
        "defaults": {
          "custom": {}
        },
        "overrides": []
      },
      "fill": 1,
      "fillGradient": 0,
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "hiddenSeries": false,
      "id": 4,
      "legend": {
        "avg": false,
        "current": false,
        "max": false,
        "min": false,
        "show": true,
        "total": false,
        "values": false
      },
      "lines": true,
      "linewidth": 1,
      "nullPointMode": "null",
      "options": {
        "alertThreshold": true
      },
      "percentage": false,
      "pluginVersion": "7.3.7",
      "pointradius": 2,
      "points": false,
      "renderer": "flot",
      "seriesOverrides": [],
      "spaceLength": 10,
      "stack": false,
      "steppedLine": false,
      "targets": [
        {
          "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
          "interval": "",
          "legendFormat": "Memory Usage",
          "refId": "A"
        }
      ],
      "thresholds": [],
      "timeFrom": null,
      "timeRegions": [],
      "timeShift": null,
      "title": "Memory Usage",
      "tooltip": {
        "shared": true,
        "sort": 0,
        "value_type": "individual"
      },
      "type": "graph",
      "xaxis": {
        "buckets": null,
        "mode": "time",
        "name": null,
        "show": true,
        "values": []
      },
      "yaxes": [
        {
          "format": "percent",
          "label": null,
          "logBase": 1,
          "max": "100",
          "min": "0",
          "show": true
        },
        {
          "format": "short",
          "label": null,
          "logBase": 1,
          "max": null,
          "min": null,
          "show": true
        }
      ],
      "yaxis": {
        "align": false,
        "alignLevel": null
      }
    }
  ],
  "refresh": "5s",
  "schemaVersion": 26,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "System Overview",
  "uid": "system-overview",
  "version": 1
}
EOF

    log_success "Monitoring configurations created successfully"
    save_state "monitoring_configs_created"
}

# Function to create Nginx configuration
create_nginx_config() {
    log_info "Creating Nginx configuration..."
    
    # Create default Nginx configuration
    cat > "$CONFIG_DIR/nginx/default.conf" << 'EOF'
# Default server configuration
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # Redirect all HTTP requests to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name _;

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # HSTS (ngx_http_headers_module is required)
    add_header Strict-Transport-Security "max-age=63072000" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # API proxy
    location /api/ {
        proxy_pass http://api:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Grafana proxy
    location /monitoring/ {
        proxy_pass http://grafana:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        expires 1d;
    }
}
EOF

    # Create self-signed SSL certificate if it doesn't exist
    if [ ! -f "$CONFIG_DIR/ssl/server.crt" ] || [ ! -f "$CONFIG_DIR/ssl/server.key" ]; then
        mkdir -p "$CONFIG_DIR/ssl"
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$CONFIG_DIR/ssl/server.key" \
            -out "$CONFIG_DIR/ssl/server.crt" \
            -subj "/CN=localhost/O=Risk Platform/C=US" \
            -addext "subjectAltName = DNS:localhost,IP:127.0.0.1"
        
        chmod 600 "$CONFIG_DIR/ssl/server.key"
        chmod 644 "$CONFIG_DIR/ssl/server.crt"
    fi
    
    log_success "Nginx configuration created successfully"
    save_state "nginx_config_created"
}

# Function to create backup scripts
create_backup_scripts() {
    log_info "Creating backup scripts..."
    
    # Create database backup script
    cat > "$SCRIPTS_DIR/backup/backup_database.sh" << 'EOF'
#!/bin/bash
# Database backup script

BACKUP_DIR="/opt/risk-platform/backups/db"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/risk-platform-db-$TIMESTAMP.sql.gz"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup the database
echo "Creating database backup: $BACKUP_FILE"
docker exec risk-platform-db pg_dump -U risk_platform -d risk_platform | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully"
    
    # Set proper permissions
    chmod 600 "$BACKUP_FILE"
    
    # Delete old backups
    find "$BACKUP_DIR" -name "risk-platform-db-*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    echo "Cleaned up backups older than $RETENTION_DAYS days"
else
    echo "Backup failed"
    exit 1
fi
EOF

    # Create configuration backup script
    cat > "$SCRIPTS_DIR/backup/backup_config.sh" << 'EOF'
#!/bin/bash
# Configuration backup script

BACKUP_DIR="/opt/risk-platform/backups/config"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/risk-platform-config-$TIMESTAMP.tar.gz"
CONFIG_DIR="/opt/risk-platform/config"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup the configuration
echo "Creating configuration backup: $BACKUP_FILE"
tar -czf "$BACKUP_FILE" -C "$(dirname "$CONFIG_DIR")" "$(basename "$CONFIG_DIR")"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully"
    
    # Set proper permissions
    chmod 600 "$BACKUP_FILE"
    
    # Delete old backups
    find "$BACKUP_DIR" -name "risk-platform-config-*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    echo "Cleaned up backups older than $RETENTION_DAYS days"
else
    echo "Backup failed"
    exit 1
fi
EOF

    # Create full backup script
    cat > "$SCRIPTS_DIR/backup/backup_full.sh" << 'EOF'
#!/bin/bash
# Full system backup script

BACKUP_DIR="/opt/risk-platform/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/risk-platform-full-$TIMESTAMP.tar.gz"
PROJECT_DIR="/opt/risk-platform"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Stop services
echo "Stopping services..."
cd "$PROJECT_DIR" && docker compose down

# Backup the entire project
echo "Creating full backup: $BACKUP_FILE"
tar --exclude="$PROJECT_DIR/backups" -czf "$BACKUP_FILE" -C "$(dirname "$PROJECT_DIR")" "$(basename "$PROJECT_DIR")"

# Start services
echo "Starting services..."
cd "$PROJECT_DIR" && docker compose up -d

if [ $? -eq 0 ]; then
    echo "Backup completed successfully"
    
    # Set proper permissions
    chmod 600 "$BACKUP_FILE"
    
    # Delete old backups
    find "$BACKUP_DIR" -name "risk-platform-full-*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    echo "Cleaned up backups older than $RETENTION_DAYS days"
else
    echo "Backup failed"
    exit 1
fi
EOF

    # Create restore script
    cat > "$SCRIPTS_DIR/backup/restore.sh" << 'EOF'
#!/bin/bash
# Restore script

if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

BACKUP_FILE=$1
PROJECT_DIR="/opt/risk-platform"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Determine backup type
if [[ "$BACKUP_FILE" == *"risk-platform-db-"* ]]; then
    # Database backup
    echo "Restoring database backup: $BACKUP_FILE"
    
    # Stop services
    cd "$PROJECT_DIR" && docker compose down
    
    # Restore database
    zcat "$BACKUP_FILE" | docker exec -i risk-platform-db psql -U risk_platform -d risk_platform
    
    # Start services
    cd "$PROJECT_DIR" && docker compose up -d
    
elif [[ "$BACKUP_FILE" == *"risk-platform-config-"* ]]; then
    # Configuration backup
    echo "Restoring configuration backup: $BACKUP_FILE"
    
    # Stop services
    cd "$PROJECT_DIR" && docker compose down
    
    # Backup current config
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    tar -czf "$PROJECT_DIR/backups/config-before-restore-$TIMESTAMP.tar.gz" -C "$PROJECT_DIR" "config"
    
    # Restore configuration
    rm -rf "$PROJECT_DIR/config"
    tar -xzf "$BACKUP_FILE" -C "$PROJECT_DIR"
    
    # Start services
    cd "$PROJECT_DIR" && docker compose up -d
    
elif [[ "$BACKUP_FILE" == *"risk-platform-full-"* ]]; then
    # Full backup
    echo "Restoring full backup: $BACKUP_FILE"
    
    # Stop services
    cd "$PROJECT_DIR" && docker compose down
    
    # Backup current state
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    tar --exclude="$PROJECT_DIR/backups" -czf "$PROJECT_DIR/backups/before-full-restore-$TIMESTAMP.tar.gz" -C "$(dirname "$PROJECT_DIR")" "$(basename "$PROJECT_DIR")"
    
    # Remove current project (except backups)
    find "$PROJECT_DIR" -mindepth 1 -maxdepth 1 -not -name "backups" -exec rm -rf {} \;
    
    # Restore from backup
    tar -xzf "$BACKUP_FILE" -C "$(dirname "$PROJECT_DIR")"
    
    # Start services
    cd "$PROJECT_DIR" && docker compose up -d
    
else
    echo "Unknown backup type: $BACKUP_FILE"
    exit 1
fi

echo "Restore completed"
EOF

    # Set executable permissions
    chmod +x "$SCRIPTS_DIR/backup/"*.sh
    
    # Create cron jobs for automated backups
    cat > /etc/cron.d/risk-platform-backups << 'EOF'
# Risk Platform automated backups

# Database backup every day at 2 AM
0 2 * * * root /opt/risk-platform/scripts/backup/backup_database.sh >> /var/log/risk-platform-backup.log 2>&1

# Configuration backup every day at 3 AM
0 3 * * * root /opt/risk-platform/scripts/backup/backup_config.sh >> /var/log/risk-platform-backup.log 2>&1

# Full backup every Sunday at 4 AM
0 4 * * 0 root /opt/risk-platform/scripts/backup/backup_full.sh >> /var/log/risk-platform-backup.log 2>&1
EOF

    log_success "Backup scripts created successfully"
    save_state "backup_scripts_created"
}

# Function to create monitoring scripts
create_monitoring_scripts() {
    log_info "Creating monitoring scripts..."
    
    # Create health check script
    cat > "$SCRIPTS_DIR/monitoring/health_check.sh" << 'EOF'
#!/bin/bash
# Health check script

PROJECT_DIR="/opt/risk-platform"
LOG_FILE="/var/log/risk-platform-health.log"

# Check if Docker is running
if ! systemctl is-active --quiet docker; then
    echo "$(date): Docker is not running!" >> "$LOG_FILE"
    systemctl start docker
    echo "$(date): Started Docker" >> "$LOG_FILE"
fi

# Check if containers are running
cd "$PROJECT_DIR"
CONTAINERS=$(docker compose ps -q)
if [ -z "$CONTAINERS" ]; then
    echo "$(date): No containers are running!" >> "$LOG_FILE"
    docker compose up -d
    echo "$(date): Started containers" >> "$LOG_FILE"
fi

# Check container health
for CONTAINER in $(docker compose ps -q); do
    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER" 2>/dev/null)
    if [ "$HEALTH" = "unhealthy" ]; then
        CONTAINER_NAME=$(docker inspect --format='{{.Name}}' "$CONTAINER" | sed 's/\///')
        echo "$(date): Container $CONTAINER_NAME is unhealthy!" >> "$LOG_FILE"
        docker restart "$CONTAINER"
        echo "$(date): Restarted container $CONTAINER_NAME" >> "$LOG_FILE"
    fi
done

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "$(date): Disk usage is high: $DISK_USAGE%" >> "$LOG_FILE"
    
    # Clean up Docker
    docker system prune -af --volumes
    echo "$(date): Cleaned up Docker resources" >> "$LOG_FILE"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk '/Mem:/ {print int($3/$2 * 100)}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    echo "$(date): Memory usage is high: $MEMORY_USAGE%" >> "$LOG_FILE"
    
    # Restart services to free up memory
    docker compose restart
    echo "$(date): Restarted services to free up memory" >> "$LOG_FILE"
fi

echo "$(date): Health check completed" >> "$LOG_FILE"
EOF

    # Create log rotation script
    cat > "$SCRIPTS_DIR/monitoring/rotate_logs.sh" << 'EOF'
#!/bin/bash
# Log rotation script

PROJECT_DIR="/opt/risk-platform"
LOGS_DIR="$PROJECT_DIR/logs"
MAX_SIZE_MB=100
MAX_AGE_DAYS=7

# Find and compress logs larger than MAX_SIZE_MB
find "$LOGS_DIR" -type f -name "*.log" -size +${MAX_SIZE_MB}M | while read -r log_file; do
    gzip -9 "$log_file"
    touch "${log_file}.gz"
    echo "Compressed log file: $log_file"
done

# Delete old compressed logs
find "$LOGS_DIR" -type f -name "*.log.gz" -mtime +$MAX_AGE_DAYS -delete
echo "Deleted compressed logs older than $MAX_AGE_DAYS days"

# Create new log files if they were compressed
for dir in $(find "$LOGS_DIR" -type d); do
    for log_base in $(find "$dir" -type f -name "*.log.gz" | sed 's/\.gz$//' | sort | uniq); do
        if [ ! -f "$log_base" ]; then
            touch "$log_base"
            chmod 644 "$log_base"
            echo "Created new log file: $log_base"
        fi
    done
done

echo "Log rotation completed"
EOF

    # Set executable permissions
    chmod +x "$SCRIPTS_DIR/monitoring/"*.sh
    
    # Create cron jobs for monitoring
    cat > /etc/cron.d/risk-platform-monitoring << 'EOF'
# Risk Platform monitoring

# Health check every 5 minutes
*/5 * * * * root /opt/risk-platform/scripts/monitoring/health_check.sh

# Log rotation every day at 1 AM
0 1 * * * root /opt/risk-platform/scripts/monitoring/rotate_logs.sh >> /var/log/risk-platform-logrotate.log 2>&1
EOF

    log_success "Monitoring scripts created successfully"
    save_state "monitoring_scripts_created"
}

# Function to validate the setup
validate_setup() {
    log_info "Validating setup..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed!"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose is not installed!"
        exit 1
    fi
    
    # Check if project directory exists
    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "Project directory does not exist: $PROJECT_DIR"
        exit 1
    fi
    
    # Check if Docker Compose file exists
    if [ ! -f "$PROJECT_DIR/docker-compose.yml" ]; then
        log_error "Docker Compose file does not exist: $PROJECT_DIR/docker-compose.yml"
        exit 1
    fi
    
    # Check if Nginx configuration exists
    if [ ! -f "$CONFIG_DIR/nginx/default.conf" ]; then
        log_error "Nginx configuration not found: $CONFIG_DIR/nginx/default.conf"
        exit 1
    fi
    
    # Check if Prometheus configuration exists
    if [ ! -f "$CONFIG_DIR/monitoring/prometheus/prometheus.yml" ]; then
        log_error "Prometheus configuration not found: $CONFIG_DIR/monitoring/prometheus/prometheus.yml"
        exit 1
    fi
    
    # Check if Docker is running
    if ! systemctl is-active --quiet docker; then
        log_error "Docker is not running!"
        exit 1
    fi
    
    # Validate Docker Compose file
    cd "$PROJECT_DIR"
    if ! docker compose config &>/dev/null; then
        log_error "Docker Compose configuration is invalid!"
        exit 1
    fi
    
    log_success "Validation completed successfully"
    save_state "validation_completed"
}

# Function to deploy the platform
deploy_platform() {
    log_info "Deploying platform..."
    
    # Navigate to project directory
    cd "$PROJECT_DIR"
    
    # Pull Docker images
    log_info "Pulling Docker images..."
    docker compose pull
    
    # Start services
    log_info "Starting services..."
    docker compose up -d
    
    # Check if services are running
    if [ "$(docker compose ps -q | wc -l)" -gt 0 ]; then
        log_success "Services started successfully"
    else
        log_error "Failed to start services"
        exit 1
    fi
    
    # Create a simple HTML page
    mkdir -p /usr/share/nginx/html
    cat > /usr/share/nginx/html/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Platform</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .status {
            background-color: #e8f4f8;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .links {
            margin-top: 30px;
        }
        .links a {
            display: inline-block;
            margin-right: 15px;
            background-color: #3498db;
            color: white;
            padding: 10px 15px;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        .links a:hover {
            background-color: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Risk Platform</h1>
        <p>Welcome to the Risk Platform deployment. This platform provides comprehensive risk management capabilities for your organization.</p>
        
        <div class="status">
            <h2>System Status</h2>
            <p>The platform has been successfully deployed and is running.</p>
        </div>
        
        <div class="links">
            <h2>Quick Links</h2>
            <a href="/api/status">API Status</a>
            <a href="/monitoring">Monitoring Dashboard</a>
        </div>
    </div>
</body>
</html>
EOF

    log_success "Platform deployed successfully"
    save_state "platform_deployed"
}

# Function to display final message
display_final_message() {
    IP_ADDRESS=$(hostname -I | awk '{print $1}')
    
    echo ""
    echo "==============================================="
    echo "       Risk Platform Deployment Complete       "
    echo "==============================================="
    echo ""
    echo "The Risk Platform has been successfully deployed on your VPS."
    echo ""
    echo "Access the platform at: https://$IP_ADDRESS"
    echo "Access the monitoring dashboard at: https://$IP_ADDRESS/monitoring"
    echo ""
    echo "Grafana admin password: $(cat "$PROJECT_DIR/config/secrets/grafana_admin_password.txt")"
    echo ""
    echo "Important directories:"
    echo "- Configuration: $CONFIG_DIR"
    echo "- Data: $DATA_DIR"
    echo "- Logs: $LOGS_DIR"
    echo "- Backups: $BACKUP_DIR"
    echo "- Scripts: $SCRIPTS_DIR"
    echo ""
    echo "Backup scripts are scheduled to run automatically."
    echo "Health checks are performed every 5 minutes."
    echo ""
    echo "For more information, refer to the documentation."
    echo "==============================================="
    
    log_success "Deployment process completed successfully"
    save_state "completed"
}

# Main function
main() {
    local arg=${1:---all}
    
    # Display header
    echo "==============================================="
    echo "  Risk Platform VPS Deployment - Version $SCRIPT_VERSION  "
    echo "==============================================="
    
    # Create necessary directories
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$STATE_FILE")"
    
    # Process arguments
    case "$arg" in
        --all)
            log_info "Starting full deployment process..."
            install_docker
            create_project_structure
            create_docker_compose
            create_monitoring_configs
            create_nginx_config
            create_backup_scripts
            create_monitoring_scripts
            validate_setup
            deploy_platform
            display_final_message
            ;;
        --docker)
            log_info "Installing Docker only..."
            install_docker
            ;;
        --structure)
            log_info "Creating project structure only..."
            create_project_structure
            create_docker_compose
            create_monitoring_configs
            create_nginx_config
            ;;
        --services)
            log_info "Setting up services only..."
            create_backup_scripts
            create_monitoring_scripts
            validate_setup
            deploy_platform
            ;;
        --deploy)
            log_info "Deploying platform only..."
            validate_setup
            deploy_platform
            display_final_message
            ;;
        --help)
            cat << USAGE
Risk-Platform VPS Deployment  (version ${SCRIPT_VERSION})

Usage: $0 [OPTIONS]
    --all        Run ALL steps (default if no option supplied)
    --docker     Docker installation only
    --structure  Create project structure only
    --services   API & monitoring services setup only
    --deploy     Deploy platform only
    --help       Display this help message
USAGE
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            help
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"
