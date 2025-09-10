#!/bin/bash

# CBT Database Setup Script
# This script initializes the database with CBT syllabus subjects and chapters

echo "🚀 Setting up CBT Database with Subjects and Chapters..."

# Check if NEON_DATABASE_URL is set
if [ -z "$NEON_DATABASE_URL" ]; then
    echo "❌ Error: NEON_DATABASE_URL environment variable is not set"
    echo "Please set your Neon database URL:"
    echo "export NEON_DATABASE_URL='postgresql://user:pass@host/db?sslmode=require'"
    exit 1
fi

echo "✅ NEON_DATABASE_URL is set"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

echo "✅ PostgreSQL client is available"

# Run the database initialization
echo "📊 Initializing CBT database schema and data..."

if psql "$NEON_DATABASE_URL" -f "$(dirname "$0")/database/init_cbt_database.sql"; then
    echo "✅ Database initialization completed successfully!"
    echo ""
    echo "🎯 CBT Subjects and Chapters Created:"
    echo "   • General Awareness (9 chapters)"
    echo "   • General Intelligence and Reasoning (17 chapters)"  
    echo "   • Basics of Computers and Applications (11 chapters)"
    echo "   • Mathematics (14 chapters)"
    echo "   • Basic Science and Engineering (33 chapters)"
    echo ""
    echo "🎉 Your application is now ready to accept file uploads with subject/chapter selection!"
    echo "   The 'relation subjects does not exist' error should be resolved."
    echo ""
    echo "Next steps:"
    echo "1. Deploy your application to Vercel"
    echo "2. Set environment variables in Vercel dashboard"
    echo "3. Test file upload with subject/chapter selection"
else
    echo "❌ Database initialization failed"
    echo "Please check your NEON_DATABASE_URL and try again"
    exit 1
fi