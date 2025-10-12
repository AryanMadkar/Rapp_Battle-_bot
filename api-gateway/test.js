#!/usr/bin/env node

const axios = require('axios');

// Configuration - UPDATE THESE WITH YOUR EXISTING USER
const BASE_URL = 'http://localhost:5000';
const EXISTING_USER = {
  email: "rap@example.com",           // ⚠️ CHANGE THIS to your existing user email
  password: "StrongPass123!"           // ⚠️ CHANGE THIS to your password
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Rap verses for 5 rounds
const RAP_VERSES = [
  "I step to the mic with surgical precision, My bars cut deep like a lyrical incision, You're facing a veteran with infinite wisdom, While you're still a beginner stuck in your system",
  
  "Round two and I'm heating up the stage, My rhymes are timeless like words on a page, You can't compete with my lyrical rage, I'm the master and you're stuck in a cage",
  
  "Three rounds in and I'm still on fire, My wordplay elevates you can't go higher, Every bar I spit makes the crowd perspire, While your weak rhymes make the audience tire",
  
  "Fourth round hitting and I'm unstoppable force, My flow is natural you sound so forced, I'm running this battle staying on course, While you're falling behind with deep remorse",
  
  "Final round five and I seal your fate, My legendary bars you can't replicate, I dominated this battle it's not up for debate, You faced greatness now accept your L mate"
];

// Global variables
let authToken = '';
let battleId = '';
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? colors.green : colors.red;
  log(`${status} - ${testName}`, color);
  if (details) log(`   ${details}`, colors.cyan);
  
  testResults.tests.push({ testName, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, endpoint, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (useAuth && authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
      fullError: error
    };
  }
}

// Test functions
async function testHealthCheck() {
  log('\n' + '='.repeat(60), colors.bright);
  log('TEST 1: HEALTH CHECK', colors.bright);
  log('='.repeat(60), colors.bright);

  const result = await makeRequest('GET', '/health');
  
  if (result.success && result.data.success) {
    logTest('Gateway Health Check', true, `Status: ${result.data.status}, Service: ${result.data.service}`);
  } else {
    logTest('Gateway Health Check', false, JSON.stringify(result.error));
  }
}

async function testServicesHealth() {
  log('\n' + '='.repeat(60), colors.bright);
  log('TEST 2: ALL SERVICES HEALTH', colors.bright);
  log('='.repeat(60), colors.bright);

  const result = await makeRequest('GET', '/services/health');
  
  if (result.success) {
    logTest('All Services Health Check', true, 'All microservices are running');
    
    if (result.data.services) {
      for (const [serviceName, serviceData] of Object.entries(result.data.services)) {
        log(`   ${serviceName}: ${serviceData.status}`, colors.cyan);
      }
    }
  } else {
    logTest('All Services Health Check', false, JSON.stringify(result.error));
  }
}

async function testUserLogin() {
  log('\n' + '='.repeat(60), colors.bright);
  log('TEST 3: USER LOGIN', colors.bright);
  log('='.repeat(60), colors.bright);

  log(`\n🔑 Logging in with EXISTING USER...`, colors.yellow);
  log(`   Email: ${EXISTING_USER.email}`, colors.cyan);
  log(`   Password: ${EXISTING_USER.password}`, colors.cyan);

  const result = await makeRequest('POST', '/api/auth/login', {
    email: EXISTING_USER.email,
    password: EXISTING_USER.password
  });
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    logTest('User Login', true, `Token received (${authToken.substring(0, 20)}...)`);
    log(`   Username: ${result.data.data?.username || 'N/A'}`, colors.cyan);
    log(`   User ID: ${result.data.data?._id || 'N/A'}`, colors.cyan);
  } else {
    logTest('User Login', false, `Login failed`);
    log(`\n🔍 Debug Info:`, colors.yellow);
    log(`   Status Code: ${result.status}`, colors.red);
    log(`   Error: ${JSON.stringify(result.error, null, 2)}`, colors.red);
    
    log(`\n⚠️  TROUBLESHOOTING:`, colors.yellow);
    log(`   1. Make sure you have an existing user in the database`, colors.cyan);
    log(`   2. Update EXISTING_USER email and password at the top of this script`, colors.cyan);
    log(`   3. You can create a user by POSTing to /api/auth/register first`, colors.cyan);
    
    throw new Error('Login failed - cannot continue tests');
  }

  await sleep(1000);
}

async function testStartBattle() {
  log('\n' + '='.repeat(60), colors.bright);
  log('TEST 4: START BATTLE', colors.bright);
  log('='.repeat(60), colors.bright);

  const result = await makeRequest('POST', '/api/battles/start', {
    theme: 'freestyle',
    aiModel: 'groq',
    maxRounds: 5
  }, true);
  
  if (result.success && result.data.data) {
    battleId = result.data.data._id;
    logTest('Start Battle', true, `Battle ID: ${battleId}`);
    log(`   Theme: ${result.data.data.theme}`, colors.cyan);
    log(`   AI Model: ${result.data.data.aiModel}`, colors.cyan);
    log(`   Max Rounds: ${result.data.data.maxRounds}`, colors.cyan);
  } else {
    logTest('Start Battle', false, JSON.stringify(result.error));
    log(`\n🔍 Debug Info:`, colors.yellow);
    log(`   Status Code: ${result.status}`, colors.red);
    log(`   Error: ${JSON.stringify(result.error, null, 2)}`, colors.red);
    throw new Error('Start battle failed - cannot continue');
  }

  await sleep(1000);
}

async function testBattleRound(roundNumber, verse) {
  log('\n' + '='.repeat(60), colors.bright);
  log(`TEST ${4 + roundNumber}: BATTLE ROUND ${roundNumber}`, colors.bright);
  log('='.repeat(60), colors.bright);

  log('\n💬 User Rap:', colors.yellow);
  log(`   ${verse}`, colors.cyan);

  const result = await makeRequest('POST', `/api/battles/${battleId}/continue`, {
    userRap: verse
  }, true);
  
  if (result.success && result.data.success) {
    logTest(`Battle Round ${roundNumber}`, true, `Current Round: ${result.data.data.currentRound}/${result.data.data.maxRounds}`);
    
    log('\n🎤 AI Response:', colors.magenta);
    log(`   ${result.data.data.aiResponse}`, colors.cyan);
    
    log(`\n📊 Status:`, colors.blue);
    log(`   Can Continue: ${result.data.data.canContinue}`, colors.cyan);
    log(`   Message: ${result.data.message}`, colors.cyan);
  } else {
    logTest(`Battle Round ${roundNumber}`, false, JSON.stringify(result.error));
  }

  await sleep(2000);
}

async function testGetBattleById() {
  log('\n' + '='.repeat(60), colors.bright);
  log('TEST 10: GET BATTLE BY ID', colors.bright);
  log('='.repeat(60), colors.bright);

  const result = await makeRequest('GET', `/api/battles/${battleId}`, null, true);
  
  if (result.success && result.data.data) {
    const battle = result.data.data;
    logTest('Get Battle By ID', true, `Found battle with ${battle.conversation?.length || 0} conversation entries`);
    log(`   Status: ${battle.status}`, colors.cyan);
    log(`   Current Round: ${battle.currentRound}/${battle.maxRounds}`, colors.cyan);
    log(`   Theme: ${battle.theme}`, colors.cyan);
  } else {
    logTest('Get Battle By ID', false, JSON.stringify(result.error));
  }

  await sleep(1000);
}

async function testEndBattle() {
  log('\n' + '='.repeat(60), colors.bright);
  log('TEST 11: END BATTLE', colors.bright);
  log('='.repeat(60), colors.bright);

  const result = await makeRequest('POST', `/api/battles/${battleId}/end`, null, true);
  
  if (result.success && result.data.data) {
    const battle = result.data.data;
    logTest('End Battle', true, `Winner: ${battle.winner || 'Not judged'}`);
    
    if (battle.scores) {
      log('\n🏆 Final Scores:', colors.yellow);
      log(`   User Score: ${battle.scores.user || 'N/A'}`, colors.cyan);
      log(`   AI Score: ${battle.scores.ai || 'N/A'}`, colors.cyan);
    }
    
    if (battle.detailedAnalysis) {
      log('\n📈 Detailed Analysis Available:', colors.blue);
      log(`   User Analysis: ${battle.detailedAnalysis.userAnalysis ? 'Yes' : 'No'}`, colors.cyan);
      log(`   AI Analysis: ${battle.detailedAnalysis.aiAnalysis ? 'Yes' : 'No'}`, colors.cyan);
      log(`   Overall: ${battle.detailedAnalysis.overallAnalysis ? 'Yes' : 'No'}`, colors.cyan);
    }
  } else {
    logTest('End Battle', false, JSON.stringify(result.error));
  }

  await sleep(1000);
}

async function testGetAllBattles() {
  log('\n' + '='.repeat(60), colors.bright);
  log('TEST 12: GET ALL BATTLES', colors.bright);
  log('='.repeat(60), colors.bright);

  const result = await makeRequest('GET', '/api/battles?page=1&limit=10', null, true);
  
  if (result.success && result.data.data) {
    logTest('Get All Battles', true, `Retrieved ${result.data.data.length} battles`);
    log(`   Total Battles: ${result.data.data.length}`, colors.cyan);
    if (result.data.pagination) {
      log(`   Page: ${result.data.pagination.page}`, colors.cyan);
      log(`   Total Pages: ${result.data.pagination.pages}`, colors.cyan);
    }
  } else {
    logTest('Get All Battles', false, JSON.stringify(result.error));
  }

  await sleep(1000);
}

async function testGetUserStats() {
  log('\n' + '='.repeat(60), colors.bright);
  log('TEST 13: GET USER STATS', colors.bright);
  log('='.repeat(60), colors.bright);

  const result = await makeRequest('GET', '/api/battles/stats/me', null, true);
  
  if (result.success && result.data.data) {
    const stats = result.data.data;
    logTest('Get User Stats', true, `Total Battles: ${stats.totalBattles || 0}`);
    log('\n📊 User Statistics:', colors.yellow);
    log(`   Total Battles: ${stats.totalBattles || 0}`, colors.cyan);
    log(`   Wins: ${stats.wins || 0}`, colors.cyan);
    log(`   Losses: ${stats.losses || 0}`, colors.cyan);
    log(`   Draws: ${stats.draws || 0}`, colors.cyan);
    log(`   Win Rate: ${stats.winRate || 0}%`, colors.cyan);
    log(`   Average Score: ${stats.averageUserScore || 0}`, colors.cyan);
  } else {
    logTest('Get User Stats', false, JSON.stringify(result.error));
  }

  await sleep(1000);
}

async function testAIServiceDirect() {
  log('\n' + '='.repeat(60), colors.bright);
  log('TEST 14: AI SERVICE DIRECT TEST', colors.bright);
  log('='.repeat(60), colors.bright);

  const result = await makeRequest('GET', '/api/ai/test', null, true);
  
  if (result.success) {
    logTest('AI Service Direct Test', true, 'AI service is responding');
  } else {
    logTest('AI Service Direct Test', false, JSON.stringify(result.error));
  }
}

// Main execution
async function runAllTests() {
  log('\n' + '█'.repeat(60), colors.bright);
  log('  AI RAP BATTLE - COMPREHENSIVE API TEST SUITE', colors.bright);
  log('  (Using Existing User - No Registration)', colors.bright);
  log('█'.repeat(60), colors.bright);
  log(`\nBase URL: ${BASE_URL}`, colors.yellow);
  log(`User Email: ${EXISTING_USER.email}`, colors.yellow);
  log(`Starting tests...\n`, colors.yellow);

  try {
    // Health checks
    await testHealthCheck();
    await testServicesHealth();

    // Login with existing user (NO REGISTRATION)
    await testUserLogin();

    // Battle flow
    await testStartBattle();

    // Run 5 rounds of battle
    for (let i = 0; i < RAP_VERSES.length; i++) {
      await testBattleRound(i + 1, RAP_VERSES[i]);
    }

    // Battle queries
    await testGetBattleById();
    await testEndBattle();
    await testGetAllBattles();
    await testGetUserStats();

    // AI service test
    await testAIServiceDirect();

    // Final summary
    log('\n' + '█'.repeat(60), colors.bright);
    log('  TEST SUMMARY', colors.bright);
    log('█'.repeat(60), colors.bright);
    
    log(`\n✅ Passed: ${testResults.passed}`, colors.green);
    log(`❌ Failed: ${testResults.failed}`, colors.red);
    log(`📊 Total: ${testResults.passed + testResults.failed}`, colors.blue);
    
    const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2);
    log(`\n🎯 Success Rate: ${successRate}%\n`, colors.yellow);

    if (testResults.failed === 0) {
      log('🎉 ALL TESTS PASSED! 🎉\n', colors.green);
    } else {
      log('⚠️  SOME TESTS FAILED - CHECK LOGS ABOVE\n', colors.red);
    }

  } catch (error) {
    log(`\n❌ CRITICAL ERROR: ${error.message}\n`, colors.red);
    console.error(error);
    
    // Show helpful debugging info
    log('\n🔍 TROUBLESHOOTING TIPS:', colors.yellow);
    log('   1. Ensure all services are running:', colors.cyan);
    log('      - Gateway: http://localhost:5000', colors.cyan);
    log('      - Auth Service: http://localhost:5001', colors.cyan);
    log('      - Battle Service: http://localhost:5002', colors.cyan);
    log('      - AI Service: http://localhost:5003', colors.cyan);
    log('   2. Update EXISTING_USER credentials at the top of the script', colors.cyan);
    log('   3. Check MongoDB is connected', colors.cyan);
    log('   4. Verify environment variables (.env file)', colors.cyan);
    log('   5. Check service logs for errors\n', colors.cyan);
  }
}

// Run the tests
runAllTests().catch(console.error);
