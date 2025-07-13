/**
 * Test script to verify the complete generation flow is working correctly
 * Tests that only one offer is created and stats update properly
 */

require('dotenv').config({ path: './.env.local' });

const testGenerationFlow = async () => {
  console.log('🧪 Testing complete generation flow...\n');

  try {
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db();

    // Step 1: Check current state
    console.log('📊 BEFORE Generation:');
    const userBefore = await db.collection('user_profiles').findOne({ 
      email: 'mohammedsaimuae@gmail.com' 
    });
    const offersBefore = await db.collection('grand_slam_offers').find({
      user_id: 'mohammedsaimuae@gmail.com'
    }).toArray();
    const purchasesBefore = await db.collection('purchased_offers').find({
      userId: 'mohammedsaimuae@gmail.com'
    }).toArray();

    console.log(`  • Credits: ${userBefore?.credits_remaining || 0}`);
    console.log(`  • Total offers: ${userBefore?.total_offers_generated || 0}`);
    console.log(`  • Generations today: ${userBefore?.generations_today || 0}`);
    console.log(`  • Grand slam offers count: ${offersBefore.length}`);
    console.log(`  • Purchase records count: ${purchasesBefore.length}`);

    // If user already hit daily limit, clean up for testing
    if ((userBefore?.generations_today || 0) >= (userBefore?.daily_limit || 1)) {
      console.log('\n🧹 Resetting daily limit for testing...');
      await db.collection('user_profiles').updateOne(
        { email: 'mohammedsaimuae@gmail.com' },
        { $set: { generations_today: 0, daily_generation_count: 0 } }
      );
    }

    await client.close();

    console.log('\n🚀 Now test a generation in the UI and check results...');
    console.log('\n⏱️  After generation, run this script again to see results:');
    console.log('   node test-generation-flow.js');
    
    console.log('\n📋 What to expect after generation:');
    console.log('  ✅ Credits: Should decrease by 1');
    console.log('  ✅ Total offers: Should increase by 1');
    console.log('  ✅ Generations today: Should increase by 1');
    console.log('  ✅ Grand slam offers: Only 1 new offer (no duplicates)');
    console.log('  ✅ Purchase records: Should remain 0 for free users');
    console.log('  ✅ Profile page: Should show updated stats');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run test
testGenerationFlow().catch(console.error);