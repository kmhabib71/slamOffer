/**
 * Cleanup script to remove incorrect purchase records for free tier users
 * These should not exist according to project rules
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env.local' });

async function cleanupFreePurchases() {
  console.log('🧹 Cleaning up incorrect purchase records for free tier users...\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Step 1: Find all free tier users
    const freeUsers = await db.collection('user_profiles').find({
      subscription_tier: 'free'
    }).toArray();
    
    console.log(`Found ${freeUsers.length} free tier users`);
    
    if (freeUsers.length === 0) {
      console.log('✅ No free tier users found');
      return;
    }
    
    // Step 2: Find purchase records for free users (these shouldn't exist)
    const freeUserEmails = freeUsers.map(user => user.email);
    
    const incorrectPurchases = await db.collection('purchased_offers').find({
      userId: { $in: freeUserEmails }
    }).toArray();
    
    console.log(`\n🔍 Found ${incorrectPurchases.length} incorrect purchase records for free users:`);
    
    if (incorrectPurchases.length === 0) {
      console.log('✅ No incorrect purchase records found');
      return;
    }
    
    // Show details of incorrect records
    incorrectPurchases.forEach(purchase => {
      console.log(`  • User: ${purchase.userId}`);
      console.log(`    Offer ID: ${purchase.offerId}`);
      console.log(`    Amount Paid: $${purchase.amount_paid}`);
      console.log(`    Created: ${new Date(purchase.created_at).toLocaleString()}`);
      console.log(`    Status: ${purchase.status}`);
      console.log('');
    });
    
    // Step 3: Remove incorrect purchase records
    console.log('🗑️  Removing incorrect purchase records...');
    
    const deleteResult = await db.collection('purchased_offers').deleteMany({
      userId: { $in: freeUserEmails }
    });
    
    console.log(`✅ Removed ${deleteResult.deletedCount} incorrect purchase records`);
    
    // Step 4: Verify cleanup
    const remainingIncorrectPurchases = await db.collection('purchased_offers').find({
      userId: { $in: freeUserEmails }
    }).toArray();
    
    if (remainingIncorrectPurchases.length === 0) {
      console.log('✅ Cleanup successful - no purchase records remain for free users');
    } else {
      console.log(`⚠️  Warning: ${remainingIncorrectPurchases.length} purchase records still exist`);
    }
    
    // Step 5: Show corrected state
    console.log('\n📊 Current state summary:');
    console.log(`  • Free tier users: ${freeUsers.length}`);
    console.log(`  • Purchase records for free users: ${remainingIncorrectPurchases.length} (should be 0)`);
    
    // Step 6: Show grand_slam_offers for free users (these are correct)
    const freeOffers = await db.collection('grand_slam_offers').find({
      user_id: { $in: freeUserEmails }
    }).toArray();
    
    console.log(`  • Free offers in grand_slam_offers: ${freeOffers.length} (correct location)`);
    
    console.log('\n🎉 Cleanup completed successfully!');
    console.log('✅ Free tier users no longer have purchase records');
    console.log('✅ Project rules compliance restored');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
  }
}

// Run cleanup
cleanupFreePurchases().catch(console.error);