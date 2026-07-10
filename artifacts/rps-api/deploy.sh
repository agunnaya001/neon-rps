#!/bin/bash
set -e

echo "🚀 Deploying Neon RPS API to Vercel..."

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Check environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Set it in Vercel project settings."
    echo "   You can get it from your Neon dashboard."
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "✅ Build successful!"
echo ""
echo "Next steps:"
echo "1. Set DATABASE_URL in Vercel project settings"
echo "2. Deploy with: vercel --prod"
echo "3. Configure custom domain in Vercel settings"
echo ""
echo "Environment variables needed in Vercel:"
echo "  - DATABASE_URL: postgresql://..."
echo ""
echo "Frontend should set:"
echo "  - VITE_API_URL: https://rps-api.vercel.app (or your domain)"
