const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env.local' });

async function verifyRegistrationFix() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    // Find the test user we just created
    const testUser = await db.collection('user_profiles').findOne({ 
      email: 'test-phase1-restart@example.com' 
    });
    
    if (!testUser) {
      console.log('❌ Test user not found');
      return false;
    }
    
    console.log('✅ Test user found! Checking Phase 1 Test 1.1 requirements:\n');
    
    // Phase 1 Test 1.1 Requirements
    const requirements = [
      { field: 'subscription_tier', expected: 'free', actual: testUser.subscription_tier },
      { field: 'credits_remaining', expected: 3, actual: testUser.credits_remaining },
      { field: 'daily_limit', expected: 1, actual: testUser.daily_limit },
      { field: 'generations_today', expected: 0, actual: testUser.generations_today },
      { field: 'daily_generation_count', expected: 0, actual: testUser.daily_generation_count },
      { field: 'total_offers_generated', expected: 0, actual: testUser.total_offers_generated }
    ];
    
    let allPassed = true;
    requirements.forEach(req => {
      const passed = req.actual === req.expected;
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status}: ${req.field} = ${req.actual} (expected: ${req.expected})`);
      if (!passed) allPassed = false;
    });
    
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('🎉 ALL Phase 1 Test 1.1 requirements PASSED!');
      console.log('✅ Email/password registration is now fixed!');
    } else {
      console.log('❌ Some requirements failed - registration still needs fixes');
    }
    
    // Clean up test user
    await db.collection('user_profiles').deleteOne({ email: 'test-phase1-restart@example.com' });
    console.log('🧹 Test user cleaned up');
    
    return allPassed;
    
  } catch (error) {
    console.error('Error:', error);
    return false;
  } finally {
    await client.close();
  }
}

verifyRegistrationFix().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Critical error:', error);
  process.exit(1);
});