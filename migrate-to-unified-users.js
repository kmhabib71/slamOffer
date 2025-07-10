/**
 * Migration Script: Merge users and user_profiles collections
 *
 * This script will:
 * 1. Read all documents from both collections
 * 2. Merge them into unified user_profiles documents
 * 3. Create a backup of original data
 * 4. Update user_profiles collection with merged data
 *
 * Run this script in MongoDB Compass or MongoDB shell
 */

// Step 1: Create backup collections
db.users_backup.drop()
db.user_profiles_backup.drop()

// Backup original data
db.users.aggregate([{ $out: 'users_backup' }])
db.user_profiles.aggregate([{ $out: 'user_profiles_backup' }])

print('✅ Backup created: users_backup and user_profiles_backup')

// Step 2: Get all users and profiles
const users = db.users.find({}).toArray()
const profiles = db.user_profiles.find({}).toArray()

print(`Found ${users.length} users and ${profiles.length} profiles`)

// Step 3: Create unified documents
const unifiedUsers = []

users.forEach(user => {
  // Find matching profile by email (userId in profile matches email in users)
  const profile = profiles.find(p => p.userId === user.email)

  const unifiedUser = {
    // Authentication fields from users
    email: user.email,
    password: user.password,
    name: user.name,
    image: user.image,
    role: user.role || 'user',
    emailVerified: user.emailVerified,

    // Subscription fields from profile (with defaults)
    subscription_tier: profile?.subscription_tier || 'free',
    credits_remaining: profile?.credits_remaining || 3,
    total_offers_generated: profile?.total_offers_generated || 0,
    offers_this_month: profile?.offers_this_month || 0,
    credits_used: profile?.credits_used || 0,
    last_generation_date: profile?.last_generation_date,
    daily_generation_count: profile?.daily_generation_count || 0,
    purchased_offers_count: profile?.purchased_offers_count || 0,
    package_details: profile?.package_details,
    daily_usage: profile?.daily_usage || [],

    // Timestamps (prefer profile timestamps, fallback to user)
    created_at: profile?.created_at || user.createdAt || new Date(),
    updated_at: profile?.updated_at || user.updatedAt || new Date(),
    createdAt: user.createdAt || profile?.created_at || new Date(),
    updatedAt: user.updatedAt || profile?.updated_at || new Date(),
  }

  unifiedUsers.push(unifiedUser)
})

// Handle profiles without matching users (shouldn't happen, but just in case)
profiles.forEach(profile => {
  const userExists = users.find(u => u.email === profile.userId)
  if (!userExists) {
    print(`⚠️  Profile without user found: ${profile.userId}`)

    const unifiedUser = {
      email: profile.userId,
      role: 'user',
      subscription_tier: profile.subscription_tier || 'free',
      credits_remaining: profile.credits_remaining || 3,
      total_offers_generated: profile.total_offers_generated || 0,
      offers_this_month: profile.offers_this_month || 0,
      credits_used: profile.credits_used || 0,
      last_generation_date: profile.last_generation_date,
      daily_generation_count: profile.daily_generation_count || 0,
      purchased_offers_count: profile.purchased_offers_count || 0,
      package_details: profile.package_details,
      daily_usage: profile.daily_usage || [],
      created_at: profile.created_at || new Date(),
      updated_at: profile.updated_at || new Date(),
      createdAt: profile.created_at || new Date(),
      updatedAt: profile.updated_at || new Date(),
    }

    unifiedUsers.push(unifiedUser)
  }
})

print(`Created ${unifiedUsers.length} unified user documents`)

// Step 4: Clear and repopulate user_profiles collection
db.user_profiles.deleteMany({})

if (unifiedUsers.length > 0) {
  const result = db.user_profiles.insertMany(unifiedUsers)
  print(`✅ Inserted ${result.insertedIds.length} unified users into user_profiles`)
} else {
  print('❌ No unified users to insert')
}

// Step 5: Verification
print('\n=== VERIFICATION ===')
print(`Users backup: ${db.users_backup.countDocuments()}`)
print(`User profiles backup: ${db.user_profiles_backup.countDocuments()}`)
print(`New unified user_profiles: ${db.user_profiles.countDocuments()}`)

// Show sample unified document
print('\n=== SAMPLE UNIFIED DOCUMENT ===')
printjson(db.user_profiles.findOne())

print('\n=== MIGRATION COMPLETE ===')
print('Next steps:')
print('1. Test the application with the new unified collection')
print('2. Update code to use only user_profiles collection')
print('3. Once verified, you can drop the users collection')
print("4. Keep backups until you're confident everything works")

// Optional: Create index on email for faster lookups
db.user_profiles.createIndex({ email: 1 }, { unique: true })
print('✅ Created unique index on email field')
