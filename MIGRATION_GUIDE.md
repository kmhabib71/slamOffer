# User Collections Migration Guide

## Problem

Currently using two collections for a single user:

- `users` collection: Authentication data (email, password, role)
- `user_profiles` collection: Subscription data (tier, credits, package details)

This creates confusion and complexity.

## Solution: Unified `user_profiles` Collection

### Benefits

✅ **Single source of truth** for user data  
✅ **Simplified queries** - no more joins  
✅ **Better data consistency**  
✅ **Easier for AI assistants** to understand  
✅ **Maintains current function flow**

## Migration Steps

### Step 1: Data Migration (SAFE)

Run this script in MongoDB Compass or MongoDB shell:

```javascript
// Copy the content from migrate-to-unified-users.js
// This will:
// 1. Backup your existing data
// 2. Merge users + user_profiles into unified user_profiles
// 3. Create indexes for performance
```

### Step 2: Minimal Code Updates

Update only 2 functions in `src/lib/auth.ts`:

#### Replace `getUserById` function (around line 241):

```typescript
async getUserById(userId: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    // First try unified collection
    const unifiedUser = await db.collection('user_profiles').findOne({
      $or: [
        { _id: new ObjectId(userId) },
        { email: userId } // fallback if userId is actually email
      ]
    })

    if (unifiedUser) {
      return unifiedUser
    }

    // Fallback to old collection for backward compatibility
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
},
```

#### Replace `getUserByEmail` function (around line 255):

```typescript
async getUserByEmail(email: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    // First try unified collection
    const unifiedUser = await db.collection('user_profiles').findOne({ email })

    if (unifiedUser) {
      // User is in unified format - return with profile included
      return {
        ...unifiedUser,
        profile: unifiedUser // The user data IS the profile data
      }
    }

    // Fallback to old collections
    const user = await db.collection('users').findOne({ email })
    if (!user) return null

    // Get user profile
    const profile = await this.getUserProfile(user._id.toString())

    return {
      ...user,
      profile,
    }
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
},
```

### Step 3: Update NextAuth Configuration

Update `src/lib/auth-config.ts` to use unified collection:

```typescript
// In the CredentialsProvider authorize function, change:
const user = await db.collection('users').findOne({
  email: credentials.email,
})

// To:
const user = await db.collection('user_profiles').findOne({
  email: credentials.email,
})
```

## Unified Schema Structure

After migration, your `user_profiles` collection will contain:

```javascript
{
  "_id": ObjectId("..."),

  // Authentication fields
  "email": "user@example.com",
  "password": "$2b$12$...", // hashed password
  "name": "User Name",
  "image": "profile_image_url",
  "role": "user", // or "admin"
  "emailVerified": null,

  // Subscription fields
  "subscription_tier": "starter_spark",
  "credits_remaining": 1,
  "package_details": {
    "price_per_offer": 9,
    "total_package_value": 9,
    "purchase_date": ISODate("..."),
    "regeneration_count": 2
  },

  // Timestamps
  "created_at": ISODate("..."),
  "updated_at": ISODate("..."),
  "createdAt": ISODate("..."), // NextAuth compatibility
  "updatedAt": ISODate("...")  // NextAuth compatibility
}
```

## Testing

1. **Run migration script**
2. **Update the 2 functions** in auth.ts
3. **Test login/registration**
4. **Test subscription features**
5. **Verify profile data is accessible**

## Rollback Plan

If something goes wrong:

1. Restore from `users_backup` and `user_profiles_backup` collections
2. Revert the 2 function changes in auth.ts

## Benefits After Migration

- **Single collection lookup** for complete user data
- **No more complex joins** between users and user_profiles
- **Consistent data structure** throughout the app
- **Better performance** with fewer database queries
- **Easier maintenance** and debugging

## Current vs New Lookup Pattern

### Before (Complex):

```typescript
// Get user
const user = await db.collection('users').findOne({ email })
// Get profile
const profile = await db.collection('user_profiles').findOne({ userId: email })
// Merge manually
```

### After (Simple):

```typescript
// Get everything in one query
const user = await db.collection('user_profiles').findOne({ email })
// All data is already there!
```

This approach maintains your current function flow while eliminating the complexity of dual collections.
