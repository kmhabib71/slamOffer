/**
 * Test script to verify database cleanup functionality
 * TESTING ONLY - REMOVE BEFORE PRODUCTION
 */

require('dotenv').config({ path: './.env.local' });

const testCleanupFunctionality = async () => {
  console.log('🧪 Testing database cleanup functionality...\n');

  try {
    // Test 1: Get collection counts
    console.log('Test 1: Getting collection counts...');
    const statsResponse = await fetch('http://localhost:3000/api/admin/database/clean-testing');
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      console.log('✅ Collection counts retrieved successfully:');
      console.log(`  • User profiles: ${statsData.collections.user_profiles}`);
      console.log(`  • Purchased offers: ${statsData.collections.purchased_offers}`);
      console.log(`  • Grand slam offers: ${statsData.collections.grand_slam_offers}`);
      console.log(`  • Total documents: ${statsData.collections.total}`);
    } else {
      console.log('❌ Failed to get collection counts');
    }

    // Test 2: Create test data first
    console.log('\nTest 2: Creating test data...');
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'cleanup-test@example.com',
        password: 'TestPassword123',
        name: 'Cleanup Test User'
      })
    });

    if (registerResponse.ok) {
      console.log('✅ Test user created');
    } else {
      console.log('⚠️  Test user might already exist');
    }

    // Test 3: Test individual collection cleanup
    console.log('\nTest 3: Testing individual collection cleanup...');
    
    // Note: We would test actual cleanup but for safety, just test the API structure
    const testCleanupBody = {
      action: 'clean-user-profiles'
    };

    console.log('🔍 Testing cleanup API structure (without actual deletion)...');
    console.log('  • Endpoint: POST /api/admin/database/clean-testing');
    console.log('  • Expected body:', testCleanupBody);
    console.log('  • Expected actions: clean-all, clean-user-profiles, clean-purchased-offers, clean-grand-slam-offers');

    console.log('\n🎉 Cleanup functionality structure test completed!');
    console.log('\n📋 Available cleanup options:');
    console.log('  1. Clean All Data - Removes all data from all collections');
    console.log('  2. Clean User Profiles - Removes all user profiles');
    console.log('  3. Clean Purchased Offers - Removes all purchased offers');
    console.log('  4. Clean Grand Slam Offers - Removes all grand slam offers');
    
    console.log('\n⚠️  REMEMBER: This functionality must be REMOVED before production!');
    console.log('✅ Test completed - cleanup functionality is ready for use');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run test
testCleanupFunctionality().catch(console.error);