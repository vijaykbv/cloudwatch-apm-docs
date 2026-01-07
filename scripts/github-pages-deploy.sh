#!/bin/bash

# CloudWatch APM Documentation - GitHub Pages Deployment
# Alternative deployment option that uses GitHub Pages for immediate team access

set -e

echo "🚀 CloudWatch APM Documentation - GitHub Pages Deployment"
echo "========================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install gh-pages if not already installed
if ! npm list gh-pages > /dev/null 2>&1; then
    echo "📥 Installing gh-pages..."
    npm install --save-dev gh-pages
fi

# Build the application for static export
echo "📦 Building application for static export..."
npm run build

# Export static files
echo "📤 Exporting static files..."
npx next export

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
npx gh-pages -d out

echo ""
echo "🎉 Deployment Complete!"
echo "======================================"
echo "Your CloudWatch APM Documentation is now live on GitHub Pages!"
echo ""
echo "📋 Access Information:"
echo "URL: https://vijaykbv.github.io/cloudwatch-apm-docs/"
echo ""
echo "📊 Features Available:"
echo "✅ Complete documentation system"
echo "✅ Interactive cost optimization calculator"
echo "✅ Search functionality"
echo "✅ Mobile-responsive design"
echo "✅ All 17 feature areas"
echo ""
echo "📱 Share with your team:"
echo "Send this URL to your team members for immediate access"
echo ""
echo "⏱️  Note: GitHub Pages may take 5-10 minutes to propagate"
echo "🔄 Updates: Re-run this script to deploy changes"
echo ""
echo "Happy documenting! 🎯"