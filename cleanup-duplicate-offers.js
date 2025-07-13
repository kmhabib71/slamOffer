/**
 * Cleanup script to remove duplicate offer records
 * Fixes the issue where each generation created two identical offers
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env.local' });

async function cleanupDuplicateOffers() {
  console.log('🧹 Cleaning up duplicate offer records...\n');

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Get all offers from grand_slam_offers collection
    const allOffers = await db.collection('grand_slam_offers').find({}).toArray();
    
    console.log(`Found ${allOffers.length} total offers in grand_slam_offers collection`);
    
    if (allOffers.length === 0) {
      console.log('✅ No offers found - nothing to clean up');
      return;
    }
    
    // Group offers by user_id, business_description, and creation time (within 1 minute)
    const duplicateGroups = new Map();
    
    allOffers.forEach(offer => {
      // Create a key based on user, business description, and rounded timestamp
      const createdTime = new Date(offer.created_at);
      const roundedTime = Math.floor(createdTime.getTime() / 60000) * 60000; // Round to nearest minute
      
      const key = `${offer.user_id}|${offer.business_description}|${roundedTime}`;
      
      if (!duplicateGroups.has(key)) {
        duplicateGroups.set(key, []);
      }
      duplicateGroups.get(key).push(offer);
    });
    
    // Find groups with duplicates
    let duplicatesFound = 0;
    let duplicatesRemoved = 0;
    
    console.log('\n🔍 Analyzing for duplicates...\n');
    
    for (const [key, offers] of duplicateGroups) {
      if (offers.length > 1) {
        duplicatesFound += offers.length - 1;
        
        // Sort by creation time and keep the first one
        offers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const keepOffer = offers[0];
        const removeOffers = offers.slice(1);
        
        console.log(`📋 Found ${offers.length} duplicates for user: ${keepOffer.user_id}`);
        console.log(`   Business: ${keepOffer.business_description.substring(0, 50)}...`);
        console.log(`   Keeping: ${keepOffer._id} (${keepOffer.created_at})`);
        
        // Remove duplicates
        for (const duplicate of removeOffers) {
          console.log(`   Removing: ${duplicate._id} (${duplicate.created_at})`);
          
          const deleteResult = await db.collection('grand_slam_offers').deleteOne({
            _id: duplicate._id
          });
          
          if (deleteResult.deletedCount === 1) {
            duplicatesRemoved++;
          }
        }
        console.log('');
      }
    }
    
    console.log(`📊 Cleanup Summary:`);
    console.log(`  • Total offers analyzed: ${allOffers.length}`);
    console.log(`  • Duplicates found: ${duplicatesFound}`);
    console.log(`  • Duplicates removed: ${duplicatesRemoved}`);
    console.log(`  • Offers remaining: ${allOffers.length - duplicatesRemoved}`);
    
    if (duplicatesRemoved > 0) {
      console.log('\n✅ Duplicate cleanup completed successfully!');
    } else {
      console.log('\n✅ No duplicates found - database is clean!');
    }
    
    // Verify cleanup
    const remainingOffers = await db.collection('grand_slam_offers').find({}).toArray();
    console.log(`\n🔍 Verification: ${remainingOffers.length} offers remain in database`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
  }
}

// Run cleanup
cleanupDuplicateOffers().catch(console.error);