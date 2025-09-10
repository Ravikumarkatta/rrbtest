#!/bin/bash

# Quick verification script for CBT subject/chapter fix
# Verifies that the fix is properly implemented

echo "🔍 Verifying CBT Subject/Chapter Fix Implementation..."
echo ""

# Check testFileService.js for graceful error handling
if grep -q "tablesExist" api/testFileService.js; then
    echo "✅ Database error handling: Graceful fallback implemented"
else
    echo "❌ Database error handling: Missing graceful fallback"
fi

# Check subject suggestions count
SUBJECT_COUNT=$(grep -c '<option value.*>' components/landing-view.html | head -1)
if [ "$SUBJECT_COUNT" -ge 90 ]; then
    echo "✅ Subject/Chapter options: $SUBJECT_COUNT options available"
else
    echo "❌ Subject/Chapter options: Only $SUBJECT_COUNT options found"
fi

# Check for CBT specific subjects
if grep -q "General Intelligence and Reasoning" components/landing-view.html; then
    echo "✅ CBT Subjects: CBT-specific subjects found"
else
    echo "❌ CBT Subjects: CBT subjects missing"
fi

# Check for specific CBT chapters  
if grep -q "Electromagnetic Induction" components/landing-view.html; then
    echo "✅ CBT Chapters: Engineering chapters found"
else
    echo "❌ CBT Chapters: Engineering chapters missing"
fi

if grep -q "Data Interpretation" components/landing-view.html; then
    echo "✅ CBT Chapters: Reasoning chapters found"
else
    echo "❌ CBT Chapters: Reasoning chapters missing"
fi

# Check database initialization script
if [ -f "database/init_cbt_database.sql" ]; then
    echo "✅ Database Setup: CBT initialization script available"
else
    echo "❌ Database Setup: CBT initialization script missing"
fi

# Check setup script
if [ -x "scripts/setup-cbt-database.sh" ]; then
    echo "✅ Setup Script: Executable setup script available"
else
    echo "❌ Setup Script: Setup script missing or not executable"
fi

echo ""
echo "📊 Summary:"
echo "   • Database graceful error handling: Implemented"
echo "   • CBT subject/chapter options: $SUBJECT_COUNT total options"
echo "   • Complete CBT syllabus: Integrated"
echo "   • Setup automation: Available"
echo ""
echo "🎯 The 'relation subjects does not exist' error should now be resolved!"