#!/bin/bash
# =====================================================
# Cyber Trust API Deployment Script
# =====================================================

echo "========================================="
echo "Deploying Cyber Trust API"
echo "========================================="

# Navigate to API directory
cd /opt/risk-platform/api

# Create package.json
cat > package.json << 'EOF'
{
  "name": "cyber-trust-api",
  "version": "1.0.0",
  "description": "Cyber Trust Platform API Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create .env file for API
cat > .env << 'EOF'
# API Configuration
NODE_ENV=production
API_PORT=3001

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-$(openssl rand -hex 32)

# Frontend URL for CORS
FRONTEND_URL=http://31.97.114.80

# Logging
LOG_LEVEL=info
EOF

# Create Dockerfile for API
cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]
EOF

# Create docker-compose.yml for API
cat > /opt/risk-platform/docker-compose.api.yml << 'EOF'
version: '3.8'

services:
  api:
    container_name: cyber-trust-api
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - API_PORT=3001
    volumes:
      - /opt/risk-platform/.env.database:/usr/src/app/.env.database:ro
      - /opt/risk-platform/logs:/usr/src/app/logs
    networks:
      - cyber-trust-network
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    external: true
    container_name: cyber-trust-postgres

networks:
  cyber-trust-network:
    external: true
    name: my-working-prototype-dashbaord_default
EOF

# Install dependencies
echo "Installing dependencies..."
npm install

# Create PM2 ecosystem file for production
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'cyber-trust-api',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      API_PORT: 3001
    },
    error_file: '/opt/risk-platform/logs/api-error.log',
    out_file: '/opt/risk-platform/logs/api-out.log',
    log_file: '/opt/risk-platform/logs/api-combined.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 4000,
    autorestart: true,
    watch: false
  }]
};
EOF

# Create systemd service (alternative to Docker)
sudo cat > /etc/systemd/system/cyber-trust-api.service << 'EOF'
[Unit]
Description=Cyber Trust API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/risk-platform/api
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=append:/opt/risk-platform/logs/api.log
StandardError=append:/opt/risk-platform/logs/api-error.log

[Install]
WantedBy=multi-user.target
EOF

echo "========================================="
echo "API Deployment Complete!"
echo "========================================="
echo ""
echo "To start the API, choose one of these methods:"
echo ""
echo "Option 1 - Using Node directly:"
echo "  cd /opt/risk-platform/api && node server.js"
echo ""
echo "Option 2 - Using PM2 (recommended for production):"
echo "  npm install -g pm2"
echo "  cd /opt/risk-platform/api && pm2 start ecosystem.config.js"
echo ""
echo "Option 3 - Using systemd service:"
echo "  systemctl enable cyber-trust-api"
echo "  systemctl start cyber-trust-api"
echo ""
echo "Option 4 - Using Docker:"
echo "  docker-compose -f /opt/risk-platform/docker-compose.api.yml up -d"
echo ""
echo "API will be available at: http://31.97.114.80:3001"
echo ""
echo "Test the API:"
echo "  curl http://localhost:3001/api/health"
echo ""