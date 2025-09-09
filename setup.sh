#!/bin/bash

# Mock Test Application - Vercel Serverless Setup Script
# This script helps developers set up the application for local development and deployment

set -e

echo "🚀 Mock Test Application - Vercel Serverless Setup"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo "✅ npm $(npm --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "📥 Installing Vercel CLI globally..."
    npm install -g vercel
else
    echo "✅ Vercel CLI $(vercel --version) already installed"
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo ""
    echo "⚙️  Creating .env.local file..."
    cat > .env.local << EOL
# Local Development Environment Variables
NEON_DATABASE_URL=postgresql://username:password@host/database?sslmode=require
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:5500,https://your-domain.vercel.app
EOL
    echo "📝 Please update .env.local with your actual Neon database URL"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update .env.local with your Neon PostgreSQL database URL"
echo "2. Run 'npm run dev' to start local development server"
echo "3. Set up environment variables in Vercel dashboard:"
echo "   - NEON_DATABASE_URL"
echo "   - ALLOWED_ORIGINS"
echo "   - NODE_ENV"
echo "4. Deploy with 'npm run deploy'"
echo ""
echo "📚 For detailed instructions, see VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "🔗 Useful commands:"
echo "   npm run dev     - Start local development"
echo "   npm run deploy  - Deploy to production"
echo "   vercel logs     - View deployment logs"