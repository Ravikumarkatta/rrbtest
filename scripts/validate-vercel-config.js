#!/usr/bin/env node

/**
 * Validate Vercel configuration for deployment
 */

const fs = require('fs');
const path = require('path');

function validateVercelConfig() {
    console.log('🔍 Validating Vercel configuration...\n');
    
    try {
        // Check if vercel.json exists
        const vercelPath = path.join(process.cwd(), 'vercel.json');
        if (!fs.existsSync(vercelPath)) {
            console.error('❌ vercel.json not found');
            process.exit(1);
        }
        
        // Parse vercel.json
        const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
        
        // Check for conflicting properties
        if (vercelConfig.builds && vercelConfig.functions) {
            console.error('❌ ERROR: Both "builds" and "functions" properties found in vercel.json');
            console.error('   This will cause deployment failure.');
            console.error('   Use either "builds" (legacy) or "functions" (modern) but not both.');
            process.exit(1);
        }
        
        // Validate required properties
        if (!vercelConfig.version) {
            console.error('❌ Missing "version" property in vercel.json');
            process.exit(1);
        }
        
        // Check API functions
        const apiDir = path.join(process.cwd(), 'api');
        if (!fs.existsSync(apiDir)) {
            console.error('❌ API directory not found');
            process.exit(1);
        }
        
        // Count serverless functions
        const apiFiles = [];
        function findJSFiles(dir) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    findJSFiles(fullPath);
                } else if (file.endsWith('.js')) {
                    apiFiles.push(fullPath);
                }
            }
        }
        findJSFiles(apiDir);
        
        console.log(`✅ Configuration validation passed`);
        console.log(`📊 Function count: ${apiFiles.length}/12 (Hobby plan limit)`);
        
        if (vercelConfig.functions) {
            console.log(`⚙️  Using modern "functions" configuration`);
            console.log(`   Memory: ${vercelConfig.functions['api/**/*.js']?.memory || 128}MB`);
            console.log(`   Timeout: ${vercelConfig.functions['api/**/*.js']?.maxDuration || 10}s`);
        } else if (vercelConfig.builds) {
            console.log(`⚙️  Using legacy "builds" configuration`);
        }
        
        console.log(`🚀 Configuration is ready for deployment`);
        
    } catch (error) {
        console.error('❌ Error validating Vercel configuration:', error.message);
        process.exit(1);
    }
}

validateVercelConfig();