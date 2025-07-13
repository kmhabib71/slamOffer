/**
 * Database migration script to fix existing user profiles
 * Adds missing fields: generations_today and daily_limit
 */

const { MongoClient } = require('mongodb')

// Load environment variables
require('dotenv').config({ path: './.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

async function fixUserProfiles() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db()
    const collection = db.collection('user_profiles')

    // Find all users that are missing the required fields
    const usersToUpdate = await collection.find({
      $or: [
        { generations_today: { $exists: false } },
        { daily_limit: { $exists: false } }
      ]
    }).toArray()

    console.log(`Found ${usersToUpdate.length} users that need to be updated`)

    if (usersToUpdate.length > 0) {
      // Update all users to have the missing fields
      const updateResult = await collection.updateMany(
        {
          $or: [
            { generations_today: { $exists: false } },
            { daily_limit: { $exists: false } }
          ]
        },
        {
          $set: {
            generations_today: 0,
            daily_limit: 1,
            updated_at: new Date(),
          }
        }
      )

      console.log(`Successfully updated ${updateResult.modifiedCount} users`)

      // Show updated users
      const updatedUsers = await collection.find({
        generations_today: { $exists: true },
        daily_limit: { $exists: true }
      }).toArray()

      console.log('Updated users:')
      updatedUsers.forEach(user => {
        console.log(`- ${user.email}: subscription_tier=${user.subscription_tier}, credits_remaining=${user.credits_remaining}, generations_today=${user.generations_today}, daily_limit=${user.daily_limit}`)
      })
    }

  } catch (error) {
    console.error('Error fixing user profiles:', error)
  } finally {
    await client.close()
    console.log('Database connection closed')
  }
}

// Run the migration
fixUserProfiles().catch(console.error)