#!/bin/bash
# =====================================================
# Test User Creation and Login Script
# =====================================================

API_URL="http://localhost:3001/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "Cyber Trust API - User Account Setup"
echo "========================================="
echo ""

# Function to test API health
test_api_health() {
    echo -e "${BLUE}Testing API connection...${NC}"
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL/health")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ API is healthy${NC}"
        echo "Response: $body"
        return 0
    else
        echo -e "${RED}✗ API is not responding (HTTP $http_code)${NC}"
        return 1
    fi
}

# Function to register a new user
register_user() {
    echo ""
    echo -e "${BLUE}Creating a new user account...${NC}"
    
    read -p "Enter email: " email
    read -s -p "Enter password (min 8 chars): " password
    echo
    read -p "Enter first name: " firstName
    read -p "Enter last name: " lastName
    read -p "Enter organization name (optional): " orgName
    
    # Create JSON payload
    json_data=$(cat <<EOF
{
    "email": "$email",
    "password": "$password",
    "firstName": "$firstName",
    "lastName": "$lastName",
    "organizationName": "$orgName"
}
EOF
    )
    
    echo ""
    echo -e "${BLUE}Registering user...${NC}"
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$json_data" \
        "$API_URL/auth/register")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ User registered successfully!${NC}"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
        
        # Extract token
        token=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        if [ ! -z "$token" ]; then
            echo ""
            echo -e "${GREEN}Your authentication token:${NC}"
            echo "$token"
            echo ""
            echo "Save this token to authenticate API requests!"
        fi
    elif [ "$http_code" = "409" ]; then
        echo -e "${YELLOW}User already exists. Try logging in instead.${NC}"
    else
        echo -e "${RED}✗ Registration failed (HTTP $http_code)${NC}"
        echo "$body"
    fi
}

# Function to login
login_user() {
    echo ""
    echo -e "${BLUE}Login to existing account...${NC}"
    
    read -p "Enter email: " email
    read -s -p "Enter password: " password
    echo
    
    # Create JSON payload
    json_data=$(cat <<EOF
{
    "email": "$email",
    "password": "$password"
}
EOF
    )
    
    echo ""
    echo -e "${BLUE}Logging in...${NC}"
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$json_data" \
        "$API_URL/auth/login")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Login successful!${NC}"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
        
        # Extract token
        token=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        if [ ! -z "$token" ]; then
            echo ""
            echo -e "${GREEN}Your authentication token:${NC}"
            echo "$token"
            echo ""
            echo "Token saved to: /tmp/cyber-trust-token.txt"
            echo "$token" > /tmp/cyber-trust-token.txt
            
            # Test authenticated endpoint
            test_authenticated_endpoint "$token"
        fi
    else
        echo -e "${RED}✗ Login failed (HTTP $http_code)${NC}"
        echo "$body"
    fi
}

# Function to test authenticated endpoint
test_authenticated_endpoint() {
    local token=$1
    
    echo ""
    echo -e "${BLUE}Testing authenticated access...${NC}"
    
    response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $token" \
        "$API_URL/auth/me")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Authenticated access successful!${NC}"
        echo "Your profile:"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Authentication test failed${NC}"
    fi
}

# Function to create test users
create_test_users() {
    echo ""
    echo -e "${BLUE}Creating test users...${NC}"
    
    # Admin user
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@cybertest.com",
            "password": "AdminPass123!",
            "firstName": "Admin",
            "lastName": "User",
            "organizationName": "Cyber Test Org"
        }' \
        "$API_URL/auth/register" > /dev/null 2>&1
    
    echo -e "${GREEN}✓ Created admin@cybertest.com (password: AdminPass123!)${NC}"
    
    # Regular user
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "email": "user@cybertest.com",
            "password": "UserPass123!",
            "firstName": "Test",
            "lastName": "User"
        }' \
        "$API_URL/auth/register" > /dev/null 2>&1
    
    echo -e "${GREEN}✓ Created user@cybertest.com (password: UserPass123!)${NC}"
}

# Main menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "1) Test API health"
    echo "2) Register new user"
    echo "3) Login to existing account"
    echo "4) Create test users"
    echo "5) Show example API calls"
    echo "0) Exit"
    echo ""
    read -p "Select option: " choice
    
    case $choice in
        1)
            test_api_health
            show_menu
            ;;
        2)
            register_user
            show_menu
            ;;
        3)
            login_user
            show_menu
            ;;
        4)
            create_test_users
            show_menu
            ;;
        5)
            show_api_examples
            show_menu
            ;;
        0)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid option"
            show_menu
            ;;
    esac
}

# Function to show API examples
show_api_examples() {
    echo ""
    echo "========================================="
    echo "Example API Calls"
    echo "========================================="
    echo ""
    echo "# Register a new user:"
    echo 'curl -X POST http://localhost:3001/api/auth/register \'
    echo '  -H "Content-Type: application/json" \'
    echo '  -d '"'"'{"email":"test@example.com","password":"Test123!","firstName":"John","lastName":"Doe"}'"'"
    echo ""
    echo "# Login:"
    echo 'curl -X POST http://localhost:3001/api/auth/login \'
    echo '  -H "Content-Type: application/json" \'
    echo '  -d '"'"'{"email":"test@example.com","password":"Test123!"}'"'"
    echo ""
    echo "# Get profile (authenticated):"
    echo 'curl -H "Authorization: Bearer YOUR_TOKEN" \'
    echo '  http://localhost:3001/api/auth/me'
    echo ""
    echo "# Get dashboard summary:"
    echo 'curl -H "Authorization: Bearer YOUR_TOKEN" \'
    echo '  http://localhost:3001/api/dashboard/summary'
    echo ""
    echo "# Get requirements:"
    echo 'curl -H "Authorization: Bearer YOUR_TOKEN" \'
    echo '  http://localhost:3001/api/requirements'
    echo ""
}

# Check if API is specified as argument
if [ ! -z "$1" ]; then
    API_URL="$1/api"
    echo "Using API URL: $API_URL"
fi

# Start
echo "Checking API at: $API_URL"
if test_api_health; then
    show_menu
else
    echo ""
    echo -e "${YELLOW}Make sure the API is running:${NC}"
    echo "  cd /opt/risk-platform/api && node server.js"
    echo ""
    echo "Or check if it's running on a different port/host"
fi