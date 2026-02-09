#!/bin/bash

# Azure App Service deployment script for Next.js

set -e

echo "Starting Next.js deployment..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the Next.js application
echo "Building Next.js application..."
npm run build

echo "Deployment completed successfully!"
