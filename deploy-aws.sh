#!/bin/bash

# AWS Amplify Deployment Script for NBCC Games Admin Portal

set -e

echo "🚀 Starting AWS Amplify deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="nbcc-games-admin"
REGION="us-east-1"
REPO_URL="https://github.com/yourusername/NBCCStrategyGames"
BRANCH="main"

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not configured. Please run: aws configure${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Check if app already exists
APP_ID=$(aws amplify list-apps --region $REGION --query "apps[?name=='$APP_NAME'].appId" --output text)

if [ -z "$APP_ID" ]; then
    echo -e "${YELLOW}📦 Creating new Amplify app...${NC}"
    
    # Prompt for GitHub token
    read -p "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
    
    # Create Amplify app
    APP_ID=$(aws amplify create-app \
        --name $APP_NAME \
        --repository $REPO_URL \
        --access-token $GITHUB_TOKEN \
        --enable-branch-auto-build \
        --region $REGION \
        --custom-rules '[
            {
                "source": "/<*>",
                "target": "/index.html",
                "status": "404-200"
            }
        ]' \
        --build-spec "$(cat amplify.yml)" \
        --query 'app.appId' \
        --output text)
    
    echo -e "${GREEN}✅ Amplify app created with ID: $APP_ID${NC}"
    
    # Connect branch
    echo -e "${YELLOW}🔗 Connecting branch: $BRANCH${NC}"
    aws amplify create-branch \
        --app-id $APP_ID \
        --branch-name $BRANCH \
        --enable-auto-build \
        --region $REGION
    
    echo -e "${GREEN}✅ Branch connected${NC}"
else
    echo -e "${GREEN}✅ Using existing Amplify app: $APP_ID${NC}"
fi

# Set environment variables
echo -e "${YELLOW}🔧 Configuring environment variables...${NC}"

# Prompt for backend URL
read -p "Enter your backend URL (e.g., https://your-app.elasticbeanstalk.com): " BACKEND_URL

aws amplify update-app \
    --app-id $APP_ID \
    --environment-variables \
        NEXT_PUBLIC_API_URL=$BACKEND_URL \
        NODE_ENV=production \
    --region $REGION

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Trigger deployment
echo -e "${YELLOW}🚢 Triggering deployment...${NC}"
JOB_ID=$(aws amplify start-job \
    --app-id $APP_ID \
    --branch-name $BRANCH \
    --job-type RELEASE \
    --region $REGION \
    --query 'jobSummary.jobId' \
    --output text)

echo -e "${YELLOW}📊 Build job started with ID: $JOB_ID${NC}"
echo -e "${YELLOW}⏳ Waiting for build to complete (this may take 5-10 minutes)...${NC}"

# Wait for job to complete
while true; do
    STATUS=$(aws amplify get-job \
        --app-id $APP_ID \
        --branch-name $BRANCH \
        --job-id $JOB_ID \
        --region $REGION \
        --query 'job.summary.status' \
        --output text)
    
    if [ "$STATUS" = "SUCCEED" ]; then
        echo -e "${GREEN}✅ Build completed successfully!${NC}"
        break
    elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
        echo -e "${RED}❌ Build failed with status: $STATUS${NC}"
        exit 1
    else
        echo -e "${YELLOW}⏳ Build status: $STATUS${NC}"
        sleep 30
    fi
done

# Get the application URL
APP_URL=$(aws amplify get-app \
    --app-id $APP_ID \
    --region $REGION \
    --query 'app.defaultDomain' \
    --output text)

FULL_URL="https://$BRANCH.$APP_URL"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your application is available at: $FULL_URL${NC}"
echo -e "${GREEN}🎉 Deployment script completed successfully!${NC}"

# Save app info
echo "APP_ID=$APP_ID" > admin_portal/.amplify-info
echo "APP_URL=$FULL_URL" >> admin_portal/.amplify-info
