#!/bin/bash

# CloudWatch APM Documentation Deployment Script

set -e

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test

# Build the application
echo "🏗️  Building application..."
npm run build

# Export static files (if needed for static hosting)
echo "📤 Exporting static files..."
npm run export 2>/dev/null || echo "Export not configured, skipping..."

echo "✅ Deployment process completed successfully!"