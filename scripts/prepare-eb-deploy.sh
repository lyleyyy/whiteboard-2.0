#!/bin/bash

set -e

echo "📦 Step 1: Build server with full deps"
cd apps/server
# dotenv got some weird bugs I don't know why, so here I use yarn install without --production
yarn install
yarn build
cd ../..

echo "📂 Step 2: Prepare deploy folder"
rm -rf server-deploy server-deploy.zip
mkdir server-deploy
cp -r apps/server/dist server-deploy/
cp apps/server/package.json server-deploy/
# also need yarn.lock, but it is under the root dirc since I am using monorepo
cp yarn.lock server-deploy/yarn.lock

# Optional：add env config file
# cp apps/server/.env.production server-deploy/.env

echo "📦 Step 3: Reinstall production deps only"
cd server-deploy
yarn install --production --frozen-lockfile

echo "🗜 Step 4: Zip folder"
zip -r ../whiteboard-server-deploy.zip .

echo "✅ Finished! Please upload 'whiteboard-server-deploy.zip' to your AWS Elastic Beanstalk"
