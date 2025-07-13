/**
 * Fix user profile statistics to reflect actual generation counts
 * Updates total_offers_generated and last_generation_date based on actual offers
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env.local' });

async function fixUserStats() {
  console.log('🔧 Fixing user profile statistics...\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Get all users
    const users = await db.collection('user_profiles').find({}).toArray();
    
    console.log(`Found ${users.length} users to check`);
    
    for (const user of users) {
      console.log(`\n👤 Checking user: ${user.email}`);
      
      // Count offers in grand_slam_offers collection
      const grandSlamOffers = await db.collection('grand_slam_offers').find({
        user_id: user.email
      }).toArray();
      
      // Count offers in purchased_offers collection
      const purchasedOffers = await db.collection('purchased_offers').find({
        userId: user.email
      }).toArray();
      
      const totalOffers = grandSlamOffers.length + purchasedOffers.length;
      
      console.log(`  • Grand slam offers: ${grandSlamOffers.length}`);
      console.log(`  • Purchased offers: ${purchasedOffers.length}`);
      console.log(`  • Total actual offers: ${totalOffers}`);
      console.log(`  • Profile shows: ${user.total_offers_generated || 0}`);
      
      // Find most recent generation date
      let lastGenerationDate = null;
      
      if (grandSlamOffers.length > 0) {
        const latestGrandSlam = grandSlamOffers.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];
        lastGenerationDate = new Date(latestGrandSlam.created_at);
      }
      
      if (purchasedOffers.length > 0) {
        const latestPurchased = purchasedOffers.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )[0];
        const purchasedDate = new Date(latestPurchased.created_at);
        
        if (!lastGenerationDate || purchasedDate > lastGenerationDate) {
          lastGenerationDate = purchasedDate;
        }
      }
      
      // Check if update is needed
      const needsUpdate = 
        (user.total_offers_generated || 0) !== totalOffers ||
        !user.last_generation_date ||
        (lastGenerationDate && new Date(user.last_generation_date) < lastGenerationDate);
      
      if (needsUpdate) {
        console.log(`  🔄 Updating user stats...`);
        
        const updateData = {
          total_offers_generated: totalOffers,
          updated_at: new Date(),
        };
        
        if (lastGenerationDate) {
          updateData.last_generation_date = lastGenerationDate;
          console.log(`  • Setting last generation: ${lastGenerationDate.toLocaleString()}`);
        }
        
        console.log(`  • Setting total offers: ${totalOffers}`);
        
        const updateResult = await db.collection('user_profiles').updateOne(
          { email: user.email },
          { $set: updateData }
        );
        
        if (updateResult.acknowledged) {
          console.log(`  ✅ Updated successfully`);
        } else {
          console.log(`  ❌ Update failed`);
        }
      } else {
        console.log(`  ✅ Stats already correct`);
      }
    }
    
    console.log('\n🎉 User stats fix completed!');
    
    // Show summary of all users
    console.log('\n📊 Updated User Summary:');
    const updatedUsers = await db.collection('user_profiles').find({}).toArray();
    
    for (const user of updatedUsers) {
      console.log(`• ${user.email}:`);
      console.log(`  - Total offers: ${user.total_offers_generated || 0}`);
      console.log(`  - Last generation: ${user.last_generation_date ? 
        new Date(user.last_generation_date).toLocaleString() : 'Never'}`);
      console.log(`  - Credits remaining: ${user.credits_remaining}`);
      console.log(`  - Daily generations today: ${user.generations_today || 0} / ${user.daily_limit || 1}`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing user stats:', error);
  } finally {
    await client.close();
  }
}

// Run fix
fixUserStats().catch(console.error);