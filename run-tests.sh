#!/bin/bash

# Grand Slam Offer Application - Test Runner Script
# This script helps execute all testing procedures for the application

echo "🚀 Grand Slam Offer Application - Test Suite"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "info") echo -e "${BLUE}🔍 $2${NC}" ;;
    esac
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_status "error" "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_status "error" "npm is not installed. Please install npm first."
    exit 1
fi

print_status "info" "Starting comprehensive test suite..."

# 1. Check environment variables
print_status "info" "Checking environment variables..."
required_vars=("NEXTAUTH_URL" "NEXTAUTH_SECRET" "MONGODB_URI" "OPENAI_API_KEY" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_status "error" "Missing environment variables: ${missing_vars[*]}"
    echo "Please set these variables before running tests."
    exit 1
else
    print_status "success" "All required environment variables are set"
fi

# 2. Check if application is running
print_status "info" "Checking if application is running..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    print_status "success" "Application is running on port 3000"
else
    print_status "warning" "Application is not running on port 3000"
    print_status "info" "Starting application..."
    
    # Kill any existing process on port 3000
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
        print_status "info" "Killing existing process on port 3000..."
        kill -9 $(lsof -Pi :3000 -sTCP:LISTEN -t) 2>/dev/null
        sleep 2
    fi
    
    # Start the application in background
    npm run dev &
    APP_PID=$!
    
    # Wait for application to start
    print_status "info" "Waiting for application to start..."
    for i in {1..30}; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
            print_status "success" "Application started successfully"
            break
        fi
        sleep 2
    done
    
    if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        print_status "error" "Failed to start application"
        exit 1
    fi
fi

# 3. Run automated tests
print_status "info" "Running automated tests..."
if [ -f "test-automation.js" ]; then
    node test-automation.js
    TEST_RESULT=$?
    
    if [ $TEST_RESULT -eq 0 ]; then
        print_status "success" "Automated tests passed"
    else
        print_status "error" "Automated tests failed"
    fi
else
    print_status "warning" "test-automation.js not found, skipping automated tests"
fi

# 4. Manual testing checklist
print_status "info" "Manual testing checklist:"
echo ""
echo "Please complete the following manual tests:"
echo ""
echo "📋 Phase 1: Authentication & User Registration"
echo "   □ Test new user registration with Google OAuth"
echo "   □ Test existing user login"
echo "   □ Verify user profile creation in database"
echo ""
echo "📋 Phase 2: Free Tier Testing"
echo "   □ Test free user first generation"
echo "   □ Test daily limit enforcement"
echo "   □ Test credit exhaustion behavior"
echo ""
echo "📋 Phase 3: Purchase Flow Testing"
echo "   □ Test free to paid tier upgrade"
echo "   □ Test direct purchase flow"
echo "   □ Test purchase validation"
echo ""
echo "📋 Phase 4: Generation System Testing"
echo "   □ Test complete offer generation"
echo "   □ Test background processing"
echo "   □ Test generation failure handling"
echo ""
echo "📋 Phase 5: Regeneration System Testing"
echo "   □ Test Starter Spark regeneration"
echo "   □ Test regeneration limits"
echo "   □ Test higher tier regeneration behavior"
echo ""
echo "📋 Phase 6: Database Integrity Testing"
echo "   □ Test concurrent operations"
echo "   □ Test data consistency"
echo "   □ Check for race conditions"
echo ""
echo "📋 Phase 7: UI/UX Testing"
echo "   □ Test tier-specific UI elements"
echo "   □ Test real-time updates"
echo "   □ Test mobile responsiveness"
echo ""

# 5. Database health check
print_status "info" "Checking database health..."
if command -v mongosh &> /dev/null; then
    print_status "success" "MongoDB shell available for manual database checks"
    echo "Use: mongosh \"$MONGODB_URI\" to connect to database"
elif command -v mongo &> /dev/null; then
    print_status "success" "MongoDB shell available for manual database checks"
    echo "Use: mongo \"$MONGODB_URI\" to connect to database"
else
    print_status "warning" "MongoDB shell not available for database checks"
fi

# 6. Performance check
print_status "info" "Basic performance check..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000)
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    print_status "success" "Application response time is good (${RESPONSE_TIME}s)"
else
    print_status "warning" "Application response time is slow (${RESPONSE_TIME}s)"
fi

# 7. Security check
print_status "info" "Basic security check..."
if curl -s http://localhost:3000/api/user/profile | grep -q "Authentication required\|Unauthorized"; then
    print_status "success" "API endpoints are properly protected"
else
    print_status "warning" "API endpoints may not be properly protected"
fi

# 8. Final summary
echo ""
echo "============================================="
print_status "info" "Test Summary"
echo "============================================="
echo ""
echo "✅ Automated tests: $([ $TEST_RESULT -eq 0 ] && echo "PASSED" || echo "FAILED")"
echo "📋 Manual tests: PENDING (see checklist above)"
echo "🔒 Security: BASIC CHECK COMPLETED"
echo "⚡ Performance: BASIC CHECK COMPLETED"
echo ""

if [ $TEST_RESULT -eq 0 ]; then
    print_status "success" "Application is ready for manual testing"
    print_status "info" "Please complete the manual testing checklist above"
    print_status "info" "Refer to TESTING_GUIDE.md for detailed testing procedures"
else
    print_status "error" "Please fix automated test failures before proceeding"
fi

echo ""
echo "📖 For detailed testing procedures, see: TESTING_GUIDE.md"
echo "🔧 For debugging, check the application logs and database"
echo ""

# Keep application running for manual testing
if [ ! -z "$APP_PID" ]; then
    print_status "info" "Application is running in background (PID: $APP_PID)"
    print_status "info" "Press Ctrl+C to stop the application and exit"
    wait $APP_PID
fi 