#!/bin/bash
# Build React Application
# This script installs dependencies and builds your React app

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================="
echo "Building React Application"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found!${NC}"
    echo "Make sure you're in the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not installed. Installing...${NC}"
    
    # Install Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo -e "${GREEN}Node.js installed: $(node --version)${NC}"
fi

# Check Node version
NODE_VERSION=$(node --version)
echo -e "${BLUE}Node.js version: ${NODE_VERSION}${NC}"

# Step 1: Install dependencies
echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
echo "This may take a few minutes..."

# Clean npm cache first
npm cache clean --force

# Remove node_modules and package-lock if they exist
rm -rf node_modules package-lock.json

# Install dependencies
if npm install; then
    echo -e "${GREEN}Dependencies installed successfully${NC}"
else
    echo -e "${RED}Failed to install dependencies${NC}"
    echo "Trying with --legacy-peer-deps flag..."
    
    if npm install --legacy-peer-deps; then
        echo -e "${GREEN}Dependencies installed with legacy-peer-deps${NC}"
    else
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
fi

echo ""

# Step 2: Build the application
echo -e "${BLUE}Step 2: Building the application...${NC}"
echo "This may take a few minutes..."

# Set CI=false to ignore warnings
export CI=false

if npm run build; then
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo ""
    
    # Check the build directory
    if [ -d "build" ]; then
        echo "Build directory contents:"
        ls -la build/ | head -10
        echo ""
        
        # Check build size
        BUILD_SIZE=$(du -sh build | cut -f1)
        echo -e "${GREEN}Build size: ${BUILD_SIZE}${NC}"
    fi
else
    echo -e "${RED}Build failed!${NC}"
    echo "Check the error messages above"
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}Build Complete!${NC}"
echo "========================================="
echo ""
echo "Your React app has been built successfully."
echo "The build files are in the 'build' directory."
echo ""
echo "Next steps:"
echo "1. The nginx container will automatically serve these files"
echo "2. Access your app at: http://31.97.114.80"
echo ""
echo "If nginx is not running, start it with:"
echo "  docker compose up -d"
