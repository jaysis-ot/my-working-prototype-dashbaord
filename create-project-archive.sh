#!/bin/bash
#
# create-project-archive.sh - Cyber Trust Sensor Dashboard Project Archiver
#
# This script creates a comprehensive archive of the Cyber Trust Sensor Dashboard project,
# organizing files by category, generating a manifest, and creating a timestamped zip file.
#
# Usage: ./create-project-archive.sh [output_directory]
#
# If output_directory is not specified, the archive will be created in the current directory.
#

set -e  # Exit on error

# Color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored status messages
print_status() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_NAME="cyber-trust-dashboard"
ARCHIVE_NAME="${PROJECT_NAME}_${TIMESTAMP}"
PROJECT_ROOT="$(pwd)"
OUTPUT_DIR="${1:-$PROJECT_ROOT}"
ARCHIVE_DIR="${OUTPUT_DIR}/${ARCHIVE_NAME}"
MANIFEST_FILE="${ARCHIVE_DIR}/FILE_MANIFEST.md"
INVENTORY_FILE="${ARCHIVE_DIR}/PROJECT_INVENTORY.md"

# Category directories
SOURCE_DIR="${ARCHIVE_DIR}/source"
CONFIG_DIR="${ARCHIVE_DIR}/config"
DOCS_DIR="${ARCHIVE_DIR}/docs"
SCRIPTS_DIR="${ARCHIVE_DIR}/scripts"
DEPLOYMENT_DIR="${ARCHIVE_DIR}/deployment"

# Files to exclude
EXCLUDE_PATTERNS=(
  "node_modules"
  ".git"
  "build"
  "dist"
  "coverage"
  ".DS_Store"
  ".env"
  "*.log"
  "tmp"
  ".cache"
  ".npm"
)

# Create exclude arguments for rsync
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_ARGS="${EXCLUDE_ARGS} --exclude='${pattern}'"
done

# Create the archive directory structure
create_directory_structure() {
  print_status "Creating archive directory structure..."
  
  mkdir -p "${ARCHIVE_DIR}"
  mkdir -p "${SOURCE_DIR}"
  mkdir -p "${CONFIG_DIR}"
  mkdir -p "${DOCS_DIR}"
  mkdir -p "${SCRIPTS_DIR}"
  mkdir -p "${DEPLOYMENT_DIR}"
  
  print_success "Directory structure created at ${ARCHIVE_DIR}"
}

# Copy source code files
copy_source_files() {
  print_status "Copying source code files..."
  
  # Create src directory if it exists
  if [ -d "${PROJECT_ROOT}/src" ]; then
    mkdir -p "${SOURCE_DIR}/src"
    eval rsync -av ${EXCLUDE_ARGS} "${PROJECT_ROOT}/src/" "${SOURCE_DIR}/src/"
  fi
  
  # Copy package.json and other root source files
  cp -f "${PROJECT_ROOT}/package.json" "${SOURCE_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/package-lock.json" "${SOURCE_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/tsconfig.json" "${SOURCE_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/.npmrc" "${SOURCE_DIR}/" 2>/dev/null || true
  
  # Copy public directory if it exists
  if [ -d "${PROJECT_ROOT}/public" ]; then
    mkdir -p "${SOURCE_DIR}/public"
    eval rsync -av ${EXCLUDE_ARGS} "${PROJECT_ROOT}/public/" "${SOURCE_DIR}/public/"
  fi
  
  print_success "Source files copied"
}

# Copy configuration files
copy_config_files() {
  print_status "Copying configuration files..."
  
  # Nginx configurations
  mkdir -p "${CONFIG_DIR}/nginx/conf.d"
  cp -f "${PROJECT_ROOT}/nginx.conf" "${CONFIG_DIR}/" 2>/dev/null || true
  cp -rf "${PROJECT_ROOT}/nginx/conf.d/" "${CONFIG_DIR}/nginx/" 2>/dev/null || true
  
  # Docker configurations
  cp -f "${PROJECT_ROOT}/Dockerfile" "${CONFIG_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/docker-compose.yml" "${CONFIG_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/.env.example" "${CONFIG_DIR}/" 2>/dev/null || true
  
  # Prometheus and Grafana configs
  mkdir -p "${CONFIG_DIR}/prometheus"
  mkdir -p "${CONFIG_DIR}/grafana/provisioning"
  cp -rf "${PROJECT_ROOT}/prometheus/" "${CONFIG_DIR}/prometheus/" 2>/dev/null || true
  cp -rf "${PROJECT_ROOT}/grafana/provisioning/" "${CONFIG_DIR}/grafana/" 2>/dev/null || true
  
  print_success "Configuration files copied"
}

# Copy documentation files
copy_docs_files() {
  print_status "Copying documentation files..."
  
  # Copy markdown files
  cp -f "${PROJECT_ROOT}/README.md" "${DOCS_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/DEPLOYMENT_GUIDE.md" "${DOCS_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/DEVELOPMENT_ROADMAP.md" "${DOCS_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/VPS_DEPLOYMENT_WALKTHROUGH.md" "${DOCS_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/ENV_CONFIGURATION_GUIDE.md" "${DOCS_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/README-standup.md" "${DOCS_DIR}/" 2>/dev/null || true
  
  # Copy the project inventory file
  cp -f "${PROJECT_ROOT}/PROJECT_INVENTORY.md" "${INVENTORY_FILE}" 2>/dev/null || true
  
  print_success "Documentation files copied"
}

# Copy scripts
copy_scripts() {
  print_status "Copying scripts..."
  
  # Copy shell scripts
  cp -f "${PROJECT_ROOT}/diagnose-port80.sh" "${SCRIPTS_DIR}/" 2>/dev/null || true
  cp -rf "${PROJECT_ROOT}/scripts/" "${SCRIPTS_DIR}/" 2>/dev/null || true
  
  # Make scripts executable
  find "${SCRIPTS_DIR}" -type f -name "*.sh" -exec chmod +x {} \;
  
  print_success "Scripts copied"
}

# Copy deployment files
copy_deployment_files() {
  print_status "Copying deployment files..."
  
  # Create directory structure for deployment files
  mkdir -p "${DEPLOYMENT_DIR}/nginx/ssl"
  mkdir -p "${DEPLOYMENT_DIR}/nginx/logs"
  mkdir -p "${DEPLOYMENT_DIR}/postgres/init"
  mkdir -p "${DEPLOYMENT_DIR}/postgres/backups"
  
  # Copy deployment-specific files
  cp -f "${PROJECT_ROOT}/docker-compose.yml" "${DEPLOYMENT_DIR}/" 2>/dev/null || true
  cp -f "${PROJECT_ROOT}/.env.example" "${DEPLOYMENT_DIR}/.env.example" 2>/dev/null || true
  
  print_success "Deployment files copied"
}

# Generate file manifest
generate_manifest() {
  print_status "Generating file manifest..."
  
  cat > "${MANIFEST_FILE}" << EOF
# Cyber Trust Sensor Dashboard - File Manifest
Generated: $(date)

This manifest lists all files included in the archive, organized by category.

## Source Code
$(find "${SOURCE_DIR}" -type f | sort | sed 's|'"${ARCHIVE_DIR}"'/|* |')

## Configuration
$(find "${CONFIG_DIR}" -type f | sort | sed 's|'"${ARCHIVE_DIR}"'/|* |')

## Documentation
$(find "${DOCS_DIR}" -type f | sort | sed 's|'"${ARCHIVE_DIR}"'/|* |')

## Scripts
$(find "${SCRIPTS_DIR}" -type f | sort | sed 's|'"${ARCHIVE_DIR}"'/|* |')

## Deployment
$(find "${DEPLOYMENT_DIR}" -type f | sort | sed 's|'"${ARCHIVE_DIR}"'/|* |')

EOF
  
  print_success "File manifest generated at ${MANIFEST_FILE}"
}

# Create zip archive
create_zip_archive() {
  print_status "Creating zip archive..."
  
  ZIP_FILE="${OUTPUT_DIR}/${ARCHIVE_NAME}.zip"
  
  # Navigate to output directory and zip the archive directory
  cd "${OUTPUT_DIR}"
  zip -r "${ZIP_FILE}" "${ARCHIVE_NAME}"
  
  print_success "Zip archive created at ${ZIP_FILE}"
}

# Main function
main() {
  print_status "Starting Cyber Trust Sensor Dashboard archiving process..."
  
  # Check if we're in the project root
  if [ ! -f "package.json" ] && [ ! -f "docker-compose.yml" ]; then
    print_warning "Current directory might not be the project root."
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_error "Archiving aborted."
      exit 1
    fi
  fi
  
  # Create directory structure
  create_directory_structure
  
  # Copy files by category
  copy_source_files
  copy_config_files
  copy_docs_files
  copy_scripts
  copy_deployment_files
  
  # Generate manifest
  generate_manifest
  
  # Create zip archive
  create_zip_archive
  
  print_success "Archiving complete! Archive created at: ${OUTPUT_DIR}/${ARCHIVE_NAME}.zip"
  echo
  echo "To extract the archive:"
  echo "  unzip ${ARCHIVE_NAME}.zip"
  echo
  echo "The archive contains:"
  echo "  - Source code files (React, TypeScript)"
  echo "  - Configuration files (Nginx, Docker, Prometheus, etc.)"
  echo "  - Documentation (README, guides, etc.)"
  echo "  - Scripts (diagnostics, backups, etc.)"
  echo "  - Deployment files (docker-compose, env templates, etc.)"
  echo "  - PROJECT_INVENTORY.md (comprehensive project overview)"
  echo "  - FILE_MANIFEST.md (detailed file listing)"
}

# Run the main function
main
