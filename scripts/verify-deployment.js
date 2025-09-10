#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests Vercel deployment to ensure all functions work correctly
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Deployment-Verification-Script'
      }
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoint(appUrl, endpoint, method = 'GET', expectedStatus = 200) {
  const url = `${appUrl}${endpoint}`;
  console.log(`\n🔍 Testing ${method} ${endpoint}...`);
  
  try {
    const result = await makeRequest(url, method);
    
    if (result.status === expectedStatus) {
      console.log(`✅ Success (${result.status})`);
      if (endpoint === '/api/health') {
        console.log(`   Database: ${result.data.database?.connected ? 'Connected' : 'Disconnected'}`);
        console.log(`   Environment: ${result.data.environment?.neonDbUrl === 'configured' ? 'OK' : 'Missing Variables'}`);
      }
      return true;
    } else {
      console.log(`❌ Failed (${result.status}): ${JSON.stringify(result.data)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Vercel Deployment Verification Script\n');
  
  // Get app URL from user
  const appUrl = await new Promise(resolve => {
    rl.question('Enter your Vercel app URL (e.g., https://your-app.vercel.app): ', resolve);
  });
  
  if (!appUrl.startsWith('https://')) {
    console.log('❌ Please provide a valid HTTPS URL');
    rl.close();
    return;
  }
  
  console.log(`\n📍 Testing deployment at: ${appUrl}`);
  
  // Test critical endpoints
  const tests = [
    { endpoint: '/api/health', method: 'GET', status: 200 },
    { endpoint: '/api/test-files', method: 'GET', status: 200 },
  ];
  
  let passed = 0;
  for (const test of tests) {
    const success = await testEndpoint(appUrl, test.endpoint, test.method, test.status);
    if (success) passed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${tests.length} tests passed`);
  
  if (passed === tests.length) {
    console.log('\n🎉 All tests passed! Your deployment is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check:');
    console.log('1. Environment variables are set in Vercel dashboard');
    console.log('2. You have redeployed after setting environment variables');
    console.log('3. Your Neon database URL is correct and accessible');
    console.log('\nSee DEPLOYMENT_FIX_GUIDE.md for detailed troubleshooting.');
  }
  
  rl.close();
}

main().catch(console.error);