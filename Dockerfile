# Multi-stage build for Cyber Trust Sensor Dashboard
# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Add package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies with exact versions and clean cache
RUN npm ci --production=false && \
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

# Add cache control for static assets
RUN echo 'location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {' > /etc/nginx/conf.d/cache.conf && \
    echo '    expires 30d;' >> /etc/nginx/conf.d/cache.conf && \
    echo '    add_header Cache-Control "public, no-transform";' >> /etc/nginx/conf.d/cache.conf && \
    echo '}' >> /etc/nginx/conf.d/cache.conf

# Run nginx as non-root user
RUN sed -i 's/user  nginx;/user  nginx;/' /etc/nginx/nginx.conf && \
    sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/nginx.conf

# Expose port 8080 instead of 80 for non-root usage
EXPOSE 8080

# Use non-root user
USER nginx

CMD ["nginx", "-g", "daemon off;"]
