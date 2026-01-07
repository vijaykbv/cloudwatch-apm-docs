#!/bin/bash

# CloudWatch APM Documentation - Quick Deployment Script
# This script deploys the application to Vercel for fastest team access

set -e

echo "🚀 CloudWatch APM Documentation - Quick Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if build is successful
echo "📦 Building the application..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo "Note: You may need to authenticate with Vercel on first run"

# Deploy with production flag
vercel --prod

echo ""
echo "🎉 Deployment Complete!"
echo "======================================"
echo "Your CloudWatch APM Documentation is now live!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy the deployment URL from above"
echo "2. Share it with your team members"
echo "3. Test the cost optimization features"
echo "4. Set up a custom domain if needed"
echo ""
echo "💡 Tips:"
echo "- The site is automatically optimized for performance"
echo "- All cost optimization tools are fully functional"
echo "- The documentation is searchable and mobile-friendly"
echo ""
echo "🔧 For custom domain setup:"
echo "   vercel domains add your-domain.com"
echo ""
echo "📊 To view deployment analytics:"
echo "   Visit https://vercel.com/dashboard"
echo ""
echo "Happy documenting! 🎯"