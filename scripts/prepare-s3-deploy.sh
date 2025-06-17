#!/bin/bash

set -e  # error then stop
echo "🔨 Building the frontend..."

# Step 1: Build
# switch to client dirc, can execute this script anywhere
cd "$(dirname "$0")/../apps/client"

yarn install --frozen-lockfile
yarn build

# Step 2: Deploy to S3
echo "🚀 Deploying to S3..."
aws s3 sync dist/ s3://whiteboard-client-lyle --delete

echo "✅ whiteboard-client Deployment completed successfully!"