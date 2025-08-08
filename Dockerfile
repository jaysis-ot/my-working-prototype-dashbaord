# Multi-stage build for Cyber Trust Sensor Dashboard
# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Add package files first for better caching
COPY package.json package-lock.json ./

# ------------------------------------------------------------------
# Install dependencies (tolerant mode)
# ------------------------------------------------------------------
#   • Write a local .npmrc that forces legacy-peer-deps so npm ignores
#     the TypeScript peer-dependency conflict between react-scripts
#     5.x and TypeScript ≥5.                                                   
#   • Use `npm install` instead of `npm ci` so the flag is honoured.           
#   • Disable audit & progress for faster, quieter CI logs.                    
# ------------------------------------------------------------------
RUN echo 'legacy-peer-deps=true' > .npmrc && \
    npm install --legacy-peer-deps --no-audit --progress=false && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:stable-alpine

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY --from=build /app/build/static /usr/share/nginx/html/static

# Add custom nginx configuration for SPA routing
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Create health endpoint directory and file
RUN mkdir -p /usr/share/nginx/html/health && \
    echo "OK" > /usr/share/nginx/html/health/index.html

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Configure security headers and optimizations
RUN echo 'server_tokens off;' > /etc/nginx/conf.d/security.conf && \
    echo 'add_header X-Frame-Options SAMEORIGIN;' >> /etc/nginx/conf.d/security.conf && \
    echo 'add_header X-Content-Type-Options nosniff;' >> /etc/nginx/conf.d/security.conf && \
    echo 'add_header X-XSS-Protection "1; mode=block";' >> /etc/nginx/conf.d/security.conf && \
    echo 'add_header Content-Security-Policy "default-src '\''self'\''; script-src '\''self'\''; img-src '\''self'\'' data:; style-src '\''self'\'' '\''unsafe-inline'\''; font-src '\''self'\'' data:; connect-src '\''self'\''";' >> /etc/nginx/conf.d/security.conf && \
    echo 'add_header Referrer-Policy "strict-origin-when-cross-origin";' >> /etc/nginx/conf.d/security.conf

# ------------------------------------------------------------------------------
# Fix permissions & prepare cache/temp directories for non-root execution
# ------------------------------------------------------------------------------
#   1. Remove potential root-owned cache/temp directories that nginx tries to
#      create on start-up (`/var/cache/nginx/*_temp`).
#   2. Ensure they exist and are owned by the `nginx` user so that nginx can
#      write to them without needing root privileges.
#   3. Keep nginx listening on port 80 (default) to align with the docker-compose
#      port mapping.
# ------------------------------------------------------------------------------
RUN mkdir -p /var/cache/nginx /var/run/nginx /var/tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx /var/tmp/nginx /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose default HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
