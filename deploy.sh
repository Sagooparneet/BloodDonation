#!/bin/bash

# Blood Donation System - Deployment Script for Azure VM
# Usage: ./deploy.sh [frontend|backend|all]

set -e

DEPLOY_TYPE=${1:-all}
PROJECT_DIR="/var/www/blood-donation-system"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "🚀 Starting deployment for: $DEPLOY_TYPE"

# Function to deploy backend
deploy_backend() {
    echo "📦 Deploying Backend..."
    cd $BACKEND_DIR
    
    echo "  ⬇️  Installing dependencies..."
    npm install --production
    
    echo "  🔄 Restarting PM2 process..."
    pm2 restart blood-donation-api || pm2 start index.js --name blood-donation-api
    
    echo "  ✅ Backend deployed successfully!"
}

# Function to deploy frontend
deploy_frontend() {
    echo "🎨 Deploying Frontend..."
    cd $FRONTEND_DIR
    
    echo "  ⬇️  Installing dependencies..."
    npm install
    
    echo "  🏗️  Building production bundle..."
    npm run build
    
    echo "  🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo "  ✅ Frontend deployed successfully!"
}

# Main deployment logic
case $DEPLOY_TYPE in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "❌ Invalid deployment type. Use: frontend, backend, or all"
        exit 1
        ;;
esac

echo ""
echo "✨ Deployment completed successfully!"
echo ""
echo "📊 Status Check:"
pm2 status
echo ""
echo "🌐 Your application is live at:"
echo "   Frontend: https://parneet.me"
echo "   API: https://api.parneet.me"
echo ""
echo "📝 View logs with:"
echo "   pm2 logs blood-donation-api"
echo "   sudo tail -f /var/log/nginx/error.log"
